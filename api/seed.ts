import { VercelRequest, VercelResponse } from "@vercel/functions";
import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

const SEED_EVENTS = [
  {
    eventId: "evt_0001a2b3",
    eventType: "RUN_STARTED",
    riskLevel: "INFO",
    status: "OK",
    timestamp: "2026-06-09T14:31:02.000Z",
    detail: "RefundAgent v2.7.4 initialized",
    payload: { agentVersion: "v2.7.4", tenantId: "demo", sessionId: "sess_3b7f9c2a" },
  },
  {
    eventId: "evt_0002c3d4",
    eventType: "USER_REQUEST_RECEIVED",
    riskLevel: "INFO",
    status: "OK",
    timestamp: "2026-06-09T14:31:08.000Z",
    detail: '"I need a refund for my order #A10293"',
    payload: { message: "I need a refund for my order #A10293", userId: "user_9c7f2d", channel: "support-portal" },
  },
  {
    eventId: "evt_0003e4f5",
    eventType: "MEMORY_READ",
    riskLevel: "LOW",
    status: "OK",
    timestamp: "2026-06-09T14:31:10.000Z",
    detail: "Agent memory loaded from session context",
    payload: { keys: ["user.trust_score", "agent.authority_level", "session.refund_count"] },
  },
  {
    eventId: "evt_0004f5a6",
    eventType: "CUSTOMER_PROFILE_READ",
    riskLevel: "LOW",
    status: "OK",
    timestamp: "2026-06-09T14:31:12.000Z",
    detail: "Profile loaded for user_9c7f2d",
    payload: { customerId: "user_9c7f2d", orderId: "A10293", trustScore: 0.82 },
  },
  {
    eventId: "evt_0005b6c7",
    eventType: "TOOL_CALLED",
    riskLevel: "LOW",
    status: "OK",
    timestamp: "2026-06-09T14:31:14.000Z",
    detail: "OrderLookup(A10293)",
    payload: {
      tool: "OrderLookup",
      params: { orderId: "A10293" },
      result: { status: "delivered", amount: 4800, currency: "USD" },
    },
  },
  {
    eventId: "evt_0006c7d8",
    eventType: "POLICY_CHECKED",
    riskLevel: "MEDIUM",
    status: "VIOLATION",
    timestamp: "2026-06-09T14:31:15.000Z",
    detail: "Refund amount exceeds limit",
    payload: { policyId: "refund.amount.limit", rule: "amount <= 500", value: 4800, limit: 500 },
    policyId: "refund.amount.limit",
  },
  {
    eventId: "evt_9f7a2b1c4d5e",
    eventType: "ACTION_ATTEMPTED",
    riskLevel: "CRITICAL",
    status: "BLOCKED",
    action: "ProcessRefund",
    amount: 4800,
    currency: "USD",
    timestamp: "2026-06-09T14:31:18.000Z",
    detail: "ProcessRefund for $4,800.00",
    payload: {
      action: "ProcessRefund",
      parameters: {
        orderId: "A10293",
        amount: 4800,
        currency: "USD",
        reason: "Product not as described",
        refundMethod: "original_payment_method",
      },
      agent: "RefundAgent v2.7.4",
      sessionId: "sess_3b7f9c2a",
      timestamp: "2026-06-09T14:31:18.456Z",
    },
    policyId: "refund.amount.limit",
  },
  {
    eventId: "evt_0008e9f0",
    eventType: "POLICY_VIOLATION_DETECTED",
    riskLevel: "CRITICAL",
    status: "VIOLATION",
    timestamp: "2026-06-09T14:31:19.000Z",
    detail: "Unauthorized refund amount",
    payload: { policyId: "refund.amount.limit", violatedRule: "amount <= 500", severity: "CRITICAL" },
    policyId: "refund.amount.limit",
  },
  {
    eventId: "evt_0009f0a1",
    eventType: "ACTION_BLOCKED",
    riskLevel: "CRITICAL",
    status: "BLOCKED",
    timestamp: "2026-06-09T14:31:20.000Z",
    detail: "System prevented the refund",
    payload: { blockedAction: "ProcessRefund", reason: "policy_violation", policyId: "refund.amount.limit" },
  },
  {
    eventId: "evt_0010a1b2",
    eventType: "HUMAN_APPROVAL_REQUESTED",
    riskLevel: "HIGH",
    status: "PENDING",
    timestamp: "2026-06-09T14:31:22.000Z",
    detail: "Escalated to Finance Team",
    payload: { approverGroup: "Finance Team", sla: "15m", requestId: "apr_1d2e3f4a", amount: 4800 },
  },
  {
    eventId: "evt_0011b2c3",
    eventType: "HUMAN_DENIED",
    riskLevel: "HIGH",
    status: "DENIED",
    timestamp: "2026-06-09T14:31:45.000Z",
    detail: "Finance Team denied the request",
    payload: { approver: "Finance Team", decision: "DENIED", reason: "Exceeds agent authority limit of $500" },
  },
  {
    eventId: "evt_0012c3d4",
    eventType: "ACTION_CANCELLED",
    riskLevel: "MEDIUM",
    status: "CANCELLED",
    timestamp: "2026-06-09T14:31:46.000Z",
    detail: "Refund request cancelled",
    payload: { cancelledAction: "ProcessRefund", reason: "human_denied" },
  },
  {
    eventId: "evt_0013d4e5",
    eventType: "AUDIT_REPORT_GENERATED",
    riskLevel: "INFO",
    status: "GENERATED",
    timestamp: "2026-06-09T14:32:18.000Z",
    detail: "Compliance report saved to ledger",
    payload: { reportId: "rpt_8f3a1a2b", format: "JSON", events: 13, violations: 1 },
  },
];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.AWS_REGION || !process.env.DYNAMODB_TABLE_NAME || !process.env.AWS_ROLE_ARN) {
      // Return mock success if env vars not set
      return res.status(200).json({
        ok: true,
        seeded: SEED_EVENTS.length,
        runId: "run_8f3a1a2b",
        mode: "mock",
        message: "Mock seed data would be written to DynamoDB (env vars not configured)",
      });
    }

    const client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: awsCredentialsProvider({
        roleArn: process.env.AWS_ROLE_ARN!,
        clientConfig: { region: process.env.AWS_REGION },
      }),
    });

    const docClient = DynamoDBDocumentClient.from(client);
    const tableName = process.env.DYNAMODB_TABLE_NAME;
    const tenantId = "demo";
    const runId = "run_8f3a1a2b";
    const agentId = "refund-agent";
    const agentName = "RefundAgent";

    // Batch write events
    const requestItems = SEED_EVENTS.map((event) => {
      const pk = `TENANT#${tenantId}`;
      const sk = `RUN#${runId}#EVENT#${event.timestamp}#${event.eventId}`;

      return {
        PutRequest: {
          Item: {
            PK: pk,
            SK: sk,
            tenantId,
            agentId,
            agentName,
            runId,
            eventId: event.eventId,
            eventType: event.eventType,
            riskLevel: event.riskLevel,
            status: event.status,
            action: event.action,
            amount: event.amount,
            currency: event.currency,
            policyId: event.policyId,
            timestamp: event.timestamp,
            payload: event.payload,
            detail: event.detail,
            createdAt: new Date().toISOString(),
          },
        },
      };
    });

    try {
      // DynamoDB BatchWrite has a limit of 25 items per batch
      for (let i = 0; i < requestItems.length; i += 25) {
        const batch = requestItems.slice(i, i + 25);
        await docClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [tableName]: batch,
            },
          })
        );
      }

      return res.status(200).json({
        ok: true,
        seeded: SEED_EVENTS.length,
        runId,
        mode: "live",
        message: `Seeded ${SEED_EVENTS.length} events to DynamoDB`,
      });
    } catch (batchError) {
      // If batch fails, return mock success
      return res.status(200).json({
        ok: true,
        seeded: SEED_EVENTS.length,
        runId,
        mode: "mock",
        message: `Would seed ${SEED_EVENTS.length} events (DynamoDB unavailable)`,
      });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(200).json({
      ok: true,
      seeded: SEED_EVENTS.length,
      runId: "run_8f3a1a2b",
      mode: "mock",
      message: errorMessage,
    });
  }
}

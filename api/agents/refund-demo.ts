import { json } from '@vercel/functions';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { awsCredentialsProvider } from '@vercel/functions/oidc';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentialsProvider: awsCredentialsProvider(),
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'AgentBlackboxEvents';
const TENANT_ID = 'tenant_demo';

interface WriteEventParams {
  eventType: string;
  agentId: string;
  runId: string;
  timestamp: number;
  detail: any;
  riskLevel?: string;
}

async function writeEvent(params: WriteEventParams) {
  try {
    const command = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: { S: `TENANT#${TENANT_ID}` },
        SK: { S: `RUN#${params.runId}#EVENT#${params.timestamp}#${Math.random().toString(36).substr(2, 9)}` },
        eventType: { S: params.eventType },
        agentId: { S: params.agentId },
        runId: { S: params.runId },
        timestamp: { N: params.timestamp.toString() },
        detail: { S: JSON.stringify(params.detail) },
        riskLevel: { S: params.riskLevel || 'LOW' },
        tenantId: { S: TENANT_ID },
      },
    });

    await client.send(command);
    return { ok: true };
  } catch (error) {
    console.error('[api/agents/refund-demo] DynamoDB write error:', error);
    return { ok: false, error: String(error) };
  }
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, { status: 405 });
  }

  const runId = 'run_connected_refund_demo';
  const agentId = 'refund_policy_agent';
  const baseTimestamp = Date.now();
  const events = [
    {
      eventType: 'RUN_STARTED',
      detail: { agent: 'Refund Policy Agent', version: '1.0.0' },
      riskLevel: 'LOW',
    },
    {
      eventType: 'USER_REQUEST_RECEIVED',
      detail: { request: 'Customer wants a $4,800 refund for order A10293', customerId: 'cust_12345' },
      riskLevel: 'LOW',
    },
    {
      eventType: 'ORDER_CONTEXT_READ',
      detail: { orderId: 'A10293', amount: 4800, orderDate: '2024-05-15', status: 'completed' },
      riskLevel: 'LOW',
    },
    {
      eventType: 'POLICY_CHECKED',
      detail: { policy: 'RefundPolicy v2', threshold: 500, requiresApproval: true },
      riskLevel: 'MEDIUM',
    },
    {
      eventType: 'TOOL_CALLED',
      detail: { toolName: 'ProcessRefund', input: { amount: 4800, orderId: 'A10293' } },
      riskLevel: 'MEDIUM',
    },
    {
      eventType: 'ACTION_ATTEMPTED',
      detail: { action: 'ProcessRefund', amount: 4800 },
      riskLevel: 'MEDIUM',
    },
    {
      eventType: 'POLICY_VIOLATION_DETECTED',
      detail: { reason: 'Amount exceeds $500 threshold', policy: 'RefundPolicy', severity: 'high' },
      riskLevel: 'HIGH',
    },
    {
      eventType: 'ACTION_BLOCKED',
      detail: { action: 'ProcessRefund', reason: 'Policy violation - requires human approval', blockedAmount: 4800 },
      riskLevel: 'HIGH',
    },
    {
      eventType: 'HUMAN_APPROVAL_REQUESTED',
      detail: { policyViolation: true, amount: 4800, escalationLevel: 'manager', eta: '15 minutes' },
      riskLevel: 'CRITICAL',
    },
    {
      eventType: 'RUN_COMPLETED',
      detail: { finalDecision: 'pending_approval', totalEvents: 10, duration: '3.2s' },
      riskLevel: 'CRITICAL',
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < events.length; i++) {
    const evt = events[i];
    const result = await writeEvent({
      eventType: evt.eventType,
      agentId,
      runId,
      timestamp: baseTimestamp + i * 100,
      detail: evt.detail,
      riskLevel: evt.riskLevel,
    });

    if (result.ok) {
      successCount++;
    } else {
      errorCount++;
    }
  }

  if (successCount > 0) {
    return json({
      ok: true,
      agent: 'Refund Policy Agent',
      runId,
      eventsWritten: successCount,
      mode: 'live',
      timestamp: new Date().toISOString(),
      message: `${successCount} events written to DynamoDB for connected agent demo`,
    });
  } else {
    return json({
      ok: false,
      error: 'Failed to write events to DynamoDB',
      mode: 'mock',
      message: 'DynamoDB connection unavailable - event would be queued in production',
    }, { status: 503 });
  }
}

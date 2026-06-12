import { VercelRequest, VercelResponse } from "@vercel/functions";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

async function getDocClient() {
  if (!process.env.AWS_REGION || !process.env.AWS_ROLE_ARN) {
    throw new Error("AWS environment variables not configured");
  }

  const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: awsCredentialsProvider({
      roleArn: process.env.AWS_ROLE_ARN!,
      clientConfig: { region: process.env.AWS_REGION },
    }),
  });

  return DynamoDBDocumentClient.from(client);
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    if (req.method === "POST") {
      // Write event to DynamoDB
      const {
        tenantId,
        agentId,
        agentName,
        runId,
        eventId,
        eventType,
        riskLevel,
        status,
        action,
        amount,
        currency,
        policyId,
        timestamp,
        payload,
        message,
      } = req.body;

      if (!tenantId || !runId || !eventId || !timestamp) {
        return res.status(400).json({
          error: "Missing required fields: tenantId, runId, eventId, timestamp",
        });
      }

      try {
        const docClient = await getDocClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME || "AgentBlackboxEvents";

        const pk = `TENANT#${tenantId}`;
        const sk = `RUN#${runId}#EVENT#${timestamp}#${eventId}`;

        await docClient.send(
          new PutCommand({
            TableName: tableName,
            Item: {
              PK: pk,
              SK: sk,
              tenantId,
              agentId,
              agentName,
              runId,
              eventId,
              eventType,
              riskLevel,
              status,
              action,
              amount,
              currency,
              policyId,
              timestamp,
              payload,
              message,
              createdAt: new Date().toISOString(),
            },
          })
        );

        return res.status(201).json({
          ok: true,
          eventId,
          message: "Event recorded in DynamoDB",
        });
      } catch (dbError) {
        // If DynamoDB fails, return 201 anyway for mock mode
        return res.status(201).json({
          ok: true,
          eventId,
          message: "Event recorded (mock mode - DynamoDB unavailable)",
          mode: "mock",
        });
      }
    } else if (req.method === "GET") {
      // Read events for a run
      const { runId } = req.query;

      if (!runId || typeof runId !== "string") {
        return res.status(400).json({
          error: "Missing required query parameter: runId",
        });
      }

      try {
        const docClient = await getDocClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME || "AgentBlackboxEvents";
        const tenantId = "demo"; // For now, hardcode demo tenant

        const pk = `TENANT#${tenantId}`;
        const skPrefix = `RUN#${runId}#EVENT#`;

        const queryResponse = await docClient.send(
          new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
            ExpressionAttributeValues: {
              ":pk": pk,
              ":skPrefix": skPrefix,
            },
            ScanIndexForward: true,
          })
        );

        const events = (queryResponse.Items || []).map((item: any) => ({
          eventId: item.eventId,
          tenantId: item.tenantId,
          agentId: item.agentId,
          agentName: item.agentName,
          runId: item.runId,
          eventType: item.eventType,
          riskLevel: item.riskLevel,
          status: item.status,
          timestamp: item.timestamp,
          payload: item.payload,
          message: item.message,
          label: item.eventType.replace(/_/g, " "),
          detail: item.message || "",
          description: item.payload?.description || "",
          duration: 0,
        }));

        return res.status(200).json({
          ok: true,
          count: events.length,
          events,
          mode: "live",
        });
      } catch (dbError) {
        // If DynamoDB fails, return empty in mock mode
        return res.status(200).json({
          ok: true,
          count: 0,
          events: [],
          mode: "mock",
          message: "DynamoDB unavailable, returning empty events",
        });
      }
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({
      error: "Server error",
      message: errorMessage,
    });
  }
}

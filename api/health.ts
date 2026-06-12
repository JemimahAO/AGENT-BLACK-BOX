import { VercelRequest, VercelResponse } from "@vercel/functions";
import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Check if environment variables are set
    if (!process.env.AWS_REGION || !process.env.DYNAMODB_TABLE_NAME || !process.env.AWS_ROLE_ARN) {
      return res.status(200).json({
        ok: false,
        mode: "mock",
        error: "AWS environment variables not configured",
        message: "Configure AWS_REGION, DYNAMODB_TABLE_NAME, and AWS_ROLE_ARN to enable live DynamoDB mode",
      });
    }

    const client = new DynamoDBClient({
      region: process.env.AWS_REGION,
      credentials: awsCredentialsProvider({
        roleArn: process.env.AWS_ROLE_ARN!,
        clientConfig: { region: process.env.AWS_REGION },
      }),
    });

    const command = new DescribeTableCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
    });

    const response = await client.send(command);

    return res.status(200).json({
      ok: true,
      mode: "live",
      table: response.Table?.TableName || process.env.DYNAMODB_TABLE_NAME,
      region: process.env.AWS_REGION,
      status: response.Table?.TableStatus,
      itemCount: response.Table?.ItemCount || 0,
      lastChecked: new Date().toISOString(),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // If it's a connection/auth error, return mock mode
    if (errorMessage.includes("UnrecognizedClientException") || errorMessage.includes("credentials")) {
      return res.status(200).json({
        ok: false,
        mode: "mock",
        error: "AWS authentication failed",
        message: "Running in mock mode. Ensure OIDC is configured for this project.",
      });
    }

    return res.status(200).json({
      ok: false,
      mode: "mock",
      error: errorMessage,
      message: "DynamoDB connection error. Running in mock mode.",
    });
  }
}

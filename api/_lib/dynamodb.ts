import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { awsCredentialsProvider } from "@vercel/functions/oidc";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: awsCredentialsProvider({
    roleArn: process.env.AWS_ROLE_ARN!,
    clientConfig: { region: process.env.AWS_REGION },
  }),
});

export const docClient = DynamoDBDocumentClient.from(client);
export const tableName = process.env.DYNAMODB_TABLE_NAME!;
export const partitionKeyName = process.env.DYNAMODB_TABLE_PARTITION_KEY || "PK";
export const sortKeyName = process.env.DYNAMODB_TABLE_SORT_KEY || "SK";

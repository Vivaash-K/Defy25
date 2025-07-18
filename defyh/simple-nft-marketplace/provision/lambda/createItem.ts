import * as lambda from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const createItemJobName = process.env.CREATE_ITEM_JOB_NAME;
const tableName = process.env.TABLE_JOB;
const ddb = new AWS.DynamoDB();
const lambdaFunction = new AWS.Lambda();

interface Item {
  assetMetadataUrl: string;
  royalty: number;
}

exports.handler = async (event: lambda.APIGatewayProxyEvent): Promise<lambda.APIGatewayProxyResult> => {
  const item: Item = JSON.parse(event.body);
  const username = event.requestContext.authorizer.claims['cognito:username'];
  const jobId = uuidv4();

  const paramsJobStatus = {
    TableName: tableName,
    Item: {
      jobId: { S: jobId },
      status: { S: 'RUNNING' },
    }
  };

  await ddb.putItem(paramsJobStatus).promise();
  await lambdaFunction.invoke({
    FunctionName: createItemJobName,
    InvocationType: 'Event',
    Payload: JSON.stringify({
      jobId,
      username,
      assetMetadataUrl: item.assetMetadataUrl,
      royalty: item.royalty,
    }),
  }).promise();

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ jobId }),
  };
};

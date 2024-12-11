import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { S3, DynamoDB } from 'aws-sdk';
import { FileUploadRequest, FileMetadata } from './types';

const s3 = new S3();
const dynamodb = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        console.log('Received authentication request:', JSON.stringify(event, null, 2));

        // Parse and validate request
        const body: FileUploadRequest = JSON.parse(event.body || '{}');
        
        if (!body.fileName || !body.contentType || !body.source || !body.roleName) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    error: 'Missing required fields: fileName, contentType, source, and roleName are required'
                })
            };
        }

        // Generate pre-signed URL with 60 minutes expiry
        const fileKey = `${body.source}/${Date.now()}_${body.fileName}`;
        const presignedUrl = await s3.getSignedUrlPromise('putObject', {
            Bucket: process.env.BUCKET_NAME!,
            Key: fileKey,
            ContentType: body.contentType,
            Expires: 3600, // 60 minutes
            Metadata: {
                client: 'defaultClient',  // Can be overridden during upload
                environment: 'production',  // Can be overridden during upload
                source: body.source
            }
        });

        // Store metadata
        const timestamp = new Date().toISOString();
        const fileId = `file_${Date.now()}`;
        
        const metadata: FileMetadata = {
            id: fileId,
            fileName: body.fileName,
            source: body.source,
            roleName: body.roleName,
            status: 'pending',
            contentType: body.contentType,
            createdAt: timestamp
        };

        await dynamodb.put({
            TableName: process.env.METADATA_TABLE!,
            Item: metadata
        }).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                fileId: fileId,
                uploadUrl: presignedUrl,
                expiresIn: 3600,
                metadata: {
                    client: 'defaultClient',
                    environment: 'production',
                    source: body.source
                }
            })
        };

    } catch (error) {
        console.error('Error generating pre-signed URL:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                error: 'Internal server error'
            })
        };
    }
};
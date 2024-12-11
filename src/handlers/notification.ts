import { S3Handler } from 'aws-lambda';
import { SNS, S3, DynamoDB } from 'aws-sdk';
import { FileMetadata, S3EventRecord, NotificationMessage } from './types';

const sns = new SNS();
const s3 = new S3();
const dynamodb = new DynamoDB.DocumentClient();

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
};

export const handler: S3Handler = async (event) => {
    try {
        console.log('Received event:', JSON.stringify(event, null, 2));

        const s3Event: S3EventRecord = event.Records[0] as unknown as S3EventRecord;
        const bucketName = s3Event.s3.bucket.name;
        const objectKey = decodeURIComponent(s3Event.s3.object.key.replace(/\+/g, ' '));
        const fileSize = s3Event.s3.object.size;

        // Get file metadata from S3
        const s3Response = await s3.headObject({
            Bucket: bucketName,
            Key: objectKey
        }).promise();

        const source = s3Response.Metadata?.source || '';
        const client = s3Response.Metadata?.client || '';
        const environment = s3Response.Metadata?.environment || '';
        const timestamp = new Date().toISOString();

        // Store metadata in DynamoDB
        const fileId = `file_${Date.now()}`;
        
        const metadata: FileMetadata = {
            id: fileId,
            fileName: objectKey,
            source: source,
            roleName: s3Response.Metadata?.roleName || '',
            fileSize: fileSize,
            contentType: s3Response.ContentType || 'application/octet-stream',
            uploadTime: timestamp,
            bucket: bucketName,
            status: 'uploaded',
            client: client,
            environment: environment,
            createdAt: timestamp  // Added this line to fix the error
        };

        await dynamodb.put({
            TableName: process.env.METADATA_TABLE!,
            Item: metadata
        }).promise();

        // Only send notification for automobile data
        if (source.toLowerCase() === 'automobiles') {
            const message: NotificationMessage = {
                subject: 'Automobile Data File Upload Notification',
                message: `
                    New automobile data file has been uploaded to S3:
                    - File Name: ${objectKey}
                    - Size: ${formatFileSize(fileSize)}
                    - Type: ${s3Response.ContentType || 'Unknown'}
                    - Upload Time: ${timestamp}
                    - Bucket: ${bucketName}
                    - Client: ${client}
                    - Environment: ${environment}
                `
            };

            await sns.publish({
                TopicArn: process.env.NOTIFICATION_TOPIC_ARN!,
                Subject: message.subject,
                Message: message.message
            }).promise();

            console.log('Successfully sent notification for automobile data');
        }

        console.log('Successfully processed file upload');

    } catch (error) {
        console.error('Error processing file upload:', error);
        throw error;
    }
};
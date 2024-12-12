import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from '../../../handlers/authenticate';
import { mockS3, mockDynamoDB } from '../../_mocks_/aws-sdk';

describe('authenticate handler', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Set required environment variables
        process.env.BUCKET_NAME = 'test-bucket';
        process.env.METADATA_TABLE = 'test-metadata-table';
    });

    // Negative test case
    test('should return 400 for missing required fields', async () => {
        // Setup
        const event = {
            body: JSON.stringify({}),
            headers: {},
            multiValueHeaders: {},
            httpMethod: 'POST',
            isBase64Encoded: false,
            path: '/authenticate',
            pathParameters: null,
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            stageVariables: null,
            requestContext: {} as any,
            resource: ''
        } as APIGatewayProxyEvent;

        // Execute
        const response = await handler(event);
        const responseBody = JSON.parse(response.body);

        // Verify
        expect(response.statusCode).toBe(400);
        expect(responseBody).toHaveProperty('error', 'Missing required fields: fileName, contentType, source, and roleName are required');
    });

    // Additional error test case
    test('should handle S3 errors gracefully', async () => {
        // Setup
        const event = {
            body: JSON.stringify({
                fileName: 'test.pdf',
                contentType: 'application/pdf',
                source: 'test',
                roleName: 'admin'
            }),
            headers: {},
            multiValueHeaders: {},
            httpMethod: 'POST',
            isBase64Encoded: false,
            path: '/authenticate',
            pathParameters: null,
            queryStringParameters: null,
            multiValueQueryStringParameters: null,
            stageVariables: null,
            requestContext: {} as any,
            resource: ''
        } as APIGatewayProxyEvent;

        // Mock S3 error
        mockS3.getSignedUrlPromise.mockRejectedValueOnce(new Error('S3 Error'));

        // Execute
        const response = await handler(event);
        const responseBody = JSON.parse(response.body);

        // Verify
        expect(response.statusCode).toBe(500);
        expect(responseBody).toHaveProperty('error', 'Internal server error');
    });
});
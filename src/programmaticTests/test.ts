import AWS from 'aws-sdk';
import axios from 'axios';
import { FileUploadRequest } from '../handlers/types';

AWS.config.update({ region: 'us-east-1' });

async function testFileUpload(): Promise<void> {
    try {
        const testFile: FileUploadRequest = {
            fileName: 'test.txt',
            contentType: 'text/plain',
            source: 'automobiles',     // Added required field
            roleName: 'test-role'      // Added required field
        };

        // 1. Get pre-signed URL
        console.log('Requesting pre-signed URL...');
        const response = await axios.post(
            'https://dqdux45du5.execute-api.us-east-1.amazonaws.com/Prod/authenticate',
            testFile
        );

        console.log('Got pre-signed URL:', response.data);

        // 2. Upload file using pre-signed URL
        const fileContent = 'This is a test file for automobile data';
        
        console.log('Uploading file...');
        await axios.put(response.data.uploadUrl, fileContent, {
            headers: {
                'Content-Type': testFile.contentType,
                'x-amz-meta-client': 'testClient',
                'x-amz-meta-environment': 'development',
                'x-amz-meta-source': testFile.source
            }
        });

        console.log('✅ File uploaded successfully');
        console.log('📧 Check your email for the notification (automobile data)');

    } catch (error: any) {
        console.error('❌ Error during test:', error.response?.data || error.message);
    }
}

console.log('🚀 Starting file upload test...');
testFileUpload();
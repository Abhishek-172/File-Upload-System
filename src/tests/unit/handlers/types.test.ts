import { FileUploadRequest, FileMetadata } from '../../../handlers/types';

describe('Types', () => {
    // Positive test case
    test('should allow valid FileUploadRequest', () => {
        const request: FileUploadRequest = {
            fileName: 'test.pdf',
            contentType: 'application/pdf',
            source: 'test',
            roleName: 'admin'
        };

        expect(request.fileName).toBe('test.pdf');
    });

    // Positive test case
    test('should allow valid FileMetadata', () => {
        const metadata: FileMetadata = {
            id: 'test-id',
            fileName: 'test.pdf',
            source: 'test',
            roleName: 'admin',
            status: 'pending',
            contentType: 'application/pdf',
            createdAt: new Date().toISOString()
        };

        expect(metadata.id).toBe('test-id');
    });
});
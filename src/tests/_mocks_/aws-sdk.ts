const mockS3 = {
  getSignedUrlPromise: jest.fn(),
  headObject: jest.fn().mockReturnValue({
      promise: jest.fn()
  })
};

const mockSNS = {
  publish: jest.fn().mockReturnValue({
      promise: jest.fn()
  })
};

const mockDynamoDB = {
  put: jest.fn().mockReturnValue({
      promise: jest.fn()
  })
};

export const S3 = jest.fn(() => mockS3);
export const SNS = jest.fn(() => mockSNS);
export const DynamoDB = {
  DocumentClient: jest.fn(() => mockDynamoDB)
};

// Export mock instances for easy access in tests
export { mockS3, mockSNS, mockDynamoDB };

// Initialize default mock implementations
mockS3.getSignedUrlPromise.mockResolvedValue('mock-url');
mockDynamoDB.put().promise.mockResolvedValue({});
mockSNS.publish().promise.mockResolvedValue({});
export interface FileUploadRequest {
  fileName: string;
  contentType: string;
  source: string;
  roleName: string;
}

export interface FileMetadata {
  id: string;
  fileName: string;
  source: string;
  roleName: string;
  status: string;
  contentType: string;
  createdAt: string;
  fileSize?: number;
  bucket?: string;
  uploadTime?: string;
  client?: string;
  environment?: string;
}

export interface S3Metadata {
  client: string;
  environment: string;
  source: string;
}

export interface S3EventRecord {
  s3: {
      bucket: {
          name: string;
      };
      object: {
          key: string;
          size: number;
      };
  };
  userMetadata?: S3Metadata;
}

export interface NotificationMessage {
  subject: string;
  message: string;
}
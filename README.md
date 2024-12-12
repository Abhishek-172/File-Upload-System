# File Upload System with AWS

A secure and scalable file upload system built using AWS services including S3, Lambda, API Gateway, and DynamoDB for managing file uploads with automated notifications.

## Architecture Overview

The system consists of several AWS components working together:

1. **API Gateway** (/authenticate endpoint)

   - Handles authentication requests for file uploads
   - Returns pre-signed URLs for secure S3 uploads
   - Resource ID: ccozoxeph

2. **Lambda Functions**

   - Authentication Function (Node.js 16.x)
   - Notification Function (Node.js 16.x)
   - Event-driven processing

3. **S3 Buckets**

   - Main bucket: <Your_Bucket_Name>
   - Organized folder structure:
     - /automobiles/ directory for vehicle-related files
     - Current files include test.txt (39.0B)
   - Proper permissions and access controls

4. **DynamoDB**
   - Table: File-Upload-System-metadata
   - Stores file metadata and upload history
   - Schema with partition key: id (String)

## Project Structure

```
FILE-UPLOAD-SYSTEM/
├── .aws-sam/               # SAM build artifacts
├── coverage/               # Test coverage reports
├── dist/                   # Compiled TypeScript output
├── node_modules/           # Project dependencies
├── src/
│   ├── handlers/          # Lambda function handlers
│   │   ├── authenticate.ts
│   │   └── notification.ts
│   ├── programmaticTests/
│   │   └── test.ts       # Programmatic test suite
│   └── tests/            # Unit tests directory
│       └── unit/
│           ├── handlers/
│           │   ├── authenticate.test.ts
│           │   ├── notification.test.ts
│           │   └── types.test.ts
│           └── _mocks_/
│               └── aws-sdk.ts
├── .gitignore             # Git ignore rules
├── base-infrastructure.yml # Base AWS infrastructure template
├── copyFile.ts            # File copy utility
├── functions.yml          # AWS Lambda functions template
├── package-lock.json      # Dependency lock file
├── package.json           # Project configuration and scripts
├── README.md             # Project documentation
├── samconfig.toml        # SAM CLI configuration
├── template.yml          # Main SAM template
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

1. **AWS Account Setup**

   ```bash
   aws configure
   # Configure your AWS credentials, region, and output format
   ```

2. **Node.js and npm**

   ```bash
   node --version  # Should be >= 16.x
   npm --version   # Should be >= 8.x
   ```

3. **AWS SAM CLI**

   ```bash
   sam --version  # Install if not present
   ```

4. **TypeScript**
   ```bash
   npm install -g typescript
   tsc --version
   ```

## Installation Steps

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd File-Upload-System
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Build and Deploy Process

1. **Build TypeScript Code**

   ```bash
   npm run build
   ```

   This command:

   - Compiles TypeScript files using `tsc`
   - Runs the copyFile.ts script using `ts-node`

2. **Run Unit Tests**

   ```bash
   npm test
   ```

   This runs Jest with the following configuration:

   - Uses ts-jest preset
   - Runs all files matching "\*.test.ts"
   - Generates coverage reports
   - Excludes node_modules, dist, and programmaticTests directories

3. **Deploy to AWS**

   ```bash
   npm run deploy
   ```

   This single command executes the following sequence:

   ```bash
   # 1. Builds the base infrastructure
   sam build -t base-infrastructure.yml

   # 2. Deploys the base infrastructure stack
   sam deploy --guided --template-file base-infrastructure.yml --stack-name File-Upload-System-Base

   # 3. Builds the functions
   sam build -t functions.yml

   # 4. Deploys the functions stack
   sam deploy --guided --template-file functions.yml --stack-name File-Upload-System-Functions
   ```

4. **Run Programmatic Tests Post Deployment**

   Important Pre-deployment Configuration:

   1. Navigate to the `src/programmaticTests/test.ts` file
   2. Locate the `apiEndpoint` details
   3. Update it with your AWS API Gateway endpoint URL:
      - Open AWS Console → API Gateway
      - Select your API
      - Copy the Invoke URL
      - Replace the existing URL in test.ts
   4. Save the file

   Then run the tests:

   ```bash
   npm run usertest
   ```

   This executes programmatic tests using ts-node to run src/programmaticTests/test.ts

## Project Dependencies

### Main Dependencies

```json
{
	"aws-sdk": "^2.1040.0",
	"axios": "^0.24.0"
}
```

### Development Dependencies

```json
{
	"@jest/types": "^29.6.3",
	"@types/aws-lambda": "^8.10.92",
	"@types/jest": "^29.5.14",
	"@types/node": "^16.11.12",
	"jest": "^29.7.0",
	"ts-jest": "^29.2.5",
	"ts-node": "^10.4.0",
	"typescript": "^4.5.4"
}
```

## API Details

### Authentication Endpoint

```
POST /authenticate
```

Request Body:

```json
{
	"fileName": "example.pdf",
	"contentType": "application/pdf",
	"source": "userUpload",
	"roleName": "admin"
}
```

Response:

```json
{
	"uploadUrl": "https://...",
	"fileId": "unique-file-id"
}
```

## Test Coverage and Results

Current coverage metrics:

- Overall coverage: 68.65% statements covered
- Handlers:
  - authenticate.ts: 94.73% coverage
  - notification.ts: 48.48% coverage
- Mock utilities: 80% coverage

Test Results:

- Test Suites: 1 failed, 2 passed, 3 total
- Tests: 1 failed, 4 passed, 5 total
- Total time: 38.758s

## Security Features

1. **Authentication & Authorization**

   - Pre-signed URLs for secure uploads
   - IAM role-based access control
   - Request validation

2. **Data Protection**

   - Input sanitization
   - Secure file storage
   - Metadata validation

3. **Monitoring**
   - CloudWatch integration
   - Error logging
   - Access logging

## Troubleshooting

1. **Build Issues**

   ```bash
   # Clean the build directory
   rm -rf dist/
   # Retry build
   npm run build
   ```

2. **Deploy Failures**

   ```bash
   # Check CloudFormation events
   aws cloudformation describe-stack-events --stack-name File-Upload-System-Base
   ```

3. **Test Failures**

   ```bash
   # Run tests with verbose output
   npm test -- --verbose
   ```

4. **AWS Credential Issues**
   ```bash
   # Verify AWS credentials
   aws sts get-caller-identity
   ```

## Error Handling

The system implements comprehensive error handling:

- Input validation
- AWS service errors
- File type validation
- Permission checks
- Network timeouts

---

_Last Updated: December 2024_
_Created By: Abhishek Pandey_

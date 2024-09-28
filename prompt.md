Dưới đây là hướng dẫn từng bước để tạo project AWS SAM với Lambda, S3 và SQS như bạn mô tả:

## Bước 1: Cài đặt và cấu hình môi trường

1. Cài đặt AWS CLI và cấu hình credentials.
2. Cài đặt AWS SAM CLI.
3. Cài đặt Node.js 18.x.

## Bước 2: Tạo project AWS SAM

1. Mở terminal và chạy lệnh:

```
sam init
```

2. Chọn các tùy chọn sau:

   - AWS Quick Start Templates
   - ZIP package type
   - nodejs18.x
   - Hello World Example

3. Đặt tên project, ví dụ: `s3-lambda-sqs-app`

## Bước 3: Cấu trúc project

Cấu trúc thư mục của bạn sẽ như sau:

```
s3-lambda-sqs-app/
├── events/
├── src/
│   ├── handlers/
│   │   ├── rcHandler.js
│   │   └── acHandler.js
├── template.yaml
├── buildspec.yml
└── README.md
```

## Bước 4: Cập nhật template.yaml

Cập nhật file `template.yaml` như sau:

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: S3 Lambda SQS Application

Globals:
  Function:
    Timeout: 30
    Runtime: nodejs18.x

Resources:
  RcBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: rc-bucket-name

  AcBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: ac-bucket-name

  SQSQueue:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: my-sqs-queue

  RcLambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/handlers/
      Handler: rcHandler.handler
      Events:
        S3Event:
          Type: S3
          Properties:
            Bucket: !Ref RcBucket
            Events: s3:ObjectCreated:*

  AcLambdaFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/handlers/
      Handler: acHandler.handler
      Events:
        S3Event:
          Type: S3
          Properties:
            Bucket: !Ref AcBucket
            Events: s3:ObjectCreated:*

Outputs:
  RcBucketName:
    Description: "RC S3 bucket name"
    Value: !Ref RcBucket
  AcBucketName:
    Description: "AC S3 bucket name"
    Value: !Ref AcBucket
  SQSQueueUrl:
    Description: "SQS Queue URL"
    Value: !Ref SQSQueue
  RcLambdaFunction:
    Description: "RC Lambda Function ARN"
    Value: !GetAtt RcLambdaFunction.Arn
  AcLambdaFunction:
    Description: "AC Lambda Function ARN"
    Value: !GetAtt AcLambdaFunction.Arn
```

## Bước 5: Tạo Lambda handlers

Tạo file `src/handlers/rcHandler.js`:

```javascript
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const sqs = new AWS.SQS();

exports.handler = async (event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

  try {
    const { Body } = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    const fileContent = Body.toString("utf-8");

    await sqs
      .sendMessage({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: JSON.stringify({
          type: "RC",
          content: fileContent,
        }),
      })
      .promise();

    console.log(`File ${key} processed from RC bucket`);
    return { statusCode: 200, body: "Success" };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: "Error processing file" };
  }
};
```

Tạo file `src/handlers/acHandler.js` tương tự, chỉ thay đổi `type: 'AC'`.

## Bước 6: Tạo buildspec.yml

Tạo file `buildspec.yml` trong thư mục gốc:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
  pre_build:
    commands:
      - npm install -g aws-sam-cli
  build:
    commands:
      - sam build
      - sam deploy --no-confirm-changeset --no-fail-on-empty-changeset

artifacts:
  type: zip
  files:
    - template.yaml
    - packaged.yaml
```

## Bước 7: Tạo CodeCommit repository

1. Mở AWS Console và tạo một CodeCommit repository.
2. Clone repository về máy local.
3. Copy toàn bộ nội dung project vào thư mục đã clone.
4. Commit và push code lên repository.

## Bước 8: Tạo CodeBuild project

1. Mở AWS Console và tạo một CodeBuild project.
2. Chọn CodeCommit làm source provider.
3. Chọn repository và branch.
4. Sử dụng buildspec file từ source.
5. Cấu hình các quyền cần thiết cho CodeBuild role.

## Bước 9: Tạo CodePipeline

1. Mở AWS Console và tạo một CodePipeline.
2. Chọn CodeCommit làm source provider.
3. Thêm CodeBuild làm build provider.
4. Cấu hình để trigger pipeline khi có new tag.

## Bước 10: Test và Deploy

1. Tạo một tag mới trên CodeCommit repository.
2. Kiểm tra CodePipeline để xem quá trình build và deploy.
3. Sau khi deploy thành công, test ứng dụng bằng cách upload file lên S3 buckets và kiểm tra SQS queue.

Lưu ý: Đảm bảo rằng bạn đã cấu hình đúng IAM permissions cho Lambda functions để có thể truy cập S3 và SQS.

---

Hãy hướng dẫn chi tiết cho tôi bước 9 chi tiết từng a-z (và về giá cả của dịch vụ nếu có). 

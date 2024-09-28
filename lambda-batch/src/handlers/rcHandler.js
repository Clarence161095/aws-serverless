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

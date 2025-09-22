const AWS = require("aws-sdk");

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // your access key
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // your secret key
  region: process.env.AWS_REGION, // your S3 bucket region
});

const s3 = new AWS.S3();

module.exports = s3;

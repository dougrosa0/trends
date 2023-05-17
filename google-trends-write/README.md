# Overview
Node Lambda function to store Google trends into DynamoDB table

# Deploy
select index.js and package.json file, zip
`aws lambda update-function-code --function-name write-google-trends --zip-file fileb://pathtozip`

# Dependencies

- [aws sdk](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
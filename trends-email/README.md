# Overview
Node function to send trending data via email

# Deploy
select index.js and package.json file, zip
`aws lambda update-function-code --function-name email-trends --zip-file fileb://pathtozip`

# Dependencies

- [aws sdk](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/)
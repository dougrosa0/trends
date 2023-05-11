const aws = require('aws-sdk');
aws.config.update({
  region: 'us-west-2'
});
const docClient = new aws.DynamoDB.DocumentClient();

exports.handler = async function (event) {
  const searchDate = event.queryStringParameters?.date;

  console.log("Search date: " + searchDate);

  const params = {
    TableName: "googleTrends",
    KeyConditionExpression: "#sd = :searchDate",
    ExpressionAttributeNames: {
      "#sd": "searchDate"
    },
    ExpressionAttributeValues: {
      ":searchDate": searchDate
    }
  };

  try {
    const data = await new Promise((resolve, reject) => {
      docClient.query(params, function (err, data) {
        if (err) {
          console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          data.Items.sort(function (a, b) {
            return a.dayRank - b.dayRank;
          })
          const trends = data.Items.map(function (item) {
            return {
              dayRank: item.dayRank,
              queryText: item.queryText,
              trafficAmount: item.trafficAmount
            };
          });
          resolve(trends);
        }
      });
    });

    const response = {
      statusCode: 200,
      body: JSON.stringify(data),
    };

    return response;
  } catch (err) {
    console.error("Error:", JSON.stringify(err, null, 2));
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
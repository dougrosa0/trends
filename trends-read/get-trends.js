const aws = require('aws-sdk');
aws.config.update({
    region: 'us-west-2'
});
const docClient = new aws.DynamoDB.DocumentClient();

var today = new Date();
var year = today.getFullYear().toString();
var month = today.getMonth() + 1;
var monthWithPrecedingZero = (month < 10 ? "0" : "") + month.toString();
var day = today.getDate();
var dayWithPrecedingZero = (day < 10 ? "0" : "") + day.toString();
var searchDate = year + monthWithPrecedingZero + dayWithPrecedingZero;

var params = {
    TableName : "googleTrends",
    KeyConditionExpression: "#sd = :searchDate",
    ExpressionAttributeNames:{
        "#sd": "searchDate"
    },
    ExpressionAttributeValues: {
        ":searchDate": searchDate
    }
};

docClient.query(params, function(err, data) {
    if (err) {
        console.error("Unable to query. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Query succeeded.");
        data.Items.sort(function(a, b) {
            return a.dayRank - b.dayRank;
        })
        var trends = [];
        data.Items.forEach(function(item) {
            var trend = {
              dayRank: item.dayRank,
              queryText: item.queryText,
              trafficAmount: item.trafficAmount
            };
            trends.push(trend);
        });
        return JSON.stringify(trends);
    }
});
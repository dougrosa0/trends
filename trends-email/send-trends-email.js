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
var searchDateUsFormat = month + "/" + day + "/" + year;
console.log("Querying trends for " + searchDate);

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
        var emailContent = "<h2>Trending Google Searches " + searchDateUsFormat + "</h2>";
        emailContent += "<table><tr><th>Rank</th><th>Search</th><th>Traffic amount</th></tr>";
        console.log("Query succeeded.");
        console.log("Query text | Day rank | Traffic amount | Query link")
        data.Items.sort(function(a, b) {
            return a.dayRank - b.dayRank;
        })
        data.Items.forEach(function(item) {
            emailContent += "<tr><td>" + item.dayRank + "</td><td><a href=\"" + encodeURI('https://google.com/search?q=' + item.queryText) + "\">" + item.queryText + "</a></td><td>" + item.trafficAmount + "</td></tr>";
            console.log(item.queryText + " | " + item.dayRank + " | " + item.trafficAmount + " | " + item.queryLink);
        });
        emailContent += "</table>";
        sendEmail(emailContent);
    }
});

function sendEmail(content) {

  // Create sendEmail params data
  var params = {
    Destination: {
      ToAddresses: [
        'dougrosa0@gmail.com'
      ]
    },
    Message: {
      Body: {
        Html: {
         Charset: "UTF-8",
         Data: content
        },
        Text: {
         Charset: "UTF-8",
         Data: content
        }
       },
       Subject: {
        Charset: 'UTF-8',
        Data: 'Google Trends'
       }
      },
    Source: 'dougrosa0@gmail.com'
  };

  // Create the promise and SES service object
  var sendPromise = new aws.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();

  // Handle promise's fulfilled/rejected states
  sendPromise.then(
    function(data) {
      console.log("Email sent successfully. MessageId: " + data.MessageId);
    }).catch(
      function(err) {
      console.error(err, err.stack);
    });
}

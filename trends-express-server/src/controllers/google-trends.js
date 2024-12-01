const aws = require('aws-sdk');
const googleTrends = require('google-trends-api');

aws.config.update({
  region: 'us-west-2'
});
const docClient = new aws.DynamoDB.DocumentClient();

exports.readTrends = async function(req) {
  var searchDate = req.params.date;

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

exports.writeTrends = async function() {
  try {
    const results = await googleTrends.dailyTrends({ geo: 'US' });
    const dailyGoogleTrends = JSON.parse(results);
    const days = dailyGoogleTrends.default.trendingSearchesDays;

    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      const trendingSearches = day.trendingSearches;
      const searchDate = day.date;

      for (let j = 0; j < trendingSearches.length; j++) {
        const search = trendingSearches[j];
        const rank = j+1;
        const query = search.title.query;
        const trafficAmount = search.formattedTraffic;
        console.log(searchDate + " " + query + " " + trafficAmount);
        await saveItem(query, searchDate, trafficAmount, rank);
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Items saved to DynamoDB" })
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" })
    };
  }
};



function saveItem(queryString, searchDate, trafficAmount, dayRank) {
  const queryLink = encodeURI('https://google.com/search?q=' + queryString);
  const params = {
    Item: {
      "searchDate": searchDate,
      "queryText": queryString,
      "trafficAmount": trafficAmount,
      "dayRank": dayRank,
      "queryLink": queryLink
    },
    TableName: "googleTrends"
  };
  return docClient.put(params).promise();
}
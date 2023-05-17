const googleTrends = require('google-trends-api');
const aws = require('aws-sdk');
const dynamodb = new aws.DynamoDB.DocumentClient();

exports.handler = async function(event) {
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
  return dynamodb.put(params).promise();
}

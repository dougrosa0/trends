const googleTrends = require('google-trends-api');
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const dynamodb = new DynamoDB({ region: "us-west-2" });

googleTrends.dailyTrends({
  geo: 'US'
}, saveTrendingSearches);

function saveTrendingSearches (err, results) {
  if (err) {
    console.log(err);
    return;
  }

  const dailyGoogleTrends = JSON.parse(results);
  let days = dailyGoogleTrends.default.trendingSearchesDays;

  for (let i = 0; i < days.length; i++) {
    let day = days[i];
    let trendingSearches = day.trendingSearches;
    let searchDate = day.date;
    console.log("Search date: " + searchDate);
    let searchCount = 5;
    if (trendingSearches.length < 5) {
      searchCount = trendingSearches.length;
    }

    for (let j = 0; j < searchCount; j++) {
      let search = trendingSearches[j];
      let rank = j+1;
      let query = search.title.query;
      let trafficAmount = search.formattedTraffic;
      saveItem(query, searchDate, trafficAmount, rank);
    }
  }
};

function saveItem(queryString, searchDate, trafficAmount, dayRank) {
    let params = {
        Item: {
			      "searchDate": {
                S: searchDate
            },
            "queryText": {
                S: queryString
            },
            "trafficAmount": {
                S: trafficAmount
            },
            "dayRank": {
                N: dayRank.toString()
            }
        },
        TableName: "googleTrends"
    };
    return dynamodb.putItem(params, function(err, data) {
        if (err) console.log(err, err.stack)
		else console.log("Trend " + queryString + " " + trafficAmount + " uploaded to DynamoDB successfully");
    });
}

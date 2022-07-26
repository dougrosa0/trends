const googleTrends = require('google-trends-api');
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const dynamodb = new DynamoDB({ region: "us-west-2" });

googleTrends.dailyTrends({
  geo: 'US'
}, function(err, results) {
  if (err) {
  console.log(err);
  } else {
    const dailyGoogleTrends = JSON.parse(results);
    var days = dailyGoogleTrends.default.trendingSearchesDays;

    for (var i = 0; i < days.length; i++) {
      var day = days[i];
      var trendingSearches = day.trendingSearches;
      var searchDate = day.date;
      console.log("Search date: " + searchDate);
      var searchCount = 5;
      if (trendingSearches.length < 5) {
        searchCount = trendingSearches.length;
      }

      for (var j = 0; j < searchCount; j++) {
        var search = trendingSearches[j];
        var rank = j+1;
        var query = search.title.query;
        var trafficAmount = search.formattedTraffic;
        saveItem(query, searchDate, trafficAmount, rank);
      }
    }
  }
});

function saveItem(queryString, searchDate, trafficAmount, dayRank) {
    var params = {
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

const googleTrends = require('google-trends-api');

const aws = require('aws-sdk');
aws.config.update({
    region: 'us-west-2'
});
const dynamodb = new aws.DynamoDB();

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

    for (var j = 0; j < trendingSearches.length; j++) {
      var search = trendingSearches[j];
      var rank = j+1;
      var query = search.title.query;
      var trafficAmount = search.formattedTraffic;
      console.log(searchDate + " " + query + " " + trafficAmount);
      saveItem(query, searchDate, trafficAmount, rank);
    }
  }
  }
});

function saveItem(queryString, searchDate, trafficAmount, dayRank) {
	var queryLink = encodeURI('https://google.com/search?q=' + queryString);
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
            },
      			"queryLink": {
      				S: queryLink
      			}
        },
        TableName: "googleTrends"
    };
    return dynamodb.putItem(params, function(err, data) {
        if (err) console.log(err, err.stack)
		else console.log(data);
    });
}

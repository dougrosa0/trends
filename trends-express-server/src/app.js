const cors = require("cors");
const express = require("express");
const api = require("./controllers/google-trends.js");

const app = express();
const port = 3000;

app.use(cors());

app.get("/trends/:date", async function (req, res) {
  res.send(await api.readTrends(req));
});

app.put("/trends", async function (req, res) {
  res.send(await api.writeTrends());
});

app.listen(port, function () {
  console.log(`Trends app listening on port ${port}!`);
});
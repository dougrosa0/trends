const express = require('express');
const router = express.Router();
const googleTrendsController = require('../controllers/google-trends');

router.get('/:date', async function (req, res) {
    res.send(await googleTrendsController.readTrends(req));
});

router.put('/', async function (req, res) {
    res.send(await googleTrendsController.writeTrends());
});

module.exports = router;
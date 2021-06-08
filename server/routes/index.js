var express = require('express');
var router = express.Router();
const axios = require('axios');

const API_URL = "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1"
/* GET home page. */
router.get('/', async function(req, res, next) {
  try {
    const result = await axios.get(API_URL);
    const exchangeRate = result.data.observations[0].FXUSDCAD.v;
    res.status(200).json({usdToCad: exchangeRate});
  }catch(err) {
    console.log(err);
  }
});

module.exports = router;

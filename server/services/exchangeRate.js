const axios = require('axios');

const API_URL = "https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?recent=1"



async function getUsdToCad(){
    const result = await axios.get(API_URL);
    const exchangeRate = result.data.observations[0].FXUSDCAD.v;
    return exchangeRate;

}

module.exports = {
    getUsdToCad
}
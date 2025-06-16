const axios = require('axios');

const getRealTimeData = async (symbol) => {
  try {
    const response = await axios.get(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_KEY}`
    );
    return {
      currentPrice: response.data.c,
      high: response.data.h,
      low: response.data.l
    };
  } catch (error) {
    throw new Error('Failed to fetch stock data');
  }
};

module.exports = { getRealTimeData };
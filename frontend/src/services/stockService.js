import api from './api';

export const stockService = {
  getStockData: async (symbol, timeframe = '1d') => {
    try {
      const response = await api.get(`/quote/${symbol}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch stock data: ${error.message}`);
    }
  },

  getMultipleStocks: async (symbols) => {
    try {
      const response = await api.post('/stocks/multiple', { symbols });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch multiple stocks: ${error.message}`);
    }
  },

  getHistoricalData: async (symbol, period = '1y') => {
    try {
      const response = await api.get(`/stocks/${symbol}/history`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }
  },

  searchStocks: async (query) => {
    try {
      const response = await api.get('/stocks/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search stocks: ${error.message}`);
    }
  },

  // Add these if needed elsewhere in your codebase
 getStockQuote: async (symbol) => {
  const response = await api.get(`/quote/${symbol}`);
  return response.data;
}
,

  getWatchlist: async () => {
    try {
      const response = await api.get('/watchlist');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch watchlist: ${error.message}`);
    }
  }
};

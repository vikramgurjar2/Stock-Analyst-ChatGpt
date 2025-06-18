// src/services/stockService.js - Stock-related API calls
import api from './api';

export const stockService = {
  // Get stock data for a specific symbol
  getStockData: async (symbol, timeframe = '1d') => {
    try {
      const response = await api.get(`/quote/:${symbol}`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch stock data: ${error.message}`);
    }
  },

  // Get multiple stocks data
  getMultipleStocks: async (symbols) => {
    try {
      const response = await api.post('/stocks/multiple', {
        symbols: symbols
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch multiple stocks: ${error.message}`);
    }
  },

  // Get stock historical data
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

  // Search stocks
  searchStocks: async (query) => {
    try {
      const response = await api.get('/stocks/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search stocks: ${error.message}`);
    }
  }
};
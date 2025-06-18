import api from './api';

export const portfolioService = {
  // Get user portfolio
  getPortfolio: async () => {
    try {
      const response = await api.get('/portfolio');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch portfolio: ${error.message}`);
    }
  },

  // Add stock to portfolio
  addStock: async (stockData) => {
    try {
      const response = await api.post('/portfolio/stocks', stockData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add stock: ${error.message}`);
    }
  },

  // Update stock in portfolio
  updateStock: async (stockId, updateData) => {
    try {
      const response = await api.put(`/portfolio/stocks/${stockId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update stock: ${error.message}`);
    }
  },

  // Remove stock from portfolio
  removeStock: async (stockId) => {
    try {
      const response = await api.delete(`/portfolio/stocks/${stockId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to remove stock: ${error.message}`);
    }
  },

  // Get portfolio performance
  getPerformance: async (timeframe = '1m') => {
    try {
      const response = await api.get('/portfolio/performance', {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch performance: ${error.message}`);
    }
  }
};
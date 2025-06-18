// Utility functions for the Stock Analyst Dashboard

/**
 * Format currency values
 * @param {number} value - The numerical value to format
 * @param {string} currency - Currency symbol (default: 'USD')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(value);
};

/**
 * Format percentage values
 * @param {number} value - The percentage value
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 2) => {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with K, M, B suffixes
 * @param {number} num - The number to format
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format date strings
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  const dateObj = new Date(date);
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    case 'short':
    default:
      return dateObj.toLocaleDateString('en-US');
  }
};

/**
 * Generate AI response for stock analysis
 * @param {string} stock - Stock symbol
 * @returns {string} AI response text
 */
export const generateAIResponse = (stock) => {
  const recommendations = ['BUY', 'HOLD', 'SELL'];
  const momentum = ['bullish', 'neutral', 'bearish'];
  
  const recommendation = recommendations[Math.floor(Math.random() * recommendations.length)];
  const momentumType = momentum[Math.floor(Math.random() * momentum.length)];
  const targetPrice = (Math.random() * 20 + 160).toFixed(2);
  const allocation = Math.floor(Math.random() * 15 + 5);
  
  return `Based on the current analysis of ${stock}, I recommend a ${recommendation} position. The technical indicators show ${momentumType} momentum with a target price of $${targetPrice}. Portfolio allocation should be around ${allocation}% for optimal risk-adjusted returns.`;
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Calculate portfolio metrics
 * @param {Array} portfolioData - Array of portfolio items
 * @returns {Object} Portfolio metrics
 */
export const calculatePortfolioMetrics = (portfolioData) => {
  const totalValue = portfolioData.reduce((sum, item) => 
    sum + (item.shares * item.currentPrice), 0
  );
  
  const totalChange = portfolioData.reduce((sum, item) => 
    sum + (item.shares * item.currentPrice * item.change / 100), 0
  );
  
  const changePercentage = totalValue > 0 ? (totalChange / totalValue) * 100 : 0;
  
  return {
    totalValue,
    totalChange,
    changePercentage,
    itemCount: portfolioData.length
  };
};

/**
 * Validate stock symbol format
 * @param {string} symbol - Stock symbol to validate
 * @returns {boolean} Whether the symbol is valid
 */
export const isValidStockSymbol = (symbol) => {
  return /^[A-Z]{1,5}$/.test(symbol);
};

/**
 * Get color class based on value
 * @param {number} value - Numerical value
 * @param {boolean} inverse - Whether to inverse colors (default: false)
 * @returns {string} Tailwind color class
 */
export const getColorClass = (value, inverse = false) => {
  if (value > 0) {
    return inverse ? 'text-red-500' : 'text-green-500';
  } else if (value < 0) {
    return inverse ? 'text-green-500' : 'text-red-500';
  }
  return 'text-gray-500';
};
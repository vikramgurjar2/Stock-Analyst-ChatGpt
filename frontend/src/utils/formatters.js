// src/utils/formatters.js - Utility functions for formatting data

export const formatters = {
  // Format currency values
  currency: (value, currency = 'USD') => {
    if (value === null || value === undefined || isNaN(value)) {
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  },

  // Format percentage values
  percentage: (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  // Format large numbers with appropriate suffixes (K, M, B)
  compactNumber: (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  },

  // Format regular numbers with commas
  number: (value, decimals = 0) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  },

  // Format dates
  date: (date, options = {}) => {
    if (!date) return '';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
  },

  // Format time
  time: (date, options = {}) => {
    if (!date) return '';
    
    const defaultOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return new Intl.DateTimeFormat('en-US', defaultOptions).format(new Date(date));
  },

  // Format market cap
  marketCap: (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    
    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  },

  // Format volume
  volume: (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    } else {
      return value.toString();
    }
  },

  // Format price change with + or - sign
  priceChange: (value, showSign = true) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '$0.00';
    }
    
    const formatted = formatters.currency(Math.abs(value));
    
    if (!showSign) return formatted;
    
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  },

  // Format percentage change with + or - sign
  percentageChange: (value, decimals = 2, showSign = true) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00%';
    }
    
    const formatted = formatters.percentage(Math.abs(value), decimals);
    
    if (!showSign) return formatted;
    
    return value >= 0 ? `+${formatted}` : `-${formatted}`;
  },

  // Format decimal values
  decimal: (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    
    return parseFloat(value).toFixed(decimals);
  },

  // Format stock price
  stockPrice: (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '$0.00';
    }
    
    // For stock prices, we typically want more precision
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  },

  // Format P/E ratio
  peRatio: (value) => {
    if (value === null || value === undefined || isNaN(value) || value <= 0) {
      return 'N/A';
    }
    
    return value.toFixed(2);
  },

  // Format EPS (Earnings Per Share)
  eps: (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    
    return formatters.currency(value);
  },

  // Format dividend yield
  dividendYield: (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    
    return formatters.percentage(value / 100, 2);
  },

  // Format 52-week range
  priceRange: (low, high) => {
    if (!low || !high || isNaN(low) || isNaN(high)) {
      return 'N/A';
    }
    
    return `${formatters.stockPrice(low)} - ${formatters.stockPrice(high)}`;
  }
};

// Export individual formatters for convenience
export const {
  currency,
  percentage,
  compactNumber,
  number,
  date,
  time,
  marketCap,
  volume,
  priceChange,
  percentageChange,
  decimal,
  stockPrice,
  peRatio,
  eps,
  dividendYield,
  priceRange
} = formatters;
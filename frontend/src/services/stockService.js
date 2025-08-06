import api from "./api";

export const stockService = {
  getStockData: async (symbol, timeframe = "1d") => {
    try {
      const response = await api.get(`/api/quote/${symbol}`, {
        params: { timeframe },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch stock data: ${error.message}`);
    }
  },

  getMultipleStocks: async (symbols) => {
    try {
      const response = await api.post("/api/stocks/multiple", { symbols });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch multiple stocks: ${error.message}`);
    }
  },

  getHistoricalData: async (symbol, period = "1mo") => {
    try {
      const response = await api.get(`/api/stocks/history/${symbol}`, {
        params: { period },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch historical data: ${error.message}`);
    }
  },

  searchStocks: async (query) => {
    try {
      const response = await api.get("/api/stocks/search", {
        params: { q: query },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search stocks: ${error.message}`);
    }
  },

  // Fixed: Added try/catch for consistency
  getStockQuote: async (symbol) => {
    try {
      const response = await api.get(`/api/stocks/quote/${symbol}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch stock quote: ${error.message}`);
    }
  },

  getWatchlist: async () => {
    try {
      const response = await api.get("/api/stocks/watchlist");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch watchlist: ${error.message}`);
    }
  },

  // Watchlist Management
  addToWatchlist: async (symbol) => {
    try {
      const response = await api.post("/api/watchlist", {
        symbol: symbol.toUpperCase(),
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to add to watchlist: ${error.message}`);
    }
  },

  removeFromWatchlist: async (symbol) => {
    try {
      const response = await api.delete(
        `/api/watchlist/${symbol.toUpperCase()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to remove from watchlist: ${error.message}`);
    }
  },

  refreshWatchlist: async () => {
    try {
      const response = await api.post("/api/watchlist/refresh");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to refresh watchlist: ${error.message}`);
    }
  },

  // Market Data
  getTrendingStocks: async () => {
    try {
      const response = await api.get("/api/stocks/trending");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch trending stocks: ${error.message}`);
    }
  },

  getMarketMovers: async (type = "gainers") => {
    try {
      const response = await api.get("/api/stocks/movers", {
        params: { type },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch market movers: ${error.message}`);
    }
  },

  getMarketStatus: async () => {
    try {
      const response = await api.get("/api/stocks/market-status");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch market status: ${error.message}`);
    }
  },

  // Portfolio Operations
  getPortfolio: async () => {
    try {
      const response = await api.get("/api/portfolio");
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch portfolio: ${error.message}`);
    }
  },
};

// Utility functions
export const stockUtils = {
  // Format price with currency
  formatPrice: (price, currency = "USD") => {
    if (price === null || price === undefined) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  },

  // Format change percentage
  formatChangePercent: (changePercent) => {
    if (changePercent === null || changePercent === undefined) return "N/A";
    const sign = changePercent >= 0 ? "+" : "";
    return `${sign}${changePercent.toFixed(2)}%`;
  },

  // Format volume
  formatVolume: (volume) => {
    if (volume === null || volume === undefined) return "N/A";
    if (volume >= 1000000000) {
      return `${(volume / 1000000000).toFixed(1)}B`;
    } else if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}K`;
    }
    return volume.toString();
  },

  // Get color class for change (Tailwind classes)
  getChangeColor: (change) => {
    if (change === null || change === undefined) return "text-gray-500";
    return change >= 0 ? "text-green-600" : "text-red-600";
  },

  // Get trend icon
  getTrendIcon: (change) => {
    if (change === null || change === undefined) return "→";
    return change >= 0 ? "↗" : "↘";
  },

  // Validate stock symbol
  isValidSymbol: (symbol) => {
    if (!symbol || typeof symbol !== "string") return false;
    return /^[A-Za-z0-9.-]{1,10}$/.test(symbol.trim());
  },

  // Debounce function for search
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
};

// Error handler utility
export const handleStockError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return data?.message || "Invalid request";
      case 401:
        return "Authentication required";
      case 404:
        return "Stock not found";
      case 429:
        const retryAfter = data?.retryAfter || 60;
        return `Rate limit exceeded. Try again in ${retryAfter} seconds.`;
      case 500:
        return "Server error. Please try again later.";
      default:
        return data?.message || "An unexpected error occurred";
    }
  } else if (error.request) {
    return "Network error. Please check your connection.";
  } else {
    return error.message || "An unexpected error occurred";
  }
};

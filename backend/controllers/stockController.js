const { StockData, Watchlist } = require('../models/Stock');
const axios = require('axios');
const { validationResult } = require('express-validator');

// Rate limiting configuration
const RATE_LIMIT_DELAY = 12000; // 12 seconds between API calls (5 calls per minute)
let lastApiCall = 0;

// Helper function to add delay between API calls
const enforceRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastCall;
    console.log(`Rate limiting: waiting ${waitTime}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastApiCall = Date.now();
};

// Get stock data from external API (Alpha Vantage) with caching
const fetchStockData = async (symbol, useCache = true) => {
  try {
    // Check cache first if enabled
    if (useCache) {
      const cachedData = await StockData.findOne({ 
        symbol: symbol.toUpperCase(),
        lastUpdated: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes cache
      });
      
      if (cachedData) {
        console.log(`Using cached data for ${symbol}`);
        return {
          symbol: cachedData.symbol,
          price: cachedData.price,
          change: cachedData.change,
          changePercent: cachedData.changePercent,
          volume: cachedData.volume,
          high: cachedData.high || 0,
          low: cachedData.low || 0,
          open: cachedData.open || 0,
          previousClose: cachedData.previousClose || 0
        };
      }
    }

    // Enforce rate limiting before API call
    await enforceRateLimit();

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('API Response for', symbol, ':', JSON.stringify(response.data, null, 2));

    // Check for API errors
    if (response.data['Error Message']) {
      throw new Error(`Invalid stock symbol: ${symbol}`);
    }

    if (response.data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    const quote = response.data['Global Quote'];
    
    // Check if quote exists and has data
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    // Validate required fields exist
    const requiredFields = [
      '01. symbol',
      '05. price',
      '09. change',
      '10. change percent'
    ];

    for (const field of requiredFields) {
      if (!quote[field]) {
        console.log(`Missing field: ${field}`);
        throw new Error(`Incomplete data received for symbol: ${symbol}`);
      }
    }

    // Parse values with validation
    const parseNumber = (value, fieldName) => {
      if (!value || value === '') {
        return 0; // Return 0 for missing optional fields
      }
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        return 0;
      }
      return parsed;
    };

    const parseInteger = (value, fieldName) => {
      if (!value || value === '') {
        return 0;
      }
      const parsed = parseInt(value);
      if (isNaN(parsed)) {
        return 0;
      }
      return parsed;
    };

    // Clean and parse change percent
    const changePercentRaw = quote['10. change percent'];
    const changePercentCleaned = changePercentRaw.replace('%', '');

    const stockData = {
      symbol: quote['01. symbol'],
      price: parseNumber(quote['05. price'], 'price'),
      change: parseNumber(quote['09. change'], 'change'),
      changePercent: parseNumber(changePercentCleaned, 'change percent'),
      volume: parseInteger(quote['06. volume'], 'volume'),
      high: parseNumber(quote['03. high'], 'high'),
      low: parseNumber(quote['04. low'], 'low'),
      open: parseNumber(quote['02. open'], 'open'),
      previousClose: parseNumber(quote['08. previous close'], 'previous close')
    };

    // Save to database for caching
    await StockData.findOneAndUpdate(
      { symbol: stockData.symbol },
      { ...stockData, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    return stockData;
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    throw error;
  }
};

//Get stock quote
const getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Stock symbol is required'
      });
    }

    const stockData = await fetchStockData(symbol.toUpperCase(), false); // Don't use cache for direct requests
    
    res.json({
      success: true,
      data: stockData
    });

  } catch (error) {
    console.error('Get stock quote error:', error.message);
    
    // Return more specific error messages
    if (error.message.includes('Invalid stock symbol')) {
      return res.status(404).json({
        success: false,
        message: 'Stock symbol not found',
        error: error.message
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'API rate limit exceeded',
        error: error.message,
        retryAfter: 60 // seconds
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock data',
      error: error.message
    });
  }
};
// const getStockQuote = async (req, res) => {
//   try {
//     const { symbol } = req.params;
//     const stockData = await fetchStockData(symbol);
    
//     res.json({
//       success: true,
//       data: stockData  // or { stockData } depending on your frontend expectation
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
// Get multiple stock quotes (batch)
const getMultipleQuotes = async (req, res) => {
  try {
    const { symbols } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Symbols array is required'
      });
    }

    if (symbols.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 10 symbols allowed per request'
      });
    }

    const results = [];
    const errors = [];

    // Process symbols sequentially to avoid rate limiting
    for (const symbol of symbols) {
      try {
        const stockData = await fetchStockData(symbol.toUpperCase(), true); // Use cache
        results.push(stockData);
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error.message);
        errors.push({ symbol: symbol.toUpperCase(), error: error.message });
      }
    }

    res.json({
      success: true,
      data: results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Get multiple quotes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stock data',
      error: error.message
    });
  }
};

// Search stocks
const searchStocks = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Enforce rate limiting
    await enforceRateLimit();

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      },
      timeout: 10000
    });

    console.log('Search API Response:', JSON.stringify(response.data, null, 2));

    // Check for API errors
    if (response.data['Error Message']) {
      throw new Error('Search failed: ' + response.data['Error Message']);
    }

    if (response.data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    const matches = response.data.bestMatches || [];
    
    const results = matches.slice(0, 10).map(match => ({
      symbol: match['1. symbol'] || match['1. Symbol'],
      name: match['2. name'] || match['2. Name'],
      type: match['3. type'] || match['3. Type'],
      region: match['4. region'] || match['4. Region'],
      currency: match['8. currency'] || match['8. Currency']
    }));

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Search stocks error:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'API rate limit exceeded',
        error: error.message,
        retryAfter: 60
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to search stocks',
      error: error.message
    });
  }
};

// Get user's watchlist (optimized to avoid rate limiting)
const getWatchlist = async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.user.userId });
    
    if (!watchlist) {
      watchlist = new Watchlist({ userId: req.user.userId, stocks: [] });
      await watchlist.save();
    }

    // Return watchlist with cached data to avoid rate limiting
    const stocksWithPrices = await Promise.all(
      watchlist.stocks.map(async (stock) => {
        try {
          // Use cached data for watchlist to avoid hitting rate limits
          const currentData = await fetchStockData(stock.symbol, true);
          return {
            ...stock.toObject(),
            currentPrice: currentData.price,
            change: currentData.change,
            changePercent: currentData.changePercent,
            volume: currentData.volume
          };
        } catch (error) {
          console.error(`Error fetching data for ${stock.symbol}:`, error);
          return {
            ...stock.toObject(),
            currentPrice: null,
            change: null,
            changePercent: null,
            volume: null
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        ...watchlist.toObject(),
        stocks: stocksWithPrices
      }
    });

  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get watchlist',
      error: error.message
    });
  }
};

// Refresh watchlist data (force update)
const refreshWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ userId: req.user.userId });
    
    if (!watchlist || watchlist.stocks.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found or empty'
      });
    }

    const stocksWithPrices = [];
    const errors = [];

    // Refresh data for each stock (will be slow due to rate limiting)
    for (const stock of watchlist.stocks) {
      try {
        const currentData = await fetchStockData(stock.symbol, false); // Force fresh data
        stocksWithPrices.push({
          ...stock.toObject(),
          currentPrice: currentData.price,
          change: currentData.change,
          changePercent: currentData.changePercent,
          volume: currentData.volume
        });
      } catch (error) {
        console.error(`Error refreshing data for ${stock.symbol}:`, error);
        errors.push({ symbol: stock.symbol, error: error.message });
        stocksWithPrices.push({
          ...stock.toObject(),
          currentPrice: null,
          change: null,
          changePercent: null,
          volume: null
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...watchlist.toObject(),
        stocks: stocksWithPrices
      },
      errors: errors.length > 0 ? errors : undefined,
      message: 'Watchlist refreshed successfully'
    });

  } catch (error) {
    console.error('Refresh watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh watchlist',
      error: error.message
    });
  }
};

// Add stock to watchlist
const addToWatchlist = async (req, res) => {
  try {
    const { symbol } = req.body;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Stock symbol is required'
      });
    }

    // Verify stock exists
    await fetchStockData(symbol.toUpperCase(), true);

    let watchlist = await Watchlist.findOne({ userId: req.user.userId });
    
    if (!watchlist) {
      watchlist = new Watchlist({ userId: req.user.userId, stocks: [] });
    }

    // Check if stock already in watchlist
    const existingStock = watchlist.stocks.find(
      stock => stock.symbol === symbol.toUpperCase()
    );

    if (existingStock) {
      return res.status(400).json({
        success: false,
        message: 'Stock already in watchlist'
      });
    }

    watchlist.stocks.push({
      symbol: symbol.toUpperCase(),
      addedAt: new Date()
    });

    await watchlist.save();

    res.json({
      success: true,
      message: 'Stock added to watchlist successfully',
      data: watchlist
    });

  } catch (error) {
    console.error('Add to watchlist error:', error);
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        message: 'API rate limit exceeded',
        error: error.message,
        retryAfter: 60
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to add stock to watchlist',
      error: error.message
    });
  }
};

// Remove stock from watchlist
const removeFromWatchlist = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const watchlist = await Watchlist.findOne({ userId: req.user.userId });
    
    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    const initialLength = watchlist.stocks.length;
    watchlist.stocks = watchlist.stocks.filter(
      stock => stock.symbol !== symbol.toUpperCase()
    );

    if (watchlist.stocks.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found in watchlist'
      });
    }

    await watchlist.save();

    res.json({
      success: true,
      message: 'Stock removed from watchlist successfully',
      data: watchlist
    });

  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove stock from watchlist',
      error: error.message
    });
  }
};

// Get stock history (from cached data)
const getStockHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query; // 1D, 1W, 1M, 3M, 6M, 1Y
    
    // For now, return mock historical data since Alpha Vantage requires separate API calls
    // In production, you might want to use a different API or cache historical data
    const mockHistoricalData = generateMockHistoricalData(symbol, period);
    
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        period,
        data: mockHistoricalData
      }
    });

  } catch (error) {
    console.error('Get stock history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stock history',
      error: error.message
    });
  }
};

// Helper function to generate mock historical data
const generateMockHistoricalData = (symbol, period) => {
  const periods = {
    '1D': 1,
    '1W': 7, 
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365
  };
  
  const days = periods[period] || 30;
  const data = [];
  let basePrice = 100 + Math.random() * 400; // Random base price between 100-500
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some random price movement
    const change = (Math.random() - 0.5) * 10; // Random change between -5 and +5
    basePrice += change;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat((basePrice + (Math.random() - 0.5) * 2).toFixed(2)),
      high: parseFloat((basePrice + Math.random() * 5).toFixed(2)),
      low: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
      close: parseFloat(basePrice.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000)
    });
  }
  
  return data;
};

module.exports = {
  getStockQuote,
  getMultipleQuotes,
  searchStocks,
  getWatchlist,
  refreshWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getStockHistory
};
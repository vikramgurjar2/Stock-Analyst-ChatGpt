const { StockData, Watchlist } = require('../models/Stock');
const axios = require('axios');
const { validationResult } = require('express-validator');

// Get stock data from external API (Alpha Vantage)
const fetchStockData = async (symbol) => {
  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });

    console.log('API Response:', JSON.stringify(response.data, null, 2));

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
      '10. change percent',
      '06. volume',
      '03. high',
      '04. low',
      '02. open',
      '08. previous close'
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
        throw new Error(`Invalid ${fieldName} value: ${value}`);
      }
      const parsed = parseFloat(value);
      if (isNaN(parsed)) {
        throw new Error(`Cannot parse ${fieldName}: ${value}`);
      }
      return parsed;
    };

    const parseInteger = (value, fieldName) => {
      if (!value || value === '') {
        throw new Error(`Invalid ${fieldName} value: ${value}`);
      }
      const parsed = parseInt(value);
      if (isNaN(parsed)) {
        throw new Error(`Cannot parse ${fieldName}: ${value}`);
      }
      return parsed;
    };

    // Clean and parse change percent
    const changePercentRaw = quote['10. change percent'];
    const changePercentCleaned = changePercentRaw.replace('%', '');

    return {
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
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    throw error;
  }
};

// Get stock quote
const getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Stock symbol is required'
      });
    }

    const stockData = await fetchStockData(symbol.toUpperCase());
    
    // Save to database
    await StockData.findOneAndUpdate(
      { symbol: stockData.symbol },
      { ...stockData, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

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
        error: error.message
      });
    }

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

    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
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
    console.log('Matches found:', matches.length);
    
    if (matches.length > 0) {
      console.log('First match structure:', JSON.stringify(matches[0], null, 2));
    }

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
    res.status(500).json({
      success: false,
      message: 'Failed to search stocks',
      error: error.message
    });
  }
};

// Get user's watchlist
const getWatchlist = async (req, res) => {
  try {
    let watchlist = await Watchlist.findOne({ userId: req.user.userId });
    
    if (!watchlist) {
      watchlist = new Watchlist({ userId: req.user.userId, stocks: [] });
      await watchlist.save();
    }

    // Fetch current prices for watchlist stocks
    const stocksWithPrices = await Promise.all(
      watchlist.stocks.map(async (stock) => {
        try {
          const currentData = await fetchStockData(stock.symbol);
          return {
            ...stock.toObject(),
            currentPrice: currentData.price,
            change: currentData.change,
            changePercent: currentData.changePercent
          };
        } catch (error) {
          console.error(`Error fetching data for ${stock.symbol}:`, error);
          return {
            ...stock.toObject(),
            currentPrice: null,
            change: null,
            changePercent: null
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
    await fetchStockData(symbol.toUpperCase());

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

    watchlist.stocks = watchlist.stocks.filter(
      stock => stock.symbol !== symbol.toUpperCase()
    );

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

module.exports = {
  getStockQuote,
  searchStocks,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
};
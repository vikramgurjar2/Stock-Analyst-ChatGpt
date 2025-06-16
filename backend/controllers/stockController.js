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

    const quote = response.data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('Stock data not found');
    }

    return {
      symbol: quote['01. Symbol'],
      price: parseFloat(quote['05. Price']),
      change: parseFloat(quote['09. Change']),
      changePercent: parseFloat(quote['10. Change Percent'].replace('%', '')),
      volume: parseInt(quote['06. Volume']),
      high: parseFloat(quote['03. High']),
      low: parseFloat(quote['04. Low']),
      open: parseFloat(quote['02. Open']),
      previousClose: parseFloat(quote['08. Previous Close'])
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
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
    console.error('Get stock quote error:', error);
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

    const matches = response.data.bestMatches || [];
    const results = matches.slice(0, 10).map(match => ({
      symbol: match['1. Symbol'],
      name: match['2. Name'],
      type: match['3. Type'],
      region: match['4. Region'],
      currency: match['8. Currency']
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
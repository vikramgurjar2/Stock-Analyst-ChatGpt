const { StockData, Watchlist } = require("../models/Stock");
const yahooFinance = require("yahoo-finance2").default;
const { validationResult } = require("express-validator");

// Rate limiting configuration (Yahoo Finance is more lenient)
const RATE_LIMIT_DELAY = 1000; // 1 second between API calls
let lastApiCall = 0;

// Helper function to add delay between API calls
const enforceRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;

  if (timeSinceLastCall < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastCall;
    console.log(`Rate limiting: waiting ${waitTime}ms`);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  lastApiCall = Date.now();
};

// Get stock data from Yahoo Finance API with caching
const fetchStockData = async (symbol, useCache = true) => {
  try {
    // Check cache first if enabled
    if (useCache) {
      const cachedData = await StockData.findOne({
        symbol: symbol.toUpperCase(),
        lastUpdated: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // 5 minutes cache
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
          previousClose: cachedData.previousClose || 0,
          marketCap: cachedData.marketCap || 0,
          name: cachedData.name || "",
        };
      }
    }

    // Enforce rate limiting before API call
    await enforceRateLimit();

    // Fetch quote data from Yahoo Finance
    const quote = await yahooFinance.quote(symbol, {
      modules: ["price", "summaryDetail", "defaultKeyStatistics"],
    });

    console.log(
      "Yahoo Finance API Response for",
      symbol,
      ":",
      JSON.stringify(quote, null, 2)
    );

    // Check if quote exists and has data
    if (!quote || !quote.price) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    const price = quote.price;
    const summaryDetail = quote.summaryDetail || {};

    // Calculate change and change percent
    const currentPrice = price.regularMarketPrice || price.postMarketPrice || 0;
    const previousClose = price.regularMarketPreviousClose || 0;
    const change = currentPrice - previousClose;
    const changePercent =
      previousClose !== 0 ? (change / previousClose) * 100 : 0;

    const stockData = {
      symbol: quote.symbol || symbol.toUpperCase(),
      name: quote.shortName || quote.longName || "",
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      volume: price.regularMarketVolume || price.postMarketVolume || 0,
      high: price.regularMarketDayHigh || 0,
      low: price.regularMarketDayLow || 0,
      open: price.regularMarketOpen || 0,
      previousClose: previousClose,
      marketCap: price.marketCap || summaryDetail.marketCap || 0,
      pe: summaryDetail.trailingPE || 0,
      eps: quote.epsTrailingTwelveMonths || 0,
      dividend: summaryDetail.dividendRate || 0,
      dividendYield: summaryDetail.dividendYield
        ? summaryDetail.dividendYield * 100
        : 0,
      beta: summaryDetail.beta || 0,
      high52Week: summaryDetail.fiftyTwoWeekHigh || 0,
      low52Week: summaryDetail.fiftyTwoWeekLow || 0,
      sector: quote.sector || "",
      industry: quote.industry || "",
      exchange: quote.fullExchangeName || quote.exchange || "",
      currency: price.currency || "USD",
    };

    // Save to database for caching
    await StockData.findOneAndUpdate(
      { symbol: stockData.symbol },
      { ...stockData, lastUpdated: new Date() },
      { upsert: true, new: true }
    );

    return stockData;
  } catch (error) {
    console.error("Error fetching stock data:", error.message);

    // Handle specific Yahoo Finance errors
    if (error.message.includes("Not Found") || error.message.includes("404")) {
      throw new Error(`Invalid stock symbol: ${symbol}`);
    }

    throw error;
  }
};

// Get stock quote
const getStockQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    console.log("Fetching stock quote for:", symbol);

    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: "Stock symbol is required",
      });
    }

    const stockData = await fetchStockData(symbol.toUpperCase(), false); // Don't use cache for direct requests

    res.json({
      success: true,
      data: stockData,
    });
  } catch (error) {
    console.error("Get stock quote error:", error.message);

    // Return more specific error messages
    if (error.message.includes("Invalid stock symbol")) {
      return res.status(404).json({
        success: false,
        message: "Stock symbol not found",
        error: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch stock data",
      error: error.message,
    });
  }
};

// Get multiple stock quotes (batch)
const getMultipleQuotes = async (req, res) => {
  try {
    const { symbols } = req.body;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Symbols array is required",
      });
    }

    if (symbols.length > 20) {
      return res.status(400).json({
        success: false,
        message: "Maximum 20 symbols allowed per request",
      });
    }

    const results = [];
    const errors = [];

    // Yahoo Finance can handle multiple symbols better
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
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Get multiple quotes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock data",
      error: error.message,
    });
  }
};

// Search stocks using Yahoo Finance
const searchStocks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    // Enforce rate limiting
    await enforceRateLimit();

    const searchResults = await yahooFinance.search(query);

    console.log(
      "Yahoo Finance Search Results:",
      JSON.stringify(searchResults, null, 2)
    );

    const results = searchResults.quotes.slice(0, 10).map((quote) => ({
      symbol: quote.symbol,
      name: quote.shortname || quote.longname,
      type: quote.typeDisp || quote.quoteType,
      exchange: quote.exchange,
      sector: quote.sector || "",
      industry: quote.industry || "",
    }));

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Search stocks error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search stocks",
      error: error.message,
    });
  }
};

// Get stock history using Yahoo Finance
const getStockHistory = async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = "1mo", interval = "1d" } = req.query;

    // Enforce rate limiting
    await enforceRateLimit();

    const queryOptions = {
      period1: getPeriodStartDate(period),
      period2: new Date(),
      interval: interval, // 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
    };

    const result = await yahooFinance.historical(symbol, queryOptions);

    const historicalData = result.map((item) => ({
      date: item.date.toISOString().split("T")[0],
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      volume: item.volume,
    }));

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        period,
        interval,
        data: historicalData,
      },
    });
  } catch (error) {
    console.error("Get stock history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get stock history",
      error: error.message,
    });
  }
};

// Helper function to get period start date
const getPeriodStartDate = (period) => {
  const now = new Date();
  const startDate = new Date(now);

  switch (period) {
    case "1d":
      startDate.setDate(now.getDate() - 1);
      break;
    case "5d":
      startDate.setDate(now.getDate() - 5);
      break;
    case "1mo":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "3mo":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "6mo":
      startDate.setMonth(now.getMonth() - 6);
      break;
    case "1y":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    case "2y":
      startDate.setFullYear(now.getFullYear() - 2);
      break;
    case "5y":
      startDate.setFullYear(now.getFullYear() - 5);
      break;
    case "10y":
      startDate.setFullYear(now.getFullYear() - 10);
      break;
    default:
      startDate.setMonth(now.getMonth() - 1);
  }

  return startDate;
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
            volume: currentData.volume,
            name: currentData.name,
          };
        } catch (error) {
          console.error(`Error fetching data for ${stock.symbol}:`, error);
          return {
            ...stock.toObject(),
            currentPrice: null,
            change: null,
            changePercent: null,
            volume: null,
            name: null,
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        ...watchlist.toObject(),
        stocks: stocksWithPrices,
      },
    });
  } catch (error) {
    console.error("Get watchlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get watchlist",
      error: error.message,
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
        message: "Watchlist not found or empty",
      });
    }

    const stocksWithPrices = [];
    const errors = [];

    // Refresh data for each stock
    for (const stock of watchlist.stocks) {
      try {
        const currentData = await fetchStockData(stock.symbol, false); // Force fresh data
        stocksWithPrices.push({
          ...stock.toObject(),
          currentPrice: currentData.price,
          change: currentData.change,
          changePercent: currentData.changePercent,
          volume: currentData.volume,
          name: currentData.name,
        });
      } catch (error) {
        console.error(`Error refreshing data for ${stock.symbol}:`, error);
        errors.push({ symbol: stock.symbol, error: error.message });
        stocksWithPrices.push({
          ...stock.toObject(),
          currentPrice: null,
          change: null,
          changePercent: null,
          volume: null,
          name: null,
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...watchlist.toObject(),
        stocks: stocksWithPrices,
      },
      errors: errors.length > 0 ? errors : undefined,
      message: "Watchlist refreshed successfully",
    });
  } catch (error) {
    console.error("Refresh watchlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh watchlist",
      error: error.message,
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
        message: "Stock symbol is required",
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
      (stock) => stock.symbol === symbol.toUpperCase()
    );

    if (existingStock) {
      return res.status(400).json({
        success: false,
        message: "Stock already in watchlist",
      });
    }

    watchlist.stocks.push({
      symbol: symbol.toUpperCase(),
      addedAt: new Date(),
    });

    await watchlist.save();

    res.json({
      success: true,
      message: "Stock added to watchlist successfully",
      data: watchlist,
    });
  } catch (error) {
    console.error("Add to watchlist error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add stock to watchlist",
      error: error.message,
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
        message: "Watchlist not found",
      });
    }

    const initialLength = watchlist.stocks.length;
    watchlist.stocks = watchlist.stocks.filter(
      (stock) => stock.symbol !== symbol.toUpperCase()
    );

    if (watchlist.stocks.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: "Stock not found in watchlist",
      });
    }

    await watchlist.save();

    res.json({
      success: true,
      message: "Stock removed from watchlist successfully",
      data: watchlist,
    });
  } catch (error) {
    console.error("Remove from watchlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove stock from watchlist",
      error: error.message,
    });
  }
};

module.exports = {
  getStockQuote,
  getMultipleQuotes,
  searchStocks,
  getWatchlist,
  refreshWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getStockHistory,
};

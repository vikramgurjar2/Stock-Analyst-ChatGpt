const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  getStockQuote,
  getMultipleQuotes,
  searchStocks,
  getWatchlist,
  refreshWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getStockHistory
} = require('../controllers/stockController');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting middleware - adjusted for Yahoo Finance limits
const stockApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // Increased slightly since Yahoo Finance is more lenient
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for cached watchlist requests
  skip: (req) => req.path === '/watchlist' && req.method === 'GET'
});

// Separate rate limit for search (more restrictive)
const searchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Too many search requests, please try again later.',
    retryAfter: 60
  }
});

// Validation error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Enhanced validation middleware
const symbolValidation = [
  param('symbol')
    .isLength({ min: 1, max: 10 })
    .withMessage('Stock symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z0-9\.\-^]+$/)
    .withMessage('Stock symbol contains invalid characters')
    .customSanitizer(value => value.toUpperCase().trim())
];

const searchValidation = [
  query('query')
    .isLength({ min: 2, max: 50 })
    .withMessage('Search query must be between 2 and 50 characters')
    .matches(/^[A-Za-z0-9\s\.\-&]+$/)
    .withMessage('Search query contains invalid characters')
    .customSanitizer(value => value.trim())
];

const addWatchlistValidation = [
  body('symbol')
    .isLength({ min: 1, max: 10 })
    .withMessage('Stock symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z0-9\.\-^]+$/)
    .withMessage('Stock symbol contains invalid characters')
    .customSanitizer(value => value.toUpperCase().trim())
];

const multipleQuotesValidation = [
  body('symbols')
    .isArray({ min: 1, max: 15 }) // Increased limit
    .withMessage('Symbols must be an array with 1-15 elements'),
  body('symbols.*')
    .isLength({ min: 1, max: 10 })
    .withMessage('Each symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z0-9\.\-^]+$/)
    .withMessage('Symbol contains invalid characters')
    .customSanitizer(value => value.toUpperCase().trim())
];

// Fixed history validation - match controller periods
const historyValidation = [
  param('symbol')
    .isLength({ min: 1, max: 10 })
    .withMessage('Stock symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z0-9\.\-^]+$/)
    .withMessage('Stock symbol contains invalid characters')
    .customSanitizer(value => value.toUpperCase().trim()),
  query('period')
    .optional()
    .isIn(['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y', '5y', '10y'])
    .withMessage('Period must be one of: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y'),
  query('interval')
    .optional()
    .isIn(['1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'])
    .withMessage('Invalid interval specified')
];

// Enhanced error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Stock API Error:', err);
  
  // Yahoo Finance specific errors
  if (err.message.includes('Not Found') || err.message.includes('404')) {
    return res.status(404).json({
      success: false,
      message: 'Stock symbol not found',
      code: 'SYMBOL_NOT_FOUND'
    });
  }
  
  if (err.message.includes('rate limit') || err.message.includes('429')) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: 60
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
};

// Stock quote routes
router.get('/quote/:symbol', 
  auth, 
  stockApiRateLimit,
  symbolValidation, 
  handleValidationErrors, 
  getStockQuote
);

// Multiple quotes route (for dashboard/watchlist bulk updates)
router.post('/quotes', 
  auth, 
  stockApiRateLimit,
  multipleQuotesValidation, 
  handleValidationErrors, 
  getMultipleQuotes
);

// Search stocks route - with stricter rate limiting
router.get('/search', 
  auth, 
  searchRateLimit,
  searchValidation, 
  handleValidationErrors, 
  searchStocks
);

// Watchlist routes - no rate limit for basic get
router.get('/watchlist', 
  auth, 
  getWatchlist
);

// Refresh watchlist route (force update all stocks)
router.post('/watchlist/refresh', 
  auth, 
  stockApiRateLimit,
  refreshWatchlist
);

router.post('/watchlist', 
  auth, 
  stockApiRateLimit,
  addWatchlistValidation, 
  handleValidationErrors, 
  addToWatchlist
);

router.delete('/watchlist/:symbol', 
  auth, 
  symbolValidation, 
  handleValidationErrors, 
  removeFromWatchlist
);

// Stock history route
router.get('/history/:symbol', 
  auth, 
  stockApiRateLimit,
  historyValidation, 
  handleValidationErrors, 
  getStockHistory
);

// Enhanced market data routes
router.get('/trending', auth, stockApiRateLimit, (req, res) => {
  // You might want to fetch real trending data from Yahoo Finance
  const trendingStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', changePercent: 2.5 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', changePercent: 1.8 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', changePercent: -0.5 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', changePercent: 3.2 },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', changePercent: 1.1 }
  ];
  
  res.json({
    success: true,
    data: trendingStocks,
    timestamp: new Date().toISOString()
  });
});

router.get('/movers', auth, stockApiRateLimit, (req, res) => {
  const { type = 'gainers' } = req.query;
  
  // Validate type parameter
  if (!['gainers', 'losers', 'active'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Type must be one of: gainers, losers, active'
    });
  }
  
  const movers = {
    gainers: [
      { symbol: 'NVDA', name: 'NVIDIA Corporation', changePercent: 8.5, price: 485.23, volume: 45000000 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', changePercent: 6.2, price: 123.45, volume: 32000000 },
      { symbol: 'TSLA', name: 'Tesla, Inc.', changePercent: 5.8, price: 185.67, volume: 78000000 }
    ],
    losers: [
      { symbol: 'META', name: 'Meta Platforms, Inc.', changePercent: -4.2, price: 298.34, volume: 23000000 },
      { symbol: 'NFLX', name: 'Netflix, Inc.', changePercent: -3.8, price: 423.12, volume: 18000000 },
      { symbol: 'PYPL', name: 'PayPal Holdings, Inc.', changePercent: -2.9, price: 67.89, volume: 15000000 }
    ],
    active: [
      { symbol: 'AAPL', name: 'Apple Inc.', volume: 89000000, price: 178.23, changePercent: 1.2 },
      { symbol: 'TSLA', name: 'Tesla, Inc.', volume: 156000000, price: 185.67, changePercent: 5.8 },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', volume: 67000000, price: 445.23, changePercent: 0.8 }
    ]
  };
  
  res.json({
    success: true,
    data: movers[type],
    type,
    timestamp: new Date().toISOString()
  });
});

// Portfolio routes placeholder
router.get('/portfolio', auth, (req, res) => {
  res.json({
    success: true,
    data: {
      totalValue: 0.00,
      totalGainLoss: 0.00,
      totalGainLossPercent: 0.00,
      positions: [],
      lastUpdated: new Date().toISOString()
    },
    message: 'Portfolio feature coming soon'
  });
});

// Enhanced market status route
router.get('/market-status', auth, (req, res) => {
  const now = new Date();
  const estTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const currentHour = estTime.getHours();
  const currentMinute = estTime.getMinutes();
  const currentDay = estTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Market hours: 9:30 AM - 4:00 PM EST, Monday-Friday
  const isWeekday = currentDay >= 1 && currentDay <= 5;
  const isAfterOpen = currentHour > 9 || (currentHour === 9 && currentMinute >= 30);
  const isBeforeClose = currentHour < 16;
  const isMarketOpen = isWeekday && isAfterOpen && isBeforeClose;
  
  // Pre-market: 4:00 AM - 9:30 AM
  const isPremarket = isWeekday && currentHour >= 4 && (currentHour < 9 || (currentHour === 9 && currentMinute < 30));
  
  // After-hours: 4:00 PM - 8:00 PM
  const isAfterHours = isWeekday && currentHour >= 16 && currentHour < 20;
  
  let status = "CLOSED";
  if (isMarketOpen) status = "OPEN";
  else if (isPremarket) status = "PREMARKET";
  else if (isAfterHours) status = "AFTERHOURS";
  
  res.json({
    success: true,
    data: {
      status,
      isOpen: isMarketOpen,
      isPremarket,
      isAfterHours,
      currentTime: estTime.toISOString(),
      timezone: 'America/New_York',
      nextOpen: isMarketOpen ? null : getNextMarketOpen(now),
      nextClose: isMarketOpen ? getNextMarketClose(now) : null
    }
  });
});

// Helper functions for market status
function getNextMarketOpen(now) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 30, 0, 0);
  
  // Skip weekends
  while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  
  return tomorrow.toISOString();
}

function getNextMarketClose(now) {
  const today = new Date(now);
  today.setHours(16, 0, 0, 0);
  return today.toISOString();
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Stock API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Apply error handler
router.use(errorHandler);

module.exports = router;
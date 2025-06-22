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

// Rate limiting middleware
const stockApiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Validation middleware
const symbolValidation = [
  param('symbol')
    .isLength({ min: 1, max: 10 })
    .withMessage('Stock symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z0-9\.\-]+$/)
    .withMessage('Stock symbol contains invalid characters')
];

const searchValidation = [
  query('query')
    .isLength({ min: 2, max: 50 })
    .withMessage('Search query must be between 2 and 50 characters')
    .matches(/^[A-Za-z0-9\s\.\-]+$/)
    .withMessage('Search query contains invalid characters')
];

const addWatchlistValidation = [
  body('symbol')
    .isLength({ min: 1, max: 10 })
    .withMessage('Stock symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z0-9\.\-]+$/)
    .withMessage('Stock symbol contains invalid characters')
];

const multipleQuotesValidation = [
  body('symbols')
    .isArray({ min: 1, max: 10 })
    .withMessage('Symbols must be an array with 1-10 elements'),
  body('symbols.*')
    .isLength({ min: 1, max: 10 })
    .withMessage('Each symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z0-9\.\-]+$/)
    .withMessage('Symbol contains invalid characters')
];

const historyValidation = [
  param('symbol')
    .isLength({ min: 1, max: 10 })
    .withMessage('Stock symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z0-9\.\-]+$/)
    .withMessage('Stock symbol contains invalid characters'),
  query('period')
    .optional()
    .isIn(['1D', '1W', '1M', '3M', '6M', '1Y'])
    .withMessage('Period must be one of: 1D, 1W, 1M, 3M, 6M, 1Y')
];

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

// Search stocks route
router.get('/search', 
  auth, 
  stockApiRateLimit,
  searchValidation, 
  handleValidationErrors, 
  searchStocks
);

// Watchlist routes
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
  historyValidation, 
  handleValidationErrors, 
  getStockHistory
);

// Market data routes (you might need these for your frontend)
router.get('/trending', auth, (req, res) => {
  // Mock trending stocks data
  const trendingStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', changePercent: 2.5 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', changePercent: 1.8 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', changePercent: -0.5 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', changePercent: 3.2 },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', changePercent: 1.1 }
  ];
  
  res.json({
    success: true,
    data: trendingStocks
  });
});

router.get('/movers', auth, (req, res) => {
  const { type = 'gainers' } = req.query; // gainers, losers, active
  
  // Mock market movers data
  const movers = {
    gainers: [
      { symbol: 'NVDA', name: 'NVIDIA Corporation', changePercent: 8.5, price: 485.23 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', changePercent: 6.2, price: 123.45 },
      { symbol: 'TSLA', name: 'Tesla, Inc.', changePercent: 5.8, price: 185.67 }
    ],
    losers: [
      { symbol: 'META', name: 'Meta Platforms, Inc.', changePercent: -4.2, price: 298.34 },
      { symbol: 'NFLX', name: 'Netflix, Inc.', changePercent: -3.8, price: 423.12 },
      { symbol: 'PYPL', name: 'PayPal Holdings, Inc.', changePercent: -2.9, price: 67.89 }
    ],
    active: [
      { symbol: 'AAPL', name: 'Apple Inc.', volume: 89000000, price: 178.23 },
      { symbol: 'TSLA', name: 'Tesla, Inc.', volume: 156000000, price: 185.67 },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', volume: 67000000, price: 445.23 }
    ]
  };
  
  res.json({
    success: true,
    data: movers[type] || movers.gainers
  });
});

// Portfolio routes (if needed for your frontend)
router.get('/portfolio', auth, (req, res) => {
  // Mock portfolio data - you might want to create a separate portfolio model
  res.json({
    success: true,
    data: {
      totalValue: 50000.00,
      totalGainLoss: 2500.50,
      totalGainLossPercent: 5.26,
      positions: []
    }
  });
});

// Market status route
router.get('/market-status', auth, (req, res) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Simple market hours check (9:30 AM - 4:00 PM EST, Monday-Friday)
  const isMarketOpen = currentDay >= 1 && currentDay <= 5 && 
                      currentHour >= 9 && currentHour < 16;
  
  res.json({
    success: true,
    data: {
      isOpen: isMarketOpen,
      nextOpen: isMarketOpen ? null : 'Tomorrow 9:30 AM EST',
      nextClose: isMarketOpen ? 'Today 4:00 PM EST' : null,
      timezone: 'EST'
    }
  });
});

module.exports = router;
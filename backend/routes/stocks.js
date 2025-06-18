const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const {
  getStockQuote,
  searchStocks,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist
} = require('../controllers/stockController');
const { auth } = require('../middleware/auth');

const router = express.Router();

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
    .matches(/^[A-Za-z]+$/)
    .withMessage('Stock symbol must contain only letters')
];

const searchValidation = [
  query('query')
    .isLength({ min: 2, max: 50 })
    .withMessage('Search query must be between 2 and 50 characters')
];

const addWatchlistValidation = [
  body('symbol')
    .isLength({ min: 1, max: 10 })
    .withMessage('Stock symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z]+$/)
    .withMessage('Stock symbol must contain only letters')
];

// Routes with validation error handling
router.get('/quote/:symbol', auth, symbolValidation, handleValidationErrors, getStockQuote);
router.get('/search', auth, searchValidation, handleValidationErrors, searchStocks);
router.get('/watchlist', auth, getWatchlist);
router.post('/watchlist', auth, addWatchlistValidation, handleValidationErrors, addToWatchlist);
router.delete('/watchlist/:symbol', auth, symbolValidation, handleValidationErrors, removeFromWatchlist);

module.exports = router;//this is what i want to export
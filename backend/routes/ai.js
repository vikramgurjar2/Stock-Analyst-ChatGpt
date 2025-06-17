const express = require('express');
const { body, param, query } = require('express-validator');
const {
  sendMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  getStockAnalysis,
  getEnhancedStockData,
  generateEnhancedAIAnalysis,
  calculatePortfolioAllocation
} = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const messageValidation = [
  body('message')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters'),
  body('stockSymbol')
    .optional()
    .matches(/^[A-Za-z]+$/)
    .withMessage('Stock symbol must contain only letters')
];

const sessionValidation = [
  param('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID')
];

const symbolValidation = [
  param('symbol')
    .isLength({ min: 1, max: 10 })
    .withMessage('Stock symbol must be between 1 and 10 characters')
    .matches(/^[A-Za-z]+$/)
    .withMessage('Stock symbol must contain only letters')
];

// Routes
router.post('/chat', auth, messageValidation, sendMessage);
router.get('/analysis/:symbol', auth, symbolValidation, getStockAnalysis);    ///getStockAnalysis
router.get('/sessions', auth, getChatSessions);
router.get('/sessions/:sessionId', auth, sessionValidation, getChatSession);
router.delete('/sessions/:sessionId', auth, sessionValidation, deleteChatSession);

module.exports = router;
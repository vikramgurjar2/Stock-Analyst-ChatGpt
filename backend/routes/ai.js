const express = require('express');
const { body, param } = require('express-validator');
const {
  sendMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession
} = require('../controllers/aiController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const messageValidation = [
  body('message')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
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

// Routes
router.post('/chat', auth, messageValidation, sendMessage);
router.get('/sessions', auth, getChatSessions);
router.get('/sessions/:sessionId', auth, sessionValidation, getChatSession);
router.delete('/sessions/:sessionId', auth, sessionValidation, deleteChatSession);

module.exports = router;
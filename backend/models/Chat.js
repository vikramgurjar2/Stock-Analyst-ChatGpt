const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  stockContext: {
    symbol: String,
    price: Number,
    change: Number,
    changePercent: Number,
    volume: Number,
    analysis: String,
    recommendation: String,
    portfolioAllocation: Number
  },
  metadata: {
    processingTime: Number,
    modelUsed: {
      type: String,
      default: 'gemini-1.5-flash'
    },
    tokenCount: Number
  }
});

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analystId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  title: {
    type: String,
    default: 'New Analysis Session',
    maxlength: 100
  },
  messages: [messageSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  summary: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for better performance
chatSessionSchema.index({ userId: 1, lastActivity: -1 });
chatSessionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
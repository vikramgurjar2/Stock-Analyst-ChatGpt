const mongoose = require('mongoose');

const stockDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  change: {
    type: Number,
    required: true
  },
  changePercent: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  marketCap: {
    type: Number
  },
  pe: {
    type: Number
  },
  high52Week: {
    type: Number
  },
  low52Week: {
    type: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const StockData = mongoose.model('StockData', stockDataSchema);

// Watchlist Schema
const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stocks: [{
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    alerts: [{
      type: {
        type: String,
        enum: ['price_above', 'price_below', 'volume_spike'],
        required: true
      },
      value: {
        type: Number,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  }]
}, {
  timestamps: true
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = { StockData, Watchlist };
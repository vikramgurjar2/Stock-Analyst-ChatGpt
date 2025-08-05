const mongoose = require('mongoose');

const stockDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true, // Add unique index for faster lookups
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: false, // Make optional since some symbols might not have names initially
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0 // Prices can't be negative
  },
  change: {
    type: Number,
    required: false, // Can be calculated from price and previousClose
    default: 0
  },
  changePercent: {
    type: Number,
    required: false, // Can be calculated from change and previousClose
    default: 0
  },
  volume: {
    type: Number,
    required: false, // Some stocks might not have volume data
    default: 0,
    min: 0
  },
  // Add missing fields that are commonly available
  high: {
    type: Number,
    default: 0,
    min: 0
  },
  low: {
    type: Number,
    default: 0,
    min: 0
  },
  open: {
    type: Number,
    default: 0,
    min: 0
  },
  previousClose: {
    type: Number,
    default: 0,
    min: 0
  },
  marketCap: {
    type: Number,
    min: 0
  },
  pe: {
    type: Number,
    min: 0 // P/E ratio can't be negative
  },
  high52Week: {
    type: Number,
    min: 0
  },
  low52Week: {
    type: Number,
    min: 0
  },
  // Additional useful fields from Yahoo Finance
  eps: {
    type: Number // Earnings per share
  },
  dividend: {
    type: Number,
    min: 0
  },
  dividendYield: {
    type: Number,
    min: 0
  },
  beta: {
    type: Number // Stock volatility measure
  },
  sector: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  exchange: {
    type: String,
    trim: true
  },
  currency: {
    type: String,
    default: 'USD',
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true // Index for efficient cache lookups
  }
}, {
  timestamps: true
});

// Add compound index for efficient cache queries
stockDataSchema.index({ symbol: 1, lastUpdated: -1 });

// Add validation middleware
stockDataSchema.pre('save', function() {
  // Ensure 52-week high is not less than 52-week low
  if (this.high52Week && this.low52Week && this.high52Week < this.low52Week) {
    const temp = this.high52Week;
    this.high52Week = this.low52Week;
    this.low52Week = temp;
  }
  
  // Ensure daily high is not less than daily low
  if (this.high && this.low && this.high < this.low) {
    const temp = this.high;
    this.high = this.low;
    this.low = temp;
  }
});

const StockData = mongoose.model('StockData', stockDataSchema);

// Watchlist Schema
const watchlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true // Index for faster user lookups
  },
  stocks: [{
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    // Enhanced alerts system
    alerts: [{
      type: {
        type: String,
        enum: [
          'price_above', 
          'price_below', 
          'volume_spike',
          'percent_change_above',
          'percent_change_below',
          'market_cap_above',
          'market_cap_below'
        ],
        required: true
      },
      value: {
        type: Number,
        required: true
      },
      isActive: {
        type: Boolean,
        default: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      triggeredAt: {
        type: Date // Track when alert was last triggered
      },
      description: {
        type: String,
        trim: true
      }
    }],
    // Add notes for each stock in watchlist
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    },
    // Track performance since adding to watchlist
    priceWhenAdded: {
      type: Number,
      min: 0
    },
    // Custom tags for organization
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  }],
  // Watchlist metadata
  name: {
    type: String,
    default: 'My Watchlist',
    trim: true,
    maxlength: 50
  },
  isDefault: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3B82F6', // Default blue color
    match: /^#[0-9A-Fa-f]{6}$/ // Hex color validation
  }
}, {
  timestamps: true
});

// Compound index for efficient user watchlist queries
watchlistSchema.index({ userId: 1, isDefault: -1 });

// Limit number of stocks per watchlist
watchlistSchema.pre('save', function() {
  if (this.stocks.length > 50) {
    throw new Error('Maximum 50 stocks allowed per watchlist');
  }
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = { StockData, Watchlist };
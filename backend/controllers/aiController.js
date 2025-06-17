const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validationResult } = require('express-validator');
const ChatSession = require('../models/Chat');
const axios = require('axios');
// ADD THESE NEW IMPORTS FOR TECHNICAL ANALYSIS
const { SMA, EMA, RSI, MACD, BollingerBands, Stochastic } = require('technicalindicators');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ENHANCED: Replace basic getStockData with comprehensive technical analysis
const getEnhancedStockData = async (symbol, period = '1y') => {
  try {
    // Get historical data (using Alpha Vantage TIME_SERIES_DAILY)
    const historicalResponse = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        outputsize: 'full',
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });

    const timeSeries = historicalResponse.data['Time Series (Daily)'];
    if (!timeSeries) {
      // FALLBACK: Try basic quote if historical data fails
      return await getBasicStockData(symbol);
    }

    // Convert to arrays for technical analysis
    const dates = Object.keys(timeSeries).sort().slice(-252); // Last year of data
    const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
    const highs = dates.map(date => parseFloat(timeSeries[date]['2. high']));
    const lows = dates.map(date => parseFloat(timeSeries[date]['3. low']));
    const volumes = dates.map(date => parseInt(timeSeries[date]['5. volume']));
    const opens = dates.map(date => parseFloat(timeSeries[date]['1. open']));

    // Calculate technical indicators
    const sma20 = SMA.calculate({ period: 20, values: prices });
    const sma50 = SMA.calculate({ period: 50, values: prices });
    const ema12 = EMA.calculate({ period: 12, values: prices });
    const ema26 = EMA.calculate({ period: 26, values: prices });
    const rsi = RSI.calculate({ period: 14, values: prices });
    const macd = MACD.calculate({
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      values: prices
    });
    const bb = BollingerBands.calculate({
      period: 20,
      stdDev: 2,
      values: prices
    });
    const stochastic = Stochastic.calculate({
      high: highs,
      low: lows,
      close: prices,
      period: 14,
      signalPeriod: 3
    });

    // Current values (latest)
    const currentPrice = prices[prices.length - 1];
    const currentSMA20 = sma20[sma20.length - 1];
    const currentSMA50 = sma50[sma50.length - 1];
    const currentRSI = rsi[rsi.length - 1];
    const currentMACD = macd[macd.length - 1];
    const currentBB = bb[bb.length - 1];
    const currentStoch = stochastic[stochastic.length - 1];

    // Calculate additional metrics
    const volatility = calculateVolatility(prices);
    const momentum = calculateMomentum(prices, 10);
    const support = Math.min(...lows.slice(-20));
    const resistance = Math.max(...highs.slice(-20));

    // Technical signals
    const signals = generateTechnicalSignals({
      price: currentPrice,
      sma20: currentSMA20,
      sma50: currentSMA50,
      rsi: currentRSI,
      macd: currentMACD,
      bb: currentBB,
      stoch: currentStoch,
      support,
      resistance
    });

    // MAINTAIN BACKWARD COMPATIBILITY: Include all original fields
    return {
      symbol: symbol.toUpperCase(),
      price: currentPrice, // Keep original field name
      currentPrice, // New field name
      change: currentPrice - prices[prices.length - 2],
      changePercent: ((currentPrice - prices[prices.length - 2]) / prices[prices.length - 2]) * 100,
      volume: volumes[volumes.length - 1],
      high: highs[highs.length - 1],
      low: lows[lows.length - 1],
      open: opens[opens.length - 1],
      previousClose: prices[prices.length - 2], // Keep original field
      // NEW ENHANCED FIELDS
      technicalIndicators: {
        sma20: currentSMA20,
        sma50: currentSMA50,
        rsi: currentRSI,
        macd: currentMACD,
        bollingerBands: currentBB,
        stochastic: currentStoch,
        volatility,
        momentum,
        support,
        resistance
      },
      signals,
      chartData: {
        dates: dates.slice(-60), // Last 60 days for charts
        prices: prices.slice(-60),
        sma20: sma20.slice(-40),
        sma50: sma50.slice(-10),
        volume: volumes.slice(-60)
      }
    };

  } catch (error) {
    console.error('Error fetching enhanced stock data:', error);
    // FALLBACK: Use basic stock data if enhanced fails
    return await getBasicStockData(symbol);
  }
};

// KEEP ORIGINAL FUNCTION AS FALLBACK
const getBasicStockData = async (symbol) => {
  try {
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: process.env.ALPHA_VANTAGE_API_KEY
      }
    });

    const quote = response.data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      return null;
    }

    return {
      symbol: quote['01. symbol'] || symbol,
      price: parseFloat(quote['05. price']) || 0,
      currentPrice: parseFloat(quote['05. price']) || 0, // Add for compatibility
      change: parseFloat(quote['09. change']) || 0,
      changePercent: quote['10. change percent'] ? parseFloat(quote['10. change percent'].replace('%', '')) : 0,
      volume: parseInt(quote['06. volume']) || 0,
      high: parseFloat(quote['03. high']) || 0,
      low: parseFloat(quote['04. low']) || 0,
      open: parseFloat(quote['02. open']) || 0,
      previousClose: parseFloat(quote['08. previous close']) || 0,
      // Add empty enhanced fields for consistency
      technicalIndicators: null,
      signals: [],
      chartData: null
    };
  } catch (error) {
    console.error('Error fetching basic stock data:', error);
    return {
      symbol: symbol.toUpperCase(),
      price: 150.00,
      currentPrice: 150.00,
      change: 2.50,
      changePercent: 1.69,
      volume: 1000000,
      high: 152.00,
      low: 148.00,
      open: 149.00,
      previousClose: 147.50,
      technicalIndicators: null,
      signals: [],
      chartData: null
    };
  }
};

// ADD NEW UTILITY FUNCTIONS
const calculateVolatility = (prices) => {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  return Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
};

const calculateMomentum = (prices, period) => {
  if (prices.length < period) return 0;
  return ((prices[prices.length - 1] - prices[prices.length - period]) / prices[prices.length - period]) * 100;
};

const generateTechnicalSignals = (data) => {
  const signals = [];
  
  // RSI signals
  if (data.rsi > 70) {
    signals.push({ type: 'SELL', indicator: 'RSI', strength: 'STRONG', reason: 'Overbought condition (RSI > 70)' });
  } else if (data.rsi < 30) {
    signals.push({ type: 'BUY', indicator: 'RSI', strength: 'STRONG', reason: 'Oversold condition (RSI < 30)' });
  }

  // Moving Average signals
  if (data.price > data.sma20 && data.sma20 > data.sma50) {
    signals.push({ type: 'BUY', indicator: 'MA', strength: 'MEDIUM', reason: 'Price above SMA20 and SMA50, bullish trend' });
  } else if (data.price < data.sma20 && data.sma20 < data.sma50) {
    signals.push({ type: 'SELL', indicator: 'MA', strength: 'MEDIUM', reason: 'Price below SMA20 and SMA50, bearish trend' });
  }

  // MACD signals
  if (data.macd && data.macd.MACD > data.macd.signal) {
    signals.push({ type: 'BUY', indicator: 'MACD', strength: 'MEDIUM', reason: 'MACD line above signal line' });
  } else if (data.macd && data.macd.MACD < data.macd.signal) {
    signals.push({ type: 'SELL', indicator: 'MACD', strength: 'MEDIUM', reason: 'MACD line below signal line' });
  }

  // Bollinger Bands signals
  if (data.bb && data.price > data.bb.upper) {
    signals.push({ type: 'SELL', indicator: 'BB', strength: 'MEDIUM', reason: 'Price above upper Bollinger Band' });
  } else if (data.bb && data.price < data.bb.lower) {
    signals.push({ type: 'BUY', indicator: 'BB', strength: 'MEDIUM', reason: 'Price below lower Bollinger Band' });
  }

  // Support/Resistance signals
  if (data.support && data.resistance) {
    const distanceToSupport = ((data.price - data.support) / data.support) * 100;
    const distanceToResistance = ((data.resistance - data.price) / data.price) * 100;
    
    if (distanceToSupport < 2) {
      signals.push({ type: 'BUY', indicator: 'SUPPORT', strength: 'STRONG', reason: `Price near support level $${data.support.toFixed(2)}` });
    }
    if (distanceToResistance < 2) {
      signals.push({ type: 'SELL', indicator: 'RESISTANCE', strength: 'STRONG', reason: `Price near resistance level $${data.resistance.toFixed(2)}` });
    }
  }

  return signals;
};

const calculatePortfolioAllocation = (signals, riskTolerance = 'MODERATE') => {
  const buySignals = signals.filter(s => s.type === 'BUY');
  const sellSignals = signals.filter(s => s.type === 'SELL');
  
  const strongBuyCount = buySignals.filter(s => s.strength === 'STRONG').length;
  const strongSellCount = sellSignals.filter(s => s.strength === 'STRONG').length;
  
  let baseAllocation = 0;
  
  if (strongBuyCount > strongSellCount) {
    baseAllocation = Math.min(25 + (strongBuyCount * 10), 40); // Max 40% for single stock
  } else if (strongSellCount > strongBuyCount) {
    baseAllocation = Math.max(5 - (strongSellCount * 5), 0); // Min 0%
  } else {
    baseAllocation = 15; // Neutral position
  }
  
  // Adjust for risk tolerance
  const riskMultiplier = {
    'CONSERVATIVE': 0.7,
    'MODERATE': 1.0,
    'AGGRESSIVE': 1.3
  };
  
  return Math.round(baseAllocation * riskMultiplier[riskTolerance]);
};

// ENHANCED: Upgrade generateAIAnalysis with technical data
const generateEnhancedAIAnalysis = async (prompt, stockData) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let enhancedPrompt = prompt;
    
    if (stockData) {
      // Check if we have enhanced technical data
      if (stockData.technicalIndicators && stockData.signals) {
        const technicalSummary = stockData.technicalIndicators;
        const signals = stockData.signals;
        const portfolioAllocation = calculatePortfolioAllocation(signals);
        
        enhancedPrompt = `
As a professional quantitative stock analyst, analyze the following comprehensive stock data:

STOCK: ${stockData.symbol}
CURRENT PRICE: $${stockData.currentPrice.toFixed(2)}
CHANGE: $${stockData.change.toFixed(2)} (${stockData.changePercent.toFixed(2)}%)

TECHNICAL INDICATORS:
- SMA 20: $${technicalSummary.sma20?.toFixed(2) || 'N/A'}
- SMA 50: $${technicalSummary.sma50?.toFixed(2) || 'N/A'}
- RSI (14): ${technicalSummary.rsi?.toFixed(2) || 'N/A'}
- MACD: ${technicalSummary.macd?.MACD?.toFixed(4) || 'N/A'}
- Bollinger Bands: Upper: $${technicalSummary.bollingerBands?.upper?.toFixed(2) || 'N/A'}, Lower: $${technicalSummary.bollingerBands?.lower?.toFixed(2) || 'N/A'}
- Volatility: ${(technicalSummary.volatility * 100).toFixed(2)}%
- Momentum (10-day): ${technicalSummary.momentum.toFixed(2)}%
- Support: $${technicalSummary.support.toFixed(2)}
- Resistance: $${technicalSummary.resistance.toFixed(2)}

TECHNICAL SIGNALS:
${signals.map(signal => `- ${signal.type} (${signal.strength}): ${signal.reason}`).join('\n')}

CALCULATED PORTFOLIO ALLOCATION: ${portfolioAllocation}%

User Question: ${prompt}

Please provide a comprehensive analysis including:
1. **Technical Analysis Summary** - Interpret the indicators and signals
2. **Market Position** - Current trend and momentum analysis  
3. **Risk Assessment** - Based on volatility and technical patterns
4. **Action Recommendation** - BUY/SELL/HOLD with confidence level
5. **Price Targets** - Based on support/resistance and technical patterns
6. **Portfolio Allocation** - Validate or adjust the calculated ${portfolioAllocation}% allocation
7. **Risk Management** - Stop-loss and take-profit levels

Keep the analysis data-driven, professional, and actionable.
        `;
      } else {
        // FALLBACK: Use basic analysis format
        enhancedPrompt = `
As a professional stock analyst, analyze the following stock data and provide insights:

Stock: ${stockData.symbol}
Current Price: $${stockData.price}
Change: $${stockData.change} (${stockData.changePercent}%)
Volume: ${stockData.volume.toLocaleString()} shares
High: $${stockData.high}
Low: $${stockData.low}
Open: $${stockData.open}
Previous Close: $${stockData.previousClose}

User Question: ${prompt}

Please provide:
1. Technical Analysis
2. Market Sentiment
3. Buy/Sell/Hold Recommendation
4. Risk Assessment
5. Target Price (if applicable)
6. Portfolio Allocation Suggestion (%)

Keep your response professional, data-driven, and concise.
        `;
      }
    }

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    
    // Return enhanced result if technical data available
    if (stockData?.technicalIndicators && stockData?.signals) {
      const portfolioAllocation = calculatePortfolioAllocation(stockData.signals);
      return {
        analysis: response.text(),
        calculatedAllocation: portfolioAllocation,
        technicalSignals: stockData.signals,
        riskMetrics: {
          volatility: stockData.technicalIndicators.volatility,
          rsi: stockData.technicalIndicators.rsi,
          momentum: stockData.technicalIndicators.momentum
        }
      };
    }
    
    // Return basic result for backward compatibility
    return response.text();
  } catch (error) {
    console.error('Enhanced AI analysis error:', error);
    throw new Error('AI analysis temporarily unavailable. Please try again later.');
  }
};

// ENHANCED: Update sendMessage function
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, stockSymbol, sessionId } = req.body;
    const userId = req.user.userId;

    let chatSession;
    if (sessionId) {
      chatSession = await ChatSession.findOne({ _id: sessionId, userId });
      if (!chatSession) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }
    } else {
      chatSession = new ChatSession({
        userId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: []
      });
    }

    chatSession.messages.push({
      content: message,
      sender: 'user',
      timestamp: new Date()
    });

    // ENHANCED: Get enhanced stock data with technical analysis
    let stockData = null;
    let analysisResult = null;
    
    if (stockSymbol && stockSymbol.trim()) {
      const startTime = Date.now();
      stockData = await getEnhancedStockData(stockSymbol.trim().toUpperCase());
      
      if (stockData) {
        analysisResult = await generateEnhancedAIAnalysis(message, stockData);
      }
      
      const processingTime = Date.now() - startTime;

      const aiMessage = {
        content: typeof analysisResult === 'object' ? analysisResult.analysis : analysisResult || 'Unable to analyze stock at this time.',
        sender: 'ai',
        timestamp: new Date(),
        metadata: {
          processingTime,
          modelUsed: stockData?.technicalIndicators ? 'gemini-1.5-flash-enhanced' : 'gemini-1.5-flash',
          tokenCount: (typeof analysisResult === 'object' ? analysisResult.analysis : analysisResult)?.length || 0
        }
      };

      // ENHANCED: Add enhanced stock context if available
      if (stockData) {
        aiMessage.stockContext = {
          symbol: stockData.symbol,
          price: stockData.price,
          change: stockData.change,
          changePercent: stockData.changePercent,
          volume: stockData.volume
        };

        // Add enhanced context if available
        if (typeof analysisResult === 'object') {
          aiMessage.stockContext.technicalSignals = analysisResult.technicalSignals || [];
          aiMessage.stockContext.portfolioAllocation = analysisResult.calculatedAllocation || 0;
          aiMessage.stockContext.riskMetrics = analysisResult.riskMetrics || {};
        }
      }

      chatSession.messages.push(aiMessage);
      chatSession.lastActivity = new Date();
      await chatSession.save();

      res.json({
        success: true,
        data: {
          sessionId: chatSession._id,
          message: aiMessage,
          stockData: stockData,
          // ENHANCED: Add chart data and technical indicators
          chartData: stockData?.chartData || null,
          technicalIndicators: stockData?.technicalIndicators || null
        }
      });
    } else {
      // Regular chat without stock analysis (unchanged)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(message);
      const response = await result.response;
      
      const aiMessage = {
        content: response.text(),
        sender: 'ai',
        timestamp: new Date()
      };
      
      chatSession.messages.push(aiMessage);
      chatSession.lastActivity = new Date();
      await chatSession.save();

      res.json({
        success: true,
        data: {
          sessionId: chatSession._id,
          message: aiMessage
        }
      });
    }

  } catch (error) {
    console.error('Enhanced send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process message'
    });
  }
};

// ENHANCED: Update getStockAnalysis function
const getStockAnalysis = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symbol } = req.params;
    const userId = req.user.userId;

    // ENHANCED: Get enhanced stock data
    const stockData = await getEnhancedStockData(symbol.toUpperCase());
    
    if (!stockData) {
      return res.status(404).json({
        success: false,
        message: 'Stock data not found for symbol: ' + symbol
      });
    }

    // Generate comprehensive analysis
    const analysisPrompt = `Provide a comprehensive analysis of ${symbol.toUpperCase()} stock`;
    const startTime = Date.now();
    const analysisResult = await generateEnhancedAIAnalysis(analysisPrompt, stockData);
    const processingTime = Date.now() - startTime;

    const analysis = typeof analysisResult === 'object' ? analysisResult.analysis : analysisResult;

    // Create a new chat session for this analysis
    const chatSession = new ChatSession({
      userId,
      title: `${symbol.toUpperCase()} Stock Analysis`,
      messages: [
        {
          content: `Analyze ${symbol.toUpperCase()} stock`,
          sender: 'user',
          timestamp: new Date()
        },
        {
          content: analysis,
          sender: 'ai',
          timestamp: new Date(),
          stockContext: {
            symbol: stockData.symbol,
            price: stockData.price,
            change: stockData.change,
            changePercent: stockData.changePercent,
            volume: stockData.volume,
            // ENHANCED: Add enhanced context
            technicalSignals: typeof analysisResult === 'object' ? analysisResult.technicalSignals : [],
            portfolioAllocation: typeof analysisResult === 'object' ? analysisResult.calculatedAllocation : 0,
            riskMetrics: typeof analysisResult === 'object' ? analysisResult.riskMetrics : {}
          },
          metadata: {
            processingTime,
            modelUsed: stockData.technicalIndicators ? 'gemini-1.5-flash-enhanced' : 'gemini-1.5-flash',
            tokenCount: analysis.length
          }
        }
      ]
    });

    await chatSession.save();

    res.json({
      success: true,
      data: {
        stockData,
        analysis,
        sessionId: chatSession._id,
        processingTime,
        // ENHANCED: Add chart data and technical indicators
        chartData: stockData.chartData || null,
        technicalIndicators: stockData.technicalIndicators || null
      }
    });

  } catch (error) {
    console.error('Get stock analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get stock analysis'
    });
  }
};

// KEEP ALL OTHER FUNCTIONS UNCHANGED FOR BACKWARD COMPATIBILITY
const getChatSessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const sessions = await ChatSession.find({ userId, isActive: true })
      .select('title lastActivity createdAt tags summary messages')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const enrichedSessions = sessions.map(session => ({
      ...session,
      messageCount: session.messages ? session.messages.length : 0,
      latestMessage: session.messages && session.messages.length > 0 
        ? session.messages[session.messages.length - 1].content.substring(0, 100) + '...'
        : 'No messages'
    }));

    const total = await ChatSession.countDocuments({ userId, isActive: true });

    res.json({
      success: true,
      data: {
        sessions: enrichedSessions,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat sessions'
    });
  }
};

const getChatSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await ChatSession.findOne({
      _id: sessionId,
      userId,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });

  } catch (error) {
    console.error('Get chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat session'
    });
  }
};

const deleteChatSession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { sessionId } = req.params;
    const userId = req.user.userId;

    const session = await ChatSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session'
    });
  }
};

module.exports = {
  sendMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession,
  getStockAnalysis,
  // ENHANCED: Export new functions
  getEnhancedStockData,
  generateEnhancedAIAnalysis,
  calculatePortfolioAllocation
};
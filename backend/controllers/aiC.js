const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validationResult } = require('express-validator');
const ChatSession = require('../models/Chat');
const axios = require('axios');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to get stock data (you can replace this with your preferred stock API)
const getStockData = async (symbol) => {
  try {
    // Using Alpha Vantage API - replace with your preferred stock data provider
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
      change: parseFloat(quote['09. change']) || 0,
      changePercent: quote['10. change percent'] ? parseFloat(quote['10. change percent'].replace('%', '')) : 0,
      volume: parseInt(quote['06. volume']) || 0,
      high: parseFloat(quote['03. high']) || 0,
      low: parseFloat(quote['04. low']) || 0,
      open: parseFloat(quote['02. open']) || 0,
      previousClose: parseFloat(quote['08. previous close']) || 0
    };
  } catch (error) {
    console.error('Error fetching stock data:', error);
    // Return mock data if API fails
    return {
      symbol: symbol.toUpperCase(),
      price: 150.00,
      change: 2.50,
      changePercent: 1.69,
      volume: 1000000,
      high: 152.00,
      low: 148.00,
      open: 149.00,
      previousClose: 147.50
    };
  }
};

// Generate AI analysis using Gemini
const generateAIAnalysis = async (prompt, stockData = null) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let enhancedPrompt = prompt;
    
    if (stockData) {
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

    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Error:', error);
    throw new Error('AI analysis temporarily unavailable. Please try again later.');
  }
};

// Send message to AI
const sendMessage = async (req, res) => {
  try {
    // Check for validation errors
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

    // Get or create chat session
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

    // Add user message
    chatSession.messages.push({
      content: message,
      sender: 'user',
      timestamp: new Date()
    });

    // Get stock data if symbol provided
    let stockData = null;
    if (stockSymbol && stockSymbol.trim()) {
      stockData = await getStockData(stockSymbol.trim().toUpperCase());
    }

    // Generate AI response
    const startTime = Date.now();
    const aiResponse = await generateAIAnalysis(message, stockData);
    const processingTime = Date.now() - startTime;

    // Add AI message
    const aiMessage = {
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      metadata: {
        processingTime,
        modelUsed: 'gemini-1.5-flash',
        tokenCount: aiResponse.length // Approximate token count
      }
    };

    if (stockData) {
      aiMessage.stockContext = {
        symbol: stockData.symbol,
        price: stockData.price,
        change: stockData.change,
        changePercent: stockData.changePercent,
        volume: stockData.volume
      };
    }

    chatSession.messages.push(aiMessage);
    chatSession.lastActivity = new Date();

    await chatSession.save();

    res.json({
      success: true,
      data: {
        sessionId: chatSession._id,
        message: aiMessage,
        stockData: stockData
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process message'
    });
  }
};

// Get stock analysis
const getStockAnalysis = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symbol } = req.params;
    const userId =req.user.userId;

    // Get stock data
    const stockData = await getStockData(symbol.toUpperCase());
    
    if (!stockData) {
      return res.status(404).json({
        success: false,
        message: 'Stock data not found for symbol: ' + symbol
      });
    }

    // Generate comprehensive analysis
    const analysisPrompt = `Provide a comprehensive analysis of ${symbol.toUpperCase()} stock`;
    const startTime = Date.now();
    const analysis = await generateAIAnalysis(analysisPrompt, stockData);
    const processingTime = Date.now() - startTime;

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
            volume: stockData.volume
          },
          metadata: {
            processingTime,
            modelUsed: 'gemini-1.5-flash',
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
        processingTime
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

// Get all chat sessions for user
const getChatSessions = async (req, res) => {
  try {
    const userId =req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const sessions = await ChatSession.find({ userId, isActive: true })
      .select('title lastActivity createdAt tags summary messages')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add message count and latest message preview
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

// Get specific chat session
const getChatSession = async (req, res) => {
  try {
    // Check for validation errors
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

// Delete chat session
const deleteChatSession = async (req, res) => {
  try {
    // Check for validation errors
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
  getStockAnalysis
};
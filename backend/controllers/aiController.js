const ChatSession = require('../models/Chat');
const { StockData } = require('../models/Stock');
const axios = require('axios');

// OpenAI API integration
const generateAIResponse = async (message, stockContext = null) => {
  try {
    const systemPrompt = `You are a professional stock market analyst. Provide helpful, accurate financial analysis and investment insights. Always include disclaimers about investment risks. Be concise but informative.`;
    
    let userMessage = message;
    if (stockContext) {
      userMessage += `\n\nStock Context: ${stockContext.symbol} - Current Price: $${stockContext.price}`;
    }

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate AI response');
  }
};

// Send message to AI
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId, stockSymbol } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    let chatSession;
    
    // Get or create chat session
    if (sessionId) {
      chatSession = await ChatSession.findById(sessionId);
      if (!chatSession || chatSession.userId.toString() !== req.user.userId) {
        return res.status(404).json({
          success: false,
          message: 'Chat session not found'
        });
      }
    } else {
      chatSession = new ChatSession({
        userId: req.user.userId,
        title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
        messages: []
      });
    }

    // Get stock context if provided
    let stockContext = null;
    if (stockSymbol) {
      try {
        const stockData = await StockData.findOne({ symbol: stockSymbol.toUpperCase() });
        if (stockData) {
          stockContext = {
            symbol: stockData.symbol,
            price: stockData.price
          };
        }
      } catch (error) {
        console.error('Error fetching stock context:', error);
      }
    }

    // Add user message
    chatSession.messages.push({
      content: message,
      sender: 'user',
      timestamp: new Date(),
      stockContext
    });

    // Generate AI response
    const aiResponse = await generateAIResponse(message, stockContext);

    // Add AI message
    chatSession.messages.push({
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      stockContext
    });

    chatSession.lastActivity = new Date();
    await chatSession.save();

    res.json({
      success: true,
      data: {
        sessionId: chatSession._id,
        message: aiResponse,
        session: chatSession
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get chat sessions
const getChatSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ 
      userId: req.user.userId,
      isActive: true 
    })
    .sort({ lastActivity: -1 })
    .select('title lastActivity createdAt messages')
    .limit(20);

    // Add message count to each session
    const sessionsWithCount = sessions.map(session => ({
      ...session.toObject(),
      messageCount: session.messages.length,
      lastMessage: session.messages.length > 0 ? 
        session.messages[session.messages.length - 1].content.substring(0, 100) : null
    }));

    res.json({
      success: true,
      data: sessionsWithCount
    });

  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get chat sessions',
      error: error.message
    });
  }
};

// Get specific chat session
const getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findById(sessionId);
    
    if (!session || session.userId.toString() !== req.user.userId) {
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
      message: 'Failed to get chat session',
      error: error.message
    });
  }
};

// Delete chat session
const deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await ChatSession.findById(sessionId);
    
    if (!session || session.userId.toString() !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }

    session.isActive = false;
    await session.save();

    res.json({
      success: true,
      message: 'Chat session deleted successfully'
    });

  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete chat session',
      error: error.message
    });
  }
};

module.exports = {
  sendMessage,
  getChatSessions,
  getChatSession,
  deleteChatSession
};
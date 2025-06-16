const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Watchlist } = require('../models/Stock');

module.exports = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user to their personal room
    socket.join(socket.userId);

    // Join watchlist room for real-time stock updates
    socket.on('join_watchlist', async (data) => {
      try {
        const watchlist = await Watchlist.findOne({ userId: socket.userId });
        if (watchlist) {
          watchlist.stocks.forEach(stock => {
            socket.join(`stock_${stock.symbol}`);
          });
        }
      } catch (error) {
        console.error('Error joining watchlist rooms:', error);
      }
    });

    // Handle real-time chat
    socket.on('join_chat', (sessionId) => {
      socket.join(`chat_${sessionId}`);
    });

    socket.on('leave_chat', (sessionId) => {
      socket.leave(`chat_${sessionId}`);
    });

    // Handle typing indicators
    socket.on('typing_start', (sessionId) => {
      socket.to(`chat_${sessionId}`).emit('user_typing', {
        userId: socket.userId,
        typing: true
      });
    });

    socket.on('typing_stop', (sessionId) => {
      socket.to(`chat_${sessionId}`).emit('user_typing', {
        userId: socket.userId,
        typing: false
      });
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });

  // Function to broadcast stock updates
  const broadcastStockUpdate = (symbol, data) => {
    io.to(`stock_${symbol}`).emit('stock_update', {
      symbol,
      ...data,
      timestamp: new Date()
    });
  };

  // Function to broadcast chat messages
  const broadcastChatMessage = (sessionId, message) => {
    io.to(`chat_${sessionId}`).emit('new_message', message);
  };

  return { broadcastStockUpdate, broadcastChatMessage };
};
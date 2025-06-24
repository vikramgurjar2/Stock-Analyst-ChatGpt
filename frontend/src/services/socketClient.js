// src/services/socketClient.js
import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.stockUpdateCallbacks = new Map();
    this.chatCallbacks = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = process.env.REACT_APP_API_URL || 'https://stock-analyst-chatgpt-backend.onrender.com';
    
    this.socket = io(serverUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Join watchlist room for stock updates
      this.socket.emit('join_watchlist');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, need to reconnect manually
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Stock data events
    this.socket.on('stock_update', (data) => {
      console.log('Received stock update:', data);
      this.stockUpdateCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in stock update callback:', error);
        }
      });
    });

    // Chat events
    this.socket.on('new_message', (message) => {
      console.log('Received chat message:', message);
      this.chatCallbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in chat callback:', error);
        }
      });
    });

    this.socket.on('user_typing', (data) => {
      console.log('User typing:', data);
      // Handle typing indicators
    });

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        const token = localStorage.getItem('token');
        if (token) {
          this.connect(token);
        }
      }
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Stock-related methods
  subscribeToStockUpdates(callback) {
    const id = Date.now().toString();
    this.stockUpdateCallbacks.set(id, callback);
    return id;
  }

  unsubscribeFromStockUpdates(id) {
    this.stockUpdateCallbacks.delete(id);
  }

  joinStockRoom(symbol) {
    if (this.socket?.connected) {
      this.socket.emit('join_stock_room', symbol);
    }
  }

  leaveStockRoom(symbol) {
    if (this.socket?.connected) {
      this.socket.emit('leave_stock_room', symbol);
    }
  }

  // Chat-related methods
  subscribeToChatUpdates(callback) {
    const id = Date.now().toString();
    this.chatCallbacks.set(id, callback);
    return id;
  }

  unsubscribeFromChatUpdates(id) {
    this.chatCallbacks.delete(id);
  }

  joinChatRoom(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('join_chat', sessionId);
    }
  }

  leaveChatRoom(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('leave_chat', sessionId);
    }
  }

  sendTypingStart(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('typing_start', sessionId);
    }
  }

  sendTypingStop(sessionId) {
    if (this.socket?.connected) {
      this.socket.emit('typing_stop', sessionId);
    }
  }

  // Utility methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Manual emit for custom events
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;
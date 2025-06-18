import api from './api';

export const chatService = {
  // Send message to AI
  sendMessage: async (message, context = {}) => {
    try {
      const response = await api.post('/chat/message', {
        message,
        context,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  },

  // Get chat history
  getChatHistory: async (limit = 50) => {
    try {
      const response = await api.get('/chat/history', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch chat history: ${error.message}`);
    }
  },

  // Clear chat history
  clearHistory: async () => {
    try {
      const response = await api.delete('/chat/history');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to clear history: ${error.message}`);
    }
  }
};
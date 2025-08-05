import { useState } from 'react';
import { chatService } from '../services/chatService';

export const useChat = (selectedStock) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || loading) return;

    const newMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    // Add user message to chat immediately
    setChatMessages(prev => [...prev, newMessage]);
    setCurrentMessage('');
    setLoading(true);
    setError(null);

    try {
      // Send message to backend using imported chatService
      const response = await chatService.sendMessage(
        currentMessage,
        selectedStock, // Pass selected stock as stockSymbol
        { 
          sessionId: currentSessionId,
          previousMessages: chatMessages.slice(-5) // Send last 5 messages for context
        }
      );

      console.log('Full API response:', response); // Debug log

      // Handle the nested response structure
      const responseData = response.data || response;
      const messageData = responseData.message || responseData;
      
      // Update session ID if it's a new session
      const sessionId = responseData.sessionId || response.sessionId;
      if (sessionId && sessionId !== currentSessionId) {
        setCurrentSessionId(sessionId);
      }

      // Extract the actual message content
      let messageContent;
      if (typeof messageData === 'string') {
        messageContent = messageData;
      } else if (messageData && messageData.content) {
        messageContent = messageData.content;
      } else if (messageData && messageData.text) {
        messageContent = messageData.text;
      } else {
        messageContent = 'I received your message but couldn\'t generate a response.';
      }

      // Add AI response to chat
      const aiResponse = {
        id: Date.now() + 1,
        text: messageContent,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        data: responseData.stockContext || responseData.data || null // Store any additional data (stock analysis, etc.)
      };

      setChatMessages(prev => [...prev, aiResponse]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Function to get stock analysis using imported chatService
  const getStockAnalysis = async (symbol = selectedStock) => {
    if (!symbol || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await chatService.getStockAnalysis(symbol);
      
      // Handle the response structure similar to sendMessage
      const analysis = response.data || response;

      const analysisMessage = {
        id: Date.now(),
        text: `Here's the analysis for ${symbol.toUpperCase()}:`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        data: analysis,
        isAnalysis: true
      };

      setChatMessages(prev => [...prev, analysisMessage]);

    } catch (err) {
      console.error('Stock analysis error:', err);
      setError(err.message);

      const errorMessage = {
        id: Date.now(),
        text: `Sorry, I couldn't fetch the analysis for ${symbol} due to exceed stock api call limit. Error: ${err.message}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Function to clear chat
  const clearChat = () => {
    setChatMessages([]);
    setCurrentSessionId(null);
    setError(null);
  };

  // Function to retry last message
  const retryLastMessage = () => {
    const lastUserMessage = [...chatMessages].reverse().find(msg => msg.sender === 'user');
    if (lastUserMessage && !loading) {
      setCurrentMessage(lastUserMessage.text);
      // Remove messages after the last user message
      const lastUserIndex = chatMessages.findIndex(msg => msg.id === lastUserMessage.id);
      setChatMessages(prev => prev.slice(0, lastUserIndex + 1));
    }
  };

  return {
    chatMessages,
    currentMessage,
    setCurrentMessage,
    handleSendMessage,
    handleKeyPress,
    loading,
    error,
    clearError: () => setError(null),
    getStockAnalysis,
    clearChat,
    retryLastMessage,
    currentSessionId
  };
};
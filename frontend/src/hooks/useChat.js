import { useState } from 'react';

export const useChat = (selectedStock) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: `Based on the current analysis of ${selectedStock}, I recommend a ${Math.random() > 0.5 ? 'BUY' : 'HOLD'} position. The technical indicators show ${Math.random() > 0.5 ? 'bullish' : 'neutral'} momentum with a target price of $${(Math.random() * 20 + 160).toFixed(2)}. Portfolio allocation should be around ${Math.floor(Math.random() * 15 + 5)}% for optimal risk-adjusted returns.`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1500);

    setCurrentMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return {
    chatMessages,
    currentMessage,
    setCurrentMessage,
    handleSendMessage,
    handleKeyPress
  };
};
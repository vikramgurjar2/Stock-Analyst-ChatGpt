import React, { useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import ChatMessage from './ChatMessage';

const ChatInterface = ({ 
  selectedStock, 
  chatMessages, 
  currentMessage, 
  setCurrentMessage, 
  handleSendMessage, 
  handleKeyPress 
}) => {
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">AI Stock Analyst Chat</h3>
          <p className="text-sm text-gray-600">Ask me anything about {selectedStock} or portfolio optimization</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-96">
          {chatMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={chatEndRef} />
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about stock analysis, portfolio optimization..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
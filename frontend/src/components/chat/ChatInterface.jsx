import React, { useRef, useEffect } from 'react';
import { Send, Loader2, BarChart3, X, RotateCcw, Trash2 } from 'lucide-react';
import ChatMessage from './ChatMessage';

const ChatInterface = ({
  selectedStock,
  chatMessages,
  currentMessage,
  setCurrentMessage,
  handleSendMessage,
  handleKeyPress,
  loading,
  error,
  clearError,
  getStockAnalysis,
  clearChat,
  retryLastMessage
}) => {
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleStockAnalysis = () => {
    if (selectedStock && !loading) {
      getStockAnalysis(selectedStock);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">AI Stock Analyst Chat</h3>
              <p className="text-sm text-gray-600">
                Ask me anything about {selectedStock} or portfolio optimization
              </p>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {selectedStock && (
                <button
                  onClick={handleStockAnalysis}
                  disabled={loading}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                  title={`Get analysis for ${selectedStock}`}
                >
                  <BarChart3 className="h-3 w-3" />
                  Analyze {selectedStock}
                </button>
              )}
              
              {chatMessages.length > 0 && (
                <>
                  <button
                    onClick={retryLastMessage}
                    disabled={loading}
                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Retry last message"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retry
                  </button>
                  
                  <button
                    onClick={clearChat}
                    disabled={loading}
                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Clear chat"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-3 bg-red-50 border-b border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-96">
          {chatMessages.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                Start a conversation about {selectedStock} or ask for portfolio advice!
              </p>
              {selectedStock && (
                <button
                  onClick={handleStockAnalysis}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  Get {selectedStock} Analysis
                </button>
              )}
            </div>
          )}

          {chatMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              placeholder={
                loading 
                  ? "Please wait..." 
                  : "Ask about stock analysis, portfolio optimization..."
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setCurrentMessage(`What's your analysis of ${selectedStock}?`)}
              disabled={loading || !selectedStock}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Stock
            </button>
            <button
              onClick={() => setCurrentMessage("What's the best portfolio allocation for my risk profile?")}
              disabled={loading}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Portfolio Advice
            </button>
            <button
              onClick={() => setCurrentMessage("Show me the current market trends")}
              disabled={loading}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Market Trends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
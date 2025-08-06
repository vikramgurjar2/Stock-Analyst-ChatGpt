import React, { useRef, useEffect } from "react";
import { Send, Loader2, BarChart3, X, RotateCcw, Trash2 } from "lucide-react";
import ChatMessage from "./ChatMessage";

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
  retryLastMessage,
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
    <div className="p-3 sm:p-6 h-full flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900">
                  AI Stock Analyst Chat
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-tight">
                  Ask me anything about {selectedStock} or portfolio
                  optimization
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedStock && (
                <button
                  onClick={handleStockAnalysis}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md"
                  title={`Get analysis for ${selectedStock}`}
                >
                  <BarChart3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Analyze</span>{" "}
                  {selectedStock}
                </button>
              )}

              {chatMessages.length > 0 && (
                <>
                  <button
                    onClick={retryLastMessage}
                    disabled={loading}
                    className="px-3 py-2 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Retry last message"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span className="hidden sm:inline">Retry</span>
                  </button>

                  <button
                    onClick={clearChat}
                    disabled={loading}
                    className="px-3 py-2 text-xs bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Clear chat"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-3 sm:mx-4 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-2 text-red-700 flex-1">
              <X className="h-4 w-4 mt-0.5 sm:mt-0 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 min-h-0">
          {chatMessages.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-8 sm:py-12">
              <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 text-blue-600" />
              </div>
              <p className="text-sm leading-relaxed mb-4 px-4">
                Start a conversation about {selectedStock} or ask for portfolio
                advice!
              </p>
              {selectedStock && (
                <button
                  onClick={handleStockAnalysis}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
              <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-sm font-medium">AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="flex space-x-2 mb-3">
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
              className="flex-1 px-3 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm bg-white shadow-sm transition-all duration-200"
            />
            <button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || loading}
              className="px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() =>
                setCurrentMessage(`What's your analysis of ${selectedStock}?`)
              }
              disabled={loading || !selectedStock}
              className="px-3 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm hover:shadow transition-all duration-200"
            >
              Analyze Stock
            </button>
            <button
              onClick={() =>
                setCurrentMessage(
                  "What's the best portfolio allocation for my risk profile?"
                )
              }
              disabled={loading}
              className="px-3 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm hover:shadow transition-all duration-200"
            >
              Portfolio Advice
            </button>
            <button
              onClick={() =>
                setCurrentMessage("Show me the current market trends")
              }
              disabled={loading}
              className="px-3 py-2 text-xs bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-sm hover:shadow transition-all duration-200"
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

// import React, { useRef, useEffect } from "react";
// import { Send, Loader2, BarChart3, X, RotateCcw, Trash2 } from "lucide-react";
// import ChatMessage from "./ChatMessage";

// const ChatInterface = ({
//   selectedStock,
//   chatMessages,
//   currentMessage,
//   setCurrentMessage,
//   handleSendMessage,
//   handleKeyPress,
//   loading,
//   error,
//   clearError,
//   getStockAnalysis,
//   clearChat,
//   retryLastMessage,
// }) => {
//   const chatEndRef = useRef(null);

//   const scrollToBottom = () => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [chatMessages]);

//   const handleStockAnalysis = () => {
//     if (selectedStock && !loading) {
//       getStockAnalysis(selectedStock);
//     }
//   };

//   return (
//     <div className="p-6 h-full flex flex-col">
//       <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col">
//         {/* Header */}
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-lg font-semibold">AI Stock Analyst Chat</h3>
//               <p className="text-sm text-gray-600">
//                 Ask me anything about {selectedStock} or portfolio optimization
//               </p>
//             </div>

//             {/* Header Actions */}
//             <div className="flex items-center gap-2">
//               {selectedStock && (
//                 <button
//                   onClick={handleStockAnalysis}
//                   disabled={loading}
//                   className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                   title={`Get analysis for ${selectedStock}`}
//                 >
//                   <BarChart3 className="h-3 w-3" />
//                   Analyze {selectedStock}
//                 </button>
//               )}

//               {chatMessages.length > 0 && (
//                 <>
//                   <button
//                     onClick={retryLastMessage}
//                     disabled={loading}
//                     className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                     title="Retry last message"
//                   >
//                     <RotateCcw className="h-3 w-3" />
//                     Retry
//                   </button>

//                   <button
//                     onClick={clearChat}
//                     disabled={loading}
//                     className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                     title="Clear chat"
//                   >
//                     <Trash2 className="h-3 w-3" />
//                     Clear
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Error Banner */}
//         {error && (
//           <div className="p-3 bg-red-50 border-b border-red-200 flex items-center justify-between">
//             <div className="flex items-center gap-2 text-red-700">
//               <X className="h-4 w-4" />
//               <span className="text-sm">{error}</span>
//             </div>
//             <button
//               onClick={clearError}
//               className="text-red-500 hover:text-red-700"
//             >
//               <X className="h-4 w-4" />
//             </button>
//           </div>
//         )}

//         {/* Chat Messages */}
//         <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-96">
//           {chatMessages.length === 0 && !loading && (
//             <div className="text-center text-gray-500 py-8">
//               <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
//               <p className="text-sm">
//                 Start a conversation about {selectedStock} or ask for portfolio
//                 advice!
//               </p>
//               {selectedStock && (
//                 <button
//                   onClick={handleStockAnalysis}
//                   className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
//                 >
//                   Get {selectedStock} Analysis
//                 </button>
//               )}
//             </div>
//           )}

//           {chatMessages.map((message) => (
//             <ChatMessage key={message.id} message={message} />
//           ))}

//           {/* Loading Indicator */}
//           {loading && (
//             <div className="flex justify-start">
//               <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2">
//                 <Loader2 className="h-4 w-4 animate-spin" />
//                 <span className="text-sm">AI is thinking...</span>
//               </div>
//             </div>
//           )}

//           <div ref={chatEndRef} />
//         </div>

//         {/* Input Area */}
//         <div className="p-4 border-t border-gray-200">
//           <div className="flex space-x-2">
//             <input
//               type="text"
//               value={currentMessage}
//               onChange={(e) => setCurrentMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               disabled={loading}
//               placeholder={
//                 loading
//                   ? "Please wait..."
//                   : "Ask about stock analysis, portfolio optimization..."
//               }
//               className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
//             />
//             <button
//               onClick={handleSendMessage}
//               disabled={!currentMessage.trim() || loading}
//               className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//             >
//               {loading ? (
//                 <Loader2 className="h-4 w-4 animate-spin" />
//               ) : (
//                 <Send className="h-4 w-4" />
//               )}
//             </button>
//           </div>

//           {/* Quick Actions */}
//           <div className="flex gap-2 mt-2">
//             <button
//               onClick={() =>
//                 setCurrentMessage(`What's your analysis of ${selectedStock}?`)
//               }
//               disabled={loading || !selectedStock}
//               className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Analyze Stock
//             </button>
//             <button
//               onClick={() =>
//                 setCurrentMessage(
//                   "What's the best portfolio allocation for my risk profile?"
//                 )
//               }
//               disabled={loading}
//               className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Portfolio Advice
//             </button>
//             <button
//               onClick={() =>
//                 setCurrentMessage("Show me the current market trends")
//               }
//               disabled={loading}
//               className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Market Trends
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInterface;

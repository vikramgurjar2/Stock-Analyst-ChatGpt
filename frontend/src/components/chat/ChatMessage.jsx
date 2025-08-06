import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  User,
  Bot,
} from "lucide-react";

const parseMarkdown = (text) => {
  if (!text) return text;

  let processedText = text;

  // First, handle headers before other processing
  processedText = processedText
    .replace(
      /^## (.*$)/gim,
      '<h2 class="text-lg font-bold text-gray-900 mt-6 mb-3 border-b border-gray-300 pb-2">$1</h2>'
    )
    .replace(
      /^### (.*$)/gim,
      '<h3 class="text-base font-semibold text-gray-800 mt-4 mb-2">$1</h3>'
    );

  // Handle special bullet points with stars (***item:)
  processedText = processedText.replace(
    /\*\*\*(.*?):/g,
    '<div class="mt-3 mb-2"><span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-semibold">$1:</span></div>'
  );

  // Handle bold and italic formatting
  processedText = processedText
    .replace(
      /\*\*\*(.*?)\*\*\*/g,
      "<strong class='bg-yellow-100 text-yellow-800 px-1 rounded font-bold'>$1</strong>"
    )
    .replace(
      /\*\*(.*?)\*\*/g,
      "<strong class='font-bold text-gray-900'>$1</strong>"
    )
    .replace(/\*(.*?)\*/g, "<em class='text-gray-700 italic'>$1</em>");

  // Handle numbered sections (1. 2. 3. etc.)
  processedText = processedText.replace(
    /^(\d+)\.\s+(.*?):/gm,
    '<div class="mt-4 mb-2"><span class="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">$1. $2:</span></div>'
  );

  // Handle regular bullet points
  processedText = processedText.replace(
    /^\* (.*$)/gm,
    '<div class="ml-4 mb-2 flex items-start"><span class="text-blue-500 mr-2">•</span><span>$1</span></div>'
  );

  // Split into paragraphs and process
  const paragraphs = processedText.split(/\n\s*\n/);

  const formattedParagraphs = paragraphs.map((paragraph) => {
    paragraph = paragraph.trim();
    if (!paragraph) return "";

    // Skip if it's already a formatted element (headers, divs, etc.)
    if (
      paragraph.startsWith("<h") ||
      paragraph.startsWith("<div") ||
      paragraph.startsWith("<span")
    ) {
      return paragraph;
    }

    // Replace single line breaks with <br> within paragraphs
    paragraph = paragraph.replace(/\n/g, "<br>");

    // Wrap in paragraph tag
    return `<p class="mb-4 leading-relaxed text-sm">${paragraph}</p>`;
  });

  return formattedParagraphs.join("");
};

const ChatMessage = ({ message }) => {
  const [showData, setShowData] = useState(false);

  const getMessageStyle = () => {
    if (message.sender === "user") {
      return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg";
    } else if (message.isError) {
      return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200 shadow-md";
    } else if (message.isAnalysis) {
      return "bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 border border-green-200 shadow-md";
    } else {
      return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 shadow-md";
    }
  };

  const getChangeColorClasses = (change) => {
    return change >= 0 ? "text-emerald-600" : "text-red-500";
  };

  const getSignalClasses = (signalType) => {
    return signalType === "BUY"
      ? "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 border border-emerald-200"
      : "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200";
  };

  const renderStockData = (data) => {
    if (!data) return null;

    // Handle the stock context structure from your debug data
    const stockInfo = data.stockContext || data;

    return (
      <div className="mt-3 p-4 bg-white rounded-xl border border-gray-200 text-sm shadow-sm">
        {/* Basic Stock Info */}
        {stockInfo.symbol && (
          <div className="mb-4 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="font-bold text-lg text-gray-900">
                {stockInfo.symbol}
              </h4>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {stockInfo.price && (
                <div className="px-3 py-1.5 bg-blue-50 rounded-lg">
                  <span className="text-xs font-medium text-blue-600">
                    Price
                  </span>
                  <div className="font-bold text-blue-900">
                    ${stockInfo.price}
                  </div>
                </div>
              )}
              {stockInfo.change && (
                <div
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                    stockInfo.change >= 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {stockInfo.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  <div>
                    <div className="text-xs font-medium opacity-75">Change</div>
                    <div className="font-bold">
                      ${stockInfo.change.toFixed(2)}
                      {stockInfo.changePercent &&
                        ` (${stockInfo.changePercent.toFixed(2)}%)`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Technical Signals */}
        {stockInfo.technicalSignals &&
          stockInfo.technicalSignals.length > 0 && (
            <div className="mb-4">
              <h5 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gray-600" />
                Technical Signals
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stockInfo.technicalSignals.map((signal, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${getSignalClasses(
                      signal.type
                    )} transition-all duration-200 hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">{signal.type}</span>
                      <span className="text-xs opacity-75">
                        {signal.indicator}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 leading-relaxed">
                      {signal.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Risk Metrics */}
        {stockInfo.riskMetrics && (
          <div className="mb-4">
            <h5 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              Risk Metrics
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stockInfo.riskMetrics.volatility && (
                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="text-xs font-medium text-purple-600 mb-1">
                    Volatility
                  </div>
                  <div className="font-bold text-purple-900">
                    {(stockInfo.riskMetrics.volatility * 100).toFixed(2)}%
                  </div>
                </div>
              )}
              {stockInfo.riskMetrics.rsi && (
                <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="text-xs font-medium text-orange-600 mb-1">
                    RSI
                  </div>
                  <div className="font-bold text-orange-900">
                    {stockInfo.riskMetrics.rsi}
                  </div>
                </div>
              )}
              {stockInfo.riskMetrics.momentum && (
                <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                  <div className="text-xs font-medium text-indigo-600 mb-1">
                    Momentum
                  </div>
                  <div className="font-bold text-indigo-900">
                    {stockInfo.riskMetrics.momentum.toFixed(2)}%
                  </div>
                </div>
              )}
              {stockInfo.portfolioAllocation && (
                <div className="p-3 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                  <div className="text-xs font-medium text-teal-600 mb-1">
                    Suggested Allocation
                  </div>
                  <div className="font-bold text-teal-900">
                    {stockInfo.portfolioAllocation}%
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback for other data structures */}
        {!stockInfo.symbol && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {data.currentPrice && (
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="text-xs font-medium text-blue-600 mb-1">
                  Current Price
                </div>
                <div className="font-bold text-blue-900">
                  ${data.currentPrice}
                </div>
              </div>
            )}
            {data.recommendation && (
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                <div className="text-xs font-medium text-green-600 mb-1">
                  Recommendation
                </div>
                <div className="font-bold text-green-900">
                  {data.recommendation}
                </div>
              </div>
            )}
            {data.targetPrice && (
              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="text-xs font-medium text-purple-600 mb-1">
                  Target Price
                </div>
                <div className="font-bold text-purple-900">
                  ${data.targetPrice}
                </div>
              </div>
            )}
            {data.riskLevel && (
              <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                <div className="text-xs font-medium text-yellow-600 mb-1">
                  Risk Level
                </div>
                <div className="font-bold text-yellow-900">
                  {data.riskLevel}
                </div>
              </div>
            )}
            {data.allocationPercentage && (
              <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                <div className="text-xs font-medium text-indigo-600 mb-1">
                  Suggested Allocation
                </div>
                <div className="font-bold text-indigo-900">
                  {data.allocationPercentage}%
                </div>
              </div>
            )}
          </div>
        )}

        {data.analysis && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-blue-800">Analysis</span>
            </div>
            <div
              className="text-sm text-blue-700 leading-relaxed max-w-none [&>h2]:first:mt-0 [&>p]:first:mt-0 [&>h2]:text-blue-800 [&>h3]:text-blue-700 [&>strong]:text-blue-900"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(data.analysis) }}
            />
          </div>
        )}

        {data.technicalIndicators && (
          <div>
            <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              Technical Indicators
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(data.technicalIndicators).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="text-xs font-medium text-gray-600 mb-1 capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div className="text-sm text-gray-800 font-medium break-words">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex ${
        message.sender === "user" ? "justify-end" : "justify-start"
      } mb-6`}
    >
      <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
        {/* Avatar */}
        {message.sender !== "user" && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-300">
            {message.isError ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : message.isAnalysis ? (
              <BarChart3 className="h-4 w-4 text-green-600" />
            ) : (
              <Bot className="h-4 w-4 text-gray-600" />
            )}
          </div>
        )}

        <div
          className={`px-4 py-3 rounded-2xl shadow-lg ${getMessageStyle()} ${
            message.sender === "user" ? "rounded-br-md" : "rounded-bl-md"
          } transition-all duration-200 hover:shadow-xl`}
        >
          {/* Message Content */}
          <div className="min-w-0">
            <div
              className="text-sm leading-relaxed break-words max-w-none [&>h2]:first:mt-0 [&>p]:first:mt-0"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
            />

            {/* Show analysis data if available */}
            {message.data && (
              <div className="mt-4">
                <button
                  onClick={() => setShowData(!showData)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    message.sender === "user"
                      ? "bg-white/20 text-white/90 hover:bg-white/30"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                  }`}
                  aria-expanded={showData}
                >
                  {showData ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                  <span className="font-medium">
                    {showData ? "Hide Details" : "Show Details"}
                  </span>
                </button>

                {showData && (
                  <div className="transition-all duration-300 ease-in-out">
                    {renderStockData(message.data)}
                  </div>
                )}
              </div>
            )}

            {/* Show raw data for debugging (only in development) */}
            {message.data && process.env.NODE_ENV === "development" && (
              <details className="mt-3">
                <summary className="text-xs opacity-70 cursor-pointer hover:opacity-100 transition-opacity py-1 px-2 bg-black/10 rounded">
                  Debug Data
                </summary>
                <pre className="text-xs mt-2 p-3 bg-black/20 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap break-all font-mono">
                  {JSON.stringify(message.data, null, 2)}
                </pre>
              </details>
            )}

            <p
              className={`text-xs mt-3 text-right opacity-70 ${
                message.sender === "user" ? "text-white/70" : "text-gray-500"
              }`}
            >
              {message.timestamp}
            </p>
          </div>
        </div>

        {/* User Avatar */}
        {message.sender === "user" && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-blue-300">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};
export default ChatMessage;

// import React, { useState } from "react";
// import {
//   ChevronDown,
//   ChevronUp,
//   AlertCircle,
//   BarChart3,
//   TrendingUp,
//   TrendingDown,
//   User,
//   Bot,
// } from "lucide-react";

// const parseMarkdown = (text) => {
//   if (!text) return text;

//   return (
//     text
//       // Handle bold italic (***text***)
//       .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
//       // Handle bold (**text**)
//       .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
//       // Handle italic (*text*)
//       .replace(/\*(.*?)\*/g, "<em>$1</em>")
//       // Handle line breaks
//       .replace(/\n/g, "<br />")
//   );
// };

// const ChatMessage = ({ message }) => {
//   const [showData, setShowData] = useState(false);

//   const getMessageStyle = () => {
//     if (message.sender === "user") {
//       return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg";
//     } else if (message.isError) {
//       return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200 shadow-md";
//     } else if (message.isAnalysis) {
//       return "bg-gradient-to-r from-green-50 to-emerald-100 text-green-800 border border-green-200 shadow-md";
//     } else {
//       return "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-800 border border-gray-200 shadow-md";
//     }
//   };

//   const getChangeColorClasses = (change) => {
//     return change >= 0 ? "text-emerald-600" : "text-red-500";
//   };

//   const getSignalClasses = (signalType) => {
//     return signalType === "BUY"
//       ? "bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800 border border-emerald-200"
//       : "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border border-red-200";
//   };

//   const renderStockData = (data) => {
//     if (!data) return null;

//     // Handle the stock context structure from your debug data
//     const stockInfo = data.stockContext || data;

//     return (
//       <div className="mt-3 p-4 bg-white rounded-xl border border-gray-200 text-sm shadow-sm">
//         {/* Basic Stock Info */}
//         {stockInfo.symbol && (
//           <div className="mb-4 pb-3 border-b border-gray-200">
//             <div className="flex items-center gap-2 mb-2">
//               <div className="p-1.5 bg-blue-100 rounded-lg">
//                 <BarChart3 className="h-4 w-4 text-blue-600" />
//               </div>
//               <h4 className="font-bold text-lg text-gray-900">
//                 {stockInfo.symbol}
//               </h4>
//             </div>
//             <div className="flex items-center gap-4 flex-wrap">
//               {stockInfo.price && (
//                 <div className="px-3 py-1.5 bg-blue-50 rounded-lg">
//                   <span className="text-xs font-medium text-blue-600">
//                     Price
//                   </span>
//                   <div className="font-bold text-blue-900">
//                     ${stockInfo.price}
//                   </div>
//                 </div>
//               )}
//               {stockInfo.change && (
//                 <div
//                   className={`px-3 py-1.5 rounded-lg flex items-center gap-2 ${
//                     stockInfo.change >= 0
//                       ? "bg-emerald-50 text-emerald-700"
//                       : "bg-red-50 text-red-700"
//                   }`}
//                 >
//                   {stockInfo.change >= 0 ? (
//                     <TrendingUp className="h-4 w-4" />
//                   ) : (
//                     <TrendingDown className="h-4 w-4" />
//                   )}
//                   <div>
//                     <div className="text-xs font-medium opacity-75">Change</div>
//                     <div className="font-bold">
//                       ${stockInfo.change.toFixed(2)}
//                       {stockInfo.changePercent &&
//                         ` (${stockInfo.changePercent.toFixed(2)}%)`}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Technical Signals */}
//         {stockInfo.technicalSignals &&
//           stockInfo.technicalSignals.length > 0 && (
//             <div className="mb-4">
//               <h5 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
//                 <BarChart3 className="h-4 w-4 text-gray-600" />
//                 Technical Signals
//               </h5>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {stockInfo.technicalSignals.map((signal, index) => (
//                   <div
//                     key={index}
//                     className={`p-3 rounded-lg ${getSignalClasses(
//                       signal.type
//                     )} transition-all duration-200 hover:shadow-md`}
//                   >
//                     <div className="flex items-center justify-between mb-1">
//                       <span className="font-bold text-sm">{signal.type}</span>
//                       <span className="text-xs opacity-75">
//                         {signal.indicator}
//                       </span>
//                     </div>
//                     <p className="text-xs opacity-90 leading-relaxed">
//                       {signal.reason}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//         {/* Risk Metrics */}
//         {stockInfo.riskMetrics && (
//           <div className="mb-4">
//             <h5 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
//               <AlertCircle className="h-4 w-4 text-gray-600" />
//               Risk Metrics
//             </h5>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
//               {stockInfo.riskMetrics.volatility && (
//                 <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
//                   <div className="text-xs font-medium text-purple-600 mb-1">
//                     Volatility
//                   </div>
//                   <div className="font-bold text-purple-900">
//                     {(stockInfo.riskMetrics.volatility * 100).toFixed(2)}%
//                   </div>
//                 </div>
//               )}
//               {stockInfo.riskMetrics.rsi && (
//                 <div className="p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
//                   <div className="text-xs font-medium text-orange-600 mb-1">
//                     RSI
//                   </div>
//                   <div className="font-bold text-orange-900">
//                     {stockInfo.riskMetrics.rsi}
//                   </div>
//                 </div>
//               )}
//               {stockInfo.riskMetrics.momentum && (
//                 <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
//                   <div className="text-xs font-medium text-indigo-600 mb-1">
//                     Momentum
//                   </div>
//                   <div className="font-bold text-indigo-900">
//                     {stockInfo.riskMetrics.momentum.toFixed(2)}%
//                   </div>
//                 </div>
//               )}
//               {stockInfo.portfolioAllocation && (
//                 <div className="p-3 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
//                   <div className="text-xs font-medium text-teal-600 mb-1">
//                     Suggested Allocation
//                   </div>
//                   <div className="font-bold text-teal-900">
//                     {stockInfo.portfolioAllocation}%
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Fallback for other data structures */}
//         {!stockInfo.symbol && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
//             {data.currentPrice && (
//               <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
//                 <div className="text-xs font-medium text-blue-600 mb-1">
//                   Current Price
//                 </div>
//                 <div className="font-bold text-blue-900">
//                   ${data.currentPrice}
//                 </div>
//               </div>
//             )}
//             {data.recommendation && (
//               <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
//                 <div className="text-xs font-medium text-green-600 mb-1">
//                   Recommendation
//                 </div>
//                 <div className="font-bold text-green-900">
//                   {data.recommendation}
//                 </div>
//               </div>
//             )}
//             {data.targetPrice && (
//               <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
//                 <div className="text-xs font-medium text-purple-600 mb-1">
//                   Target Price
//                 </div>
//                 <div className="font-bold text-purple-900">
//                   ${data.targetPrice}
//                 </div>
//               </div>
//             )}
//             {data.riskLevel && (
//               <div className="p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
//                 <div className="text-xs font-medium text-yellow-600 mb-1">
//                   Risk Level
//                 </div>
//                 <div className="font-bold text-yellow-900">
//                   {data.riskLevel}
//                 </div>
//               </div>
//             )}
//             {data.allocationPercentage && (
//               <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
//                 <div className="text-xs font-medium text-indigo-600 mb-1">
//                   Suggested Allocation
//                 </div>
//                 <div className="font-bold text-indigo-900">
//                   {data.allocationPercentage}%
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {data.analysis && (
//           <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 mb-4">
//             <div className="flex items-center gap-2 mb-2">
//               <BarChart3 className="h-4 w-4 text-blue-600" />
//               <span className="font-semibold text-blue-800">Analysis</span>
//             </div>
//             <p className="text-sm text-blue-700 leading-relaxed">
//               {data.analysis}
//             </p>
//           </div>
//         )}

//         {data.technicalIndicators && (
//           <div>
//             <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
//               <TrendingUp className="h-4 w-4 text-gray-600" />
//               Technical Indicators
//             </h5>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//               {Object.entries(data.technicalIndicators).map(([key, value]) => (
//                 <div
//                   key={key}
//                   className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
//                 >
//                   <div className="text-xs font-medium text-gray-600 mb-1 capitalize">
//                     {key.replace(/([A-Z])/g, " $1").trim()}
//                   </div>
//                   <div className="text-sm text-gray-800 font-medium break-words">
//                     {typeof value === "object"
//                       ? JSON.stringify(value)
//                       : String(value)}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div
//       className={`flex ${
//         message.sender === "user" ? "justify-end" : "justify-start"
//       } mb-6`}
//     >
//       <div className="flex items-start gap-3 max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
//         {/* Avatar */}
//         {message.sender !== "user" && (
//           <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center border border-gray-300">
//             {message.isError ? (
//               <AlertCircle className="h-4 w-4 text-red-500" />
//             ) : message.isAnalysis ? (
//               <BarChart3 className="h-4 w-4 text-green-600" />
//             ) : (
//               <Bot className="h-4 w-4 text-gray-600" />
//             )}
//           </div>
//         )}

//         <div
//           className={`px-4 py-3 rounded-2xl shadow-lg ${getMessageStyle()} ${
//             message.sender === "user" ? "rounded-br-md" : "rounded-bl-md"
//           } transition-all duration-200 hover:shadow-xl`}
//         >
//           {/* Message Content */}
//           <div className="min-w-0">
//             <div
//               className="text-sm leading-relaxed break-words"
//               dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
//             />

//             {/* Show analysis data if available */}
//             {message.data && (
//               <div className="mt-4">
//                 <button
//                   onClick={() => setShowData(!showData)}
//                   className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${
//                     message.sender === "user"
//                       ? "bg-white/20 text-white/90 hover:bg-white/30"
//                       : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
//                   }`}
//                   aria-expanded={showData}
//                 >
//                   {showData ? (
//                     <ChevronUp className="h-3 w-3" />
//                   ) : (
//                     <ChevronDown className="h-3 w-3" />
//                   )}
//                   <span className="font-medium">
//                     {showData ? "Hide Details" : "Show Details"}
//                   </span>
//                 </button>

//                 {showData && (
//                   <div className="transition-all duration-300 ease-in-out">
//                     {renderStockData(message.data)}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Show raw data for debugging (only in development) */}
//             {message.data && process.env.NODE_ENV === "development" && (
//               <details className="mt-3">
//                 <summary className="text-xs opacity-70 cursor-pointer hover:opacity-100 transition-opacity py-1 px-2 bg-black/10 rounded">
//                   Debug Data
//                 </summary>
//                 <pre className="text-xs mt-2 p-3 bg-black/20 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap break-all font-mono">
//                   {JSON.stringify(message.data, null, 2)}
//                 </pre>
//               </details>
//             )}

//             <p
//               className={`text-xs mt-3 text-right opacity-70 ${
//                 message.sender === "user" ? "text-white/70" : "text-gray-500"
//               }`}
//             >
//               {message.timestamp}
//             </p>
//           </div>
//         </div>

//         {/* User Avatar */}
//         {message.sender === "user" && (
//           <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-2 border-blue-300">
//             <User className="h-4 w-4 text-white" />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatMessage;

// import React, { useState } from "react";
// import {
//   ChevronDown,
//   ChevronUp,
//   AlertCircle,
//   BarChart3,
//   TrendingUp,
//   TrendingDown,
// } from "lucide-react";

// const parseMarkdown = (text) => {
//   if (!text) return text;

//   return (
//     text
//       // Handle bold italic (***text***)
//       .replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>")
//       // Handle bold (**text**)
//       .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
//       // Handle italic (*text*)
//       .replace(/\*(.*?)\*/g, "<em>$1</em>")
//       // Handle line breaks
//       .replace(/\n/g, "<br />")
//   );
// };

// const ChatMessage = ({ message }) => {
//   const [showData, setShowData] = useState(false);

//   const getMessageStyle = () => {
//     if (message.sender === "user") {
//       return "bg-blue-500 text-white";
//     } else if (message.isError) {
//       return "bg-red-100 text-red-800 border border-red-200";
//     } else if (message.isAnalysis) {
//       return "bg-green-100 text-green-800 border border-green-200";
//     } else {
//       return "bg-gray-200 text-gray-800";
//     }
//   };

//   const getChangeColorClasses = (change) => {
//     return change >= 0 ? "text-green-600" : "text-red-600";
//   };

//   const getSignalClasses = (signalType) => {
//     return signalType === "BUY"
//       ? "bg-green-50 text-green-800"
//       : "bg-red-50 text-red-800";
//   };

//   const renderStockData = (data) => {
//     if (!data) return null;

//     // Handle the stock context structure from your debug data
//     const stockInfo = data.stockContext || data;

//     return (
//       <div className="mt-2 p-3 bg-white rounded border text-sm">
//         {/* Basic Stock Info */}
//         {stockInfo.symbol && (
//           <div className="mb-3 pb-2 border-b border-gray-200">
//             <h4 className="font-bold text-lg text-gray-900">
//               {stockInfo.symbol}
//             </h4>
//             <div className="flex items-center gap-4 mt-1 flex-wrap">
//               {stockInfo.price && (
//                 <div className="text-gray-700">
//                   <span className="font-semibold">Price:</span> $
//                   {stockInfo.price}
//                 </div>
//               )}
//               {stockInfo.change && (
//                 <div
//                   className={`flex items-center gap-1 ${getChangeColorClasses(
//                     stockInfo.change
//                   )}`}
//                 >
//                   {stockInfo.change >= 0 ? (
//                     <TrendingUp className="h-4 w-4" />
//                   ) : (
//                     <TrendingDown className="h-4 w-4" />
//                   )}
//                   <span>
//                     ${stockInfo.change.toFixed(2)}
//                     {stockInfo.changePercent &&
//                       ` (${stockInfo.changePercent.toFixed(2)}%)`}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Technical Signals */}
//         {stockInfo.technicalSignals &&
//           stockInfo.technicalSignals.length > 0 && (
//             <div className="mb-3">
//               <h5 className="font-semibold mb-2 text-gray-800">
//                 Technical Signals:
//               </h5>
//               <div className="space-y-1">
//                 {stockInfo.technicalSignals.map((signal, index) => (
//                   <div
//                     key={index}
//                     className={`flex items-center gap-2 text-xs p-2 rounded ${getSignalClasses(
//                       signal.type
//                     )}`}
//                   >
//                     <span className="font-medium">{signal.type}</span>
//                     <span className="text-gray-600">({signal.indicator})</span>
//                     <span className="opacity-75">{signal.reason}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//         {/* Risk Metrics */}
//         {stockInfo.riskMetrics && (
//           <div className="mb-3">
//             <h5 className="font-semibold mb-2 text-gray-800">Risk Metrics:</h5>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
//               {stockInfo.riskMetrics.volatility && (
//                 <div className="p-2 bg-gray-50 rounded">
//                   <span className="font-medium text-gray-700">Volatility:</span>{" "}
//                   <span className="text-gray-900">
//                     {(stockInfo.riskMetrics.volatility * 100).toFixed(2)}%
//                   </span>
//                 </div>
//               )}
//               {stockInfo.riskMetrics.rsi && (
//                 <div className="p-2 bg-gray-50 rounded">
//                   <span className="font-medium text-gray-700">RSI:</span>{" "}
//                   <span className="text-gray-900">
//                     {stockInfo.riskMetrics.rsi}
//                   </span>
//                 </div>
//               )}
//               {stockInfo.riskMetrics.momentum && (
//                 <div className="p-2 bg-gray-50 rounded">
//                   <span className="font-medium text-gray-700">Momentum:</span>{" "}
//                   <span className="text-gray-900">
//                     {stockInfo.riskMetrics.momentum.toFixed(2)}%
//                   </span>
//                 </div>
//               )}
//               {stockInfo.portfolioAllocation && (
//                 <div className="p-2 bg-gray-50 rounded">
//                   <span className="font-medium text-gray-700">
//                     Suggested Allocation:
//                   </span>{" "}
//                   <span className="text-gray-900">
//                     {stockInfo.portfolioAllocation}%
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Fallback for other data structures */}
//         {!stockInfo.symbol && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {data.currentPrice && (
//               <div className="p-2 bg-blue-50 rounded">
//                 <span className="font-semibold text-blue-800">
//                   Current Price:
//                 </span>{" "}
//                 <span className="text-blue-900">${data.currentPrice}</span>
//               </div>
//             )}
//             {data.recommendation && (
//               <div className="p-2 bg-green-50 rounded">
//                 <span className="font-semibold text-green-800">
//                   Recommendation:
//                 </span>{" "}
//                 <span className="text-green-900">{data.recommendation}</span>
//               </div>
//             )}
//             {data.targetPrice && (
//               <div className="p-2 bg-purple-50 rounded">
//                 <span className="font-semibold text-purple-800">
//                   Target Price:
//                 </span>{" "}
//                 <span className="text-purple-900">${data.targetPrice}</span>
//               </div>
//             )}
//             {data.riskLevel && (
//               <div className="p-2 bg-yellow-50 rounded">
//                 <span className="font-semibold text-yellow-800">
//                   Risk Level:
//                 </span>{" "}
//                 <span className="text-yellow-900">{data.riskLevel}</span>
//               </div>
//             )}
//             {data.allocationPercentage && (
//               <div className="p-2 bg-indigo-50 rounded">
//                 <span className="font-semibold text-indigo-800">
//                   Suggested Allocation:
//                 </span>{" "}
//                 <span className="text-indigo-900">
//                   {data.allocationPercentage}%
//                 </span>
//               </div>
//             )}
//           </div>
//         )}

//         {data.analysis && (
//           <div className="mt-3 p-3 bg-blue-50 rounded">
//             <span className="font-semibold text-blue-800 block mb-1">
//               Analysis:
//             </span>
//             <p className="text-sm text-blue-700 leading-relaxed">
//               {data.analysis}
//             </p>
//           </div>
//         )}

//         {data.technicalIndicators && (
//           <div className="mt-3">
//             <span className="font-semibold text-gray-800 block mb-2">
//               Technical Indicators:
//             </span>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
//               {Object.entries(data.technicalIndicators).map(([key, value]) => (
//                 <div key={key} className="p-2 bg-gray-50 rounded text-xs">
//                   <span className="font-medium text-gray-700 capitalize block">
//                     {key.replace(/([A-Z])/g, " $1").trim()}:
//                   </span>
//                   <span className="text-gray-600 mt-1 block">
//                     {typeof value === "object"
//                       ? JSON.stringify(value)
//                       : String(value)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div
//       className={`flex ${
//         message.sender === "user" ? "justify-end" : "justify-start"
//       } mb-4`}
//     >
//       <div
//         className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${getMessageStyle()}`}
//       >
//         {/* Message header with icon for special message types */}
//         <div className="flex items-start gap-2">
//           {message.isError && (
//             <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
//           )}
//           {message.isAnalysis && (
//             <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0" />
//           )}

//           <div className="flex-1 min-w-0">
//             <div
//               className="text-sm leading-relaxed break-words"
//               dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
//             />

//             {/* Show analysis data if available */}
//             {message.data && (
//               <div className="mt-3">
//                 <button
//                   onClick={() => setShowData(!showData)}
//                   className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:opacity-100"
//                   aria-expanded={showData}
//                 >
//                   {showData ? (
//                     <ChevronUp className="h-3 w-3" />
//                   ) : (
//                     <ChevronDown className="h-3 w-3" />
//                   )}
//                   {showData ? "Hide Details" : "Show Details"}
//                 </button>

//                 {showData && (
//                   <div className="animate-in slide-in-from-top-2 duration-200">
//                     {renderStockData(message.data)}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Show raw data for debugging (only in development) */}
//             {message.data && process.env.NODE_ENV === "development" && (
//               <details className="mt-2">
//                 <summary className="text-xs opacity-70 cursor-pointer hover:opacity-100 transition-opacity">
//                   Debug Data
//                 </summary>
//                 <pre className="text-xs mt-2 p-3 bg-black bg-opacity-10 rounded overflow-auto max-h-40 whitespace-pre-wrap break-all">
//                   {JSON.stringify(message.data, null, 2)}
//                 </pre>
//               </details>
//             )}

//             <p className="text-xs mt-2 opacity-70 text-right">
//               {message.timestamp}
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default ChatMessage;

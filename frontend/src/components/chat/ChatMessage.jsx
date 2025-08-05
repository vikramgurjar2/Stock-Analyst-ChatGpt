import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const ChatMessage = ({ message }) => {
  const [showData, setShowData] = useState(false);

  const getMessageStyle = () => {
    if (message.sender === 'user') {
      return 'bg-blue-500 text-white';
    } else if (message.isError) {
      return 'bg-red-100 text-red-800 border border-red-200';
    } else if (message.isAnalysis) {
      return 'bg-green-100 text-green-800 border border-green-200';
    } else {
      return 'bg-gray-200 text-gray-800';
    }
  };

  const getChangeColorClasses = (change) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getSignalClasses = (signalType) => {
    return signalType === 'BUY' 
      ? 'bg-green-50 text-green-800' 
      : 'bg-red-50 text-red-800';
  };

  const renderStockData = (data) => {
    if (!data) return null;

    // Handle the stock context structure from your debug data
    const stockInfo = data.stockContext || data;
    
    return (
      <div className="mt-2 p-3 bg-white rounded border text-sm">
        {/* Basic Stock Info */}
        {stockInfo.symbol && (
          <div className="mb-3 pb-2 border-b border-gray-200">
            <h4 className="font-bold text-lg text-gray-900">{stockInfo.symbol}</h4>
            <div className="flex items-center gap-4 mt-1 flex-wrap">
              {stockInfo.price && (
                <div className="text-gray-700">
                  <span className="font-semibold">Price:</span> ${stockInfo.price}
                </div>
              )}
              {stockInfo.change && (
                <div className={`flex items-center gap-1 ${getChangeColorClasses(stockInfo.change)}`}>
                  {stockInfo.change >= 0 ? 
                    <TrendingUp className="h-4 w-4" /> : 
                    <TrendingDown className="h-4 w-4" />
                  }
                  <span>
                    ${stockInfo.change.toFixed(2)} 
                    {stockInfo.changePercent && ` (${stockInfo.changePercent.toFixed(2)}%)`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Technical Signals */}
        {stockInfo.technicalSignals && stockInfo.technicalSignals.length > 0 && (
          <div className="mb-3">
            <h5 className="font-semibold mb-2 text-gray-800">Technical Signals:</h5>
            <div className="space-y-1">
              {stockInfo.technicalSignals.map((signal, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-2 text-xs p-2 rounded ${getSignalClasses(signal.type)}`}
                >
                  <span className="font-medium">{signal.type}</span>
                  <span className="text-gray-600">({signal.indicator})</span>
                  <span className="opacity-75">{signal.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Metrics */}
        {stockInfo.riskMetrics && (
          <div className="mb-3">
            <h5 className="font-semibold mb-2 text-gray-800">Risk Metrics:</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {stockInfo.riskMetrics.volatility && (
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Volatility:</span>{' '}
                  <span className="text-gray-900">
                    {(stockInfo.riskMetrics.volatility * 100).toFixed(2)}%
                  </span>
                </div>
              )}
              {stockInfo.riskMetrics.rsi && (
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">RSI:</span>{' '}
                  <span className="text-gray-900">{stockInfo.riskMetrics.rsi}</span>
                </div>
              )}
              {stockInfo.riskMetrics.momentum && (
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Momentum:</span>{' '}
                  <span className="text-gray-900">{stockInfo.riskMetrics.momentum.toFixed(2)}%</span>
                </div>
              )}
              {stockInfo.portfolioAllocation && (
                <div className="p-2 bg-gray-50 rounded">
                  <span className="font-medium text-gray-700">Suggested Allocation:</span>{' '}
                  <span className="text-gray-900">{stockInfo.portfolioAllocation}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback for other data structures */}
        {!stockInfo.symbol && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.currentPrice && (
              <div className="p-2 bg-blue-50 rounded">
                <span className="font-semibold text-blue-800">Current Price:</span>{' '}
                <span className="text-blue-900">${data.currentPrice}</span>
              </div>
            )}
            {data.recommendation && (
              <div className="p-2 bg-green-50 rounded">
                <span className="font-semibold text-green-800">Recommendation:</span>{' '}
                <span className="text-green-900">{data.recommendation}</span>
              </div>
            )}
            {data.targetPrice && (
              <div className="p-2 bg-purple-50 rounded">
                <span className="font-semibold text-purple-800">Target Price:</span>{' '}
                <span className="text-purple-900">${data.targetPrice}</span>
              </div>
            )}
            {data.riskLevel && (
              <div className="p-2 bg-yellow-50 rounded">
                <span className="font-semibold text-yellow-800">Risk Level:</span>{' '}
                <span className="text-yellow-900">{data.riskLevel}</span>
              </div>
            )}
            {data.allocationPercentage && (
              <div className="p-2 bg-indigo-50 rounded">
                <span className="font-semibold text-indigo-800">Suggested Allocation:</span>{' '}
                <span className="text-indigo-900">{data.allocationPercentage}%</span>
              </div>
            )}
          </div>
        )}
        
        {data.analysis && (
          <div className="mt-3 p-3 bg-blue-50 rounded">
            <span className="font-semibold text-blue-800 block mb-1">Analysis:</span>
            <p className="text-sm text-blue-700 leading-relaxed">{data.analysis}</p>
          </div>
        )}
        
        {data.technicalIndicators && (
          <div className="mt-3">
            <span className="font-semibold text-gray-800 block mb-2">Technical Indicators:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(data.technicalIndicators).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded text-xs">
                  <span className="font-medium text-gray-700 capitalize block">
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span className="text-gray-600 mt-1 block">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${getMessageStyle()}`}>
        {/* Message header with icon for special message types */}
        <div className="flex items-start gap-2">
          {message.isError && <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
          {message.isAnalysis && <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0" />}
          
          <div className="flex-1 min-w-0">
            <p className="text-sm leading-relaxed break-words">{message.text}</p>
            
            {/* Show analysis data if available */}
            {message.data && (
              <div className="mt-3">
                <button
                  onClick={() => setShowData(!showData)}
                  className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:opacity-100"
                  aria-expanded={showData}
                >
                  {showData ? 
                    <ChevronUp className="h-3 w-3" /> : 
                    <ChevronDown className="h-3 w-3" />
                  }
                  {showData ? 'Hide Details' : 'Show Details'}
                </button>
                
                {showData && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                    {renderStockData(message.data)}
                  </div>
                )}
              </div>
            )}
            
            {/* Show raw data for debugging (only in development) */}
            {message.data && process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="text-xs opacity-70 cursor-pointer hover:opacity-100 transition-opacity">
                  Debug Data
                </summary>
                <pre className="text-xs mt-2 p-3 bg-black bg-opacity-10 rounded overflow-auto max-h-40 whitespace-pre-wrap break-all">
                  {JSON.stringify(message.data, null, 2)}
                </pre>
              </details>
            )}
            
            <p className="text-xs mt-2 opacity-70 text-right">
              {message.timestamp}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatMessage;
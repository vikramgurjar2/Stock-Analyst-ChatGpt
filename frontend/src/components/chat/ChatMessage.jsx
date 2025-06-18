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

  const renderStockData = (data) => {
    if (!data) return null;

    // Handle the stock context structure from your debug data
    const stockInfo = data.stockContext || data;
    
    return (
      <div className="mt-2 p-3 bg-white rounded border text-sm">
        {/* Basic Stock Info */}
        {stockInfo.symbol && (
          <div className="mb-3 pb-2 border-b">
            <h4 className="font-bold text-lg">{stockInfo.symbol}</h4>
            <div className="flex items-center gap-4 mt-1">
              {stockInfo.price && (
                <div>
                  <span className="font-semibold">Price:</span> ${stockInfo.price}
                </div>
              )}
              {stockInfo.change && (
                <div className={`flex items-center gap-1 ${stockInfo.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stockInfo.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  <span>${stockInfo.change.toFixed(2)} ({stockInfo.changePercent?.toFixed(2)}%)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Technical Signals */}
        {stockInfo.technicalSignals && stockInfo.technicalSignals.length > 0 && (
          <div className="mb-3">
            <h5 className="font-semibold mb-2">Technical Signals:</h5>
            <div className="space-y-1">
              {stockInfo.technicalSignals.map((signal, index) => (
                <div key={index} className={`flex items-center gap-2 text-xs p-2 rounded ${
                  signal.type === 'BUY' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  <span className="font-medium">{signal.type}</span>
                  <span>({signal.indicator})</span>
                  <span className="opacity-75">{signal.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Metrics */}
        {stockInfo.riskMetrics && (
          <div className="mb-3">
            <h5 className="font-semibold mb-2">Risk Metrics:</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {stockInfo.riskMetrics.volatility && (
                <div>
                  <span className="font-medium">Volatility:</span> {(stockInfo.riskMetrics.volatility * 100).toFixed(2)}%
                </div>
              )}
              {stockInfo.riskMetrics.rsi && (
                <div>
                  <span className="font-medium">RSI:</span> {stockInfo.riskMetrics.rsi}
                </div>
              )}
              {stockInfo.riskMetrics.momentum && (
                <div>
                  <span className="font-medium">Momentum:</span> {stockInfo.riskMetrics.momentum.toFixed(2)}%
                </div>
              )}
              {stockInfo.portfolioAllocation && (
                <div>
                  <span className="font-medium">Suggested Allocation:</span> {stockInfo.portfolioAllocation}%
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback for other data structures */}
        {!stockInfo.symbol && (
          <div className="grid grid-cols-2 gap-2">
            {data.currentPrice && (
              <div>
                <span className="font-semibold">Current Price:</span> ${data.currentPrice}
              </div>
            )}
            {data.recommendation && (
              <div>
                <span className="font-semibold">Recommendation:</span> {data.recommendation}
              </div>
            )}
            {data.targetPrice && (
              <div>
                <span className="font-semibold">Target Price:</span> ${data.targetPrice}
              </div>
            )}
            {data.riskLevel && (
              <div>
                <span className="font-semibold">Risk Level:</span> {data.riskLevel}
              </div>
            )}
            {data.allocationPercentage && (
              <div>
                <span className="font-semibold">Suggested Allocation:</span> {data.allocationPercentage}%
              </div>
            )}
          </div>
        )}
        
        {data.analysis && (
          <div className="mt-2">
            <span className="font-semibold">Analysis:</span>
            <p className="text-xs text-gray-600 mt-1">{data.analysis}</p>
          </div>
        )}
        
        {data.technicalIndicators && (
          <div className="mt-2">
            <span className="font-semibold">Technical Indicators:</span>
            <div className="grid grid-cols-3 gap-1 mt-1 text-xs">
              {Object.entries(data.technicalIndicators).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium">{key}:</span> {
                    typeof value === 'object' ? JSON.stringify(value) : value
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${getMessageStyle()}`}>
        {/* Message header with icon for special message types */}
        <div className="flex items-start gap-2">
          {message.isError && <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
          {message.isAnalysis && <BarChart3 className="h-4 w-4 mt-0.5 flex-shrink-0" />}
          
          <div className="flex-1">
            <p className="text-sm">{message.text}</p>
            
            {/* Show analysis data if available */}
            {message.data && (
              <div className="mt-2">
                <button
                  onClick={() => setShowData(!showData)}
                  className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100 transition-opacity"
                >
                  {showData ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  {showData ? 'Hide Details' : 'Show Details'}
                </button>
                
                {showData && renderStockData(message.data)}
              </div>
            )}
            
            {/* Show raw data for debugging (only in development) */}
            {message.data && process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="text-xs opacity-70 cursor-pointer">Debug Data</summary>
                <pre className="text-xs mt-1 p-2 bg-black bg-opacity-10 rounded overflow-auto max-h-40">
                  {JSON.stringify(message.data, null, 2)}
                </pre>
              </details>
            )}
            
            <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
// import React from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// const PriceChart = ({ selectedStock, stockData }) => {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <h3 className="text-lg font-semibold mb-4">Price Chart - {selectedStock}</h3>
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={stockData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis dataKey="date" />
//           <YAxis />
//           <Tooltip />
//           <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default PriceChart;



//src/components/PriceChart.js
import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

const PriceChart = ({ 
  selectedStock, 
  stockData, 
  currentQuote, 
  loading, 
  onRefresh,
  isConnected 
}) => {
  const [chartType, setChartType] = useState('line');
  const [showVolume, setShowVolume] = useState(false);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Date: ${label}`}</p>
          <p className="text-blue-600">{`Price: $${payload[0].value?.toFixed(2)}`}</p>
          {data.volume && (
            <p className="text-gray-600">{`Volume: ${data.volume?.toLocaleString()}`}</p>
          )}
          {data.high && data.low && (
            <>
              <p className="text-green-600">{`High: $${data.high?.toFixed(2)}`}</p>
              <p className="text-red-600">{`Low: $${data.low?.toFixed(2)}`}</p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate price change for current quote
  const priceChange = useMemo(() => {
    if (!currentQuote || !stockData.length) return null;
    
    const lastHistoricalPrice = stockData[stockData.length - 1]?.price;
    const currentPrice = currentQuote.price;
    
    if (lastHistoricalPrice && currentPrice) {
      const change = currentPrice - lastHistoricalPrice;
      const changePercent = (change / lastHistoricalPrice) * 100;
      return { change, changePercent };
    }
    
    return {
      change: currentQuote.change || 0,
      changePercent: currentQuote.changePercent || 0
    };
  }, [currentQuote, stockData]);

  // Combine historical data with current quote if available
  const chartData = useMemo(() => {
    let data = [...stockData];
    
    // Add current quote as the latest data point if available
    if (currentQuote && currentQuote.price) {
      const today = new Date().toLocaleDateString();
      const existsToday = data.some(item => item.date === today);
      
      if (!existsToday) {
        data.push({
          date: today,
          price: currentQuote.price,
          volume: currentQuote.volume || 0,
          high: currentQuote.high || currentQuote.price,
          low: currentQuote.low || currentQuote.price,
          open: currentQuote.open || currentQuote.price,
          isRealTime: true
        });
      }
    }
    
    return data;
  }, [stockData, currentQuote]);

  // Chart configuration based on type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    if (chartType === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `$${value?.toFixed(0)}`}
            domain={['dataMin - 5', 'dataMax + 5']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#colorPrice)"
            dot={(props) => {
              if (props.payload?.isRealTime) {
                return <circle cx={props.cx} cy={props.cy} r={4} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
              }
              return null;
            }}
          />
        </AreaChart>
      );
    }

    return (
      <LineChart {...commonProps}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          }}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value?.toFixed(0)}`}
          domain={['dataMin - 5', 'dataMax + 5']}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke="#3b82f6" 
          strokeWidth={2}
          dot={(props) => {
            if (props.payload?.isRealTime) {
              return <circle cx={props.cx} cy={props.cy} r={4} fill="#ef4444" stroke="#fff" strokeWidth={2} />;
            }
            return false;
          }}
          activeDot={{ r: 6, fill: "#3b82f6" }}
        />
      </LineChart>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Price Chart - {selectedStock}
            {isConnected && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                Live
              </span>
            )}
          </h3>
          
          {/* Current Quote Display */}
          {currentQuote && (
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="font-bold text-lg">
                ${currentQuote.price?.toFixed(2)}
              </span>
              {priceChange && (
                <span className={`font-medium ${priceChange.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {priceChange.changePercent >= 0 ? '+' : ''}
                  {priceChange.change?.toFixed(2)} ({priceChange.changePercent?.toFixed(2)}%)
                </span>
              )}
              {currentQuote.lastUpdate && (
                <span className="text-gray-500 text-xs">
                  Updated: {currentQuote.lastUpdate}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="line">Line Chart</option>
            <option value="area">Area Chart</option>
          </select>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        )}
        
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
        <span>
          {chartData.length > 0 && `${chartData.length} data points`}
        </span>
        <span>
          Real-time updates {isConnected ? 'enabled' : 'disabled'}
        </span>
      </div>
    </div>
  );
};

export default PriceChart;
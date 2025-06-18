import React from 'react';

const PortfolioOverview = ({ portfolioData }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Portfolio Overview</h3>
      <div className="space-y-3">
        {portfolioData.map((stock, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold">{stock.symbol}</p>
              <p className="text-sm text-gray-600">{stock.shares} shares</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${stock.currentPrice}</p>
              <p className={`text-sm ${stock.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stock.change > 0 ? '+' : ''}{stock.change}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PortfolioOverview;
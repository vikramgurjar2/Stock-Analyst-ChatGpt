import React from 'react';
import { Search, Bell } from 'lucide-react';

const Header = ({ 
  user, 
  selectedStock, 
  setSelectedStock, 
  searchQuery, 
  setSearchQuery, 
  notifications 
}) => {
  const stockOptions = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];

  return (
    <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {stockOptions.map(stock => (
            <option key={stock} value={stock}>{stock}</option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Bell className="h-6 w-6 text-gray-600 cursor-pointer" />
          {notifications > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Header;
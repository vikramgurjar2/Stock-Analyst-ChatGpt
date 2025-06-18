import React from 'react';

const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    green: 'text-green-500',
    blue: 'text-blue-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500'
  };

  const valueColorClasses = {
    green: 'text-green-500',
    blue: 'text-blue-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${value.includes('%') || value === 'BUY' || value === 'SELL' ? valueColorClasses[color] : ''}`}>
            {value}
          </p>
        </div>
        <Icon className={`h-8 w-8 ${colorClasses[color]}`} />
      </div>
    </div>
  );
};

export default StatsCard;
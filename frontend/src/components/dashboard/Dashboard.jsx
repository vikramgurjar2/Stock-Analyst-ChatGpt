// src/components/Dashboard/Dashboard.jsx - Updated with API integration
import React, { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import PriceChart from './PriceChart';
import PortfolioOverview from './PortfolioOverview';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { TrendingUp, BarChart, DollarSign, Percent } from 'lucide-react';
import { useStockData } from '../../hooks/useStockData';
import { formatters } from '../../utils/formatters';

const Dashboard = () => {
  const {
    selectedStock,
    stockData,
    portfolioData,
    loading,
    error,
    fetchStockData,
  } = useStockData();

  const [dashboardStats, setDashboardStats] = useState({
    totalValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    totalGain: 0,
  });

  // Calculate dashboard statistics
  useEffect(() => {
    if (portfolioData.length > 0) {
      const totalValue = portfolioData.reduce((sum, stock) => sum + (stock.quantity * stock.currentPrice), 0);
      const totalCost = portfolioData.reduce((sum, stock) => sum + (stock.quantity * stock.averagePrice), 0);
      const totalGain = totalValue - totalCost;
      const dayChange = portfolioData.reduce((sum, stock) => sum + (stock.quantity * stock.dayChange), 0);
      const dayChangePercent = totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

      setDashboardStats({
        totalValue,
        dayChange,
        dayChangePercent,
        totalGain,
      });
    }
  }, [portfolioData]);

  if (error) {
    return <ErrorMessage message={error} onRetry={() => fetchStockData(selectedStock)} />;
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Portfolio Value"
          value={formatters.currency(dashboardStats.totalValue)}
          icon={DollarSign}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Day Change"
          value={formatters.currency(dashboardStats.dayChange)}
          icon={TrendingUp}
          color={dashboardStats.dayChange >= 0 ? "green" : "red"}
          loading={loading}
        />
        <StatsCard
          title="Day Change %"
          value={formatters.percentage(dashboardStats.dayChangePercent / 100)}
          icon={Percent}
          color={dashboardStats.dayChangePercent >= 0 ? "green" : "red"}
          loading={loading}
        />
        <StatsCard
          title="Total Gain/Loss"
          value={formatters.currency(dashboardStats.totalGain)}
          icon={BarChart}
          color={dashboardStats.totalGain >= 0 ? "green" : "red"}
          loading={loading}
        />
      </div>

      {/* Charts and Portfolio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceChart 
          selectedStock={selectedStock} 
          stockData={stockData}
          loading={loading}
        />
        <PortfolioOverview 
          portfolioData={portfolioData}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
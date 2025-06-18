import { useState, useEffect } from 'react';

export const useStockData = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState([]);
  const [portfolioData, setPortfolioData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate stock data
    const mockStockData = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 150 + Math.random() * 20 - 10 + Math.sin(i / 5) * 5,
      volume: Math.floor(Math.random() * 1000000 + 500000)
    }));
    setStockData(mockStockData);

    // Mock portfolio data
    setPortfolioData([
      { symbol: 'AAPL', shares: 100, currentPrice: 165.50, change: 2.5 },
      { symbol: 'GOOGL', shares: 50, currentPrice: 2750.00, change: -1.2 },
      { symbol: 'MSFT', shares: 75, currentPrice: 380.25, change: 0.8 },
    ]);
  }, [selectedStock]);

  return {
    selectedStock,
    setSelectedStock,
    stockData,
    portfolioData,
    searchQuery,
    setSearchQuery
  };
};
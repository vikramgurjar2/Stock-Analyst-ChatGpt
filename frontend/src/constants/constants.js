// Application constants and configurations

export const STOCK_OPTIONS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'];

export const USER_ROLES = {
  ANALYST: 'analyst',
  INVESTOR: 'investor'
};

export const TABS = {
  DASHBOARD: 'dashboard',
  CHAT: 'chat',
  REPORTS: 'reports',
  INVESTORS: 'investors'
};

export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai'
};

export const REPORT_STATUS = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress'
};

export const COLORS = {
  PRIMARY: 'blue',
  SUCCESS: 'green',
  WARNING: 'yellow',
  DANGER: 'red'
};

// Mock data generators
export const generateMockStockData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    price: 150 + Math.random() * 20 - 10 + Math.sin(i / 5) * 5,
    volume: Math.floor(Math.random() * 1000000 + 500000)
  }));
};

export const generateMockPortfolioData = () => [
  { symbol: 'AAPL', shares: 100, currentPrice: 165.50, change: 2.5 },
  { symbol: 'GOOGL', shares: 50, currentPrice: 2750.00, change: -1.2 },
  { symbol: 'MSFT', shares: 75, currentPrice: 380.25, change: 0.8 },
];

export const generateMockReports = () => [
  { id: 1, title: 'AAPL Q4 Analysis', date: '2025-06-16', status: REPORT_STATUS.COMPLETED },
  { id: 2, title: 'Tech Sector Review', date: '2025-06-15', status: REPORT_STATUS.PENDING },
  { id: 3, title: 'Portfolio Optimization', date: '2025-06-14', status: REPORT_STATUS.COMPLETED },
];

export const generateMockInvestors = () => [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@email.com', portfolio: 250000 },
  { id: 2, name: 'Mike Chen', email: 'mike@email.com', portfolio: 180000 },
  { id: 3, name: 'Emma Davis', email: 'emma@email.com', portfolio: 320000 },
];
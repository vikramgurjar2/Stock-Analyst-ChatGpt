import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Search, Send, TrendingUp, TrendingDown, Users, FileText, Settings, LogOut, Bell, Download, Eye } from 'lucide-react';

const StockAnalystDashboard = () => {
  const [user, setUser] = useState({ role: 'analyst', name: 'John Analyst' });
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [stockData, setStockData] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);
  const [portfolioData, setPortfolioData] = useState([]);
  const [reports, setReports] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const chatEndRef = useRef(null);

  // Mock data - replace with actual API calls
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

    // Mock reports
    setReports([
      { id: 1, title: 'AAPL Q4 Analysis', date: '2025-06-16', status: 'completed' },
      { id: 2, title: 'Tech Sector Review', date: '2025-06-15', status: 'pending' },
      { id: 3, title: 'Portfolio Optimization', date: '2025-06-14', status: 'completed' },
    ]);

    // Mock investors (for analysts)
    setInvestors([
      { id: 1, name: 'Sarah Johnson', email: 'sarah@email.com', portfolio: 250000 },
      { id: 2, name: 'Mike Chen', email: 'mike@email.com', portfolio: 180000 },
      { id: 3, name: 'Emma Davis', email: 'emma@email.com', portfolio: 320000 },
    ]);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: currentMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: `Based on the current analysis of ${selectedStock}, I recommend a ${Math.random() > 0.5 ? 'BUY' : 'HOLD'} position. The technical indicators show ${Math.random() > 0.5 ? 'bullish' : 'neutral'} momentum with a target price of $${(Math.random() * 20 + 160).toFixed(2)}. Portfolio allocation should be around ${Math.floor(Math.random() * 15 + 5)}% for optimal risk-adjusted returns.`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1500);

    setCurrentMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const Sidebar = () => (
    <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Stock Analyst AI</h2>
        <p className="text-sm text-gray-400">{user.name} - {user.role}</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <TrendingUp className="mr-3 h-5 w-5" />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                activeTab === 'chat' ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <Send className="mr-3 h-5 w-5" />
              AI Chat
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                activeTab === 'reports' ? 'bg-blue-600' : 'hover:bg-gray-800'
              }`}
            >
              <FileText className="mr-3 h-5 w-5" />
              Reports
            </button>
          </li>
          {user.role === 'analyst' && (
            <li>
              <button
                onClick={() => setActiveTab('investors')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeTab === 'investors' ? 'bg-blue-600' : 'hover:bg-gray-800'
                }`}
              >
                <Users className="mr-3 h-5 w-5" />
                Investors
              </button>
            </li>
          )}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center p-3 text-red-400 hover:bg-gray-800 rounded-lg transition-colors">
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );

  const Header = () => (
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
          <option value="AAPL">AAPL</option>
          <option value="GOOGL">GOOGL</option>
          <option value="MSFT">MSFT</option>
          <option value="TSLA">TSLA</option>
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

  const Dashboard = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Price</p>
              <p className="text-2xl font-bold">${stockData.length > 0 ? stockData[stockData.length - 1].price.toFixed(2) : '0.00'}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">24h Change</p>
              <p className="text-2xl font-bold text-green-500">+2.5%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Volume</p>
              <p className="text-2xl font-bold">1.2M</p>
            </div>
            <BarChart className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">AI Recommendation</p>
              <p className="text-2xl font-bold text-green-500">BUY</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Price Chart - {selectedStock}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

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
      </div>
    </div>
  );

  const ChatInterface = () => (
    <div className="p-6 h-full flex flex-col">
      <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">AI Stock Analyst Chat</h3>
          <p className="text-sm text-gray-600">Ask me anything about {selectedStock} or portfolio optimization</p>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-96">
          {chatMessages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about stock analysis, portfolio optimization..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ReportsSection = () => (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Analysis Reports</h3>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Generate New Report
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold">{report.title}</h4>
                  <p className="text-sm text-gray-600">{report.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    report.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                  <button className="p-2 text-gray-600 hover:text-blue-600">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-600 hover:text-blue-600">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const InvestorsSection = () => (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Assigned Investors</h3>
          <p className="text-sm text-gray-600">Manage and review investor portfolios</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {investors.map((investor) => (
              <div key={investor.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => setSelectedInvestor(investor)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{investor.name}</h4>
                    <p className="text-sm text-gray-600">{investor.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${investor.portfolio.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Portfolio Value</p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    View Portfolio
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                    Generate Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <ChatInterface />;
      case 'reports':
        return <ReportsSection />;
      case 'investors':
        return user.role === 'analyst' ? <InvestorsSection /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StockAnalystDashboard;
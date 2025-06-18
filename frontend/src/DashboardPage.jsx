import React, { useState } from 'react';
import { Sidebar, Header } from './components/common';
import { Dashboard } from './components/dashboard';
import { ChatInterface } from './components/chat';
import { ReportsSection } from './components/reports';
import { InvestorsSection } from './components/investors';
import { useStockData, useChat } from './hooks';

const DashboardPage = () => {
  const [user, setUser] = useState({ role: 'analyst', name: 'John Analyst' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);
  
  const {
    selectedStock,
    setSelectedStock,
    stockData,
    portfolioData,
    searchQuery,
    setSearchQuery
  } = useStockData();

    const {
    chatMessages,
    currentMessage,
    setCurrentMessage,
    handleSendMessage,
    handleKeyPress,
    loading,
    error,
    clearError,
    getStockAnalysis,
    clearChat,
    retryLastMessage,
    currentSessionId
  } = useChat(selectedStock);
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard 
          selectedStock={selectedStock} 
          stockData={stockData} 
          portfolioData={portfolioData} 
        />;
      case 'chat':
        return <ChatInterface
        selectedStock={selectedStock}
        chatMessages={chatMessages}
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        loading={loading}
        error={error}
        clearError={clearError}
        getStockAnalysis={getStockAnalysis}
        clearChat={clearChat}
        retryLastMessage={retryLastMessage}
      />;
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
      <Sidebar 
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          user={user}
          selectedStock={selectedStock}
          setSelectedStock={setSelectedStock}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
        />
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
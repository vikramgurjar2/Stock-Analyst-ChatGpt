import React, { useState } from 'react';
import { useEffect } from 'react';
import { Sidebar, Header } from './components/common';
import { Dashboard } from './components/dashboard';
import { ChatInterface } from './components/chat';
import { ReportsSection } from './components/reports';
import { InvestorsSection } from './components/investors';
import { useStockData, useChat } from './hooks';
import { authService } from '../src/services/authService';

const DashboardPage = () => {
  const [user, setUser] = useState({ role: 'analyst', name: 'John Analyst' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [notifications, setNotifications] = useState(3);

  //  window.authService = authService;///temporary making it global
  // authService.getProfile()
  //   .then(response => console.log('Success:', response))
  //   .catch(error => console.log('Error:', error));

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const response = await authService.getProfile();
  //       setUser(response.data.data.user);
  //     } catch (error) {
  //       console.error('Error fetching user:', error);
  //     }
  //   };

  //   fetchUser();
  // }, []);
useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.data.data.user;
      console.log('User data:', userData);
      
      // Add the missing properties that your Sidebar expects
      setUser({
        ...userData,
        role: userData.role || 'analyst', // Use API role or default
        name: `${userData.firstName} ${userData.lastName}` // Create name property
      });
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  fetchUser();
}, []);

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
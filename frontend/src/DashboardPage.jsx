import React, { useState, useEffect } from 'react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when tab changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  }, [activeTab, isMobile]);

  // Fetch user data
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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed' : 'relative'} 
        ${isMobile && !isMobileMenuOpen ? '-translate-x-full' : 'translate-x-0'}
        ${isMobile ? 'z-50' : 'z-10'}
        transition-transform duration-300 ease-in-out
        w-64 md:w-64 lg:w-72
        h-full
      `}>
        <Sidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobile={isMobile}
          closeMobileMenu={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex-shrink-0">
          <Header
            user={user}
            selectedStock={selectedStock}
            setSelectedStock={setSelectedStock}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            notifications={notifications}
            isMobile={isMobile}
            onMobileMenuToggle={handleMobileMenuToggle}
            isMobileMenuOpen={isMobileMenuOpen}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4 lg:p-6">
          <div className="max-w-full">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation (Optional Alternative) */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 md:hidden">
          <div className="flex justify-around py-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="text-xs">Dashboard</span>
            </button>
            
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span className="text-xs">Chat</span>
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeTab === 'reports'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" />
              </svg>
              <span className="text-xs">Reports</span>
            </button>
            
            {user.role === 'analyst' && (
              <button
                onClick={() => setActiveTab('investors')}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  activeTab === 'investors'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                <span className="text-xs">Investors</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;

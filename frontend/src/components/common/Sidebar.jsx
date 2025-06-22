import React from 'react';
import { TrendingUp, Send, FileText, Users, LogOut } from 'lucide-react';
import { authService } from '../../services/authService';

//i want fetch user data from authService and display it in sidebar
const Sidebar = ({ user, activeTab, setActiveTab }) => {
  const handleLogout = async () => {
    try {
      // Call the logout function from authService
      await authService.logout();
      
      // Redirect to login page after successful logout
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Even if logout service fails, redirect to login
      // The authService.logout() should handle clearing storage
      window.location.href = '/login';
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'chat', label: 'AI Chat', icon: Send },
    { id: 'reports', label: 'Reports', icon: FileText },
    ...(user.role === 'analyst' ? [{ id: 'investors', label: 'Investors', icon: Users }] : [])
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Stock Analyst AI</h2>
        <p className="text-sm text-gray-400">{user.firstName} - {user.role}</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === item.id ? 'bg-blue-600' : 'hover:bg-gray-800'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center p-3 text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
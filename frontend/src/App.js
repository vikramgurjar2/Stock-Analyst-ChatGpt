// filepath: src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
//import StockAnalystDashboard from './pages/StockAnalystDashboard';
import DashboardPage from './DashboardPage';
import './App.css'; 

function App() {
  return (
    <AuthProvider>  
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* <Route path="/dashboard" element={<StockAnalystDashboard />} /> */}
            <Route path="/dashboard" element={<DashboardPage />} />
            
            
            

          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
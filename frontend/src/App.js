import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import './App.css'; 
//import Dashboard from './components/Dashboard';
//import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
  //  <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
           {/* <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            /> */}
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </Router>
   // </AuthProvider>
  );
}

export default App;
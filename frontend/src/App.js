// filepath: src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/auth/Login';
import './App.css'; 

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
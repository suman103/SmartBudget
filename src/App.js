import React, { useState } from 'react';
import './App.css';
import { UserProvider } from './context/UserContext';
import Home from './component/home';
import Login from './component/auth/Login';
import Register from './component/auth/Register';
import TransactionAPP from './component/TransactionAPP';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  const handleLoginSuccess = () => {
    setCurrentPage('transactions');
  };

  const handleRegister = () => {
    setCurrentPage('login');
  };

  const handleLogout = () => {
    setCurrentPage('home');
  };

  return (
    <UserProvider>
      <div className="App">
        {currentPage === 'home' && (
          <Home onNavigate={handleNavigate} />
        )}
        
        {currentPage === 'login' && (
          <Login 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => handleNavigate('register')}
          />
        )}
        
        {currentPage === 'register' && (
          <Register 
            onRegister={handleRegister}
            onSwitchToLogin={() => handleNavigate('login')}
          />
        )}
        
        {currentPage === 'transactions' && (
          <TransactionAPP onLogout={handleLogout} />
        )}
      </div>
    </UserProvider>
  );
}

export default App;
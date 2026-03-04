import React from 'react';
import { ShoppingCart } from 'lucide-react';

const home = ({ onNavigate }) => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{
        backgroundImage: 'url(/image/logo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: '#f0f0f0'
      }}
    >
      <div className="w-full max-w-6xl text-center">
        
        {/* Shopping Cart Icon */}
        <div className="flex justify-center mb-16">
          <div className="bg-white bg-opacity-90 rounded-full w-48 h-48 flex items-center justify-center shadow-2xl backdrop-blur-sm">
            <ShoppingCart size={100} className="text-gray-900" strokeWidth={1.5} />
          </div>
        </div>

       {/* Welcome Text */}
<div className="bg-white bg-opacity-85 rounded-2xl p-6 mb-10 shadow-xl backdrop-blur-sm inline-block">
  <h1 className="text-4xl font-bold text-gray-900 leading-tight">
    Welcome to<br />SmartBudget
  </h1>
</div>
        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-6 justify-center items-center">
          <button
            onClick={() => onNavigate('login')}
            className="login-button"
            style={{ width: '250px', height: '50px' }}
          >
            Login 
          </button>
          <button
            onClick={() => onNavigate('register')}
            className="register-button"
            style={{ width: '250px', height: '50px' }}
          >
            Register
          </button>
        </div>

      </div>
    </div>
  );
};

export default home;
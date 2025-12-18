import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', disabled = false, ...props }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-semibold transition duration-200 
                  ${disabled ? 'opacity-50 cursor-not-allowed' : ''} 
                  ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
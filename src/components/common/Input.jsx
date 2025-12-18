import React from 'react';

const Input = ({ label, id, type = 'text', value, onChange, className = '', required = false, disabled = false, placeholder, error, ...props }) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        name={props.name || id}
        type={type}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                    ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'} 
                    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} 
                    ${className}`}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
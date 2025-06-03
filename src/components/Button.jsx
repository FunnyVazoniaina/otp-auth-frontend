import React from 'react';

export default function Button({ children, type = 'button', onClick, className = '', disabled = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-2 px-4 rounded font-medium text-white transition duration-200 
        ${disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} 
        ${className}`}
    >
      {children}
    </button>
  );
}

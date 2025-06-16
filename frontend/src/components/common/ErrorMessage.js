// src/components/common/ErrorMessage.js
import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-message">
      <span>{message}</span>
      {onClose && (
        <button 
          onClick={onClose}
          style={{
            float: 'right',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#721c24'
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
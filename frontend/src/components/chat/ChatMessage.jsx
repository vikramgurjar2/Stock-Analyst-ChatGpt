import React from 'react';

const ChatMessage = ({ message }) => {
  return (
    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        message.sender === 'user' 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        <p className="text-sm">{message.text}</p>
        <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
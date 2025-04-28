import React from 'react';
import './ChatBackground.css';

const ChatBackground = ({ children, backgroundImage }) => {
  return (
    <div className="chat-background-container">
      <div 
        className="chat-background" 
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      <div className="chat-interface-wrapper">
        {children}
      </div>
    </div>
  );
};

export default ChatBackground;
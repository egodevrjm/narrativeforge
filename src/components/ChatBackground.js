import React from 'react';
import './ChatBackground.css';

const ChatBackground = ({ children, backgroundImage }) => {
  const backgroundStyle = {
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
  };

  return (
    <div className="chat-background" style={backgroundStyle}>
      <div className="chat-content-overlay">
        {children}
      </div>
    </div>
  );
};

export default ChatBackground;
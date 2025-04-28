import React from 'react';
import './MobilePhoneUI.css';

const MobilePhoneUI = ({ messages, onSendMessage }) => {
  // Use current time for the status bar display
  // const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  // TODO: Implement status bar with currentTime when adding that UI element
  
  // Handle sending a message from the phone UI
  const handlePhoneInput = () => {
    if (onSendMessage) {
      onSendMessage('What do you do?');
    }
  };
  
  // Format messages based on type
  const renderContent = (message) => {
    if (message.type === 'system' && message.content.includes('Day')) {
      // Day marker
      return <div className="day-marker">{message.content}</div>;
    }
    
    if (message.type === 'social') {
      // Check if it's a social media feed
      if (message.content && typeof message.content === 'string' && 
        (message.content.includes('TikTok') || message.content.includes('Instagram') || message.content.includes('YouTube'))) {
        return renderSocialFeed(message);
      }
      
      // Check if it's a direct message
      if (message.content && typeof message.content === 'string' && 
          (message.content.includes('DM') || message.content.includes('Message Requests'))) {
        return renderDirectMessages(message);
      }
      
      // Default social content
      return renderNotification(message);
    }
    
    // Regular messages
    return <div className="notification-item">
      <div className="notification-content">
        <div className="notification-message">{formatMessageContent(message.content)}</div>
        <div className="notification-time">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>;
  };
  
  // Format message content with emojis and styling
  const formatMessageContent = (content) => {
    if (!content) return '';
    // Ensure content is a string
    if (typeof content !== 'string') return '';
    
    // Normalize different line break styles
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Handle line breaks and paragraphs
    const paragraphs = normalizedContent.split(/\n\s*\n/);
    
    // If it's just one long paragraph, try to break it at sentence boundaries
    if (paragraphs.length === 1 && paragraphs[0].length > 200) {
      const sentences = paragraphs[0].split(/(?<=\.)\s+/);
      // Group sentences into reasonable paragraphs
      const groupedParagraphs = [];
      let currentParagraph = '';
      sentences.forEach(sentence => {
        if (currentParagraph.length + sentence.length > 200) {
          groupedParagraphs.push(currentParagraph);
          currentParagraph = sentence;
        } else {
          currentParagraph += (currentParagraph ? ' ' : '') + sentence;
        }
      });
      if (currentParagraph) {
        groupedParagraphs.push(currentParagraph);
      }
      
      return groupedParagraphs.map((para, i) => {
        // Replace references to social media with emoji icons
        const formattedPara = para
          .replace(/TikTok/g, '🎵 TikTok')
          .replace(/Instagram/g, '📱 Instagram')
          .replace(/YouTube/g, '▶️ YouTube')
          .replace(/Twitter/g, '🐦 Twitter')
          .replace(/@([a-zA-Z0-9_]+)/g, '<span class="handle">@$1</span>')
          .replace(/"([^"]+)"/g, '<em>"$1"</em>')
          .replace(/\bviral\b/gi, '<span class="highlight">viral</span>')
          .replace(/\blikes\b/gi, 'likes ❤️')
          .replace(/\bshares\b/gi, 'shares 🔄')
          .replace(/\bfollowers\b/gi, 'followers 👥');
        
        // Replace single line breaks with <br>
        const withLineBreaks = formattedPara.replace(/\n/g, '<br />');
        
        return <p key={i} dangerouslySetInnerHTML={{ __html: withLineBreaks }} />;
      });
    }
    
    return paragraphs.map((para, i) => {
      // Replace references to social media with emoji icons
      const formattedPara = para
        .replace(/TikTok/g, '🎵 TikTok')
        .replace(/Instagram/g, '📱 Instagram')
        .replace(/YouTube/g, '▶️ YouTube')
        .replace(/Twitter/g, '🐦 Twitter')
        .replace(/@([a-zA-Z0-9_]+)/g, '<span class="handle">@$1</span>')
        .replace(/"([^"]+)"/g, '<em>"$1"</em>')
        .replace(/\bviral\b/gi, '<span class="highlight">viral</span>')
        .replace(/\blikes\b/gi, 'likes ❤️')
        .replace(/\bshares\b/gi, 'shares 🔄')
        .replace(/\bfollowers\b/gi, 'followers 👥');
      
      // Replace single line breaks with <br>
      const withLineBreaks = formattedPara.replace(/\n/g, '<br />');
      
      return <p key={i} dangerouslySetInnerHTML={{ __html: withLineBreaks }} />;
    });
  };
  
  // Render social media feed format
  const renderSocialFeed = (message) => {
    return (
      <div className="social-feed-item">
        <div className="social-header">
          <div className="profile-image">B</div>
          <div className="profile-info">
            <div className="profile-name">@blackberrysoul</div>
            <div className="post-time">Just now</div>
          </div>
        </div>
        <div className="social-content">
          {formatMessageContent(message.content)}
        </div>
        <div className="social-footer">
          <div className="social-stat">
            <span className="social-stat-icon">❤️</span>
            <span>2.4K</span>
          </div>
          <div className="social-stat">
            <span className="social-stat-icon">💬</span>
            <span>186</span>
          </div>
          <div className="social-stat">
            <span className="social-stat-icon">🔄</span>
            <span>752</span>
          </div>
        </div>
      </div>
    );
  };
  
  // Render direct messages format
  const renderDirectMessages = (message) => {
    // Check if we need to render a list of DM requests
    if (message.content && typeof message.content === 'string' && message.content.includes('Message Requests:')) {
      return renderMessageRequests(message);
    }
    
    return (
      <div className="dm-conversation">
        <div className="dm-header">
          <div className="dm-profile">N</div>
          <div className="dm-name">Nashville Records</div>
        </div>
        <div className="dm-body">
          <div className="dm-bubble received">
            Your music is unlike anything we've heard. We want to talk.
          </div>
          <div className="notification-time">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    );
  };
  
  // Render notification style
  const renderNotification = (message) => {
    let iconText = '📳';
    let appName = 'Notification';
    
    // Ensure message.content is a string
    if (message.content && typeof message.content === 'string') {
      if (message.content.includes('TikTok')) {
        iconText = '🎵';
        appName = 'TikTok';
      } else if (message.content.includes('Instagram')) {
        iconText = '📱';
        appName = 'Instagram';
      } else if (message.content.includes('YouTube')) {
        iconText = '▶️';
        appName = 'YouTube';
      } else if (message.content.includes('Twitter')) {
        iconText = '🐦';
        appName = 'Twitter';
      }
    }
    
    return (
      <div className="notification-item">
        <div className="notification-icon">{iconText}</div>
        <div className="notification-content">
          <div className="notification-app">{appName}</div>
          <div className="notification-message">{formatMessageContent(message.content)}</div>
          <div className="notification-time">{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    );
  };
  
  // Render message requests
  const renderMessageRequests = (message) => {
    // First split the content into sections
    // Ensure message.content is a string
    if (!message || !message.content || typeof message.content !== 'string') {
      return <div>Invalid message content</div>;
    }
    const requestPattern = /([^•]+)(?=•|$)/g;
    const requests = message.content.match(requestPattern) || [];
    
    const items = requests.map((request, index) => {
      const lines = request.trim().split('\n');
      const username = lines[0]?.replace('Instagram Message Requests:', '').trim();
      
      if (!username) return null;
      
      const messageContent = lines.slice(1).join(' ').trim();
      
      return (
        <div key={index} className="notification-item">
          <div className="notification-icon">📱</div>
          <div className="notification-content">
            <div className="notification-app">Instagram DM Request</div>
            <div className="notification-message">
              <strong>{username}</strong>: {messageContent}
            </div>
            <div className="notification-time">Just now</div>
          </div>
        </div>
      );
    }).filter(Boolean);
    
    return <div className="message-requests">{items}</div>;
  };
  
  return (
    <div className="mobile-simulation">
      <div className="phone-simulation-header">
        <h3>Phone View</h3>
        <p>You are viewing your phone's notifications</p>
      </div>
      
      <div className="app-screen">
        {messages.map(message => (
          <div key={message.id}>
            {renderContent(message)}
          </div>
        ))}
      </div>
      
      <div className="phone-input-area">
        <div className="phone-input-field" onClick={handlePhoneInput}>
          What do you do?
        </div>
      </div>
      
      <div className="phone-bottom-bar"></div>
    </div>
  );
};

export default MobilePhoneUI;
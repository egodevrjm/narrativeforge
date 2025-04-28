import React from 'react';

/**
 * Component for rendering social media messages in a platform-specific format
 * 
 * @param {Object} props - Component props
 * @param {string} props.content - The social media content to render
 * @returns {JSX.Element} - Rendered social media message
 */
const SocialMediaMessage = ({ content }) => {
  if (!content || typeof content !== 'string') {
    return <div className="social-media-content">Invalid content</div>;
  }
  
  // Split the content by triple line breaks to ensure strong separation between platforms
  const sections = content.split(/\n\s*\n\s*\n/);
  
  // Platform-specific styling information
  const platformStyles = {
    'Instagram': {
      className: 'instagram-notification',
      icon: '📱',
      color: '#C13584'
    },
    'TikTok': {
      className: 'tiktok-notification',
      icon: '🎵',
      color: '#25F4EE'
    },
    'YouTube': {
      className: 'youtube-notification',
      icon: '▶️',
      color: '#FF0000'
    },
    'Twitter': {
      className: 'twitter-notification',
      icon: '🐦',
      color: '#1DA1F2'
    },
    'Snapchat': {
      className: 'snapchat-notification',
      icon: '👻',
      color: '#FFFC00'
    }
  };
  
  // Process each section and determine if it has a platform marker
  const platformSections = [];
  
  sections.forEach((section, index) => {
    const platformMatch = section.match(/\[PLATFORM:(\w+)\]/);
    const platform = platformMatch ? platformMatch[1] : null;
    
    // Remove platform marker from content
    let sectionContent = platformMatch ? 
      section.replace(/\[PLATFORM:\w+\]\s*[\ud83d\udcf1\ud83c\udfb5\u25b6\ufe0f\ud83d\udc26\ud83d\udc7b]?\s*\w+\s*/, '') :
      section;
    
    // Split the remaining content into paragraphs for better formatting
    const paragraphs = sectionContent.split(/\n\n+/).filter(para => para.trim() !== '');
    
    // For each paragraph, split into lines
    const formattedContent = [];
    
    paragraphs.forEach((paragraph, pIndex) => {
      // Split paragraph into lines
      const lines = paragraph.split(/\n/).filter(line => line.trim() !== '');
      
      // Format each line
      const formattedLines = lines.map(line => formatLine(line));
      
      // Add lines to content
      formattedContent.push(
        <div key={`para-${index}-${pIndex}`} className="notification-paragraph">
          {formattedLines.map((line, lIndex) => (
            <div key={`line-${index}-${pIndex}-${lIndex}`} className="notification-line">
              <span dangerouslySetInnerHTML={{ __html: line }} />
            </div>
          ))}
        </div>
      );
    });
    
    // Get the styling for this platform
    const style = platform && platformStyles[platform] ? platformStyles[platform] : {
      className: 'generic-notification',
      icon: '📱',
      color: '#808080'
    };
    
    // Create platform section
    platformSections.push(
      <div 
        key={`platform-${index}`} 
        className={`platform-section ${platform ? style.className : 'generic-notification'}`}
        style={platform ? { borderLeftColor: style.color } : {}}
      >
        {platform && (
          <div className="platform-header">
            <span className="platform-icon">{style.icon}</span>
            <span className="platform-name">{platform}</span>
          </div>
        )}
        <div className="platform-content">
          {formattedContent}
        </div>
      </div>
    );
  });
  
  return <div className="social-media-content">{platformSections}</div>;
};

/**
 * Format a line of content with HTML styling
 * 
 * @param {string} line - The line to format
 * @returns {string} - HTML formatted line
 */
function formatLine(line) {
  if (!line || typeof line !== 'string') return '';
  
  return line
    // Format handles with styling
    .replace(/@([a-zA-Z0-9_]+)/g, '<span class="handle">@$1</span>')
    // Format quotes
    .replace(/"([^"]+)"/g, '<span class="quote">"$1"</span>')
    // Format keywords
    .replace(/\b(viral|trending|followers|views|likes|comments|shares)\b/gi, '<span class="highlight">$1</span>')
    // Preserve existing HTML markup
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export default SocialMediaMessage;

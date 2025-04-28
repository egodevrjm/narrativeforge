import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Settings, Music, BookOpen, ScrollText, MessageSquare, MousePointer, Brain, Phone } from 'lucide-react';
import RoleplayInstructions from './RoleplayInstructions';
import MobilePhoneUI from './MobilePhoneUI';
import SocialMediaMessage from './SocialMediaMessage';
import { preprocessAIMessage, formatSocialMediaContent, detectMessageType } from '../utils/textFormatUtils';
import './error-message.css';

const ChatInterface = ({ character, scenario, onSaveChat, geminiService, onReset }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messageType, setMessageType] = useState('dialogue'); // dialogue, action, thought
  const [isPhoneMode, setIsPhoneMode] = useState(false); // State to track if we're in phone mode
  const [showInstructionsEditor, setShowInstructionsEditor] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showMusicPanel, setShowMusicPanel] = useState(false);
  const [showScenarioInfo, setShowScenarioInfo] = useState(false);
  const [roleplayInstructions, setRoleplayInstructions] = useState(scenario?.roleplayInstructions || '');
  const [autoDetectMessageType, setAutoDetectMessageType] = useState(true); // New state for auto-detection toggle
  const messagesEndRef = useRef(null);
  
  // Watch for input changes to detect message type in real-time
  const updateDetectedMessageType = useCallback((text) => {
    if (autoDetectMessageType && text) {
      const detectedType = detectMessageType(text);
      setMessageType(detectedType);
    }
  }, [autoDetectMessageType]);

  // Update detected message type when input changes
  useEffect(() => {
    updateDetectedMessageType(inputValue);
  }, [inputValue, updateDetectedMessageType]);

  // When scenario changes, update the roleplay instructions
  useEffect(() => {
    if (scenario && scenario.roleplayInstructions) {
      setRoleplayInstructions(scenario.roleplayInstructions);
    }
  }, [scenario]);
  
  // Get AI response
  const handleAiResponse = useCallback(async (userMessage, messageType) => {
    setIsTyping(true);
    
    try {
      let responseContent;
      
      // If we have a Gemini service, use it
      if (geminiService) {
        // For the first message, include roleplay instructions if they exist
        if (!userMessage && roleplayInstructions) {
          console.log('Generating initial AI response with roleplay instructions');
          
          // Make sure the geminiService is initialized
          if (!geminiService.characterProfile && character && scenario) {
            console.log('Initializing geminiService with character and scenario');
            geminiService.initialize(character, scenario);
          }
          
          // Add it to the context for the AI but don't show it in chat
          const initPrompt = `Initial scene: ${scenario?.initialSituation}\n\nRoleplay instructions:\n${roleplayInstructions}\n\nPlease respond with an opening for this scene, following the roleplay instructions but without mentioning them directly. Make sure to use proper paragraph breaks and spacing for better readability.`;
          console.log('Sending initial prompt');
          responseContent = await geminiService.generateGeneric(initPrompt);
          
          // Preprocess the response for better formatting
          responseContent = preprocessAIMessage(responseContent);
        } else {
          responseContent = await geminiService.generateResponse(userMessage, messageType);
          
          // Preprocess the response for better formatting
          responseContent = preprocessAIMessage(responseContent);
          
          // Additional formatting for social media content
          if (messageType === 'social' || responseContent.includes('@') || 
              responseContent.includes('Instagram') || responseContent.includes('TikTok')) {
            responseContent = formatSocialMediaContent(responseContent);
          }
        }
      } else {
        // Fallback for development
        await new Promise(resolve => setTimeout(resolve, 1500));
        responseContent = "This is a placeholder response. In the full implementation, this would be a response from Google's Gemini LLM, responding appropriately to your character's situation.";
      }
      
      // Check if the AI response is implying phone interaction
      const lowerResponse = responseContent.toLowerCase();
      if (lowerResponse.includes('on your phone') || 
          lowerResponse.includes('your phone shows') || 
          lowerResponse.includes('on the screen of your phone')) {
        // Activate phone mode if AI refers to phone content
        setIsPhoneMode(true);
      }
      
      // Detect if this should be a social media response
      let responseType = 'dialogue';
      if (messageType === 'social' || 
          (responseContent && (responseContent.includes('@') || 
                             responseContent.includes('Instagram') || 
                             responseContent.includes('TikTok') || 
                             responseContent.includes('followers')))) {
        responseType = 'social';
      } else if (messageType === 'action') {
        responseType = 'action';
      } else if (messageType === 'thought') {
        responseType = 'thought';
      }
      
      const aiMessage = {
        id: Date.now(),
        sender: 'ai',
        type: responseType,
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Create a more informative error message
      let errorMessage = 'There was an error getting a response. Please try again.';
      
      // Extract more specific error information if available
      if (error.message) {
        if (error.message.includes('401')) {
          errorMessage = 'API Authentication Error: Your API key may be invalid or expired. Please check your settings.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Access Denied: Your API key may not have access to the required model or you have exceeded your quota.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Model Not Found: The specified AI model could not be found. Please check the model configuration.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate Limit Exceeded: Too many requests. Please wait a moment and try again later.';
        } else if (error.message.includes('safety')) {
          errorMessage = 'Content filtered: The AI detected potentially sensitive content and could not respond.';
        }
      }
      
      // Add error message
      const errorMessageObj = {
        id: Date.now(),
        sender: 'system',
        type: 'error',
        content: errorMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsTyping(false);
    }
  }, [geminiService, roleplayInstructions, scenario, character]);

  // Initial system message when the scenario begins
  useEffect(() => {
    if (scenario && !messages.length) {
      // Create day header
      const dayHeader = {
        id: Date.now() - 2,
        type: 'system',
        content: 'Day 1, Late-night',
        timestamp: new Date()
      };
      
      // Create initial narrative message describing the scenario
      const formattedContent = scenario.initialSituation
        .replace(/TikTok/g, '🎵 TikTok')
        .replace(/Instagram/g, '📱 Instagram')
        .replace(/YouTube/g, '▶️ YouTube')
        .replace(/Twitter/g, '🐦 Twitter')
        .replace(/@([\w]+)/g, '@$1')
        .replace(/girlfriend/g, 'girlfriend 💔')
        .replace(/video call/g, 'video call 📱')
        .replace(/guitar/g, 'guitar 🎸')
        .replace(/notifications/g, 'notifications 🔔');
      
      const initialMessage = {
        id: Date.now() - 1,
        type: 'social',
        content: formattedContent,
        timestamp: new Date()
      };
      
      // Set messages first
      setMessages([dayHeader, initialMessage]);
      
      // If there are roleplay instructions, set them but DON'T add them as a visible message
      if (scenario.roleplayInstructions) {
        setRoleplayInstructions(scenario.roleplayInstructions);
      }
      
      // Add a small delay before triggering the AI response to ensure state updates are complete
      setTimeout(() => {
        // Here's the critical fix - ensuring we only make this call when geminiService is ready
        if (geminiService) {
          console.log('Triggering initial AI response...');
          handleAiResponse();
        } else {
          console.log('GeminiService not ready, skipping initial AI response');
        }
      }, 500);
    }
  }, [scenario, messages.length, geminiService, handleAiResponse]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save roleplay instructions
  const saveRoleplayInstructions = (instructions) => {
    setRoleplayInstructions(instructions);
    setShowInstructionsEditor(false);
    
    // Don't add to visible messages, but update the AI context
    if (geminiService) {
      geminiService.updateInstructions(instructions);
    }
  };

  // Cancel editing instructions
  const cancelEditInstructions = () => {
    setShowInstructionsEditor(false);
  };

  // Send user message
  const handleSendMessage = (customText) => {
    console.log('handleSendMessage called with:', customText || inputValue);
    // Use either the custom text or the inputValue
    const messageText = customText || inputValue;
    
    // Check that we have a valid string to work with
    if (!messageText) {
      console.log('Empty message, returning');
      return;
    }
    
    // Ensure messageText is a string before calling trim
    if (typeof messageText === 'string') {
      if (!messageText.trim()) {
        console.log('Message contains only whitespace, returning');
        return;
      }
      
      console.log('Processing valid message:', messageText);
      
      // Check for phone mode commands
      // Ensure messageText is a string before calling toLowerCase
      const lowerText = messageText.toLowerCase();
      if (lowerText.includes('check my phone') || lowerText.includes('look at my phone') || 
          lowerText.includes('check phone') || lowerText.includes('use my phone')) {
        setIsPhoneMode(true);
      } else if (lowerText.includes('put phone away') || lowerText.includes('stop using phone') || 
                 lowerText.includes('put away phone') || lowerText.includes('exit phone')) {
        setIsPhoneMode(false);
      }
      
      // Detect message type based on content and chosen type
      let detectedType = messageType;
      
      // If auto-detection is enabled, determine type from content
      if (autoDetectMessageType) {
        detectedType = detectMessageType(messageText);
      }
      
      // Add day header if this is the first message in a while
      const now = new Date();
      if (messages.length > 0) {
        const lastMessageTime = messages[messages.length - 1].timestamp;
        // If more than 3 hours since last message, add a timestamp header
        if ((now - lastMessageTime) / (1000 * 60 * 60) > 3) {
          const dayHeader = {
            id: Date.now() - 1, // Ensure unique ID
            type: 'system',
            content: getDayHeaderText(now),
            timestamp: now
          };
          setMessages(prev => [...prev, dayHeader]);
        }
      }
      
      // Create user message object
      const userMessage = {
        id: Date.now(),
        sender: 'user',
        type: detectedType,
        content: messageText,
        timestamp: now
      };
      
      console.log('Adding user message to chat:', userMessage);
      
      // Add message to chat
      setMessages(prev => [...prev, userMessage]);
      
      // Clear input field
      setInputValue('');
      
      // Process with AI
      handleAiResponse(userMessage.content, userMessage.type);
    } else {
      // Handle case where messageText is not a string
      console.error('messageText is not a string:', messageText);
    }
  };
  
  // Helper function to get appropriate day header text
  const getDayHeaderText = (date) => {
    const hours = date.getHours();
    let timeOfDay = '';
    
    if (hours >= 5 && hours < 12) {
      timeOfDay = 'Morning';
    } else if (hours >= 12 && hours < 17) {
      timeOfDay = 'Afternoon';
    } else if (hours >= 17 && hours < 22) {
      timeOfDay = 'Evening';
    } else {
      timeOfDay = 'Late-night';
    }
    
    return `Day ${Math.floor(Math.random() * 5 + 1)}, ${timeOfDay}`;
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message based on type
  const formatText = (text) => {
    if (!text) return '';
    if (typeof text !== 'string') return '';
    
    // Ensure proper paragraph spacing by normalizing all line breaks
    // First, normalize different line break styles
    let normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remove markdown bold formatting
    normalizedText = normalizedText.replace(/\*\*([^*]+)\*\*/g, '$1');
    
    // Enhance line break separation for social media platform headers
    normalizedText = normalizedText
      .replace(/(📱 Instagram|🎵 TikTok|▶️ YouTube|🐦 Twitter|👻 Snapchat)/g, '\n$1')  
      .replace(/\n\n(📱 Instagram|🎵 TikTok|▶️ YouTube|🐦 Twitter|👻 Snapchat)/g, '\n\n\n$1');
    
    // Format social media messages with proper styling
    if (normalizedText.includes('@') || normalizedText.includes('#') || normalizedText.includes('Instagram') || normalizedText.includes('TikTok')) {
      // Add emoji and styling to social media content
      const formattedText = normalizedText
        .replace(/Instagram/g, '📱 Instagram')
        .replace(/TikTok/g, '🎵 TikTok')
        .replace(/YouTube/g, '▶️ YouTube')
        .replace(/Twitter/g, '🐦 Twitter')
        .replace(/direct message/gi, 'DM 💬')
        .replace(/@([\w]+)/g, '<span class="handle">@$1</span>')
        .replace(/"([^"]+)"/g, '<span class="quote">"$1"</span>')
        .replace(/\bviral\b/g, '<span class="highlight">viral</span>')
        .replace(/\bfollowers\b/g, 'followers 👥')
        .replace(/\blikes\b/g, 'likes ❤️')
        .replace(/\bcomments\b/g, 'comments 💬')
        .replace(/\bshares\b/g, 'shares 🔄');
          
      // Make sure we have proper paragraph breaks
      // Split by double newlines (paragraphs) or ensure line breaks in longer text
      const paragraphs = formattedText.split(/\n\s*\n/);
      if (paragraphs.length === 1 && paragraphs[0].length > 200) {
        // Long single paragraph - try to break it at sentence boundaries
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
          const processedPara = para.replace(/\n/g, '<br />');
          return <p key={i} dangerouslySetInnerHTML={{ __html: processedPara }} />;
        });
      }
      
      return paragraphs.map((para, i) => {
        const processedPara = para.replace(/\n/g, '<br />');
        return <p key={i} dangerouslySetInnerHTML={{ __html: processedPara }} />;
      });
    }
    
    // For message lists like the Instagram DM requests
    if (normalizedText.includes('Instagram Message Requests:')) {
      const sections = normalizedText.split(/\n\s*\n/);
      
      return sections.map((section, i) => {
        if (section.includes('•')) {
          // This is a list section
          const listItems = section.split('•').filter(item => item.trim());
          return (
            <div key={i} className="message-list">
              {listItems.map((item, j) => {
                // Check if this contains a username and message
                const parts = item.split(/\n/);
                if (parts.length > 1) {
                  const username = parts[0].trim();
                  const messageText = parts.slice(1).join('\n').trim();
                  
                  return (
                    <div key={j} className="dm-message">
                      <div className="dm-username">{username}</div>
                      <div className="dm-content"><em>"{messageText}"</em></div>
                    </div>
                  );
                } else {
                  return <p key={j}>{item.trim()}</p>;
                }
              })}
            </div>
          );
        } else {
          // Regular paragraph
          return <p key={i}>{section}</p>;
        }
      });
    }
    
    // Regular content - split by paragraphs
    // First check if we need to add paragraph breaks to a long single paragraph
    const paragraphs = normalizedText.split(/\n\s*\n/);
    
    if (paragraphs.length === 1 && paragraphs[0].length > 200) {
      // Long single paragraph - try to break it at sentence boundaries
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
        // Replace single newlines with <br>
        const formattedPara = para.replace(/\n/g, '<br />');
        return <p key={i} dangerouslySetInnerHTML={{ __html: formattedPara }} />;
      });
    }
    
    return paragraphs.map((para, i) => {
      // Replace single newlines with <br>
      const formattedPara = para.replace(/\n/g, '<br />');
      return <p key={i} dangerouslySetInnerHTML={{ __html: formattedPara }} />;
    });
  };
    
  // Format message based on type
  const formatMessage = (message) => {
    // Create a timestamp element
    const timestamp = (
      <span className="timestamp">
        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    );
    
    switch (message.type) {
      case 'system':
        // For system messages like day headers
        if (message.content.startsWith('Day ') || message.content.includes('Late-night')) {
          return (
            <div className="day-header">
              <div className="day-marker">{message.content}</div>
            </div>
          );
        }
        return <div className="system-message">{formatText(message.content)}</div>;
        
      case 'error':
        return <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-content">{message.content}</div>
        </div>;
        
      case 'social':
        // Use our specialized social media component for better notification display
        return (
          <div className={`social-message ${message.sender}`}>
            <SocialMediaMessage content={message.content} />
            {timestamp}
          </div>
        );
        
      case 'dialogue':
        return (
          <div className={`dialogue-message ${message.sender}`}>
            {formatText(message.content)}
            {timestamp}
          </div>
        );
        
      case 'action':
        return (
          <div className={`action-message ${message.sender}`}>
            {formatText(message.content)}
            {timestamp}
          </div>
        );
        
      case 'thought':
        return (
          <div className={`thought-message ${message.sender}`}>
            {formatText(message.content)}
            {timestamp}
          </div>
        );
        
      default:
        return (
          <div className={`message ${message.sender}`}>
            {formatText(message.content)}
            {timestamp}
          </div>
        );
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>{scenario?.title || 'Untitled Scenario'}</h2>
        <div className="chat-controls">
          <button 
            className="control-btn reset-chat-btn" 
            onClick={onReset}
            title="Start Over"
          >
            Start Over
          </button>
          <button 
            className="control-btn" 
            onClick={() => setShowInstructionsEditor(true)}
            title="View/Edit Roleplay Instructions"
          >
            <ScrollText size={18} />
          </button>
          <button 
            className="control-btn"
            onClick={() => setShowSettingsPanel(true)}
            title="Roleplay Settings"
          >
            <Settings size={18} />
          </button>
          <button 
            className="control-btn"
            onClick={() => setShowMusicPanel(true)}
            title="Ambient Music"
          >
            <Music size={18} />
          </button>
          <button 
            className="control-btn"
            onClick={() => setShowScenarioInfo(true)}
            title="View Scenario Details"
          >
            <BookOpen size={18} />
          </button>
        </div>
      </div>
      
      <div className="auto-detect-toggle">
        <label className="toggle-label">
          <input 
            type="checkbox" 
            checked={autoDetectMessageType} 
            onChange={() => setAutoDetectMessageType(!autoDetectMessageType)}
          />
          Auto-detect message type based on content
        </label>
      </div>
      
      <div className="type-explainer">
        {autoDetectMessageType ? (
          <p>Automatically detected as: <strong className="detected-type">{messageType}</strong></p>
        ) : (
          <p>Choose a response type: <strong>Dialogue</strong> (speaking), <strong>Action</strong> (doing), <strong>Thought</strong> (thinking), or <strong>Social</strong> (social media)</p>
        )}
      </div>
      
      <div className="messages-container">
        {/* Mobile Phone UI when in phone mode */}
        {isPhoneMode ? (
          <MobilePhoneUI 
            messages={messages} 
            onSendMessage={handleSendMessage}
          />
        ) : (
          /* Regular message display */
          messages.map(message => (
            <div key={message.id} className={`message-wrapper ${message.sender}`}>
              {formatMessage(message)}
              <span className="timestamp">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        
        {isTyping && (
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="message-type-selector" style={{ display: isPhoneMode ? 'none' : 'flex' }}>
        <div className="message-type-help" title="Choose how you want to respond">
          <span className="type-help-text">{autoDetectMessageType ? 'Detected type:' : 'Response type:'}</span>
        </div>
        <button 
          className={`type-btn ${messageType === 'dialogue' ? 'active' : ''}`}
          onClick={() => setMessageType('dialogue')}
          title="What you say out loud to characters"
        >
          <MessageSquare size={16} />
          Dialogue
        </button>
        <button 
          className={`type-btn ${messageType === 'action' ? 'active' : ''}`}
          onClick={() => setMessageType('action')}
          title="Physical actions you take"
        >
          <MousePointer size={16} />
          Action
        </button>
        <button 
          className={`type-btn ${messageType === 'thought' ? 'active' : ''}`}
          onClick={() => setMessageType('thought')}
          title="Your inner thoughts (not heard by others)"
        >
          <Brain size={16} />
          Thought
        </button>
        <button 
          className={`type-btn ${messageType === 'social' ? 'active' : ''}`}
          onClick={() => setMessageType('social')}
          title="Social media posts, DMs, notifications"
        >
          <Phone size={16} />
          Social
        </button>
      </div>
      
      {/* Regular input area - hidden in phone mode */}
      {!isPhoneMode && (
        <form 
          className="input-area"
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Form submitted');
            handleSendMessage(inputValue);
          }}
        >
          <div className="input-wrapper">
            <textarea 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={messageType === 'dialogue' ? 'Type your dialogue...' : 
                          messageType === 'action' ? 'Describe your action...' : 
                          messageType === 'thought' ? 'Share your thoughts...' :
                          'Type social media content, DMs, or notifications...'}
              rows={3}
            />
            <div className="input-helper">
              {inputValue.length > 0 ? 'Press Enter to send or click the button' : 'Type your message'}
            </div>
          </div>
          <button 
            type="submit"
            className="send-btn"
          >
            <Send size={20} />
          </button>
        </form>
      )}
      
      {/* Exit phone mode button - only shown in phone mode */}
      {isPhoneMode && (
        <div className="phone-mode-footer">
          <button className="exit-phone-btn" onClick={() => setIsPhoneMode(false)}>
            Put Phone Away
          </button>
        </div>
      )}

      {/* Roleplay Instructions Modal */}
      {showInstructionsEditor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <RoleplayInstructions 
              instructions={roleplayInstructions}
              onSave={saveRoleplayInstructions}
              onCancel={cancelEditInstructions}
            />
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettingsPanel && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <h3>Roleplay Settings</h3>
              <button className="close-btn" onClick={() => setShowSettingsPanel(false)}>×</button>
            </div>
            <div className="panel-body">
              <div className="settings-section">
                <h4>AI Response Style</h4>
                <div className="setting-control">
                  <label>Temperature:</label>
                  <select>
                    <option value="0.3">More Focused (0.3)</option>
                    <option value="0.7" selected>Balanced (0.7)</option>
                    <option value="1.0">More Creative (1.0)</option>
                  </select>
                </div>
                <p className="setting-description">Lower values make responses more predictable, higher values make them more creative.</p>
              </div>
              
              <div className="settings-section">
                <h4>Message Type Settings</h4>
                <div className="setting-control">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={autoDetectMessageType} 
                      onChange={() => setAutoDetectMessageType(!autoDetectMessageType)}
                    /> 
                    Auto-detect message type
                  </label>
                  <p className="setting-description">When enabled, the system will automatically detect if your message is dialogue, action, thought, or social media content.</p>
                </div>
              </div>
              
              <div className="settings-section">
                <h4>Display Settings</h4>
                <div className="setting-control">
                  <label>
                    <input type="checkbox" /> Dark Mode
                  </label>
                </div>
                <div className="setting-control">
                  <label>
                    <input type="checkbox" checked /> Show Timestamps
                  </label>
                </div>
              </div>
              
              <button className="save-settings-btn">Save Settings</button>
            </div>
          </div>
        </div>
      )}

      {/* Music Panel */}
      {showMusicPanel && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <h3>Ambient Music</h3>
              <button className="close-btn" onClick={() => setShowMusicPanel(false)}>×</button>
            </div>
            <div className="panel-body">
              <p>Choose background music to enhance your roleplay experience:</p>
              
              <div className="music-options">
                <div className="music-option">
                  <h4>Atmospheric</h4>
                  <button className="play-btn">▶️ Gentle Ambient</button>
                  <button className="play-btn">▶️ Dark Ambient</button>
                  <button className="play-btn">▶️ Space</button>
                </div>
                
                <div className="music-option">
                  <h4>Emotional</h4>
                  <button className="play-btn">▶️ Melancholic</button>
                  <button className="play-btn">▶️ Hopeful</button>
                  <button className="play-btn">▶️ Tense</button>
                </div>
                
                <div className="music-option">
                  <h4>Location-based</h4>
                  <button className="play-btn">▶️ Nature Sounds</button>
                  <button className="play-btn">▶️ Urban</button>
                  <button className="play-btn">▶️ Rain & Thunder</button>
                </div>
              </div>
              
              <div className="music-controls">
                <button>Stop Music</button>
                <div className="volume-control">
                  <label>Volume:</label>
                  <input type="range" min="0" max="100" value="70" />
                </div>
              </div>
              
              <p className="music-note">Music feature coming soon! This is a placeholder interface.</p>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Info Panel */}
      {showScenarioInfo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="panel-header">
              <h3>Scenario Details</h3>
              <button className="close-btn" onClick={() => setShowScenarioInfo(false)}>×</button>
            </div>
            <div className="panel-body scenario-info">
              <h4>{scenario?.title || 'Untitled Scenario'}</h4>
              
              <div className="info-section">
                <h5>Setting</h5>
                <p><strong>Location:</strong> {scenario?.setting?.location || 'Not specified'}</p>
                <p><strong>Time:</strong> {scenario?.setting?.time || 'Not specified'}</p>
                <p><strong>Atmosphere:</strong> {scenario?.setting?.atmosphere || 'Not specified'}</p>
              </div>
              
              <div className="info-section">
                <h5>Your Character</h5>
                <p><strong>Name:</strong> {character?.name || 'Unnamed'}</p>
                <p><strong>Age:</strong> {character?.age || 'Not specified'}</p>
              </div>
              
              <div className="info-section">
                <h5>Other Characters</h5>
                {scenario?.otherCharacters?.map((char, index) => (
                  <div key={index} className="other-character">
                    <p><strong>{char.name}</strong> ({char.role})</p>
                    <p>{char.description}</p>
                  </div>
                )) || <p>No other characters specified.</p>}
              </div>
              
              <div className="info-section">
                <h5>Narrative Goals</h5>
                <p>{scenario?.narrativeGoals || 'No specific goals set.'}</p>
              </div>
              
              <div className="info-section">
                <h5>Tone & Themes</h5>
                <p>{scenario?.toneAndThemes || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
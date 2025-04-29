import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ character, scenario, geminiService, onSaveChat, onReset }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [messageType, setMessageType] = useState('dialogue'); // dialogue, action, thought
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize with system message
  useEffect(() => {
    if (character && scenario) {
      setMessages([
        {
          role: 'system',
          content: `Scenario initialized: ${scenario.title}. Character: ${character.name}. Ready to begin roleplay.`,
          timestamp: new Date().toISOString()
        }
      ]);
      
      // Generate initial AI response
      handleAIResponse();
    }
  }, [character, scenario]);

  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAIResponse = async () => {
    if (!geminiService) return;
    
    setIsLoading(true);
    
    try {
      // Let AI know we're starting
      const response = await geminiService.generateResponse("Let's begin the roleplay. Please set the scene based on the initial situation.", "system");
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Error: Could not generate AI response. Please check your API key or try again later.',
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !geminiService) return;
    
    const newMessage = {
      role: 'user',
      content: inputValue,
      type: messageType,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await geminiService.generateResponse(inputValue, messageType);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Error: Could not generate AI response. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="character-info">
          <h2>{character?.name || 'Unnamed Character'}</h2>
          <p className="scenario-title">{scenario?.title || 'Untitled Scenario'}</p>
        </div>
        <div className="chat-controls">
          <button className="save-btn" onClick={() => onSaveChat(messages)}>
            Save Chat
          </button>
          <button className="reset-btn" onClick={onReset}>
            Start Over
          </button>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role === 'user' ? 'user-message' : message.role === 'assistant' ? 'ai-message' : 'system-message'} ${message.error ? 'error-message' : ''}`}
          >
            {message.role === 'user' && (
              <div className="message-type-tag">
                {message.type === 'dialogue' ? 'Dialogue' : 
                message.type === 'action' ? 'Action' : 
                message.type === 'thought' ? 'Thought' : 'Message'}
              </div>
            )}
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        
        {isLoading && (
          <div className="loading-indicator">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input">
        <div className="message-type-selector">
          <button 
            className={`type-btn ${messageType === 'dialogue' ? 'active' : ''}`}
            onClick={() => setMessageType('dialogue')}
          >
            Dialogue
          </button>
          <button 
            className={`type-btn ${messageType === 'action' ? 'active' : ''}`}
            onClick={() => setMessageType('action')}
          >
            Action
          </button>
          <button 
            className={`type-btn ${messageType === 'thought' ? 'active' : ''}`}
            onClick={() => setMessageType('thought')}
          >
            Thought
          </button>
        </div>
        
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
            {inputValue.length > 0 ? 'Press Enter to send or click the button' : ''}
          </div>
        </div>
        
        <button 
          className="send-btn"
          onClick={handleSendMessage}
          disabled={isLoading || !inputValue.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
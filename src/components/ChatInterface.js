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
      // Clear any existing messages to prevent story contamination
      setMessages([]);
      
      // Small timeout to ensure everything is reset
      setTimeout(() => {
        setMessages([
          {
            role: 'system',
            content: `Scenario initialized: ${scenario.title || 'Untitled'}. Character: ${character.name || 'Unnamed'}. Ready to begin roleplay.`,
            timestamp: new Date().toISOString()
          }
        ]);
        
        // Generate initial AI response if geminiService is available
        if (geminiService) {
          // Make sure the service is properly initialized
          geminiService.reset();
          geminiService.initialize(character, scenario);
          handleAIResponse();
        }
      }, 200);
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
      // Provide a very explicit instruction to start the roleplay correctly
      const scenarioTitle = scenario?.title || 'Untitled';
      const initialSituation = scenario?.initialSituation || 'Not specified';
      
      const response = await geminiService.generateResponse(
        `Begin a new roleplay for "${scenarioTitle}" with NO references to any other stories or narratives. Set the scene EXACTLY as described in this initial situation: "${initialSituation}". Start the narrative at precisely this moment with no previous events assumed. DO NOT introduce elements from any other stories, scenarios, or previous conversations.`, 
        "system"
      );
      
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
          <button 
            className="save-btn" 
            onClick={() => typeof onSaveChat === 'function' && onSaveChat(messages)}
            type="button"
          >
            Save Chat
          </button>
          <button 
            className="reset-btn" 
            onClick={onReset}
            type="button"
          >
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
            {message.role === 'user' && message.type && (
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
            type="button"
            className={`type-btn ${messageType === 'dialogue' ? 'active' : ''}`}
            onClick={() => setMessageType('dialogue')}
          >
            Dialogue
          </button>
          <button 
            type="button"
            className={`type-btn ${messageType === 'action' ? 'active' : ''}`}
            onClick={() => setMessageType('action')}
          >
            Action
          </button>
          <button 
            type="button"
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
                        'Type your message...'}
            rows={3}
          />
          <div className="input-helper">
            {inputValue.length > 0 ? 'Press Enter to send or click the button' : ''}
          </div>
        </div>
        
        <button 
          type="button"
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
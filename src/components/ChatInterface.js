  // Save current chat state
  const saveCurrentChat = () => {
    if (!geminiService || !character || !scenario || !chatId) {
      console.error('Cannot save chat: missing required data');
      return null;
    }
    
    try {
      // Get chat history from Gemini service
      const geminiHistory = geminiService.exportChatHistory();
      
      // Create chat snapshot
      const chatSnapshot = StorageService.saveChatSnapshot(
        messages,
        character,
        scenario, 
        geminiHistory
      );
      
      console.log('Chat automatically saved:', chatSnapshot?.id);
      return chatSnapshot;
    } catch (error) {
      console.error('Error saving chat snapshot:', error);
      return null;
    }
  };
  
  // Handle manual save request
  const handleSaveRequest = () => {
    const savedChat = saveCurrentChat();
    if (savedChat && typeof onSaveChat === 'function') {
      onSaveChat(savedChat);
    }
  };

  // Toggle auto-save feature
  const toggleAutoSave = () => {
    const newState = !autoSaveEnabled;
    setAutoSaveEnabled(newState);
    localStorage.setItem('auto_save_chat', newState.toString());
  };
  
  // Load auto-save setting
  useEffect(() => {
    const savedAutoSave = localStorage.getItem('auto_save_chat');
    if (savedAutoSave !== null) {
      setAutoSaveEnabled(savedAutoSave === 'true');
    }
  }, []);

  // Save chat state when component unmounts if auto-save is enabled
  useEffect(() => {
    return () => {
      if (autoSaveEnabled && messages.length > 1) {
        saveCurrentChat();
      }
    };
  }, [autoSaveEnabled, messages]);

  // Handle exporting chat to file
  const handleExportChat = () => {
    if (!messages.length) return;
    
    // Format and save chat history as a JSON file
    const chatData = {
      id: chatId,
      title: character?.name ? `${character.name} - ${scenario?.title || 'Untitled'}` : 'Chat Export',
      character: character,
      scenario: scenario,
      messages: messages,
      geminiHistory: geminiService ? geminiService.exportChatHistory() : null,
      exported: true,
      exportDate: new Date().toISOString()
    };
    
    const chatJson = JSON.stringify(chatData, null, 2);
    const filename = `${chatData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    
    const blob = new Blob([chatJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temp link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };
  import React, { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';
import VoiceSelector from './VoiceSelector';
import StorageService from '../services/storageService';

const ChatInterface = ({ character, scenario, geminiService, elevenLabsService, isVoiceEnabled, onSaveChat, onReset, savedChatData = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [messageType, setMessageType] = useState('dialogue'); // dialogue, action, thought
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [chatId, setChatId] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Voice-related state
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [currentlyPlayingMessageIndex, setCurrentlyPlayingMessageIndex] = useState(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true); // Default to enabled
  
  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const recordedChunks = useRef([]);

  // Initialize with system message or load saved chat
  useEffect(() => {
    if (savedChatData) {
      // Load from saved chat data
      console.log('Loading saved chat:', savedChatData.id);
      setChatId(savedChatData.id);
      setMessages(savedChatData.messages || []);
      
      // Restore Gemini service state if history is available
      if (geminiService && savedChatData.geminiHistory) {
        try {
          geminiService.reset();
          geminiService.initialize(savedChatData.character, savedChatData.scenario);
          geminiService.importChatHistory(savedChatData.geminiHistory);
          console.log('Restored Gemini chat history');
        } catch (error) {
          console.error('Error restoring Gemini chat history:', error);
          // Fall back to normal initialization
          geminiService.reset();
          geminiService.initialize(character, scenario);
        }
      }
    } else if (character && scenario) {
      // New chat - clear any existing messages to prevent story contamination
      setMessages([]);
      setChatId(Date.now().toString());
      
      // Small timeout to ensure everything is reset
      setTimeout(() => {
        setMessages([{
          role: 'system',
          content: `Scenario initialized: ${scenario.title || 'Untitled'}. Character: ${character.name || 'Unnamed'}. Ready to begin roleplay.`,
          timestamp: new Date().toISOString()
        }]);
        
        // Generate initial AI response if geminiService is available
        if (geminiService) {
          // Make sure the service is properly initialized
          geminiService.reset();
          geminiService.initialize(character, scenario);
          handleAIResponse();
        }
      }, 200);
    }
  }, [character, scenario, savedChatData, geminiService]);

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
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Generate and play voice if enabled and autoplay is on
      if (isVoiceEnabled && elevenLabsService && selectedVoice && autoplayEnabled) {
        try {
          playMessageAudio(response, messages.length);
        } catch (voiceError) {
          console.error('Error generating voice:', voiceError);
        }
      }
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
      
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      const newMessages = [...messages, newMessage, assistantMessage];
      setMessages(newMessages);
      
      // Auto-save chat after each response if enabled
      if (autoSaveEnabled && chatId) {
        saveCurrentChat();
      }
      
      // Generate and play voice if enabled and autoplay is on
      if (isVoiceEnabled && elevenLabsService && selectedVoice && autoplayEnabled) {
        try {
          playMessageAudio(response, newMessages.length - 1);
        } catch (voiceError) {
          console.error('Error generating voice:', voiceError);
        }
      }
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
  
  // Auto-resize textarea based on content
  const handleTextareaInput = (e) => {
    setInputValue(e.target.value);
    
    // Auto-resize logic
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.max(50, Math.min(150, textarea.scrollHeight));
    textarea.style.height = `${newHeight}px`;
  };

  // Load available voices when ElevenLabs service is initialized
  useEffect(() => {
    if (elevenLabsService && isVoiceEnabled) {
      const loadVoices = async () => {
        try {
          const voices = await elevenLabsService.getVoices();
          if (voices.length > 0 && !selectedVoice) {
            // Default to first voice
            setSelectedVoice(voices[0]);
          }
        } catch (error) {
          console.error('Error loading voices:', error);
        }
      };
      
      loadVoices();
    }
  }, [elevenLabsService, isVoiceEnabled]);
  
  // Load stored settings from localStorage
  useEffect(() => {
    // Load autoplay setting
    const savedAutoplay = localStorage.getItem('voice_autoplay');
    if (savedAutoplay !== null) {
      setAutoplayEnabled(savedAutoplay === 'true');
    }
  }, []);
  
  // Save autoplay setting to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('voice_autoplay', autoplayEnabled.toString());
  }, [autoplayEnabled]);
  
  // Handle microphone access and start recording
  const startRecording = async () => {
    try {
      // Request access to the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create a media recorder
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      // Handle data available events
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks.current.push(e.data);
        }
      };
      
      // Handle recording stop event
      recorder.onstop = async () => {
        const audioBlob = new Blob(recordedChunks.current, { type: 'audio/webm' });
        recordedChunks.current = [];
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Convert speech to text if ElevenLabs is enabled
        if (elevenLabsService && isVoiceEnabled) {
          try {
            setIsLoading(true);
            const transcribedText = await elevenLabsService.speechToText(audioBlob);
            
            if (transcribedText) {
              setInputValue(transcribedText);
            } else {
              console.warn('No text transcribed from audio');
            }
          } catch (error) {
            console.error('Speech-to-text error:', error);
            // Show error message to user
            alert('Could not convert speech to text. Please try again or type your message.');
          } finally {
            setIsLoading(false);
          }
        }
      };
      
      // Start recording
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check your browser permissions.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };
  
  // Handle selecting a voice
  const handleSelectVoice = (voice) => {
    setSelectedVoice(voice);
    setShowVoiceSelector(false);
  };
  
  // Add a function to play a specific message
  const playMessageAudio = async (messageContent, messageIndex) => {
    if (isPlayingVoice || !elevenLabsService || !selectedVoice || !isVoiceEnabled) return;
    
    try {
      setIsPlayingVoice(true);
      setCurrentlyPlayingMessageIndex(messageIndex);
      
      const audioBlob = await elevenLabsService.textToSpeech(messageContent, selectedVoice.voice_id);
      
      // Set up an event listener for when audio ends
      const handleAudioEnd = () => {
        setIsPlayingVoice(false);
        setCurrentlyPlayingMessageIndex(null);
        if (elevenLabsService.currentAudio) {
          elevenLabsService.currentAudio.removeEventListener('ended', handleAudioEnd);
        }
      };
      
      const audio = elevenLabsService.playAudio(audioBlob);
      audio.addEventListener('ended', handleAudioEnd);
      
    } catch (error) {
      console.error('Error playing message audio:', error);
      setIsPlayingVoice(false);
      setCurrentlyPlayingMessageIndex(null);
    }
  };
  
  // Function to stop all audio playback
  const stopAllAudio = () => {
    if (elevenLabsService) {
      elevenLabsService.stopAudio();
      setIsPlayingVoice(false);
      setCurrentlyPlayingMessageIndex(null);
    }
  };
  
  // Stop any playing audio when component unmounts
  useEffect(() => {
    return () => {
      if (elevenLabsService) {
        elevenLabsService.stopAudio();
      }
    };
  }, [elevenLabsService]);
  
  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="character-info">
          <h2>{character?.name || 'Unnamed Character'}</h2>
          <p className="scenario-title">{scenario?.title || 'Untitled Scenario'}</p>
        </div>
        <div className="chat-controls">
          {isVoiceEnabled && elevenLabsService && (
            <button 
              className={`voice-btn ${isPlayingVoice ? 'voice-playing' : ''}`}
              onClick={() => setShowVoiceSelector(!showVoiceSelector)}
              title="Voice Settings"
              type="button"
            >
              {isPlayingVoice ? (
                <span className="voice-playing-indicator">🔊</span>
              ) : (
                <span>🎤</span>
              )}
              {selectedVoice ? selectedVoice.name : 'Select Voice'}
            </button>
          )}
          <button 
            className="save-btn" 
            onClick={handleSaveRequest}
            type="button"
            title="Save chat"
          >
            Save Chat
          </button>
          <div className="auto-save-toggle">
            <label title="Automatically save chat progress">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={toggleAutoSave}
              />
              <span>Auto-save</span>
            </label>
          </div>
          <button 
            className="export-btn" 
            onClick={handleExportChat}
            type="button"
            title="Export chat to file"
          >
            Export
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
      
      {showVoiceSelector && elevenLabsService && (
        <div className="voice-selector-modal">
          <div className="voice-selector-content">
            <div className="voice-selector-header">
              <h3>Voice Settings</h3>
              <button 
                className="close-voice-selector" 
                onClick={() => setShowVoiceSelector(false)}
              >
                ×
              </button>
            </div>
            <div className="voice-settings-controls">
              <div className="autoplay-toggle">
                <label>
                  <input
                    type="checkbox"
                    checked={autoplayEnabled}
                    onChange={(e) => setAutoplayEnabled(e.target.checked)}
                  />
                  <span>Autoplay voice responses</span>
                </label>
              </div>
            </div>
            <div className="voice-selector-title">Select Voice</div>
            <VoiceSelector
              elevenLabsApiKey={elevenLabsService.apiKey}
              selectedVoice={selectedVoice}
              onSelectVoice={handleSelectVoice}
              isLoading={isPlayingVoice}
            />
          </div>
        </div>
      )}
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`message ${message.role === 'user' ? 'user-message' : message.role === 'assistant' ? 'ai-message' : 'system-message'} ${message.error ? 'error-message' : ''} ${currentlyPlayingMessageIndex === index ? 'currently-playing' : ''}`}
          >
            {message.role === 'user' && message.type && (
              <div className="message-type-tag">
                {message.type === 'dialogue' ? 'Dialogue' : 
                message.type === 'action' ? 'Action' : 
                message.type === 'thought' ? 'Thought' : 'Message'}
              </div>
            )}
            <div className="message-content">{message.content}</div>
            
            {message.role === 'assistant' && isVoiceEnabled && elevenLabsService && selectedVoice && (
              <div className="message-voice-control">
                <button 
                  onClick={() => playMessageAudio(message.content, index)}
                  disabled={isPlayingVoice}
                  className="play-message-btn"
                  title="Play message"
                >
                  {currentlyPlayingMessageIndex === index ? '🔊 Playing...' : '🔊 Play'}
                </button>
              </div>
            )}
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
        
        {isVoiceEnabled && elevenLabsService && isPlayingVoice && (
          <button 
            type="button"
            className="stop-voice-btn"
            onClick={stopAllAudio}
            title="Stop Voice"
          >
            Stop Voice
          </button>
        )}
        
        <div className="message-input-row">
          <div className="input-wrapper">
            <textarea 
              value={inputValue}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyPress}
              placeholder={messageType === 'dialogue' ? 'Type your dialogue...' : 
                          messageType === 'action' ? 'Describe your action...' : 
                          messageType === 'thought' ? 'Share your thoughts...' :
                          'Type your message...'}
              rows={1}
              style={{ minHeight: '50px' }}
            />
            {isVoiceEnabled && elevenLabsService && (
              <button
                type="button"
                className={`voice-input-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                title={isRecording ? "Stop recording" : "Record voice input"}
              >
                {isRecording ? '⏹️' : '🎙️'}
              </button>
            )}
            {inputValue.length > 0 && (
              <div className="input-helper">
                Press Enter to send
              </div>
            )}
          </div>
          
          <button 
            type="button"
            className="send-btn"
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
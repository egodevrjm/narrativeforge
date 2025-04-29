import React from 'react';
import './ApiKeyWarning.css';

const ApiKeyWarning = ({ onOpenSettings, type = 'gemini', isElevenLabsRequired = false }) => {
  let title, message;
  
  if (type === 'gemini') {
    title = "Gemini API Key Required";
    message = "You need to add a Gemini API key to use NarrativeForge. Get your key from Google AI Studio.";
  } else if (type === 'elevenlabs') {
    title = "ElevenLabs API Key Required";
    message = "Voice features are enabled but require an ElevenLabs API key. Get your key from ElevenLabs.";
  } else if (type === 'both') {
    title = "API Keys Required";
    message = "You need both Gemini and ElevenLabs API keys to fully use NarrativeForge with voice features.";
  }
  
  return (
    <div className={`api-key-warning ${type}`}>
      <div className="warning-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <div className="warning-content">
        <h3>{title}</h3>
        <p>{message}</p>
      </div>
      <button 
        className="warning-action-btn"
        onClick={onOpenSettings}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
        </svg>
        {type === 'both' ? 'Add API Keys' : 'Add API Key'}
      </button>
    </div>
  );
};

export default ApiKeyWarning;
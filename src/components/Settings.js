import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ 
  apiKey, 
  setApiKey, 
  isApiKeySet, 
  setIsApiKeySet, 
  onClose,
  testApiKey,
  isTestingApi,
  apiTestResult,
  onSaveApiKey
}) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    setLocalApiKey(apiKey);
  }, [apiKey]);

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    
    onSaveApiKey(localApiKey);
  };

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            Settings
          </h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          <section className="api-key-section">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
              </svg>
              API Key Setup
            </h3>
            <p>Enter your Gemini API key to use with NarrativeForge. You can get a key from the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.</p>
            
            <form onSubmit={handleSaveApiKey}>
              <div className="api-key-input">
                <label htmlFor="apiKey">Gemini API Key:</label>
                <div className="input-with-toggle">
                  <input 
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={localApiKey} 
                    onChange={(e) => setLocalApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    autoComplete="off"
                  />
                  <button 
                    type="button" 
                    className="toggle-visibility"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
              
              <div className="api-key-actions">
                <button 
                  type="button" 
                  className="test-btn"
                  onClick={() => testApiKey()}
                  disabled={isTestingApi || !localApiKey}
                >
                  {isTestingApi ? (
                    <>
                      <div className="loading-spinner"></div>
                      Testing...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Test Key
                    </>
                  )}
                </button>
                
                <button 
                  type="submit" 
                  className="save-btn"
                  disabled={!localApiKey}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Save Key
                </button>
              </div>
            </form>
            
            {apiTestResult && (
              <div className={`api-test-result ${apiTestResult.success ? 'success' : 'error'}`}>
                <p>{apiTestResult.message}</p>
                {apiTestResult.success && apiTestResult.response && (
                  <div className="api-response">
                    <small>Model response:</small>
                    <p>{apiTestResult.response.substring(0, 100)}...</p>
                  </div>
                )}
              </div>
            )}
          </section>
          
          <section className="about-section">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              About NarrativeForge
            </h3>
            <p>NarrativeForge is a character-driven roleplay application created by Ryan Morrison. Create immersive storytelling experiences with detailed characters and scenarios.</p>
            <p className="version">Version 1.0.0</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;

import React, { useState, useEffect } from 'react';
import QuickSetup from './components/SetupMode/QuickSetup.js';
import './components/SetupMode/QuickSetup.css';
import SetupWizard from './components/SetupWizard/SetupWizard.js';
import ChatInterface from './components/ChatInterface.js';
import ScenarioSelection from './components/ScenarioSelection.js';
import Settings from './components/Settings.js';
import ApiKeyWarning from './components/ApiKeyWarning.js';
import GeminiService from './services/geminiService.js';
import ElevenLabsService from './services/elevenLabsService.js'; // Import ElevenLabs service
import { defaultCharacter, defaultScenario } from './templates/defaultTemplate.js';
import { preDesignedScenarios } from './templates/preDesignedScenarios.js';
import ChatBackground from './components/ChatBackground.js';
import './layout.css';
import './theme.css';
import './App.css';
import './improved-message-formatting.css';
import './social-media-style.css';
import './chat-auto-detect.css';

function App() {
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, character, scenario, chat, quickSetup
  const [character, setCharacter] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [geminiService, setGeminiService] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // ElevenLabs state
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState('');
  const [elevenLabsService, setElevenLabsService] = useState(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isTestingVoiceApi, setIsTestingVoiceApi] = useState(false);
  const [voiceApiTestResult, setVoiceApiTestResult] = useState(null);

  // Initialize Gemini service when API key is set
  useEffect(() => {
    if (isApiKeySet) {
      const service = new GeminiService(apiKey);
      setGeminiService(service);
    }
  }, [apiKey, isApiKeySet]);
  
  // Initialize ElevenLabs service when API key is set
  useEffect(() => {
    if (elevenLabsApiKey) {
      try {
        const service = new ElevenLabsService(elevenLabsApiKey);
        setElevenLabsService(service);
        console.log('ElevenLabs service initialized');
      } catch (error) {
        console.error('Failed to initialize ElevenLabs service:', error);
      }
    } else {
      // Clear the service if no API key is set
      setElevenLabsService(null);
    }
  }, [elevenLabsApiKey]);

  // Initialize service for roleplay when character and scenario are ready
  useEffect(() => {
    if (geminiService && character && scenario && currentStep === 'chat') {
      geminiService.initialize(character, scenario);
    }
  }, [geminiService, character, scenario, currentStep]);

  // Test Gemini API key functionality
  const testApiKey = async () => {
    if (!apiKey) {
      setApiTestResult({
        success: false,
        message: 'Please enter an API key first'
      });
      return;
    }

    setIsTestingApi(true);
    setApiTestResult(null);

    try {
      const service = new GeminiService(apiKey);
      const response = await service.generateGeneric('Respond only with: "API test successful" - no other text.');
      
      setApiTestResult({
        success: true,
        message: 'API test successful!',
        response: response
      });
      
    } catch (error) {
      console.error('API test error:', error);
      let errorMessage = error.message;
      
      // Make error messages more user-friendly
      if (error.message.includes('401')) {
        errorMessage = 'API key is invalid or has expired.';
      } else if (error.message.includes('403')) {
        errorMessage = 'API key does not have access to the required model (gemini-1.5-flash).';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      }
      
      setApiTestResult({
        success: false,
        message: `API test failed: ${errorMessage}`
      });
    } finally {
      setIsTestingApi(false);
    }
  };

  // Test ElevenLabs API key functionality
  const testVoiceApiKey = async (apiKeyToTest) => {
    // Use the provided key or fall back to the stored key
    const keyToTest = apiKeyToTest || elevenLabsApiKey;
    
    if (!keyToTest) {
      setVoiceApiTestResult({
        success: false,
        message: 'Please enter an ElevenLabs API key first'
      });
      return;
    }

    setIsTestingVoiceApi(true);
    setVoiceApiTestResult(null);

    try {
      const service = new ElevenLabsService(keyToTest);
      // Get available voices to test the API key
      const voices = await service.getVoices();
      
      setVoiceApiTestResult({
        success: true,
        message: `API test successful! Found ${voices.length} voices.`,
        voicesCount: voices.length,
        voices: voices
      });
      
    } catch (error) {
      console.error('ElevenLabs API test error:', error);
      let errorMessage = error.message;
      
      // Make error messages more user-friendly
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = 'API key is invalid or has expired.';
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        errorMessage = 'API key does not have sufficient permissions.';
      } else if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      }
      
      setVoiceApiTestResult({
        success: false,
        message: `API test failed: ${errorMessage}`
      });
    } finally {
      setIsTestingVoiceApi(false);
    }
  };

  // Save API key
  const handleApiKeySubmit = (newApiKey) => {
    try {
      // Test the API key by making a simple call
      localStorage.setItem('gemini_api_key', newApiKey);
      setApiKey(newApiKey);
      setIsApiKeySet(true);
      
      // Set the service
      const service = new GeminiService(newApiKey);
      setGeminiService(service);
      
      // Close settings
      setShowSettings(false);
    } catch (error) {
      console.error('API key validation error:', error);
      alert(`Error with API key: ${error.message}. Please check your API key and try again.`);
    }
  };
  
  // Save ElevenLabs API key
  const handleElevenLabsApiKeySubmit = (newApiKey) => {
    try {
      localStorage.setItem('elevenlabs_api_key', newApiKey);
      setElevenLabsApiKey(newApiKey);
      
      // Initialize the service
      const service = new ElevenLabsService(newApiKey);
      setElevenLabsService(service);
      
      console.log('ElevenLabs API key saved successfully');
    } catch (error) {
      console.error('ElevenLabs API key validation error:', error);
      alert(`Error with ElevenLabs API key: ${error.message}. Please check your API key and try again.`);
    }
  };
  
  // Toggle voice enabled setting
  const handleToggleVoice = (enabled) => {
    setIsVoiceEnabled(enabled);
    localStorage.setItem('voice_enabled', enabled ? 'true' : 'false');
  };

  // Toggle settings panel
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Handle scenario selection
  const handleSelectScenario = (scenarioData) => {
    // Reset everything first to prevent contamination
    if (geminiService) {
      geminiService.reset();
    }
    setCharacter(null);
    setScenario(null);
    
    // Set new scenario data
    setTimeout(() => {
      setCharacter(scenarioData.character);
      setScenario(scenarioData.scenario);
      setCurrentStep('chat');
    }, 100);
  };

  // Handle 'Create your own' selection
  const handleCreateOwn = (mode) => {
    if (mode === 'quick') {
      setCurrentStep('quickSetup');
    } else {
      setCurrentStep('setupWizard');
    }
  };

  // Handle saving setup data (character and scenario together from wizard or quick setup)
  const handleSaveSetup = (characterData, scenarioData) => {
    setCharacter(characterData);
    setScenario(scenarioData);
    setCurrentStep('chat');
  };

  // Handle saving chat
  const handleSaveChat = (chatData) => {
    // Save chat functionality
    console.log('Saving chat:', chatData);
    
    // Format and save chat history as a JSON file
    const chatJson = JSON.stringify(chatData, null, 2);
    const chatTitle = character?.name ? `${character.name}_chat` : 'narrative_forge_chat';
    const filename = `${chatTitle}_${new Date().toISOString().split('T')[0]}.json`;
    
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

  // Reset to welcome screen
  const handleReset = () => {
    if (window.confirm('Are you sure you want to start over? All current data will be lost.')) {
      setCurrentStep('welcome');
      setCharacter(null);
      setScenario(null);
    }
  };

  // Load stored settings from local storage on first render
  useEffect(() => {
    // Load Gemini API key
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySet(true);
    }
    
    // Load ElevenLabs API key
    const savedElevenLabsApiKey = localStorage.getItem('elevenlabs_api_key');
    if (savedElevenLabsApiKey) {
      setElevenLabsApiKey(savedElevenLabsApiKey);
    }
    
    // Load voice enabled setting
    const voiceEnabled = localStorage.getItem('voice_enabled') === 'true';
    setIsVoiceEnabled(voiceEnabled);
  }, []);

  // Get background image for the scenario
  const getScenarioImage = (scenarioId) => {
    // Define scenario images
    const scenarioImages = {
      'betrayal-melody': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
      'detective-noir': 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1200&q=80',
      'space-explorer': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80'
    };
    
    // Return image URL or a default one
    return scenarioImages[scenarioId] || 'https://images.unsplash.com/photo-1505506874110-6a7a69069a08?auto=format&fit=crop&w=1200&q=80';
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <a href="#" className="app-logo" onClick={() => setCurrentStep('welcome')}>
            <span>Narrative</span>Forge
          </a>
          <div className="app-subtitle">Character-driven roleplay</div>
        </div>
        <div className="header-right">
          {isVoiceEnabled && (
            <div className="voice-indicator">
              {elevenLabsService ? "🎤 Voice enabled" : "🎤 Voice settings needed"}
            </div>
          )}
          <button className="settings-btn" onClick={toggleSettings}>
            ⚙️ Settings
          </button>
        </div>
      </header>
      
      {showSettings && (
        <Settings 
          apiKey={apiKey}
          setApiKey={setApiKey}
          isApiKeySet={isApiKeySet}
          setIsApiKeySet={setIsApiKeySet}
          onClose={toggleSettings}
          testApiKey={testApiKey}
          isTestingApi={isTestingApi}
          apiTestResult={apiTestResult}
          onSaveApiKey={handleApiKeySubmit}
          elevenLabsApiKey={elevenLabsApiKey}
          setElevenLabsApiKey={setElevenLabsApiKey}
          isVoiceEnabled={isVoiceEnabled}
          setIsVoiceEnabled={handleToggleVoice}
          testVoiceApiKey={testVoiceApiKey}
          isTestingVoiceApi={isTestingVoiceApi}
          voiceApiTestResult={voiceApiTestResult}
          onSaveElevenLabsApiKey={handleElevenLabsApiKeySubmit}
        />
      )}

      <main className="app-content">
        {currentStep === 'welcome' && (
          <div className="welcome-screen">
            
            {!isApiKeySet && (
              <ApiKeyWarning onOpenSettings={toggleSettings} />
            )}
            
            <ScenarioSelection 
              onSelectScenario={handleSelectScenario}
              onCreateOwn={handleCreateOwn}
              isApiKeySet={isApiKeySet}
            />
            
            <div className="info-section">
              <h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                How It Works
              </h3>
              <ol>
                <li>Select a pre-designed scenario or create your own</li>
                <li>For custom scenarios, build a detailed character and setting</li>
                <li>Engage in dynamic roleplay with AI-powered responses</li>
                <li>Create memorable stories and immersive experiences</li>
              </ol>
            </div>
          </div>
        )}

        {currentStep === 'setupWizard' && (
          <SetupWizard
            onSave={handleSaveSetup}
            geminiService={geminiService}
            onReset={handleReset}
          />
        )}

        {currentStep === 'quickSetup' && (
          <QuickSetup
            onSave={handleSaveSetup}
            geminiService={geminiService}
            onReset={handleReset}
          />
        )}

        {currentStep === 'chat' && (
          <div className="chat-container">
            <ChatBackground 
              backgroundImage={getScenarioImage(scenario?.id)}
            >
              <ChatInterface 
                character={character}
                scenario={scenario}
                onSaveChat={handleSaveChat}
                geminiService={geminiService}
                elevenLabsService={elevenLabsService}
                isVoiceEnabled={isVoiceEnabled}
                onReset={handleReset}
              />
            </ChatBackground>
          </div>
        )}
      </main>

      <footer className="app-footer">
        {currentStep === 'welcome' ? (
          <div className="footer-welcome">
            <div className="footer-credit">
              Created by <span>Ryan Morrison</span>
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link">Privacy</a>
              <a href="#" className="footer-link">Terms</a>
              <button className="settings-btn-footer" onClick={toggleSettings}>
                ⚙️ Settings
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="progress-indicator">
              {currentStep === 'setupWizard' ? (
                <>
                  <div className="step active">Setup Wizard</div>
                  <div className="step">Roleplay</div>
                </>
              ) : currentStep === 'quickSetup' ? (
                <>
                  <div className="step active">Quick Setup</div>
                  <div className="step">Roleplay</div>
                </>
              ) : currentStep === 'chat' ? (
                <div className="step active">Roleplay</div>
              ) : null}
            </div>
            
            <button className="reset-btn" onClick={handleReset}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
              </svg>
              Start Over
            </button>
          </>
        )}
      </footer>
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import QuickSetup from './components/SetupMode/QuickSetup';
import './components/SetupMode/QuickSetup.css';
import SetupWizard from './components/SetupWizard/SetupWizard';
import ChatInterface from './components/ChatInterface';
import ScenarioSelection from './components/ScenarioSelection';
import Settings from './components/Settings';
import ApiKeyWarning from './components/ApiKeyWarning';
import GeminiService from './services/geminiService';
import { defaultCharacter, defaultScenario } from './templates/defaultTemplate';
import { preDesignedScenarios } from './templates/preDesignedScenarios';
import ChatBackground from './components/ChatBackground';
import './layout.css';
import './theme.css';
import './App.css';
import './improved-message-formatting.css'; // Import improved message formatting
import './social-media-style.css'; // Import social media styling
import './chat-auto-detect.css'; // Import auto-detect styling

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

  // Initialize Gemini service when API key is set
  useEffect(() => {
    if (isApiKeySet) {
      const service = new GeminiService(apiKey);
      setGeminiService(service);
    }
  }, [apiKey, isApiKeySet]);

  // Initialize service for roleplay when character and scenario are ready
  useEffect(() => {
    if (geminiService && character && scenario && currentStep === 'chat') {
      geminiService.initialize(character, scenario);
    }
  }, [geminiService, character, scenario, currentStep]);

  // Test API key functionality
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
  };

  // Reset to welcome screen
  const handleReset = () => {
    if (window.confirm('Are you sure you want to start over? All current data will be lost.')) {
      setCurrentStep('welcome');
      setCharacter(null);
      setScenario(null);
    }
  };

  // Load API key from local storage on first render
  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySet(true);
    }
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
        />
      )}

      <main className="app-content">
        {currentStep === 'welcome' && (
          <div className="welcome-screen">
            <div className="welcome-header">
              <h1 className="welcome-title">Create Your Ultimate Roleplay</h1>
              <p className="welcome-subtitle">Immerse yourself in character-driven narratives. Choose from our pre-designed scenarios or create your own unique experience.</p>
            </div>
            
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
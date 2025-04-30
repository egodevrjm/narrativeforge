import React, { useState } from 'react';
import { preDesignedScenarios } from '../templates/preDesignedScenarios';
import '../theme.css';
import './ScenarioSelection.css';

// Define scenario images
const scenarioImages = {
  'betrayal-melody': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=60',
  'detective-noir': 'https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=800&q=60',
  'space-explorer': 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=60',
  'lost-enchanter': 'https://images.unsplash.com/photo-1518709414768-a88981a4515d?auto=format&fit=crop&w=800&q=60',
  'neon-hacker': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=60',
  'wasteland-survivor': 'https://images.unsplash.com/photo-1542652694-40abf526446e?auto=format&fit=crop&w=800&q=60',
  'regency-intrigue': 'https://images.unsplash.com/photo-1551651767-d5ffbdd04088?auto=format&fit=crop&w=800&q=60'
};

const ScenarioSelection = ({ onSelectScenario, onCreateOwn, isApiKeySet }) => {
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  
  return (
    <div className="featured-scenarios">
      <h2 className="section-title right-aligned">Choose Your Adventure</h2>
      <p className="section-subtitle right-aligned">Select a pre-designed scenario or create your own unique experience</p>
      
      <div className="scenarios-grid">
        {preDesignedScenarios.map((scenario) => (
          <div 
            key={scenario.id} 
            className="scenario-card"
          >
            <div className="scenario-card-header">
              <span className="scenario-type-badge">{getScenarioTag(scenario.id)}</span>
              <div 
                className="scenario-card-image"
                style={{ backgroundImage: `url(${scenarioImages[scenario.id] || '/api/placeholder/400/225'})` }}
              >
              </div>
              <div className="scenario-card-gradient"></div>
            </div>
            
            <div className="scenario-card-content">
              <h3>{scenario.title}</h3>
              <div className="scenario-tags">
                {getScenarioTags(scenario).map((tag, index) => (
                  <span key={index} className="scenario-tag">{tag}</span>
                ))}
              </div>
              <p>{scenario.description}</p>
              <div className="scenario-card-footer">
                <button 
                  className="scenario-card-btn"
                  onClick={() => onSelectScenario(scenario)}
                  disabled={!isApiKeySet}
                >
                  {!isApiKeySet ? (
                    <>API Keys Required</>
                  ) : (
                    <>Play Now</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="create-own">
          <div className="create-card-icon">+</div>
          <h3>Create Your Own</h3>
          <p>Design a custom character and scenario from scratch exactly the way you want</p>
          {!showCreateOptions ? (
            <div className="scenario-footer">
              <button 
                className="create-btn"
                onClick={() => setShowCreateOptions(true)}
                disabled={!isApiKeySet}
              >
                {!isApiKeySet ? (
                  <>API Keys Required</>
                ) : (
                  <>Create Custom</>
                )}
              </button>
            </div>
          ) : (
            <div className="create-options">
              <button 
                className="step-by-step-btn"
                onClick={() => onCreateOwn('step')}
                disabled={!isApiKeySet}
              >
                <span>Step-by-Step</span>
                <span>Guide</span>
              </button>
              <button 
                className="quick-setup-btn"
                onClick={() => onCreateOwn('quick')}
                disabled={!isApiKeySet}
              >
                <span>Quick</span>
                <span>Setup</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {!isApiKeySet && (
        <div className="api-key-overlay">
          <div className="api-key-message">
            <p>Gemini and ElevenLabs API keys required</p>
            <p className="api-key-submessage">Add your API keys in Settings to begin</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get scenario tags
function getScenarioTags(scenario) {
  const tags = [];
  
  // Add themes based on scenario
  if (scenario.id === 'betrayal-melody') {
    tags.push('Drama', 'Romance', 'Music');
  } else if (scenario.id === 'detective-noir') {
    tags.push('Mystery', 'Crime', 'Noir');
  } else if (scenario.id === 'space-explorer') {
    tags.push('Sci-Fi', 'Adventure', 'Discovery');
  } else if (scenario.id === 'lost-enchanter') {
    tags.push('Fantasy', 'Magic', 'Mystery');
  } else if (scenario.id === 'neon-hacker') {
    tags.push('Cyberpunk', 'Dystopia', 'Tech');
  } else if (scenario.id === 'wasteland-survivor') {
    tags.push('Post-Apocalyptic', 'Survival', 'Drama');
  } else if (scenario.id === 'regency-intrigue') {
    tags.push('Historical', 'Romance', 'Intrigue');
  }
  
  return tags;
}

// Helper function to get scenario type badge
function getScenarioTag(id) {
  switch(id) {
    case 'betrayal-melody':
      return 'Drama';
    case 'detective-noir':
      return 'Mystery';
    case 'space-explorer':
      return 'Sci-Fi';
    case 'lost-enchanter':
      return 'Fantasy';
    case 'neon-hacker':
      return 'Cyberpunk';
    case 'wasteland-survivor':
      return 'Post-Apocalyptic';
    case 'regency-intrigue':
      return 'Historical';
    default:
      return 'Adventure';
  }
}

export default ScenarioSelection;
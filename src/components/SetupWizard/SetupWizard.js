import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Sparkles, User, Map, Wand2, CheckCircle, RefreshCw } from 'lucide-react';
import './SetupWizard.css';

const SetupWizard = ({ onSave, geminiService, onReset }) => {
  // Steps in the wizard
  const STEPS = {
    WELCOME: 'welcome',
    CHARACTER_BASIC: 'character_basic',
    CHARACTER_DETAIL: 'character_detail',
    CHARACTER_RELATIONSHIPS: 'character_relationships',
    SCENARIO_BASIC: 'scenario_basic',
    SCENARIO_SETTING: 'scenario_setting',
    SCENARIO_CHARACTERS: 'scenario_characters',
    SCENARIO_GOALS: 'scenario_goals',
    REVIEW: 'review'
  };

  // Main state
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState(null);
  
  // State for character and scenario data
  const [characterData, setCharacterData] = useState({
    name: '',
    age: '',
    physicalDescription: '',
    background: '',
    personality: '',
    relationships: [],
    additionalNotes: ''
  });
  
  const [scenarioData, setScenarioData] = useState({
    title: '',
    setting: {
      location: '',
      time: '',
      atmosphere: ''
    },
    initialSituation: '',
    otherCharacters: [],
    narrativeGoals: '',
    toneAndThemes: '',
    roleplayInstructions: ''
  });

  // Generate a random character
  const generateRandomCharacter = async () => {
    try {
      setIsGenerating(true);
      
      if (!geminiService) {
        alert('AI service is not available. Please check your API key in settings.');
        return;
      }
      
      const prompt = `Create a detailed fictional character profile with the following information:
      - Name (full name)
      - Age (between 18-80)
      - Detailed physical description (at least 2 paragraphs)
      - Background and history (at least 2 paragraphs, include childhood, family, and major life events)
      - Personality traits (include both strengths and flaws)
      - One key relationship with another character
      
      Make the character complex, nuanced, and interesting with strong narrative potential.
      
      IMPORTANT: Return ONLY a valid JSON object with NO additional text, following this structure:
      {
        "name": "Character's name",
        "age": "Character's age (as a number)",
        "physicalDescription": "Detailed physical description",
        "background": "Background and history",
        "personality": "Personality description",
        "relationships": [
          {
            "name": "Name of related character",
            "relationshipType": "Type of relationship",
            "description": "Description of the relationship"
          }
        ],
        "additionalNotes": "Any additional details"
      }`;
      
      const response = await geminiService.generateGeneric(prompt);
      
      try {
        // Try to parse the JSON directly first
        let jsonData;
        try {
          jsonData = JSON.parse(response.trim());
        } catch (e) {
          // Fallback to regex extraction if direct parsing fails
          const jsonRegex = /\{[\s\S]*\}/g;
          const matches = response.match(jsonRegex);
          
          if (matches && matches.length > 0) {
            const jsonString = matches[0];
            jsonData = JSON.parse(jsonString);
          } else {
            throw new Error('Could not extract valid JSON from response');
          }
        }
        
        // Ensure relationships is an array
        if (!Array.isArray(jsonData.relationships)) {
          jsonData.relationships = [];
        }
        
        // Verify name exists, set a default if missing
        if (!jsonData.name || jsonData.name.trim() === '') {
          jsonData.name = "Unnamed Character";
        }
        
        setCharacterData(jsonData);
      } catch (error) {
        console.error('Error processing character data:', error);
        console.log('Raw response:', response);
        alert('Could not process AI-generated character. Please try again or create manually.');
      }
    } catch (error) {
      console.error('Error generating character:', error);
      alert('Could not generate character. Please try again or continue with manual entry.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate a random scenario
  const generateRandomScenario = async () => {
    try {
      setIsGenerating(true);
      
      if (!geminiService) {
        alert('AI service is not available. Please check your API key in settings.');
        return;
      }
      
      const prompt = `Create a detailed roleplay scenario with the following information:
      - Title (creative and evocative)
      - Setting (including location, time period, and atmosphere)
      - Initial situation (the starting point for the roleplay)
      - Other characters (at least 1-2 characters with descriptions)
      - Narrative goals (what the scenario aims to explore)
      - Tone and themes (emotional tone and thematic elements)
      
      Make the scenario compelling, rich with potential for character development, and interesting to explore.
      
      IMPORTANT: Return ONLY a valid JSON object with NO additional text, following this structure:
      {
        "title": "Scenario title",
        "setting": {
          "location": "Description of the location",
          "time": "Time period or specific time",
          "atmosphere": "Mood and atmosphere of the setting"
        },
        "initialSituation": "Detailed description of the starting situation",
        "otherCharacters": [
          {
            "name": "Character name",
            "role": "Character's role in the scenario",
            "description": "Physical and personality description",
            "relationship": "Relationship to the protagonist"
          }
        ],
        "narrativeGoals": "What the scenario aims to explore or accomplish",
        "toneAndThemes": "Emotional tone and thematic elements"
      }`;
      
      const response = await geminiService.generateGeneric(prompt);
      
      try {
        // Try to parse the JSON directly first
        let jsonData;
        try {
          jsonData = JSON.parse(response.trim());
        } catch (e) {
          // Fallback to regex extraction if direct parsing fails
          const jsonRegex = /\{[\s\S]*\}/g;
          const matches = response.match(jsonRegex);
          
          if (matches && matches.length > 0) {
            const jsonString = matches[0];
            jsonData = JSON.parse(jsonString);
          } else {
            throw new Error('Could not extract valid JSON from response');
          }
        }
        
        // Ensure required fields exist
        if (!jsonData.setting || typeof jsonData.setting !== 'object') {
          jsonData.setting = { location: '', time: '', atmosphere: '' };
        }
        
        if (!Array.isArray(jsonData.otherCharacters)) {
          jsonData.otherCharacters = [];
        }

        // Verify title exists, set a default if missing
        if (!jsonData.title || jsonData.title.trim() === '') {
          jsonData.title = "Untitled Scenario";
        }
        
        setScenarioData(jsonData);
      } catch (error) {
        console.error('Error processing scenario data:', error);
        console.log('Raw response:', response);
        alert('Could not process AI-generated scenario. Please try again or create manually.');
      }
    } catch (error) {
      console.error('Error generating scenario:', error);
      alert('Could not generate scenario. Please try again or continue with manual entry.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate a specific field using AI
  const generateField = async (type, field, currentValue = '') => {
    try {
      setGeneratingField(field);
      
      if (!geminiService) {
        alert('AI service is not available. Please check your API key in settings.');
        return;
      }
      
      let prompt;
      
      switch (field) {
        case 'physical_description':
          prompt = `Write a detailed 2-paragraph physical description for a character named ${characterData.name || 'the protagonist'}.
          Include appearance, style, distinctive features, and mannerisms.
          Return only the description with no introduction or explanation.`;
          break;
          
        case 'background':
          prompt = `Write a detailed 2-paragraph background for a character named ${characterData.name || 'the protagonist'}, age ${characterData.age || 'adult'}.
          Include childhood, key life events, education, career, and formative experiences.
          Return only the background with no introduction or explanation.`;
          break;
          
        case 'personality':
          prompt = `Write a detailed paragraph about the personality of a character named ${characterData.name || 'the protagonist'}.
          Include traits, strengths, flaws, values, and behaviors.
          Return only the personality description with no introduction or explanation.`;
          break;
          
        case 'initial_situation':
          prompt = `Write a detailed paragraph about the initial situation for a scenario called "${scenarioData.title || 'The Scenario'}".
          The location is ${scenarioData.setting?.location || 'unspecified'} and the time is ${scenarioData.setting?.time || 'present day'}.
          Describe what is happening at the start of the roleplay, the protagonist's current state, and the immediate dramatic situation.
          Return only the initial situation with no introduction or explanation.`;
          break;
          
        case 'narrative_goals':
          prompt = `Write a paragraph about the narrative goals for a scenario called "${scenarioData.title || 'The Scenario'}".
          What is the protagonist trying to achieve? What themes will be explored? What character development might occur?
          Return only the narrative goals with no introduction or explanation.`;
          break;
          
        default:
          prompt = `Enhance this text for a roleplay scenario: "${currentValue || 'No current text'}"
          Make it more detailed, engaging, and dramatically interesting.
          Return only the enhanced text with no introduction or explanation.`;
      }
      
      const response = await geminiService.generateGeneric(prompt);
      
      // Clean up the response - remove any AI explanations
      const cleanedResponse = response
        .replace(/^(here('s| is) (the |an |a )?(expanded|enhanced|detailed|improved).*?:\s*)/i, '')
        .replace(/^(I('ve| have) (expanded|enhanced|created).*?:\s*)/i, '')
        .replace(/^(As requested.*?:\s*)/i, '')
        .trim();
      
      // Update the appropriate state
      if (type === 'character') {
        setCharacterData(prev => {
          const newData = { ...prev };
          switch (field) {
            case 'physical_description':
              newData.physicalDescription = cleanedResponse;
              break;
            case 'background':
              newData.background = cleanedResponse;
              break;
            case 'personality':
              newData.personality = cleanedResponse;
              break;
            default:
              break;
          }
          return newData;
        });
      } else if (type === 'scenario') {
        setScenarioData(prev => {
          const newData = { ...prev };
          switch (field) {
            case 'initial_situation':
              newData.initialSituation = cleanedResponse;
              break;
            case 'narrative_goals':
              newData.narrativeGoals = cleanedResponse;
              break;
            default:
              break;
          }
          return newData;
        });
      }
    } catch (error) {
      console.error(`Error generating ${field}:`, error);
      alert(`Could not generate ${field}. Please try again or continue with manual entry.`);
    } finally {
      setGeneratingField(null);
    }
  };

  // Add a relationship to the character
  const addRelationship = () => {
    setCharacterData(prev => {
      const relationships = Array.isArray(prev.relationships) ? [...prev.relationships] : [];
      relationships.push({ name: '', relationshipType: '', description: '' });
      return { ...prev, relationships };
    });
  };

  // Update a relationship
  const updateRelationship = (index, field, value) => {
    setCharacterData(prev => {
      const relationships = Array.isArray(prev.relationships) ? [...prev.relationships] : [];
      if (relationships[index]) {
        relationships[index] = { ...relationships[index], [field]: value };
      }
      return { ...prev, relationships };
    });
  };

  // Remove a relationship
  const removeRelationship = (index) => {
    setCharacterData(prev => {
      const relationships = Array.isArray(prev.relationships) ? [...prev.relationships] : [];
      return { ...prev, relationships: relationships.filter((_, i) => i !== index) };
    });
  };

  // Add a character to the scenario
  const addScenarioCharacter = () => {
    setScenarioData(prev => {
      const characters = Array.isArray(prev.otherCharacters) ? [...prev.otherCharacters] : [];
      characters.push({ name: '', role: '', description: '', relationship: '' });
      return { ...prev, otherCharacters: characters };
    });
  };

  // Update a scenario character
  const updateScenarioCharacter = (index, field, value) => {
    setScenarioData(prev => {
      const characters = Array.isArray(prev.otherCharacters) ? [...prev.otherCharacters] : [];
      if (characters[index]) {
        characters[index] = { ...characters[index], [field]: value };
      }
      return { ...prev, otherCharacters: characters };
    });
  };

  // Remove a scenario character
  const removeScenarioCharacter = (index) => {
    setScenarioData(prev => {
      const characters = Array.isArray(prev.otherCharacters) ? [...prev.otherCharacters] : [];
      return { ...prev, otherCharacters: characters.filter((_, i) => i !== index) };
    });
  };

  // Move to the next step
  const nextStep = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        setCurrentStep(STEPS.CHARACTER_BASIC);
        break;
      case STEPS.CHARACTER_BASIC:
        setCurrentStep(STEPS.CHARACTER_DETAIL);
        break;
      case STEPS.CHARACTER_DETAIL:
        setCurrentStep(STEPS.CHARACTER_RELATIONSHIPS);
        break;
      case STEPS.CHARACTER_RELATIONSHIPS:
        setCurrentStep(STEPS.SCENARIO_BASIC);
        break;
      case STEPS.SCENARIO_BASIC:
        setCurrentStep(STEPS.SCENARIO_SETTING);
        break;
      case STEPS.SCENARIO_SETTING:
        setCurrentStep(STEPS.SCENARIO_CHARACTERS);
        break;
      case STEPS.SCENARIO_CHARACTERS:
        setCurrentStep(STEPS.SCENARIO_GOALS);
        break;
      case STEPS.SCENARIO_GOALS:
        setCurrentStep(STEPS.REVIEW);
        break;
      default:
        break;
    }
  };

  // Move to the previous step
  const prevStep = () => {
    switch (currentStep) {
      case STEPS.CHARACTER_BASIC:
        setCurrentStep(STEPS.WELCOME);
        break;
      case STEPS.CHARACTER_DETAIL:
        setCurrentStep(STEPS.CHARACTER_BASIC);
        break;
      case STEPS.CHARACTER_RELATIONSHIPS:
        setCurrentStep(STEPS.CHARACTER_DETAIL);
        break;
      case STEPS.SCENARIO_BASIC:
        setCurrentStep(STEPS.CHARACTER_RELATIONSHIPS);
        break;
      case STEPS.SCENARIO_SETTING:
        setCurrentStep(STEPS.SCENARIO_BASIC);
        break;
      case STEPS.SCENARIO_CHARACTERS:
        setCurrentStep(STEPS.SCENARIO_SETTING);
        break;
      case STEPS.SCENARIO_GOALS:
        setCurrentStep(STEPS.SCENARIO_CHARACTERS);
        break;
      case STEPS.REVIEW:
        setCurrentStep(STEPS.SCENARIO_GOALS);
        break;
      default:
        break;
    }
  };

  // Complete the wizard and save data
  const completeWizard = () => {
    if (typeof onSave === 'function') {
      onSave(characterData, scenarioData);
    } else {
      console.error('onSave function not provided');
    }
  };

  // Check if current step is valid and can proceed
  const canProceed = () => {
    switch (currentStep) {
      case STEPS.CHARACTER_BASIC:
        return Boolean(characterData.name && characterData.age);
      case STEPS.SCENARIO_BASIC:
        return Boolean(scenarioData.title);
      default:
        return true;
    }
  };

  // Render the welcome step
  const renderWelcomeStep = () => (
    <div className="wizard-step-content">
      <div className="wizard-welcome">
        <h3>Character & Scenario Creation</h3>
        <p>Welcome to the guided setup process! We'll walk you through creating your character and scenario step by step.</p>
        
        <div className="wizard-options">
          <div className="wizard-option">
            <h4>Start from Scratch</h4>
            <p>Create your character and scenario step by step with our guided process.</p>
            <button className="wizard-option-btn" onClick={nextStep} type="button">
              Start Fresh <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="wizard-option-separator">OR</div>
          
          <div className="wizard-option">
            <h4>Generate with AI</h4>
            <p>Let AI create a complete character and scenario for you to customize.</p>
            <div className="wizard-option-buttons">
              <button 
                className="wizard-option-btn wizard-generate-btn" 
                onClick={() => {
                  generateRandomCharacter();
                  generateRandomScenario();
                  setCurrentStep(STEPS.REVIEW);
                }}
                disabled={isGenerating}
                type="button"
              >
                {isGenerating ? 'Generating...' : 'Generate Both'}
                <Sparkles size={16} className={isGenerating ? 'spinning' : ''} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render the character basic info step
  const renderCharacterBasicStep = () => (
    <div className="wizard-step-content">
      <h3>Basic Character Information</h3>
      
      <div className="wizard-form-group">
        <label htmlFor="character-name">Character Name</label>
        <input
          id="character-name"
          type="text"
          value={characterData.name || ''}
          onChange={(e) => setCharacterData({...characterData, name: e.target.value})}
          placeholder="Enter your character's name"
          className="wizard-input"
        />
      </div>
      
      <div className="wizard-form-group">
        <label htmlFor="character-age">Character Age</label>
        <input
          id="character-age"
          type="text"
          value={characterData.age || ''}
          onChange={(e) => setCharacterData({...characterData, age: e.target.value})}
          placeholder="How old is your character?"
          className="wizard-input"
        />
      </div>
      
      <div className="wizard-ai-suggestion">
        <button 
          className="wizard-ai-btn"
          onClick={generateRandomCharacter}
          disabled={isGenerating}
          type="button"
        >
          <Wand2 size={16} />
          Generate Random Character
        </button>
        <small>AI will create a complete character profile that you can customize.</small>
      </div>
    </div>
  );

  // Render the character details step
  const renderCharacterDetailStep = () => (
    <div className="wizard-step-content">
      <h3>Character Details</h3>
      
      <div className="wizard-form-group">
        <div className="wizard-label-with-ai">
          <label htmlFor="physical-description">Physical Description</label>
          <button 
            className="wizard-generate-field"
            onClick={() => generateField('character', 'physical_description', characterData.physicalDescription)}
            disabled={generatingField === 'physical_description'}
            type="button"
          >
            {generatingField === 'physical_description' ? 'Generating...' : <Wand2 size={14} />}
          </button>
        </div>
        <textarea
          id="physical-description"
          rows={3}
          value={characterData.physicalDescription || ''}
          onChange={(e) => setCharacterData({...characterData, physicalDescription: e.target.value})}
          placeholder="Describe your character's appearance, style, and physical traits..."
          className="wizard-textarea"
        />
      </div>
      
      <div className="wizard-form-group">
        <div className="wizard-label-with-ai">
          <label htmlFor="background">Background & History</label>
          <button 
            className="wizard-generate-field"
            onClick={() => generateField('character', 'background', characterData.background)}
            disabled={generatingField === 'background'}
            type="button"
          >
            {generatingField === 'background' ? 'Generating...' : <Wand2 size={14} />}
          </button>
        </div>
        <textarea
          id="background"
          rows={4}
          value={characterData.background || ''}
          onChange={(e) => setCharacterData({...characterData, background: e.target.value})}
          placeholder="Describe your character's background, history, and key life events..."
          className="wizard-textarea"
        />
      </div>
      
      <div className="wizard-form-group">
        <div className="wizard-label-with-ai">
          <label htmlFor="personality">Personality</label>
          <button 
            className="wizard-generate-field"
            onClick={() => generateField('character', 'personality', characterData.personality)}
            disabled={generatingField === 'personality'}
            type="button"
          >
            {generatingField === 'personality' ? 'Generating...' : <Wand2 size={14} />}
          </button>
        </div>
        <textarea
          id="personality"
          rows={3}
          value={characterData.personality || ''}
          onChange={(e) => setCharacterData({...characterData, personality: e.target.value})}
          placeholder="Describe your character's personality traits, flaws, and behaviors..."
          className="wizard-textarea"
        />
      </div>
    </div>
  );

  // Render the character relationships step
  const renderCharacterRelationshipsStep = () => (
    <div className="wizard-step-content">
      <h3>Character Relationships</h3>
      <p className="wizard-step-description">
        Define key relationships that will impact your character in the scenario.
      </p>
      
      {(!characterData.relationships || characterData.relationships.length === 0) && (
        <div className="wizard-empty-state">
          <p>No relationships added yet.</p>
        </div>
      )}
      
      {characterData.relationships && characterData.relationships.map((relationship, index) => (
        <div key={index} className="wizard-relationship-item">
          <div className="wizard-form-group">
            <label>Name</label>
            <input
              type="text"
              value={relationship.name || ''}
              onChange={(e) => updateRelationship(index, 'name', e.target.value)}
              placeholder="Person's name"
              className="wizard-input"
            />
          </div>
          
          <div className="wizard-form-group">
            <label>Relationship Type</label>
            <input
              type="text"
              value={relationship.relationshipType || ''}
              onChange={(e) => updateRelationship(index, 'relationshipType', e.target.value)}
              placeholder="e.g., Friend, Lover, Family, Rival"
              className="wizard-input"
            />
          </div>
          
          <div className="wizard-form-group">
            <label>Description</label>
            <textarea
              rows={2}
              value={relationship.description || ''}
              onChange={(e) => updateRelationship(index, 'description', e.target.value)}
              placeholder="Details about this relationship..."
              className="wizard-textarea"
            />
          </div>
          
          <button 
            className="wizard-remove-btn"
            onClick={() => removeRelationship(index)}
            type="button"
          >
            Remove
          </button>
        </div>
      ))}
      
      <button className="wizard-add-btn" onClick={addRelationship} type="button">
        Add Relationship
      </button>
    </div>
  );

  // Render the scenario basic info step
  const renderScenarioBasicStep = () => (
    <div className="wizard-step-content">
      <h3>Basic Scenario Information</h3>
      
      <div className="wizard-form-group">
        <label htmlFor="scenario-title">Scenario Title</label>
        <input
          id="scenario-title"
          type="text"
          value={scenarioData.title || ''}
          onChange={(e) => setScenarioData({...scenarioData, title: e.target.value})}
          placeholder="Give your scenario a meaningful title"
          className="wizard-input"
        />
      </div>
      
      <div className="wizard-form-group">
        <div className="wizard-label-with-ai">
          <label htmlFor="initial-situation">Initial Situation</label>
          <button 
            className="wizard-generate-field"
            onClick={() => generateField('scenario', 'initial_situation', scenarioData.initialSituation)}
            disabled={generatingField === 'initial_situation'}
            type="button"
          >
            {generatingField === 'initial_situation' ? 'Generating...' : <Wand2 size={14} />}
          </button>
        </div>
        <textarea
          id="initial-situation"
          rows={4}
          value={scenarioData.initialSituation || ''}
          onChange={(e) => setScenarioData({...scenarioData, initialSituation: e.target.value})}
          placeholder="Describe the situation at the start of your scenario. What has just happened? What state is your character in?"
          className="wizard-textarea"
        />
      </div>
      
      <div className="wizard-ai-suggestion">
        <button 
          className="wizard-ai-btn"
          onClick={generateRandomScenario}
          disabled={isGenerating}
          type="button"
        >
          <Wand2 size={16} />
          Generate Random Scenario
        </button>
        <small>AI will create a complete scenario that you can customize.</small>
      </div>
    </div>
  );

  // Render the scenario setting step
  const renderScenarioSettingStep = () => {
    // Safely access setting properties
    const setting = scenarioData.setting || {};
    
    return (
      <div className="wizard-step-content">
        <h3>Scenario Setting</h3>
        
        <div className="wizard-form-group">
          <label htmlFor="setting-location">Location</label>
          <input
            id="setting-location"
            type="text"
            value={setting.location || ''}
            onChange={(e) => setScenarioData({
              ...scenarioData, 
              setting: {...setting, location: e.target.value}
            })}
            placeholder="Where does the scenario take place?"
            className="wizard-input"
          />
        </div>
        
        <div className="wizard-form-group">
          <label htmlFor="setting-time">Time</label>
          <input
            id="setting-time"
            type="text"
            value={setting.time || ''}
            onChange={(e) => setScenarioData({
              ...scenarioData, 
              setting: {...setting, time: e.target.value}
            })}
            placeholder="When does the scenario take place? (time of day, year, era)"
            className="wizard-input"
          />
        </div>
        
        <div className="wizard-form-group">
          <label htmlFor="setting-atmosphere">Atmosphere</label>
          <input
            id="setting-atmosphere"
            type="text"
            value={setting.atmosphere || ''}
            onChange={(e) => setScenarioData({
              ...scenarioData, 
              setting: {...setting, atmosphere: e.target.value}
            })}
            placeholder="Describe the mood/atmosphere of the setting"
            className="wizard-input"
          />
        </div>
      </div>
    );
  };

  // Render the scenario characters step
  const renderScenarioCharactersStep = () => (
    <div className="wizard-step-content">
      <h3>Other Characters in Scenario</h3>
      <p className="wizard-step-description">
        Define other characters that will appear in your scenario.
      </p>
      
      {(!scenarioData.otherCharacters || scenarioData.otherCharacters.length === 0) && (
        <div className="wizard-empty-state">
          <p>No additional characters added yet.</p>
        </div>
      )}
      
      {scenarioData.otherCharacters && scenarioData.otherCharacters.map((character, index) => (
        <div key={index} className="wizard-character-item">
          <div className="wizard-form-group">
            <label>Name</label>
            <input
              type="text"
              value={character.name || ''}
              onChange={(e) => updateScenarioCharacter(index, 'name', e.target.value)}
              placeholder="Character's name"
              className="wizard-input"
            />
          </div>
          
          <div className="wizard-form-group">
            <label>Role</label>
            <input
              type="text"
              value={character.role || ''}
              onChange={(e) => updateScenarioCharacter(index, 'role', e.target.value)}
              placeholder="e.g., Antagonist, Ally, Mentor"
              className="wizard-input"
            />
          </div>
          
          <div className="wizard-form-group">
            <label>Description</label>
            <textarea
              rows={2}
              value={character.description || ''}
              onChange={(e) => updateScenarioCharacter(index, 'description', e.target.value)}
              placeholder="Physical and personality description..."
              className="wizard-textarea"
            />
          </div>
          
          <div className="wizard-form-group">
            <label>Relationship to Main Character</label>
            <input
              type="text"
              value={character.relationship || ''}
              onChange={(e) => updateScenarioCharacter(index, 'relationship', e.target.value)}
              placeholder="How do they relate to your character?"
              className="wizard-input"
            />
          </div>
          
          <button 
            className="wizard-remove-btn"
            onClick={() => removeScenarioCharacter(index)}
            type="button"
          >
            Remove
          </button>
        </div>
      ))}
      
      <button className="wizard-add-btn" onClick={addScenarioCharacter} type="button">
        Add Character
      </button>
    </div>
  );

  // Render the scenario goals step
  const renderScenarioGoalsStep = () => (
    <div className="wizard-step-content">
      <h3>Narrative Goals & Themes</h3>
      
      <div className="wizard-form-group">
        <div className="wizard-label-with-ai">
          <label htmlFor="narrative-goals">Narrative Goals</label>
          <button 
            className="wizard-generate-field"
            onClick={() => generateField('scenario', 'narrative_goals', scenarioData.narrativeGoals)}
            disabled={generatingField === 'narrative_goals'}
            type="button"
          >
            {generatingField === 'narrative_goals' ? 'Generating...' : <Wand2 size={14} />}
          </button>
        </div>
        <textarea
          id="narrative-goals"
          rows={3}
          value={scenarioData.narrativeGoals || ''}
          onChange={(e) => setScenarioData({...scenarioData, narrativeGoals: e.target.value})}
          placeholder="What are you hoping to explore in this scenario? What character development or themes are you interested in?"
          className="wizard-textarea"
        />
      </div>
      
      <div className="wizard-form-group">
        <label htmlFor="tone-themes">Tone and Themes</label>
        <textarea
          id="tone-themes"
          rows={3}
          value={scenarioData.toneAndThemes || ''}
          onChange={(e) => setScenarioData({...scenarioData, toneAndThemes: e.target.value})}
          placeholder="What is the emotional tone of this scenario? What themes should be emphasized?"
          className="wizard-textarea"
        />
      </div>
      
      <div className="wizard-form-group">
        <label htmlFor="roleplay-instructions">Roleplay Instructions (Optional)</label>
        <textarea
          id="roleplay-instructions"
          rows={3}
          value={scenarioData.roleplayInstructions || ''}
          onChange={(e) => setScenarioData({...scenarioData, roleplayInstructions: e.target.value})}
          placeholder="Any specific instructions for the AI in this roleplay? (Optional)"
          className="wizard-textarea"
        />
      </div>
    </div>
  );

  // Render the review step
  const renderReviewStep = () => {
    // Safely access setting properties
    const setting = scenarioData.setting || {};
    
    return (
      <div className="wizard-step-content">
        <h3>Review Your Setup</h3>
        <p className="wizard-step-description">
          Review your character and scenario details before starting your roleplay.
        </p>
        
        <div className="wizard-review-section">
          <h4 className="wizard-review-heading">
            <User size={16} />
            Character: {characterData.name || 'Unnamed'}
          </h4>
          <div className="wizard-review-details">
            <p><strong>Age:</strong> {characterData.age || 'Not specified'}</p>
            
            {characterData.physicalDescription && (
              <div className="wizard-review-item">
                <strong>Physical Description:</strong>
                <p className="wizard-review-text">{characterData.physicalDescription}</p>
              </div>
            )}
            
            {characterData.background && (
              <div className="wizard-review-item">
                <strong>Background:</strong>
                <p className="wizard-review-text">{characterData.background}</p>
              </div>
            )}
            
            {characterData.personality && (
              <div className="wizard-review-item">
                <strong>Personality:</strong>
                <p className="wizard-review-text">{characterData.personality}</p>
              </div>
            )}
            
            {characterData.relationships && characterData.relationships.length > 0 && (
              <div className="wizard-review-item">
                <strong>Relationships:</strong>
                <ul className="wizard-review-list">
                  {characterData.relationships.map((relationship, index) => (
                    <li key={index}>
                      <strong>{relationship.name || 'Unnamed'}</strong> 
                      {relationship.relationshipType ? ` (${relationship.relationshipType})` : ''}: 
                      {relationship.description || 'No description'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="wizard-regenerate-actions">
              <button 
                className="wizard-regenerate-btn" 
                onClick={generateRandomCharacter}
                disabled={isGenerating}
                type="button"
              >
                {isGenerating ? 'Regenerating...' : 'Regenerate Character'}
                {isGenerating && <RefreshCw size={16} className="spinning" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="wizard-review-section">
          <h4 className="wizard-review-heading">
            <Map size={16} />
            Scenario: {scenarioData.title || 'Untitled'}
          </h4>
          <div className="wizard-review-details">
            <div className="wizard-review-item">
              <strong>Setting:</strong>
              <p>
                {setting.location && (
                  <span><strong>Location:</strong> {setting.location} </span>
                )}
                {setting.time && (
                  <span><strong>Time:</strong> {setting.time} </span>
                )}
                {setting.atmosphere && (
                  <span><strong>Atmosphere:</strong> {setting.atmosphere}</span>
                )}
              </p>
            </div>
            
            {scenarioData.initialSituation && (
              <div className="wizard-review-item">
                <strong>Initial Situation:</strong>
                <p className="wizard-review-text">{scenarioData.initialSituation}</p>
              </div>
            )}
            
            {scenarioData.otherCharacters && scenarioData.otherCharacters.length > 0 && (
              <div className="wizard-review-item">
                <strong>Other Characters:</strong>
                <ul className="wizard-review-list">
                  {scenarioData.otherCharacters.map((character, index) => (
                    <li key={index}>
                      <strong>{character.name || 'Unnamed'}</strong>
                      {character.role ? ` (${character.role})` : ''}: 
                      {character.description || 'No description'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {scenarioData.narrativeGoals && (
              <div className="wizard-review-item">
                <strong>Narrative Goals:</strong>
                <p className="wizard-review-text">{scenarioData.narrativeGoals}</p>
              </div>
            )}
            
            {scenarioData.toneAndThemes && (
              <div className="wizard-review-item">
                <strong>Tone and Themes:</strong>
                <p className="wizard-review-text">{scenarioData.toneAndThemes}</p>
              </div>
            )}
            
            <div className="wizard-regenerate-actions">
              <button 
                className="wizard-regenerate-btn" 
                onClick={generateRandomScenario}
                disabled={isGenerating}
                type="button"
              >
                {isGenerating ? 'Regenerating...' : 'Regenerate Scenario'}
                {isGenerating && <RefreshCw size={16} className="spinning" />}
              </button>
            </div>
          </div>
        </div>
        
        <div className="wizard-complete">
          <button className="wizard-complete-btn" onClick={completeWizard} type="button">
            <CheckCircle size={18} />
            Start Roleplay
          </button>
        </div>
      </div>
    );
  };

  // Get the content for the current step
  const getStepContent = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return renderWelcomeStep();
      case STEPS.CHARACTER_BASIC:
        return renderCharacterBasicStep();
      case STEPS.CHARACTER_DETAIL:
        return renderCharacterDetailStep();
      case STEPS.CHARACTER_RELATIONSHIPS:
        return renderCharacterRelationshipsStep();
      case STEPS.SCENARIO_BASIC:
        return renderScenarioBasicStep();
      case STEPS.SCENARIO_SETTING:
        return renderScenarioSettingStep();
      case STEPS.SCENARIO_CHARACTERS:
        return renderScenarioCharactersStep();
      case STEPS.SCENARIO_GOALS:
        return renderScenarioGoalsStep();
      case STEPS.REVIEW:
        return renderReviewStep();
      default:
        return null;
    }
  };

  // Get the progress percentage
  const getProgressPercentage = () => {
    const stepsCount = Object.keys(STEPS).length;
    let currentStepIndex = 1; // Default to first step
    
    // Find the current step index
    Object.values(STEPS).forEach((step, index) => {
      if (step === currentStep) {
        currentStepIndex = index + 1;
      }
    });
    
    return (currentStepIndex / stepsCount) * 100;
  };

  // Get the step label
  const getStepLabel = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return 'Welcome';
      case STEPS.CHARACTER_BASIC:
        return 'Character Basics';
      case STEPS.CHARACTER_DETAIL:
        return 'Character Details';
      case STEPS.CHARACTER_RELATIONSHIPS:
        return 'Character Relationships';
      case STEPS.SCENARIO_BASIC:
        return 'Scenario Basics';
      case STEPS.SCENARIO_SETTING:
        return 'Scenario Setting';
      case STEPS.SCENARIO_CHARACTERS:
        return 'Scenario Characters';
      case STEPS.SCENARIO_GOALS:
        return 'Narrative Goals';
      case STEPS.REVIEW:
        return 'Review';
      default:
        return '';
    }
  };

  return (
    <div className="setup-wizard">
      <div className="wizard-header">
        <button 
          className="reset-btn" 
          onClick={onReset}
          type="button"
        >
          Start Over
        </button>
        <div className="wizard-progress">
          <div className="wizard-progress-label">{getStepLabel()}</div>
          <div className="wizard-progress-bar">
            <div 
              className="wizard-progress-fill" 
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="wizard-container">
        {getStepContent()}
      </div>
      
      {currentStep !== STEPS.WELCOME && currentStep !== STEPS.REVIEW && (
        <div className="wizard-navigation">
          <button 
            className="wizard-nav-btn wizard-prev-btn"
            onClick={prevStep}
            type="button"
          >
            <ArrowLeft size={16} />
            Previous
          </button>
          
          <button 
            className="wizard-nav-btn wizard-next-btn"
            onClick={nextStep}
            disabled={!canProceed()}
            type="button"
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default SetupWizard;
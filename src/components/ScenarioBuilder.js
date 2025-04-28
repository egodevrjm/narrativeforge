import React, { useState } from 'react';
import { RefreshCw, ScrollText } from 'lucide-react';
import RoleplayInstructions from './RoleplayInstructions';

const ScenarioBuilder = ({ onSave, initialData, geminiService, onReset }) => {
  const [scenarioData, setScenarioData] = useState(initialData || {
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

  const [isGenerating, setIsGenerating] = useState(false);
  const [showInstructionsEditor, setShowInstructionsEditor] = useState(false);

  // Save roleplay instructions
  const saveRoleplayInstructions = (instructions) => {
    setScenarioData({
      ...scenarioData,
      roleplayInstructions: instructions
    });
    setShowInstructionsEditor(false);
  };

  // Cancel editing instructions
  const cancelEditInstructions = () => {
    setShowInstructionsEditor(false);
  };

  // Generate random scenario using Gemini
  const generateRandomScenario = async () => {
    try {
      // Show loading state
      setIsGenerating(true);
      
      // If we have Gemini service, use it
      if (geminiService) {
        const prompt = `Create a detailed roleplay scenario with the following information:
        - Title (creative and evocative)
        - Setting (including location, time period, and atmosphere)
        - Initial situation (the starting point for the roleplay)
        - Other characters (at least 1-2 characters with descriptions)
        - Narrative goals (what the scenario aims to explore)
        - Tone and themes (emotional tone and thematic elements)
        
        Make the scenario compelling, rich with potential for character development, and interesting to explore.
        
        IMPORTANT: Return ONLY a valid JSON object with NO additional text, following this EXACT structure:
        
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
        }
        
        Do not include any explanation, preface, or conclusion. Respond ONLY with the JSON object.`;
        
        // Call Gemini API
        const response = await geminiService.generateGeneric(prompt);
        
        // Parse the response as JSON
        try {
          // Using a more robust approach to extract JSON
          try {
            // First attempt: Match content between curly braces including all nested content
            const jsonRegex = /\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g;
            const matches = response.match(jsonRegex);
            
            if (matches && matches.length > 0) {
              // Use the largest match (most complete JSON)
              const jsonString = matches.reduce((a, b) => a.length > b.length ? a : b);
              console.log('Extracted scenario JSON:', jsonString);
              
              try {
                const scenarioData = JSON.parse(jsonString);
                // Validate the JSON structure has the expected properties
                if (scenarioData.title && scenarioData.initialSituation) {
                  setScenarioData(scenarioData);
                } else {
                  throw new Error('JSON is missing required fields');
                }
              } catch (jsonError) {
                console.error('Invalid scenario JSON structure:', jsonError);
                throw new Error('Failed to parse extracted JSON: ' + jsonError.message);
              }
            } else {
              // If regex approach fails, try to manually construct a valid JSON
              console.log('Regex extraction failed, trying manual extraction');
              
              // Extract key-value pairs from the response
              const titleMatch = response.match(/"?title"?\s*:\s*"([^"]+)"/i);
              const locationMatch = response.match(/"?location"?\s*:\s*"([^"]+)"/i) || 
                                 response.match(/location[^:]*:\s*(.+?)(?=("\w+":|$))/is);
              const timeMatch = response.match(/"?time"?\s*:\s*"([^"]+)"/i) || 
                             response.match(/time[^:]*:\s*(.+?)(?=("\w+":|$))/is);
              const atmosphereMatch = response.match(/"?atmosphere"?\s*:\s*"([^"]+)"/i) || 
                                   response.match(/atmosphere[^:]*:\s*(.+?)(?=("\w+":|$))/is);
              const initialSituationMatch = response.match(/"?initialSituation"?\s*:\s*"([^"]+)"/i) || 
                                        response.match(/initial\s*situation[^:]*:\s*(.+?)(?=("\w+":|$))/is);
              const narrativeGoalsMatch = response.match(/"?narrativeGoals"?\s*:\s*"([^"]+)"/i) || 
                                      response.match(/narrative\s*goals[^:]*:\s*(.+?)(?=("\w+":|$))/is);
              const toneAndThemesMatch = response.match(/"?toneAndThemes"?\s*:\s*"([^"]+)"/i) || 
                                      response.match(/tone\s*and\s*themes[^:]*:\s*(.+?)(?=("\w+":|$))/is);
              
              // Create a minimum valid scenario object
              const manualScenario = {
                title: titleMatch ? titleMatch[1] : "Generated Scenario",
                setting: {
                  location: locationMatch ? locationMatch[1].trim() : "An intriguing location",
                  time: timeMatch ? timeMatch[1].trim() : "Present day",
                  atmosphere: atmosphereMatch ? atmosphereMatch[1].trim() : "Tense and mysterious"
                },
                initialSituation: initialSituationMatch ? initialSituationMatch[1].trim() : 
                  "You find yourself in an unusual situation that promises adventure and challenge.",
                otherCharacters: [
                  {
                    name: "Mystery Character",
                    role: "Key supporting character",
                    description: "This character was described in the AI response but couldn't be properly extracted.",
                    relationship: "Has a complex relationship with the protagonist"
                  }
                ],
                narrativeGoals: narrativeGoalsMatch ? narrativeGoalsMatch[1].trim() : 
                  "Explore themes of identity, challenge, and personal growth",
                toneAndThemes: toneAndThemesMatch ? toneAndThemesMatch[1].trim() : 
                  "Atmospheric, emotionally charged, with themes of transformation"
              };
              
              console.log('Manually constructed scenario:', manualScenario);
              setScenarioData(manualScenario);
            }
          } catch (extractionError) {
            console.error('All extraction attempts failed:', extractionError);
            console.log('Full AI response:', response);
            throw new Error('Failed to extract scenario data from AI response');
          }
        } catch (parseError) {
          console.error('Error parsing Gemini response for scenario:', parseError);
          console.log('Raw scenario response:', response);
          alert(`Failed to parse the AI-generated scenario: ${parseError.message}. Please try again.`);
        }
      } else {
        // Fallback for when Gemini service is not available
        const placeholderScenario = {
          title: "The Forgotten Lighthouse",
          setting: {
            location: "A remote lighthouse on a rocky peninsula, accessible only by a narrow causeway that disappears at high tide.",
            time: "Late autumn, present day, as fierce storms begin to batter the coast.",
            atmosphere: "Isolated, melancholic, with an underlying sense of mystery and foreboding."
          },
          initialSituation: "You've arrived to take the position of temporary lighthouse keeper after the mysterious disappearance of the previous caretaker. The local authorities claim he simply abandoned his post, but his personal belongings remain untouched, and strange entries in the logbook suggest otherwise. As you settle in for your first night, the radio crackles with fragmented warnings about the approaching storm, and you notice unusual lights moving in the waters below.",
          otherCharacters: [
            {
              name: "Eleanor Marsh",
              role: "Local historian and librarian",
              description: "A sharp-witted woman in her sixties with piercing gray eyes and silver hair always pinned in a neat bun. She carries herself with quiet authority and keeps a journal filled with local legends.",
              relationship: "Suspicious of outsiders but offers to help research the lighthouse's troubled history. Seems to know more than she initially reveals."
            },
            {
              name: "Samuel Keane",
              role: "Coast guard officer",
              description: "Mid-thirties, weathered face with a neatly trimmed beard. Always in uniform, with impeccable posture betraying a military background. A deep scar runs across his right hand.",
              relationship: "Official contact for the lighthouse position. Professional but evasive when questioned about the previous keeper."
            }
          ],
          narrativeGoals: "Uncover the truth behind the previous keeper's disappearance while confronting isolation, uncanny phenomena, and the possibility that something ancient has awakened in the depths. Explores themes of solitude, confronting the unknown, and the thin boundary between rational explanation and supernatural occurrence.",
          toneAndThemes: "Gothic mystery with elements of psychological suspense. Themes include isolation, the power of the sea, buried secrets, and the reliability of perception. The tone balances melancholy with tension, building toward revelation."
        };
        
        setScenarioData(placeholderScenario);
      }
    } catch (error) {
      console.error('Error generating scenario:', error);
      alert(`Failed to generate a random scenario: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Add another character to the scenario
  const addCharacter = () => {
    setScenarioData({
      ...scenarioData,
      otherCharacters: [
        ...scenarioData.otherCharacters,
        { name: '', role: '', description: '', relationship: '' }
      ]
    });
  };

  // Update character information
  const updateCharacter = (index, field, value) => {
    const updatedCharacters = [...scenarioData.otherCharacters];
    updatedCharacters[index] = {
      ...updatedCharacters[index],
      [field]: value
    };
    
    setScenarioData({
      ...scenarioData,
      otherCharacters: updatedCharacters
    });
  };

  // Remove a character
  const removeCharacter = (index) => {
    const updatedCharacters = scenarioData.otherCharacters.filter((_, i) => i !== index);
    setScenarioData({
      ...scenarioData,
      otherCharacters: updatedCharacters
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(scenarioData);
  };

  return (
    <div className="scenario-builder-container">
      <h2>Scenario Builder</h2>
      
      {/* Random Scenario Generation */}
      <div className="generation-controls">
        <button 
          type="button" 
          className="generate-btn" 
          onClick={generateRandomScenario}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Random Scenario'}
          <RefreshCw size={18} className={isGenerating ? 'spinning' : ''} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-actions-top">
          <button type="button" className="reset-btn" onClick={onReset}>
            Start Over
          </button>
        </div>
        {/* Title */}
        <div className="form-section">
          <h3>Scenario Title</h3>
          <input
            type="text"
            value={scenarioData.title}
            onChange={(e) => setScenarioData({...scenarioData, title: e.target.value})}
            placeholder="Give your scenario a meaningful title"
          />
        </div>

        {/* Setting */}
        <div className="form-section">
          <h3>Setting</h3>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              value={scenarioData.setting.location}
              onChange={(e) => setScenarioData({
                ...scenarioData, 
                setting: {...scenarioData.setting, location: e.target.value}
              })}
              placeholder="Where does the scenario take place?"
            />
          </div>
          
          <div className="form-group">
            <label>Time</label>
            <input
              type="text"
              value={scenarioData.setting.time}
              onChange={(e) => setScenarioData({
                ...scenarioData, 
                setting: {...scenarioData.setting, time: e.target.value}
              })}
              placeholder="When does the scenario take place? (time of day, year, era)"
            />
          </div>
          
          <div className="form-group">
            <label>Atmosphere</label>
            <input
              type="text"
              value={scenarioData.setting.atmosphere}
              onChange={(e) => setScenarioData({
                ...scenarioData, 
                setting: {...scenarioData.setting, atmosphere: e.target.value}
              })}
              placeholder="Describe the mood/atmosphere of the setting"
            />
          </div>
        </div>

        {/* Initial Situation */}
        <div className="form-section">
          <h3>Initial Situation</h3>
          <textarea
            rows={6}
            value={scenarioData.initialSituation}
            onChange={(e) => setScenarioData({...scenarioData, initialSituation: e.target.value})}
            placeholder="Describe the situation at the start of your scenario. What has just happened? What state is your character in?"
          />
        </div>

        {/* Other Characters */}
        <div className="form-section">
          <h3>Other Characters</h3>
          {scenarioData.otherCharacters.map((character, index) => (
            <div className="character-entry" key={index}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                  placeholder="Character's name"
                />
              </div>
              
              <div className="form-group">
                <label>Role in Scenario</label>
                <input
                  type="text"
                  value={character.role}
                  onChange={(e) => updateCharacter(index, 'role', e.target.value)}
                  placeholder="e.g., Antagonist, Supporting Character, etc."
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={character.description}
                  onChange={(e) => updateCharacter(index, 'description', e.target.value)}
                  placeholder="Physical and personality description..."
                />
              </div>
              
              <div className="form-group">
                <label>Relationship to Main Character</label>
                <textarea
                  rows={2}
                  value={character.relationship}
                  onChange={(e) => updateCharacter(index, 'relationship', e.target.value)}
                  placeholder="How does this character relate to the protagonist?"
                />
              </div>
              
              <button 
                type="button" 
                className="remove-btn"
                onClick={() => removeCharacter(index)}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button type="button" className="add-btn" onClick={addCharacter}>
            Add Character
          </button>
        </div>

        {/* Narrative Goals */}
        <div className="form-section">
          <h3>Narrative Goals</h3>
          <textarea
            rows={4}
            value={scenarioData.narrativeGoals}
            onChange={(e) => setScenarioData({...scenarioData, narrativeGoals: e.target.value})}
            placeholder="What are you hoping to explore in this scenario? What character development or themes are you interested in?"
          />
        </div>

        {/* Tone and Themes */}
        <div className="form-section">
          <h3>Tone and Themes</h3>
          <textarea
            rows={3}
            value={scenarioData.toneAndThemes}
            onChange={(e) => setScenarioData({...scenarioData, toneAndThemes: e.target.value})}
            placeholder="What is the emotional tone of this scenario? What themes should be emphasized?"
          />
        </div>

        {/* Roleplay Instructions */}
        <div className="form-section">
          <h3>Roleplay Instructions</h3>
          <div className="instructions-preview">
            {scenarioData.roleplayInstructions ? (
              <div className="instructions-content">
                <pre>{scenarioData.roleplayInstructions}</pre>
              </div>
            ) : (
              <p className="instructions-placeholder">No roleplay instructions defined yet. Click the button below to add detailed instructions for the AI.</p>
            )}
            <button 
              type="button" 
              className="edit-instructions-btn"
              onClick={() => setShowInstructionsEditor(true)}
            >
              <ScrollText size={16} />
              {scenarioData.roleplayInstructions ? 'Edit' : 'Add'} Roleplay Instructions
            </button>
          </div>
        </div>

        <button type="submit" className="save-btn">Save Scenario</button>
      </form>

      {/* Roleplay Instructions Modal */}
      {showInstructionsEditor && (
        <div className="modal-overlay">
          <div className="modal-content">
            <RoleplayInstructions 
              instructions={scenarioData.roleplayInstructions}
              onSave={saveRoleplayInstructions}
              onCancel={cancelEditInstructions}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioBuilder;
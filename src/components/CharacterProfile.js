import React, { useState } from 'react';
import { RefreshCw, Wand2 } from 'lucide-react';

const CharacterProfile = ({ onSave, initialData, geminiService, onReset }) => {
  const [characterData, setCharacterData] = useState(initialData || {
    name: '',
    age: '',
    physicalDescription: '',
    background: '',
    personality: '',
    relationships: [],
    additionalNotes: '',
  });

  // States for tracking generation process
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingAttribute, setGeneratingAttribute] = useState(null);

  const generateRandomCharacter = async () => {
    try {
      // Show loading state
      setIsGenerating(true);
      
      // If we have Gemini service, use it
      if (geminiService) {
        const prompt = `Create a detailed fictional character profile with the following information:
        - Age (between 18-80)
        - Detailed physical description (at least 3 paragraphs)
        - Background and history (at least 3 paragraphs, include childhood, family, and major life events)
        - Personality traits (include both strengths and flaws)
        - One key relationship with another character
        
        Make the character complex, nuanced, and interesting with a strong narrative potential. Include some unique or unexpected elements.
        
        IMPORTANT: Return ONLY a valid JSON object with NO additional text, following this EXACT structure:
        
        {
          "name": "Character's name",
          "age": "Character's age",
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
        }
        
        Do not include any explanation, preface, or conclusion. Respond ONLY with the JSON object.`;
        
        // Call Gemini API
        const response = await geminiService.generateGeneric(prompt);
        
        // Parse the response as JSON (it should be a JSON string)
        try {
          // Find the JSON in the response
          // Using a more robust approach to extract JSON
          try {
            // First attempt: Match content between curly braces including all nested content
            const jsonRegex = /\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g;
            const matches = response.match(jsonRegex);
            
            if (matches && matches.length > 0) {
              // Use the largest match (most complete JSON)
              const jsonString = matches.reduce((a, b) => a.length > b.length ? a : b);
              console.log('Extracted JSON:', jsonString);
              
              try {
                const characterData = JSON.parse(jsonString);
                // Validate the JSON structure has the expected properties
                if (characterData.name && characterData.age) {
                  setCharacterData(characterData);
                } else {
                  throw new Error('JSON is missing required fields');
                }
              } catch (jsonError) {
                console.error('Invalid JSON structure:', jsonError);
                throw new Error('Failed to parse extracted JSON: ' + jsonError.message);
              }
            } else {
              // If regex approach fails, try to manually construct a valid JSON
              console.log('Regex extraction failed, trying manual extraction');
              
              // Extract key-value pairs from the response
              const nameMatch = response.match(/"?name"?\s*:\s*"([^"]+)"/i);
              const ageMatch = response.match(/"?age"?\s*:\s*"?([\d]+)"?/i);
              const physDescMatch = response.match(/"?physicalDescription"?\s*:\s*"([^"]+)"/i) ||
                                  response.match(/physical\s*description[^:]*:\s*(.+?)(?=("\w+":|$))/is);
              const backgroundMatch = response.match(/"?background"?\s*:\s*"([^"]+)"/i) ||
                                   response.match(/background[^:]*:\s*(.+?)(?=("\w+":|$))/is);
              const personalityMatch = response.match(/"?personality"?\s*:\s*"([^"]+)"/i) ||
                                    response.match(/personality[^:]*:\s*(.+?)(?=("\w+":|$))/is);
              
              // Create a minimum valid character object
              const manualCharacter = {
                name: nameMatch ? nameMatch[1] : "", // Empty to prompt user to fill in
                age: ageMatch ? ageMatch[1] : "", // Empty to prompt user to fill in
                physicalDescription: physDescMatch ? physDescMatch[1].trim() : 
                  "The AI provided a description but it couldn't be properly extracted.",
                background: backgroundMatch ? backgroundMatch[1].trim() : 
                  "The AI provided a background but it couldn't be properly extracted.",
                personality: personalityMatch ? personalityMatch[1].trim() : 
                  "The AI provided personality details but they couldn't be properly extracted.",
                relationships: [],
                additionalNotes: "This character was generated with partial data extraction due to formatting issues with the AI response."
              };
              
              console.log('Manually constructed character:', manualCharacter);
              setCharacterData(manualCharacter);
            }
          } catch (extractionError) {
            console.error('All extraction attempts failed:', extractionError);
            console.log('Full AI response:', response);
            throw new Error('Failed to extract character data from AI response');
          }
        } catch (parseError) {
          console.error('Error parsing Gemini response:', parseError);
          console.log('Raw response:', response);
          alert(`Failed to parse the AI-generated character: ${parseError.message}. Please try again.`);
        }
      } else {
        // Fallback for when Gemini service is not available
        // Just use some placeholder data
        const placeholderCharacter = {
          name: "Alex Rivera",
          age: "34",
          physicalDescription: "Tall with a lanky build, Alex has olive skin and expressive hazel eyes that crinkle at the corners when they smile. Their dark curly hair is often pulled back in a messy bun, with a few rebellious strands framing a face marked by a prominent nose and a small scar above the left eyebrow from a childhood accident. Alex's hands are those of an artist - long fingers stained with various pigments that never quite wash away completely.",
          background: "Raised in a coastal town by their grandmother after their parents' divorce, Alex found solace in art from an early age. The seaside landscapes became their first subjects, evolving into more abstract expressions as they studied at a small art college on scholarship. After graduation, a series of odd jobs and a brief stint in corporate design led to burnout, prompting Alex to move to a rural area where they converted an old barn into a studio.",
          personality: "Introspective and thoughtful, Alex can appear aloof to strangers but shows deep loyalty to their small circle of friends. They struggle with perfectionism in their art and have periods of intense creativity followed by self-doubt. While generally even-tempered, they can be stubbornly principled about matters of artistic integrity.",
          relationships: [
            {
              name: "Jordan Chen",
              relationshipType: "Former partner, now close friend",
              description: "Met in art school, dated for three years before amicably separating. Jordan now runs a gallery in the city and occasionally features Alex's work. Their friendship survived the romantic breakup and evolved into a supportive professional relationship."
            }
          ],
          additionalNotes: "Currently working on a series of installations exploring memory and place. Keeps unusual hours, often working through the night when inspiration strikes. Has a rescue cat named Palette who has one blue eye and one green eye."
        };
        
        setCharacterData(placeholderCharacter);
      }
    } catch (error) {
      console.error('Error generating character:', error);
      alert(`Failed to generate a random character: ${error.message}. Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateAttribute = async (attribute, currentValue) => {
    try {
      // Show loading for this specific attribute
      setGeneratingAttribute(attribute);
      
      // If we have Gemini service, use it
      if (geminiService) {
        let prompt;
        
        switch(attribute) {
          case 'physicalDescription':
            prompt = `Expand and enhance this physical description of a character: "${currentValue || 'No current description'}".
            Write a detailed 2-3 paragraph physical description that includes appearance, clothing style, and distinctive features.
            If the current description is empty or minimal, create a rich and detailed physical description that would be interesting for a roleplaying character.
            
            Return ONLY the expanded description with no introduction, explanation, or conclusion. Do not include any statements about what you're doing - just provide the description text itself.`;
            break;
            
          case 'background':
            prompt = `Expand and enhance this character background: "${currentValue || 'No current background'}". 
            Write a detailed 3-4 paragraph background that includes childhood, key life events, traumas or achievements, and how these shaped the character.
            Make it nuanced, emotionally resonant, and with narrative potential.
            If the current background is empty or minimal, create a rich and detailed backstory that would be interesting for a roleplaying character.
            
            Return ONLY the expanded background with no introduction, explanation, or conclusion. Do not include any statements about what you're doing - just provide the background text itself.`;
            break;
            
          case 'personality':
            prompt = `Expand and enhance this character personality description: "${currentValue || 'No current personality'}". 
            Write a detailed paragraph about the character's personality traits, including both strengths and flaws, emotional tendencies, how they relate to others, and what drives them.
            If the current description is empty or minimal, create a complex and nuanced personality that would be interesting for a roleplaying character.
            
            Return ONLY the expanded personality description with no introduction, explanation, or conclusion. Do not include any statements about what you're doing - just provide the personality text itself.`;
            break;
            
          default:
            prompt = `Enhance this text for a character profile: "${currentValue || 'No current text'}". 
            Make it more detailed, nuanced, and interesting for a roleplaying character.
            
            Return ONLY the enhanced text with no introduction, explanation, or conclusion.`;
        }
        
        // Call Gemini API
        try {
          const response = await geminiService.generateGeneric(prompt);
          
          // Clean the response - remove any "Here's an expanded..." or similar text
          const cleanedResponse = response
            .replace(/^(here('s| is) (the |an |a )?(expanded|enhanced|detailed|improved).*?:\s*)/i, '')
            .replace(/^(I('ve| have) (expanded|enhanced|created).*?:\s*)/i, '')
            .replace(/^(As requested.*?:\s*)/i, '')
            .replace(/^(based on your.*?:\s*)/i, '')
            .trim();
          
          // Update the specific attribute
          setCharacterData(prev => ({
            ...prev,
            [attribute]: cleanedResponse
          }));
        } catch (apiError) {
          console.error(`API error when generating ${attribute}:`, apiError);
          alert(`Error generating ${attribute}: ${apiError.message}. Please try again.`);
        }
      } else {
        // Fallback for when Gemini service is not available
        alert('AI service is not available. Please check your API key or refresh the page to try again.');
      }
    } catch (error) {
      console.error(`Error generating ${attribute}:`, error);
      alert(`Failed to generate ${attribute}: ${error.message}. Please try again.`);
    } finally {
      setGeneratingAttribute(null);
    }
  };

  // Add a new relationship field
  const addRelationship = () => {
    setCharacterData({
      ...characterData,
      relationships: [
        ...characterData.relationships,
        { name: '', relationshipType: '', description: '' }
      ]
    });
  };

  // Update relationship field
  const updateRelationship = (index, field, value) => {
    const updatedRelationships = [...characterData.relationships];
    updatedRelationships[index] = {
      ...updatedRelationships[index],
      [field]: value
    };
    
    setCharacterData({
      ...characterData,
      relationships: updatedRelationships
    });
  };

  // Remove a relationship field
  const removeRelationship = (index) => {
    const updatedRelationships = characterData.relationships.filter((_, i) => i !== index);
    setCharacterData({
      ...characterData,
      relationships: updatedRelationships
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Check for required fields before saving
    if (!characterData.name || !characterData.age) {
      alert("Please provide both a name and age for your character before saving.");
      return;
    }
    onSave(characterData);
  };

  return (
    <div className="character-profile-container">
      <h2>Character Profile</h2>
      
      {/* Random Character Generation */}
      <div className="generation-controls">
        <button 
          type="button" 
          className="generate-btn" 
          onClick={generateRandomCharacter}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate Random Character'}
          <RefreshCw size={18} className={isGenerating ? 'spinning' : ''} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-actions-top">
          <button type="button" className="reset-btn" onClick={onReset}>
            Start Over
          </button>
        </div>
        {/* Basic Info */}
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-group">
            <label>Name <span className="required-field">*</span></label>
            <div className="input-with-button">
              <input
                type="text"
                value={characterData.name}
                onChange={(e) => setCharacterData({...characterData, name: e.target.value})}
                placeholder="Character's name"
                className={!characterData.name ? "highlight-missing" : ""}
              />
              {!characterData.name && (
                <div className="missing-field-message">
                  Character name is required. Please enter a name.
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label>Age <span className="required-field">*</span></label>
            <div className="input-with-button">
              <input
                type="text"
                value={characterData.age}
                onChange={(e) => setCharacterData({...characterData, age: e.target.value})}
                placeholder="Character's age"
                className={!characterData.age ? "highlight-missing" : ""}
              />
              {!characterData.age && (
                <div className="missing-field-message">
                  Character age is required. Please enter an age.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Physical Description */}
        <div className="form-section">
          <h3>Physical Description</h3>
          <div className="textarea-with-generate">
            <textarea
              rows={5}
              value={characterData.physicalDescription}
              onChange={(e) => setCharacterData({...characterData, physicalDescription: e.target.value})}
              placeholder="Describe your character's physical appearance..."
            />
            <button 
              type="button" 
              className="attribute-generate-btn" 
              onClick={() => generateAttribute('physicalDescription', characterData.physicalDescription)}
              disabled={generatingAttribute === 'physicalDescription'}
              title="Enhance this description using AI"
            >
              {generatingAttribute === 'physicalDescription' ? '...' : <Wand2 size={16} />}
            </button>
          </div>
        </div>

        {/* Background */}
        <div className="form-section">
          <h3>Background & History</h3>
          <div className="textarea-with-generate">
            <textarea
              rows={6}
              value={characterData.background}
              onChange={(e) => setCharacterData({...characterData, background: e.target.value})}
              placeholder="Detail your character's background, upbringing, significant events..."
            />
            <button 
              type="button" 
              className="attribute-generate-btn" 
              onClick={() => generateAttribute('background', characterData.background)}
              disabled={generatingAttribute === 'background'}
              title="Enhance this background using AI"
            >
              {generatingAttribute === 'background' ? '...' : <Wand2 size={16} />}
            </button>
          </div>
        </div>

        {/* Personality */}
        <div className="form-section">
          <h3>Personality</h3>
          <div className="textarea-with-generate">
            <textarea
              rows={4}
              value={characterData.personality}
              onChange={(e) => setCharacterData({...characterData, personality: e.target.value})}
              placeholder="Describe your character's personality traits, fears, desires..."
            />
            <button 
              type="button" 
              className="attribute-generate-btn" 
              onClick={() => generateAttribute('personality', characterData.personality)}
              disabled={generatingAttribute === 'personality'}
              title="Enhance this personality description using AI"
            >
              {generatingAttribute === 'personality' ? '...' : <Wand2 size={16} />}
            </button>
          </div>
        </div>

        {/* Relationships */}
        <div className="form-section">
          <h3>Key Relationships</h3>
          {characterData.relationships.map((relationship, index) => (
            <div className="relationship-entry" key={index}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={relationship.name}
                  onChange={(e) => updateRelationship(index, 'name', e.target.value)}
                  placeholder="Person's name"
                />
              </div>
              
              <div className="form-group">
                <label>Relationship Type</label>
                <input
                  type="text"
                  value={relationship.relationshipType}
                  onChange={(e) => updateRelationship(index, 'relationshipType', e.target.value)}
                  placeholder="e.g., Friend, Lover, Family"
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={relationship.description}
                  onChange={(e) => updateRelationship(index, 'description', e.target.value)}
                  placeholder="Details about this relationship..."
                />
              </div>
              
              <button 
                type="button" 
                className="remove-btn"
                onClick={() => removeRelationship(index)}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button type="button" className="add-btn" onClick={addRelationship}>
            Add Relationship
          </button>
        </div>

        {/* Additional Notes */}
        <div className="form-section">
          <h3>Additional Notes</h3>
          <textarea
            rows={4}
            value={characterData.additionalNotes}
            onChange={(e) => setCharacterData({...characterData, additionalNotes: e.target.value})}
            placeholder="Any other important details about your character..."
          />
        </div>

        <button type="submit" className="save-btn">Save Character</button>
      </form>
    </div>
  );
};

export default CharacterProfile;
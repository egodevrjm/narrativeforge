import React, { useState } from 'react';
import { RefreshCw, FileText } from 'lucide-react';

/**
 * QuickSetup - A streamlined setup component allowing users to input
 * all character and scenario details in a single text area
 */
const QuickSetup = ({ onSave, geminiService, onReset }) => {
  const [setupText, setSetupText] = useState('');
  
  // Sample content for quick setup
  const sampleContent = `Character name: Alex Morgan
Character age: 29
Physical description: Tall with dark brown hair often tied in a ponytail. Athletic build from years of running. Has a small scar above their right eyebrow from a childhood accident. Usually dresses in comfortable, practical clothing - jeans, fitted t-shirts, and a well-worn leather jacket.

Background: Grew up in a small coastal town before moving to the city for university. Studied journalism but dropped out in final year after uncovering corruption in the university administration. Now works as a freelance investigative journalist, specializing in environmental issues. Lives in a small apartment filled with books, plants, and collected souvenirs from travels.

Personality: Determined and persistent, sometimes to the point of obsession. Deeply loyal to friends but struggles to maintain romantic relationships due to workaholic tendencies. Values truth and justice above personal comfort. Has a dry sense of humor that emerges when comfortable. Tends to be suspicious of authority figures.

Relationships: Has a complicated relationship with former mentor, James Chen, who now works for a major news corporation that Alex believes has compromised its integrity for corporate interests.

Scenario title: The Blackwater Files

Location: Blackwater Bay, a once-thriving fishing town now struggling after the opening of Meridian Chemical's processing plant on the outskirts

Time: Present day, autumn, when the tourist season has ended and the town is quieter

Atmosphere: Tense, mysterious, with an underlying sense of decay and secrecy

Initial situation: You've returned to Blackwater Bay, your hometown, after receiving an anonymous tip about unusual illness patterns among residents. The local doctor who first noticed the trend, Dr. Eliza Hayes, was recently found dead in what officials ruled a suicide. Your source suggests otherwise and claims it's connected to the chemical plant. Upon arrival, you notice strange security measures at the plant and unusual resistance from town officials when you start asking questions.

Narrative goals: Uncover the truth about Dr. Hayes' death and the potential environmental hazard, while navigating old relationships and new dangers in your hometown.

Tone and themes: Environmental justice, small-town secrets, corporate corruption, personal redemption, the cost of truth`;
  
  // Function to load sample content
  const loadSampleContent = () => {
    setSetupText(sampleContent);
  };
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState(null);

  // Process the text and try to extract character and scenario information
  const processSetupText = async () => {
    try {
      setIsProcessing(true);
      setProcessingError(null);

      if (!setupText.trim()) {
        setProcessingError('Please enter some text before processing');
        return;
      }

      // Option 1: Use Gemini to parse the input if service is available
      if (geminiService) {
        const prompt = `Extract character and scenario details from the following roleplay setup text. 
        
        TEXT:
        ${setupText}
        
        INSTRUCTIONS:
        Return a valid JSON object containing two nested objects: 'character' and 'scenario'. Follow this exact structure:
        
        {
          "character": {
            "name": "Character's name (extract or use 'Unnamed Character' if not found)",
            "age": "Character's age (extract or use '25' if not found)",
            "physicalDescription": "Character's physical description (extract or use empty string if not found)",
            "background": "Character's background (extract or use empty string if not found)",
            "personality": "Character's personality (extract or use empty string if not found)",
            "relationships": [
              {
                "name": "Related character's name",
                "relationshipType": "Type of relationship",
                "description": "Description of the relationship"
              }
            ],
            "additionalNotes": "Any additional character details"
          },
          "scenario": {
            "title": "Scenario title (extract or use 'Untitled Scenario' if not found)",
            "setting": {
              "location": "Scenario location (extract or use empty string if not found)",
              "time": "Time period (extract or use 'Present day' if not found)",
              "atmosphere": "Atmosphere description (extract or use empty string if not found)"
            },
            "initialSituation": "Initial situation (extract or use a summary of the input if not explicit)",
            "otherCharacters": [
              {
                "name": "NPC name",
                "role": "NPC role",
                "description": "NPC description",
                "relationship": "Relationship to main character"
              }
            ],
            "narrativeGoals": "Narrative goals (extract or use empty string if not found)",
            "toneAndThemes": "Tone and themes (extract or use empty string if not found)",
            "roleplayInstructions": "Any explicit roleplay instructions (extract or use empty string if not found)"
          }
        }
        
        Do your best to extract meaningful information even if the text is not structured. If relationships or other characters aren't explicitly mentioned, create reasonable entries based on the context, or leave arrays empty if there's nothing to work with. Only respond with the JSON object and no other text.`;

        try {
          const response = await geminiService.generateGeneric(prompt);
          
          // Try to parse the JSON response
          try {
            // Find the JSON in the response using a regex
            const jsonRegex = /\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/g;
            const matches = response.match(jsonRegex);
            
            if (matches && matches.length > 0) {
              // Use the largest match (most complete JSON)
              const jsonString = matches.reduce((a, b) => a.length > b.length ? a : b);
              const parsedData = JSON.parse(jsonString);
              
              // Validate the data structure
              if (parsedData.character && parsedData.scenario) {
                // Success! Pass the data to parent
                onSave(parsedData.character, parsedData.scenario);
                return;
              } else {
                throw new Error('Parsed JSON is missing required character or scenario data');
              }
            } else {
              throw new Error('Failed to extract JSON from AI response');
            }
          } catch (jsonError) {
            console.error('JSON parsing error:', jsonError);
            setProcessingError(`Failed to extract character and scenario data: ${jsonError.message}`);
          }
        } catch (aiError) {
          console.error('AI processing error:', aiError);
          setProcessingError(`AI processing failed: ${aiError.message}`);
        }
      } else {
        // Option 2: Manual basic extraction (fallback if no AI service)
        performBasicExtraction();
      }
    } catch (error) {
      console.error('Setup processing error:', error);
      setProcessingError(`An error occurred: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Basic extraction logic without AI (very limited)
  const performBasicExtraction = () => {
    const lines = setupText.split('\n');
    const character = {
      name: extractValue(lines, 'name:') || 'Unnamed Character',
      age: extractValue(lines, 'age:') || '25',
      physicalDescription: extractValue(lines, 'physical description:') || '',
      background: extractValue(lines, 'background:') || '',
      personality: extractValue(lines, 'personality:') || '',
      relationships: [],
      additionalNotes: ''
    };

    const scenario = {
      title: extractValue(lines, 'title:') || 'Untitled Scenario',
      setting: {
        location: extractValue(lines, 'location:') || '',
        time: extractValue(lines, 'time:') || 'Present day',
        atmosphere: extractValue(lines, 'atmosphere:') || ''
      },
      initialSituation: extractValue(lines, 'initial situation:') || setupText.substring(0, 500),
      otherCharacters: [],
      narrativeGoals: extractValue(lines, 'goals:') || '',
      toneAndThemes: extractValue(lines, 'tone:') || '',
      roleplayInstructions: ''
    };

    // Try to extract relationships
    const relationshipMatch = setupText.match(/relationship[^:]*:([^\.]+)/i);
    if (relationshipMatch && relationshipMatch[1]) {
      character.relationships.push({
        name: 'Extracted Character',
        relationshipType: 'Relationship',
        description: relationshipMatch[1].trim()
      });
    }

    // Try to extract other characters
    const characterMatch = setupText.match(/character[^:]*:([^\.]+)/i);
    if (characterMatch && characterMatch[1]) {
      scenario.otherCharacters.push({
        name: 'Extracted Character',
        role: 'Supporting Character',
        description: characterMatch[1].trim(),
        relationship: 'Unknown'
      });
    }

    onSave(character, scenario);
  };

  // Helper to extract values from text lines
  const extractValue = (lines, key) => {
    const regex = new RegExp(key, 'i');
    const line = lines.find(l => regex.test(l));
    if (line) {
      const parts = line.split(/:\s*/);
      if (parts.length > 1) {
        return parts.slice(1).join(':').trim();
      }
    }
    return '';
  };

  return (
    <div className="quick-setup-container">
      <h2>Quick Setup Mode</h2>
      <p className="setup-description">
        Paste your entire character and scenario setup in the box below. 
        The AI will try to extract all relevant information in one go.
      </p>

      <div className="form-actions-top">
        <button type="button" className="reset-btn" onClick={onReset}>
          Start Over
        </button>
        <button type="button" className="sample-btn" onClick={loadSampleContent}>
          <FileText size={16} />
          Load Sample
        </button>
      </div>

      <div className="setup-form">
        <textarea
          className="setup-textarea"
          value={setupText}
          onChange={(e) => setSetupText(e.target.value)}
          rows={15}
          placeholder={`Paste or type all your character and scenario details here. Try to include:

Character name: 
Character age: 
Physical description: 
Background: 
Personality: 
Relationships: 

Scenario title: 
Location: 
Time: 
Atmosphere: 
Initial situation: 
Other characters: 
Narrative goals: 
Tone and themes: 

The AI will attempt to parse this information, even if it's not perfectly structured.`}
        />

        {processingError && (
          <div className="processing-error">
            <p>{processingError}</p>
          </div>
        )}

        <div className="setup-actions">
          <button 
            type="button" 
            className="process-btn" 
            onClick={processSetupText}
            disabled={isProcessing || !setupText.trim()}
          >
            {isProcessing ? 'Processing...' : 'Process and Start Roleplay'}
            {isProcessing && <RefreshCw size={18} className="spinning" />}
          </button>
        </div>
      </div>

      <div className="quick-setup-help">
        <h3>Tips for best results:</h3>
        <ul>
          <li>Include clear labels like "Character name:" or "Location:" to help the AI identify information.</li>
          <li>Provide as much detail as you can about both the character and scenario.</li>
          <li>If you have specific roleplay instructions, label them clearly as "Roleplay instructions:"</li>
          <li>The AI will make its best guess at extracting information, but you can always edit details in the chat.</li>
        </ul>
      </div>
    </div>
  );
};

export default QuickSetup;
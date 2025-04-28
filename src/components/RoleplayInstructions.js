import React, { useState } from 'react';

const RoleplayInstructions = ({ instructions, onSave, onCancel }) => {
  const [instructionsText, setInstructionsText] = useState(instructions || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(instructionsText);
  };

  return (
    <div className="roleplay-instructions-container">
      <h2>Roleplay Instructions</h2>
      <p className="instructions-description">
        Define the ground rules and expectations for your roleplay session. 
        These instructions will guide the AI on how to respond and what roles each participant plays.
      </p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <textarea
            className="instructions-textarea"
            value={instructionsText}
            onChange={(e) => setInstructionsText(e.target.value)}
            rows={15}
            placeholder={`Enter your roleplay instructions here. For example:

📜** Roleplay Instructions for [Character Name] **
You are running a fully immersive, single-player roleplay. The player has just [describe starting situation].

**Player Control:**
* **I am [Character Name]. I control my actions, thoughts, dialogue, and decisions.**
* **You control the environment, other characters, events, and opportunities.**
* **Never invent the player's actions, thoughts, or decisions unless explicitly asked.**
* **Wait for the player to choose an action at every key point.**

[Additional specific instructions for this roleplay...]`}
          />
        </div>
        
        <div className="instructions-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="save-btn">
            Save Instructions
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleplayInstructions;
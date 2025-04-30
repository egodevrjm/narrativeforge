import React, { useState, useEffect } from 'react';
import CharacterEditor from './CharacterEditor';
import SupabaseService from '../../services/supabase/supabaseService';
import './AdminStyles.css';

const ScenarioEditor = ({ scenario, isNew, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    is_default: false,
    content: {},
  });
  const [characters, setCharacters] = useState([]);
  const [showCharacterEditor, setShowCharacterEditor] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with scenario data if editing
  useEffect(() => {
    if (!isNew && scenario) {
      // Parse the content from string if needed
      let contentObj = scenario.content;
      if (typeof contentObj === 'string') {
        try {
          contentObj = JSON.parse(contentObj);
        } catch (err) {
          console.error('Error parsing scenario content:', err);
          contentObj = {};
        }
      }

      setFormData({
        id: scenario.id,
        title: scenario.title || '',
        description: scenario.description || '',
        category: scenario.category || '',
        is_default: scenario.is_default || false,
        content: contentObj || {},
      });

      if (scenario.characters) {
        setCharacters(scenario.characters);
      } else {
        loadCharacters(scenario.id);
      }
    }
  }, [isNew, scenario]);

  const loadCharacters = async (scenarioId) => {
    try {
      setLoading(true);
      const data = await SupabaseService.getCharactersForScenario(scenarioId);
      setCharacters(data);
    } catch (err) {
      console.error('Error loading characters:', err);
      setError('Failed to load characters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [name]: value
      }
    }));
  };

  const handleAddCharacter = () => {
    setSelectedCharacter(null);
    setShowCharacterEditor(true);
  };

  const handleEditCharacter = (character) => {
    setSelectedCharacter(character);
    setShowCharacterEditor(true);
  };

  const handleDeleteCharacter = async (characterId) => {
    if (window.confirm('Are you sure you want to delete this character?')) {
      try {
        setLoading(true);
        await SupabaseService.deleteCharacter(characterId);
        setCharacters(prev => prev.filter(c => c.id !== characterId));
      } catch (err) {
        console.error('Error deleting character:', err);
        setError('Failed to delete character. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveCharacter = async (characterData, isNewCharacter) => {
    try {
      setLoading(true);
      let savedCharacter;
      
      if (isNewCharacter) {
        // For new characters, we need the scenario ID
        if (!isNew && scenario?.id) {
          characterData.scenario_id = scenario.id;
          savedCharacter = await SupabaseService.createCharacter(characterData);
        } else {
          // If we're creating both a new scenario and character,
          // we'll add the character to the local state for now
          savedCharacter = {
            ...characterData,
            id: `temp-${Date.now()}`, // Temporary ID
            is_temp: true
          };
        }
      } else {
        // Update existing character
        savedCharacter = await SupabaseService.updateCharacter(
          characterData.id, 
          characterData
        );
      }
      
      if (isNewCharacter) {
        setCharacters(prev => [...prev, savedCharacter]);
      } else {
        setCharacters(prev => 
          prev.map(c => c.id === savedCharacter.id ? savedCharacter : c)
        );
      }
      
      setShowCharacterEditor(false);
    } catch (err) {
      console.error('Error saving character:', err);
      setError('Failed to save character. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    try {
      // Create or update the scenario
      const scenarioToSave = {
        ...formData,
        content: JSON.stringify(formData.content),
      };
      
      await onSave(scenarioToSave, isNew);
    } catch (err) {
      console.error('Error saving scenario:', err);
      setError('Failed to save scenario. Please try again.');
    }
  };

  return (
    <div className="admin-scenario-editor">
      {showCharacterEditor ? (
        <CharacterEditor 
          character={selectedCharacter}
          isNew={!selectedCharacter}
          onSave={handleSaveCharacter}
          onCancel={() => setShowCharacterEditor(false)}
        />
      ) : (
        <>
          <h2>{isNew ? 'Create New Scenario' : 'Edit Scenario'}</h2>
          
          {error && (
            <div className="admin-error-message">
              {error}
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />
            </div>
            
            <div className="admin-form-checkbox">
              <input
                type="checkbox"
                id="is_default"
                name="is_default"
                checked={formData.is_default}
                onChange={handleChange}
              />
              <label htmlFor="is_default">
                Make this a default scenario (visible to all users)
              </label>
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="content_setting">Setting</label>
              <textarea
                id="content_setting"
                name="setting"
                value={formData.content.setting || ''}
                onChange={handleContentChange}
                rows={3}
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="content_plotHooks">Plot Hooks</label>
              <textarea
                id="content_plotHooks"
                name="plotHooks"
                value={formData.content.plotHooks || ''}
                onChange={handleContentChange}
                rows={3}
              />
            </div>
            
            <div className="admin-form-group">
              <label htmlFor="content_themes">Themes</label>
              <textarea
                id="content_themes"
                name="themes"
                value={formData.content.themes || ''}
                onChange={handleContentChange}
                rows={3}
              />
            </div>
            
            <div className="admin-section">
              <h3>Characters</h3>
              
              {loading ? (
                <div className="admin-loading">Loading characters...</div>
              ) : (
                <>
                  {characters.length === 0 ? (
                    <div className="admin-empty-state">
                      <p>No characters added yet. Add a character to this scenario.</p>
                    </div>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Default</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {characters.map(character => (
                          <tr key={character.id}>
                            <td>{character.name}</td>
                            <td>
                              <span className={`scenario-badge ${character.is_default ? 'default' : 'custom'}`}>
                                {character.is_default ? 'Default' : 'Custom'}
                              </span>
                            </td>
                            <td className="actions-cell">
                              <button 
                                type="button"
                                className="admin-action-button edit"
                                onClick={() => handleEditCharacter(character)}
                              >
                                Edit
                              </button>
                              <button 
                                type="button"
                                className="admin-action-button delete"
                                onClick={() => handleDeleteCharacter(character.id)}
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  
                  <button 
                    type="button"
                    className="admin-button primary"
                    onClick={handleAddCharacter}
                  >
                    Add Character
                  </button>
                </>
              )}
            </div>
            
            <div className="admin-form-actions">
              <button 
                type="button" 
                className="admin-button"
                onClick={onCancel}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="admin-button primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Scenario'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ScenarioEditor;
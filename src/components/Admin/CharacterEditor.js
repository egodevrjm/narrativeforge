import React, { useState, useEffect } from 'react';
import './AdminStyles.css';

const CharacterEditor = ({ character, isNew, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    background: '',
    personality: '',
    appearance: '',
    is_default: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize form with character data if editing
  useEffect(() => {
    if (!isNew && character) {
      setFormData({
        id: character.id,
        name: character.name || '',
        background: character.background || '',
        personality: character.personality || '',
        appearance: character.appearance || '',
        is_default: character.is_default || false,
        scenario_id: character.scenario_id
      });
    }
  }, [isNew, character]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    
    try {
      setLoading(true);
      await onSave(formData, isNew);
    } catch (err) {
      console.error('Error saving character:', err);
      setError('Failed to save character. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-character-editor">
      <h2>{isNew ? 'Create New Character' : 'Edit Character'}</h2>
      
      {error && (
        <div className="admin-error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="admin-form">
        <div className="admin-form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="appearance">Appearance</label>
          <textarea
            id="appearance"
            name="appearance"
            value={formData.appearance}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="background">Background</label>
          <textarea
            id="background"
            name="background"
            value={formData.background}
            onChange={handleChange}
            rows={4}
          />
        </div>
        
        <div className="admin-form-group">
          <label htmlFor="personality">Personality</label>
          <textarea
            id="personality"
            name="personality"
            value={formData.personality}
            onChange={handleChange}
            rows={4}
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
            Make this a default character (visible to all users)
          </label>
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
            {loading ? 'Saving...' : 'Save Character'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CharacterEditor;
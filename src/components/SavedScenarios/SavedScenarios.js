import React, { useState, useEffect } from 'react';
import { Save, Download, Trash2, X } from 'lucide-react';
import './SavedScenarios.css';

const SavedScenarios = ({ onLoadScenario, onClose, currentScenario, currentCharacter }) => {
  const [savedScenarios, setSavedScenarios] = useState([]);
  const [scenarioName, setScenarioName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved scenarios from localStorage on component mount
  useEffect(() => {
    loadSavedScenarios();
  }, []);

  // Load saved scenarios from localStorage
  const loadSavedScenarios = () => {
    try {
      const scenariosJSON = localStorage.getItem('narrativeforge_scenarios') || '[]';
      const scenarios = JSON.parse(scenariosJSON);
      setSavedScenarios(scenarios);
    } catch (error) {
      console.error('Error loading saved scenarios:', error);
      setSavedScenarios([]);
    }
  };

  // Save the current scenario
  const saveCurrentScenario = () => {
    if (!currentScenario || !currentCharacter) {
      alert('No active scenario to save. Please create a character and scenario first.');
      return;
    }

    if (!scenarioName.trim()) {
      alert('Please enter a name for your scenario.');
      return;
    }

    setIsSaving(true);

    try {
      // Create a new scenario object with metadata
      const scenarioToSave = {
        id: Date.now().toString(),
        name: scenarioName,
        character: currentCharacter,
        scenario: currentScenario,
        createdAt: new Date().toISOString()
      };

      // Get existing saved scenarios
      const existingScenarios = [...savedScenarios];
      
      // Add the new scenario
      existingScenarios.push(scenarioToSave);
      
      // Save to localStorage
      localStorage.setItem('narrativeforge_scenarios', JSON.stringify(existingScenarios));
      
      // Update the local state
      setSavedScenarios(existingScenarios);
      setScenarioName('');
      setShowSaveForm(false);
      
      // Show success message
      alert('Scenario saved successfully!');
    } catch (error) {
      console.error('Error saving scenario:', error);
      alert('Failed to save scenario. Error: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a saved scenario
  const deleteScenario = (id) => {
    if (window.confirm('Are you sure you want to delete this scenario? This cannot be undone.')) {
      try {
        // Filter out the scenario to delete
        const updatedScenarios = savedScenarios.filter(scenario => scenario.id !== id);
        
        // Save to localStorage
        localStorage.setItem('narrativeforge_scenarios', JSON.stringify(updatedScenarios));
        
        // Update the local state
        setSavedScenarios(updatedScenarios);
      } catch (error) {
        console.error('Error deleting scenario:', error);
        alert('Failed to delete scenario. Error: ' + error.message);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="saved-scenarios-modal">
      <div className="saved-scenarios-header">
        <h2>Saved Scenarios</h2>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="saved-scenarios-actions">
        {showSaveForm ? (
          <div className="save-form">
            <input
              type="text"
              placeholder="Enter scenario name"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="scenario-name-input"
            />
            <div className="save-form-buttons">
              <button
                className="save-btn"
                onClick={saveCurrentScenario}
                disabled={isSaving || !scenarioName.trim()}
              >
                {isSaving ? 'Saving...' : 'Save'}
                <Save size={16} />
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowSaveForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            className="new-save-btn"
            onClick={() => setShowSaveForm(true)}
            disabled={!currentScenario || !currentCharacter}
          >
            Save Current Scenario
            <Save size={16} />
          </button>
        )}
      </div>

      <div className="saved-scenarios-list">
        {savedScenarios.length === 0 ? (
          <div className="no-scenarios">
            <p>You don't have any saved scenarios yet.</p>
            <p>Create a scenario and click "Save Current Scenario" to save it for later.</p>
          </div>
        ) : (
          <>
            <h3>Your Saved Scenarios</h3>
            {savedScenarios.map((scenario) => (
              <div key={scenario.id} className="scenario-item">
                <div className="scenario-details">
                  <h4>{scenario.name}</h4>
                  <p><strong>Character:</strong> {scenario.character?.name || 'Unnamed'}</p>
                  <p><strong>Created:</strong> {formatDate(scenario.createdAt)}</p>
                </div>
                <div className="scenario-actions">
                  <button
                    className="load-btn"
                    onClick={() => onLoadScenario(scenario)}
                    title="Load this scenario"
                  >
                    <Download size={16} />
                    Load
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteScenario(scenario.id)}
                    title="Delete this scenario"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedScenarios;
import React, { useState, useEffect } from 'react';
import SupabaseService from '../../services/supabase/supabaseService';
import ScenarioList from './ScenarioList';
import ScenarioEditor from './ScenarioEditor';
import './AdminStyles.css';

const AdminDashboard = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState([]);
  const [currentView, setCurrentView] = useState('list'); // list, edit, create
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [error, setError] = useState(null);

  // Load scenarios when component mounts
  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getAllScenarios();
      setScenarios(data);
      setError(null);
    } catch (err) {
      console.error('Error loading scenarios:', err);
      setError('Failed to load scenarios. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateScenario = () => {
    setSelectedScenario(null);
    setCurrentView('create');
  };

  const handleEditScenario = (scenario) => {
    setSelectedScenario(scenario);
    setCurrentView('edit');
  };

  const handleDeleteScenario = async (scenarioId) => {
    if (window.confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
      try {
        setLoading(true);
        await SupabaseService.deleteScenario(scenarioId);
        await loadScenarios();
      } catch (err) {
        console.error('Error deleting scenario:', err);
        setError('Failed to delete scenario. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSaveScenario = async (scenarioData, isNew = false) => {
    try {
      setLoading(true);
      
      if (isNew) {
        await SupabaseService.createScenario(scenarioData);
      } else {
        await SupabaseService.updateScenario(scenarioData.id, scenarioData);
      }
      
      await loadScenarios();
      setCurrentView('list');
    } catch (err) {
      console.error('Error saving scenario:', err);
      setError('Failed to save scenario. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setCurrentView('list');
  };

  const handleMigrateFromLocal = async () => {
    if (window.confirm('This will migrate all scenarios from localStorage to the database. Continue?')) {
      try {
        setLoading(true);
        await SupabaseService.migrateLocalScenarios();
        await loadScenarios();
        alert('Migration completed successfully!');
      } catch (err) {
        console.error('Error during migration:', err);
        setError('Failed to migrate data. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>NarrativeForge Admin</h1>
        
        <div className="admin-controls">
          {currentView === 'list' && (
            <button 
              className="admin-button primary"
              onClick={handleCreateScenario}
            >
              Create New Scenario
            </button>
          )}
          
          {currentView === 'list' && (
            <button 
              className="admin-button secondary"
              onClick={handleMigrateFromLocal}
            >
              Migrate from Local Storage
            </button>
          )}
          
          <button 
            className="admin-button"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
      
      {error && (
        <div className="admin-error-message">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}
      
      {loading && currentView === 'list' ? (
        <div className="admin-loading">Loading scenarios...</div>
      ) : (
        <>
          {currentView === 'list' && (
            <ScenarioList 
              scenarios={scenarios}
              onEdit={handleEditScenario}
              onDelete={handleDeleteScenario}
            />
          )}
          
          {(currentView === 'edit' || currentView === 'create') && (
            <ScenarioEditor 
              scenario={selectedScenario}
              isNew={currentView === 'create'}
              onSave={handleSaveScenario}
              onCancel={handleCancelEdit}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
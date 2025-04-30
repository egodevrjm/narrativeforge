import React from 'react';
import './AdminStyles.css';

const ScenarioList = ({ scenarios, onEdit, onDelete }) => {
  if (!scenarios || scenarios.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>No scenarios found. Create your first scenario!</p>
      </div>
    );
  }

  return (
    <div className="admin-scenario-list">
      <h2>Manage Scenarios</h2>
      
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Default</th>
            <th>Characters</th>
            <th>Last Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map(scenario => (
            <tr key={scenario.id}>
              <td>{scenario.title}</td>
              <td>
                <span className={`scenario-badge ${scenario.is_default ? 'default' : 'custom'}`}>
                  {scenario.is_default ? 'Default' : 'Custom'}
                </span>
              </td>
              <td>{scenario.characters?.length || 0}</td>
              <td>{new Date(scenario.updated_at).toLocaleDateString()}</td>
              <td className="actions-cell">
                <button 
                  className="admin-action-button edit"
                  onClick={() => onEdit(scenario)}
                >
                  Edit
                </button>
                <button 
                  className="admin-action-button delete"
                  onClick={() => onDelete(scenario.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScenarioList;
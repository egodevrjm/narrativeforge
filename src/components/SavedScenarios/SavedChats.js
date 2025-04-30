import React, { useState, useEffect } from 'react';
import './SavedChats.css';
import StorageService from '../../services/storageService';

/**
 * Component to display and manage saved chat sessions
 */
const SavedChats = ({ onLoadChat, onClose }) => {
  const [savedChats, setSavedChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest', 'a-z'
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Load saved chats on component mount
  useEffect(() => {
    loadSavedChats();
  }, []);

  // Load saved chats from storage service
  const loadSavedChats = () => {
    const chats = StorageService.loadChats();
    setSavedChats(chats);
  };

  // Handle deleting a chat
  const handleDelete = (chatId) => {
    setConfirmDelete(chatId);
  };

  // Confirm chat deletion
  const confirmDeleteChat = () => {
    if (confirmDelete) {
      StorageService.deleteChat(confirmDelete);
      loadSavedChats();
      setConfirmDelete(null);
    }
  };

  // Cancel chat deletion
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  // Handle loading a chat
  const handleLoad = (chat) => {
    onLoadChat(chat);
  };

  // Handle exporting a chat to file
  const handleExport = (chat) => {
    // Format and save chat as a JSON file
    const chatJson = JSON.stringify(chat, null, 2);
    const filename = `${chat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
    
    const blob = new Blob([chatJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create temp link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  // Handle importing a chat from file
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const chatData = JSON.parse(e.target.result);
        
        // Validate the imported chat data
        if (!chatData.id || !chatData.messages || !chatData.character || !chatData.scenario) {
          throw new Error('Invalid chat file format');
        }
        
        // Generate a new ID to avoid conflicts
        chatData.id = Date.now().toString();
        chatData.imported = true;
        
        // Save to storage
        StorageService.saveChat(chatData);
        loadSavedChats();
        
        // Reset file input
        event.target.value = null;
      } catch (error) {
        console.error('Error importing chat:', error);
        alert(`Error importing chat: ${error.message}`);
      }
    };
    
    reader.readAsText(file);
  };

  // Filter and sort chats based on search query and sort order
  const filteredAndSortedChats = () => {
    // First filter by search query
    let filtered = savedChats;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = savedChats.filter(chat => 
        (chat.title && chat.title.toLowerCase().includes(query)) || 
        (chat.character?.name && chat.character.name.toLowerCase().includes(query)) ||
        (chat.scenario?.title && chat.scenario.title.toLowerCase().includes(query))
      );
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.lastModified) - new Date(a.lastModified);
      } else if (sortOrder === 'oldest') {
        return new Date(a.lastModified) - new Date(b.lastModified);
      } else if (sortOrder === 'a-z') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  };

  return (
    <div className="saved-chats-container">
      <div className="saved-chats-header">
        <h2>Saved Conversations</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="saved-chats-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search saved chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="sort-container">
          <label>Sort by:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="a-z">A-Z</option>
          </select>
        </div>
        
        <div className="import-container">
          <label className="import-btn">
            Import Chat
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>
      
      <div className="saved-chats-list">
        {filteredAndSortedChats().length === 0 ? (
          <div className="no-chats-message">
            {searchQuery ? 'No chats match your search' : 'No saved chats found'}
          </div>
        ) : (
          filteredAndSortedChats().map(chat => (
            <div key={chat.id} className="chat-card">
              <div className="chat-card-header">
                <h3>{chat.title || 'Untitled Chat'}</h3>
                <div className="chat-meta">
                  <span className="chat-date">
                    {new Date(chat.lastModified).toLocaleDateString()} at {new Date(chat.lastModified).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="chat-card-body">
                <div className="chat-details">
                  <div className="chat-character">
                    <strong>Character:</strong> {chat.character?.name || 'Unknown'}
                  </div>
                  <div className="chat-scenario">
                    <strong>Scenario:</strong> {chat.scenario?.title || 'Unknown'}
                  </div>
                  <div className="chat-preview">
                    <strong>Last message:</strong>
                    <p>{chat.previewText || 'No messages'}</p>
                  </div>
                </div>
              </div>
              
              <div className="chat-card-actions">
                <button
                  className="load-btn"
                  onClick={() => handleLoad(chat)}
                  aria-label="Continue this chat"
                >
                  Continue
                </button>
                
                <button
                  className="export-btn"
                  onClick={() => handleExport(chat)}
                  aria-label="Export this chat"
                >
                  Export
                </button>
                
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(chat.id)}
                  aria-label="Delete this chat"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {confirmDelete && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this chat? This cannot be undone.</p>
            <div className="confirm-dialog-actions">
              <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
              <button className="confirm-btn" onClick={confirmDeleteChat}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedChats;
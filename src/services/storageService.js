/**
 * Storage Service
 * Handles saving and loading data from localStorage
 */

const STORAGE_KEYS = {
  CHARACTER_PROFILES: 'nf_character_profiles',
  SCENARIOS: 'nf_scenarios',
  SAVED_CHATS: 'nf_saved_chats',
  SETTINGS: 'nf_settings',
  API_KEY: 'gemini_api_key'
};

// Basic storage operations
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data to ${key}:`, error);
    return false;
  }
};

const loadData = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading data from ${key}:`, error);
    return defaultValue;
  }
};

const clearData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error clearing data from ${key}:`, error);
    return false;
  }
};

// Character profile operations
const saveCharacterProfile = (profile) => {
  if (!profile || !profile.name) {
    console.error('Cannot save character profile without a name');
    return false;
  }
  
  const existingProfiles = loadCharacterProfiles();
  
  // Check if profile with same name exists
  const existingIndex = existingProfiles.findIndex(p => p.name === profile.name);
  
  if (existingIndex >= 0) {
    // Update existing profile
    existingProfiles[existingIndex] = {
      ...profile,
      lastModified: new Date().toISOString()
    };
  } else {
    // Add new profile
    existingProfiles.push({
      ...profile,
      id: Date.now().toString(),
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return saveData(STORAGE_KEYS.CHARACTER_PROFILES, existingProfiles);
};

const loadCharacterProfiles = () => {
  return loadData(STORAGE_KEYS.CHARACTER_PROFILES, []);
};

const deleteCharacterProfile = (profileId) => {
  const existingProfiles = loadCharacterProfiles();
  const updatedProfiles = existingProfiles.filter(p => p.id !== profileId);
  
  if (updatedProfiles.length === existingProfiles.length) {
    console.warn(`Profile with ID ${profileId} not found`);
    return false;
  }
  
  return saveData(STORAGE_KEYS.CHARACTER_PROFILES, updatedProfiles);
};

// Scenario operations
const saveScenario = (scenario) => {
  if (!scenario || !scenario.title) {
    console.error('Cannot save scenario without a title');
    return false;
  }
  
  const existingScenarios = loadScenarios();
  
  // Check if scenario with same title exists
  const existingIndex = existingScenarios.findIndex(s => s.title === scenario.title);
  
  if (existingIndex >= 0) {
    // Update existing scenario
    existingScenarios[existingIndex] = {
      ...scenario,
      lastModified: new Date().toISOString()
    };
  } else {
    // Add new scenario
    existingScenarios.push({
      ...scenario,
      id: Date.now().toString(),
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return saveData(STORAGE_KEYS.SCENARIOS, existingScenarios);
};

const loadScenarios = () => {
  return loadData(STORAGE_KEYS.SCENARIOS, []);
};

const deleteScenario = (scenarioId) => {
  const existingScenarios = loadScenarios();
  const updatedScenarios = existingScenarios.filter(s => s.id !== scenarioId);
  
  if (updatedScenarios.length === existingScenarios.length) {
    console.warn(`Scenario with ID ${scenarioId} not found`);
    return false;
  }
  
  return saveData(STORAGE_KEYS.SCENARIOS, updatedScenarios);
};

// Chat operations
const saveChat = (chat) => {
  if (!chat || !chat.id || !chat.title) {
    console.error('Cannot save chat without id and title');
    return false;
  }
  
  const existingChats = loadChats();
  
  // Check if chat with same id exists
  const existingIndex = existingChats.findIndex(c => c.id === chat.id);
  
  if (existingIndex >= 0) {
    // Update existing chat
    existingChats[existingIndex] = {
      ...chat,
      lastModified: new Date().toISOString()
    };
  } else {
    // Add new chat
    existingChats.push({
      ...chat,
      created: new Date().toISOString(),
      lastModified: new Date().toISOString()
    });
  }
  
  return saveData(STORAGE_KEYS.SAVED_CHATS, existingChats);
};

const loadChats = () => {
  return loadData(STORAGE_KEYS.SAVED_CHATS, []);
};

const deleteChat = (chatId) => {
  const existingChats = loadChats();
  const updatedChats = existingChats.filter(c => c.id !== chatId);
  
  if (updatedChats.length === existingChats.length) {
    console.warn(`Chat with ID ${chatId} not found`);
    return false;
  }
  
  return saveData(STORAGE_KEYS.SAVED_CHATS, updatedChats);
};

// Settings operations
const saveSettings = (settings) => {
  return saveData(STORAGE_KEYS.SETTINGS, settings);
};

const loadSettings = () => {
  return loadData(STORAGE_KEYS.SETTINGS, {
    darkMode: false,
    aiTemperature: 0.7,
    showTimestamps: true,
    fontSize: 'medium',
    musicEnabled: false,
    musicVolume: 70
  });
};

// API Key operations
const saveApiKey = (apiKey) => {
  return saveData(STORAGE_KEYS.API_KEY, apiKey);
};

const loadApiKey = () => {
  return loadData(STORAGE_KEYS.API_KEY, '');
};

const clearApiKey = () => {
  return clearData(STORAGE_KEYS.API_KEY);
};

const StorageService = {
  saveCharacterProfile,
  loadCharacterProfiles,
  deleteCharacterProfile,
  saveScenario,
  loadScenarios,
  deleteScenario,
  saveChat,
  loadChats,
  deleteChat,
  saveSettings,
  loadSettings,
  saveApiKey,
  loadApiKey,
  clearApiKey,
  STORAGE_KEYS
};

export default StorageService;
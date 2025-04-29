import React, { useState, useEffect } from 'react';
import './VoiceSelector.css';

const VoiceSelector = ({ 
  elevenLabsApiKey, 
  selectedVoice, 
  onSelectVoice,
  isLoading = false
}) => {
  const [voices, setVoices] = useState([]);
  const [filteredVoices, setFilteredVoices] = useState([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewVoice, setPreviewVoice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);

  // Load voices when the component mounts or API key changes
  useEffect(() => {
    if (elevenLabsApiKey) {
      fetchVoices();
    }
  }, [elevenLabsApiKey]);

  // Filter voices when search term changes
  useEffect(() => {
    if (voices.length > 0 && searchTerm) {
      const filtered = voices.filter(voice => 
        voice.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVoices(filtered);
    } else {
      setFilteredVoices(voices);
    }
  }, [voices, searchTerm]);

  // Fetch voices from ElevenLabs API
  const fetchVoices = async () => {
    if (!elevenLabsApiKey) return;
    
    setIsLoadingVoices(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': elevenLabsApiKey
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.voices && Array.isArray(data.voices)) {
        // Sort voices alphabetically
        const sortedVoices = data.voices.sort((a, b) => a.name.localeCompare(b.name));
        setVoices(sortedVoices);
        setFilteredVoices(sortedVoices);
        
        // Auto-select the first voice if none is selected
        if (!selectedVoice && sortedVoices.length > 0) {
          onSelectVoice(sortedVoices[0]);
        }
      } else {
        throw new Error('No voices found in the response');
      }
    } catch (error) {
      console.error('Error fetching voices:', error);
      setError(error.message);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  // Play voice preview
  const playVoicePreview = async (voice) => {
    if (!voice || isPlaying) return;
    
    setPreviewVoice(voice);
    setIsPlaying(true);
    
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      URL.revokeObjectURL(currentAudio.src);
    }
    
    try {
      // Short preview text
      const previewText = "Hello, this is a sample of my voice. I'll be your narrator for this story.";
      
      // Make the API request to generate speech
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: previewText,
          model_id: "eleven_turbo_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Convert the response to an audio blob
      const audioBlob = await response.blob();
      
      // Create an audio element and play it
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Handle playback events
      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      // Start playing
      await audio.play();
      
      setCurrentAudio(audio);
    } catch (error) {
      console.error('Error generating speech preview:', error);
      setIsPlaying(false);
      setError(`Failed to preview voice: ${error.message}`);
    }
  };

  // Stop the preview playback
  const stopPreview = () => {
    if (currentAudio) {
      currentAudio.pause();
      URL.revokeObjectURL(currentAudio.src);
      setCurrentAudio(null);
    }
    setIsPlaying(false);
  };

  // Render a voice card
  const renderVoiceCard = (voice) => {
    const isSelected = selectedVoice && voice.voice_id === selectedVoice.voice_id;
    const isPreviewPlaying = isPlaying && previewVoice && previewVoice.voice_id === voice.voice_id;
    
    return (
      <div 
        key={voice.voice_id} 
        className={`voice-card ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelectVoice(voice)}
      >
        <div className="voice-info">
          <h4 className="voice-name">{voice.name}</h4>
          <p className="voice-description">{getVoiceDescription(voice)}</p>
        </div>
        <div className="voice-actions">
          {isPreviewPlaying ? (
            <button 
              className="voice-preview-btn stop"
              onClick={(e) => {
                e.stopPropagation();
                stopPreview();
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="6" width="12" height="12" rx="2" ry="2"></rect>
              </svg>
            </button>
          ) : (
            <button 
              className="voice-preview-btn play"
              onClick={(e) => {
                e.stopPropagation();
                playVoicePreview(voice);
              }}
              disabled={isPlaying || isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </button>
          )}
          {isSelected && (
            <div className="selected-indicator">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper to get a friendly description for the voice
  const getVoiceDescription = (voice) => {
    if (voice.labels && Object.keys(voice.labels).length > 0) {
      // Format labels like "accent: american, age: young, gender: male"
      return Object.entries(voice.labels)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    
    // Default description
    return voice.description || 'AI voice';
  };

  return (
    <div className="voice-selector">
      <div className="voice-selector-header">
        <div className="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search voices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="refresh-voices-btn"
          onClick={fetchVoices}
          disabled={isLoadingVoices}
        >
          {isLoadingVoices ? (
            <div className="loading-spinner-small"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          )}
        </button>
      </div>
      
      {error && (
        <div className="voice-selector-error">
          <p>{error}</p>
          <button onClick={fetchVoices}>Retry</button>
        </div>
      )}
      
      <div className="voice-list">
        {isLoadingVoices ? (
          <div className="voice-loading">
            <div className="loading-spinner"></div>
            <p>Loading voices...</p>
          </div>
        ) : filteredVoices.length > 0 ? (
          filteredVoices.map(voice => renderVoiceCard(voice))
        ) : (
          <div className="no-voices">
            <p>No voices found{searchTerm ? ` matching "${searchTerm}"` : ''}.</p>
          </div>
        )}
      </div>
      
      {selectedVoice && (
        <div className="selected-voice-info">
          <p>Selected voice: <strong>{selectedVoice.name}</strong></p>
        </div>
      )}
    </div>
  );
};

export default VoiceSelector;
/**
 * Service for handling interactions with ElevenLabs Text-to-Speech API
 */
class ElevenLabsService {
  /**
   * Creates an instance of ElevenLabsService.
   * @param {string} apiKey - Your ElevenLabs API key
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error("API key is required for ElevenLabsService");
    }
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.elevenlabs.io/v1';
    
    // Default voices - replace these IDs with actual voices from your ElevenLabs account
    this.voices = {
      narrator: 'pNInz6obpgDQGcFmaJgB', // Adam - good for narration
      alex: 'ErXwobaYiN019PkySvjV',      // Antoni - good for a deep male protagonist
      female: 'EXAVITQu4vr4xnSDxMaL'     // Bella - for female characters
    };
    
    // Track current audio playing
    this.currentAudio = null;
  }

  /**
   * Fetch available voices from the ElevenLabs API
   * @returns {Promise<Array>} - List of available voices
   */
  async getVoices() {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      throw error;
    }
  }

  /**
   * Convert text to speech using ElevenLabs API
   * @param {string} text - The text to convert to speech
   * @param {string} voiceId - The voice ID to use
   * @param {Object} options - Additional options for the TTS request
   * @returns {Promise<Blob>} - Audio blob containing the generated speech
   */
  async textToSpeech(text, voiceId, options = {}) {
    // Default options for voice generation
    const defaultOptions = {
      stability: 0.5,         // How stable/consistent the voice is (0-1)
      similarity_boost: 0.75, // How much to prioritize sounding like the original voice (0-1)
      style: 0.0,             // Speaking style (0-1)
      use_speaker_boost: true // Enhanced clarity and target speaker similarity
    };

    const requestOptions = { ...defaultOptions, ...options };

    try {
      // Process text for better speech output
      const processedText = this.preprocessText(text);
      
      // Make the API request
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: processedText,
          model_id: "eleven_turbo_v2", // Can be changed to other models
          voice_settings: {
            stability: requestOptions.stability,
            similarity_boost: requestOptions.similarity_boost,
            style: requestOptions.style,
            use_speaker_boost: requestOptions.use_speaker_boost
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      // Return the audio blob
      return await response.blob();
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  /**
   * Process text for better speech quality
   * @param {string} text - Raw text to process
   * @returns {string} - Processed text optimized for TTS
   */
  preprocessText(text) {
    if (!text) return '';
    
    // Remove excess whitespace
    let processed = text.trim().replace(/\s+/g, ' ');
    
    // Replace markdown formatting
    processed = processed.replace(/\*\*(.*?)\*\*/g, '$1'); // Bold
    processed = processed.replace(/\*(.*?)\*/g, '$1');     // Italic
    processed = processed.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links
    
    // Add pauses with commas
    processed = processed.replace(/([.!?])\s+/g, '$1, ');
    
    // Add pauses after blockquotes
    processed = processed.replace(/>\s*(.*?)(\n|$)/g, '$1, ');
    
    // Handle quoted speech carefully (keep quotation marks for proper intonation)
    
    // Limit length if needed
    const MAX_LENGTH = 5000;
    if (processed.length > MAX_LENGTH) {
      processed = processed.substring(0, MAX_LENGTH) + '...';
    }
    
    return processed;
  }

  /**
   * Play audio from a blob
   * @param {Blob} audioBlob - The audio blob to play
   * @returns {HTMLAudioElement} - The audio element playing the sound
   */
  playAudio(audioBlob) {
    // If there's already audio playing, stop it
    if (this.currentAudio) {
      this.currentAudio.pause();
      URL.revokeObjectURL(this.currentAudio.src);
    }
    
    // Create audio URL from blob
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Set up event handlers
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
      if (this.currentAudio === audio) {
        this.currentAudio = null;
      }
    };
    
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      URL.revokeObjectURL(audioUrl);
      this.currentAudio = null;
    };
    
    // Start playing
    audio.play().catch(error => {
      console.error('Failed to play audio:', error);
    });
    
    // Store reference to current audio
    this.currentAudio = audio;
    
    return audio;
  }

  /**
   * Stop any currently playing audio
   */
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      URL.revokeObjectURL(this.currentAudio.src);
      this.currentAudio = null;
    }
  }
  
  /**
   * Convert speech to text using ElevenLabs Scribe API
   * @param {Blob} audioBlob - Audio blob containing the speech to transcribe
   * @returns {Promise<string>} - Transcribed text
   */
  async speechToText(audioBlob) {
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recorded_audio.webm');
      
      // Make API request
      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      console.error('Error converting speech to text:', error);
      throw error;
    }
  }
}

export default ElevenLabsService;
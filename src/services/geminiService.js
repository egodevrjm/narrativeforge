/**
 * Service for handling interactions with Google's Gemini AI API
 */
class GeminiService {
  /**
   * Creates an instance of GeminiService.
   * @param {string} apiKey - Your Google AI API key.
   * @param {string} [modelName='gemini-2.5-flash-preview-04-17'] - The Gemini model to use.
   *        Examples: 'gemini-1.5-pro-latest', 'gemini-1.5-flash-latest', 'gemini-pro'.
   */
  constructor(apiKey, modelName = 'gemini-2.0-flash') { // Default to the latest Pro model
    if (!apiKey) {
      throw new Error("API key is required for GeminiService.");
    }
    this.apiKey = apiKey;
    this.modelName = modelName;
    // Construct the base URL using the provided model name
    this.baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent`;
    this.history = [];
    this.characterProfile = null;
    this.scenarioDetails = null;

    console.log(`GeminiService initialized with model: ${this.modelName}`);
  }

  /**
   * Initialize the service with character and scenario information
   * @param {Object} characterProfile - The detailed character profile
   * @param {Object} scenarioDetails - The scenario setup details
   */
  initialize(characterProfile, scenarioDetails) {
    // First reset everything completely to avoid any contamination
    this.reset();
    
    // Then set the new character and scenario
    this.characterProfile = characterProfile;
    this.scenarioDetails = scenarioDetails;
    this.history = [];

    // Create comprehensive system message that sets up the context
    const systemContext = this._createSystemContext();
    
    // Gemini's multi-turn chat expects alternating roles.
    // According to best practices, we'll setup the initial context as 'model' role,
    // then follow with a user prompt to establish the turn structure
    this.history.push({
      role: 'model',
      parts: [{ text: systemContext }]
    });

    // If there are roleplay instructions, add them by updating the system message
    if (scenarioDetails.roleplayInstructions) {
       // Append to the initial context message for a more cohesive instruction set
       const initialModelMessage = this.history[0];
       initialModelMessage.parts[0].text += `\n\n## Additional Roleplay Instructions:\n\n${scenarioDetails.roleplayInstructions}`;
    }
    
    // Add a narrative reminder to ensure the story follows the intended arc
    // and that the AI properly adheres to the narrative structure
    if (scenarioDetails.narrativeGoals) {
      const initialModelMessage = this.history[0];
      initialModelMessage.parts[0].text += `\n\n## Important Narrative Reminder:\nFollow the narrative goals described above. The story should progress from the initial situation and develop toward the themes and goals specified. Keep your responses consistent with the established setting, characters, and tone. Always respect the user's agency while guiding the story along the intended narrative arc. Start exactly from the moment described in the initial situation.`;
    }
    
    // Add an initial user prompt to kick off the conversation after setup
    // This helps establish the user/model turn structure
    this.history.push({
       role: 'user',
       parts: [{ text: "I understand the character and scenario. Please start the roleplay by setting the scene exactly as described in the initial situation, introducing the environment and appropriate characters. Begin precisely at the moment described in the initial situation." }]
    });
    // Expect the model's first response to be the scene-setting based on the initial situation
  }

  /**
   * Update roleplay instructions
   * @param {string} instructions - New roleplay instructions
   */
  updateInstructions(instructions) {
    // Find the *last* 'model' message that contains instructions, or add a new one.
    // It's often better to send updates as a 'user' message instructing the model.
    // Let's try sending it as a user directive.

    const instructionUpdateText = `(System Note: Please adhere to the following updated roleplay instructions from now on, incorporating them naturally into your responses without explicitly mentioning this note: ${instructions})`;

    this.history.push({
      role: 'user', // Send as a user message to instruct the model for the next turn
      parts: [{ text: instructionUpdateText }]
    });

    // The model's *next* response should implicitly follow these instructions.
    // Avoid adding extra 'model' reminders as it pollutes the history.

    // --- Original Logic (commented out) ---
    // // Find any existing instruction message
    // const existingInstructionIndex = this.history.findIndex(msg =>
    //   msg.role === 'model' &&
    //   msg.parts[0]?.text?.includes('Roleplay Instructions:')
    // );
    //
    // // Create the instruction message
    // const instructionMessage = {
    //   role: 'model', // This can disrupt the turn flow if inserted arbitrarily
    //   parts: [{ text: `Roleplay Instructions:\n\n${instructions}` }]
    // };
    //
    // if (existingInstructionIndex !== -1) {
    //   // Replace existing instructions
    //   this.history[existingInstructionIndex] = instructionMessage;
    // } else {
    //   // Add new instructions after the system context
    //   // Finding the right place to insert can be tricky. Appending might be safer.
    //   this.history.splice(1, 0, instructionMessage); // Inserting might break user/model alternation
    // }
    //
    // // Add a reminder to follow the new instructions (not visible to user) - Avoid this if possible
    // this.history.push({
    //   role: 'model',
    //   parts: [{ text: 'Remember to follow the updated roleplay instructions provided above, but do not explicitly mention them in your responses.' }]
    // });
    // --- End Original Logic ---
  }


  /**
   * Generate a generic response from Gemini based on a prompt (uses minimal history)
   * @param {string} prompt - The prompt to send to Gemini
   * @returns {Promise<string>} - The AI generated response
   */
  async generateGeneric(prompt) {
    // This function seems intended for non-chat, single-turn generation.
    // It should NOT use the main chat history.
    try {
      console.log(`Sending generic request to Gemini API (${this.modelName})`);
      console.log('Using API URL:', this.baseUrl);

      // Prepare contents for a single-turn request
      const contents = [{
        role: 'user',
        parts: [{ text: prompt }]
      }];

      // Add retry logic with exponential backoff (same as before)
      let retries = 3;
      let delay = 1000; // Start with 1 second delay
      let success = false;
      let data;

      while (retries > 0 && !success) {
        try {
          const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: contents, // Use the single prompt content
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1000, // Adjust as needed
              },
              // Safety settings might also be relevant here if needed
               safetySettings: [ // Keep safety settings consistent
                 { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                 { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                 { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                 { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
               ]
            })
          });

          // Check HTTP status (same as before)
          if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response (generic):', errorText);
            // Throw specific errors (same as before)
             if (response.status === 400) throw new Error(`API error: 400 - Bad Request. Check model name ('${this.modelName}') and parameters. Details: ${errorText}`);
             if (response.status === 401) throw new Error(`API error: 401 - Unauthorized. Your API key may be invalid or expired.`);
             if (response.status === 403) throw new Error(`API error: 403 - Forbidden. Your API key may not have access to '${this.modelName}' or you've exceeded quota.`);
             if (response.status === 404) throw new Error(`API error: 404 - Not Found. The specified model '${this.modelName}' may not exist or the URL is incorrect.`);
             if (response.status === 429) throw new Error(`API error: 429 - Too Many Requests. You've hit rate limits or quota restrictions.`);
             throw new Error(`API error (generic): ${response.status} - ${errorText || 'Unknown error'}`);
          }

          data = await response.json();
          // console.log('API response structure (generic):', JSON.stringify(data, null, 2).substring(0, 500) + '...'); // Optional: for debugging
          success = true;
        } catch (err) {
          console.error(`Attempt ${4 - retries} failed (generic):`, err);
          retries--;
          if (retries > 0) {
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // Exponential backoff
          } else {
            throw err; // Re-throw the last error if all retries failed
          }
        }
      }

      // Extract the model's response (same as before)
      if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
        // Safety check: Check for finishReason
        if (data.candidates[0].finishReason === 'SAFETY') {
            console.warn('Gemini response blocked due to safety settings.');
            // Optionally check promptFeedback for block reason
            if (data.promptFeedback?.blockReason) {
                 console.warn(`Safety block reason: ${data.promptFeedback.blockReason}`);
            }
            return "[Response blocked due to safety settings]";
        }
        return data.candidates[0].content.parts[0].text;
      } else if (data.promptFeedback?.blockReason) {
          // Handle cases where the prompt itself was blocked
          console.warn(`Gemini prompt blocked due to: ${data.promptFeedback.blockReason}`);
          return `[Prompt blocked due to safety settings: ${data.promptFeedback.blockReason}]`;
      }
       else {
        console.error('Unexpected API response structure (generic):', data);
        throw new Error('Invalid response format from Gemini API (generic)');
      }
    } catch (error) {
      console.error('Error calling Gemini API (generic):', error);
      // Don't add generic prompt/response to history
      throw error;
    }
  }


  /**
   * Generate a response from Gemini based on user input and chat history
   * @param {string} userMessage - The user's message content
   * @param {string} messageType - Type of message (dialogue, action, thought)
   * @returns {Promise<string>} - The AI generated response
   */
  async generateResponse(userMessage, messageType) {
    try {
      // Add user message to history
      this.history.push({
        role: 'user',
        parts: [{ text: `[${messageType.toUpperCase()}] ${userMessage}` }]
      });

      // Ensure history alternates user/model roles correctly.
      // If the last two roles are the same, it might indicate an issue.
      // Basic check:
      if (this.history.length >= 2 && this.history[this.history.length - 1].role === this.history[this.history.length - 2].role) {
          console.warn("Potential history role alternation issue detected before API call.");
          // Depending on the cause, you might need to adjust `initialize` or `updateInstructions`
      }

      // Prepare the context window for Gemini (using the full history)
      const contents = [...this.history];

      console.log(`Sending roleplay request to Gemini API (${this.modelName})`);
      // console.log('Using API URL:', this.baseUrl); // Already logged in constructor/generic
      // console.log('Sending history:', JSON.stringify(contents, null, 2)); // Debugging: log history being sent

      // Add retry logic with exponential backoff (same as before)
      let retries = 3;
      let delay = 1000;
      let success = false;
      let data;

      while (retries > 0 && !success) {
        try {
          const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: contents, // Send the chat history
              generationConfig: {
                temperature: 0.7, // Adjust as needed for creativity vs coherence
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 800, // Adjust based on desired response length
                // stopSequences: [] // Optional: sequences that stop generation
              },
              safetySettings: [ // Keep safety settings consistent
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" }, // Be cautious with roleplay
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
              ]
            })
          });

          // Check HTTP status (same as before)
          if (!response.ok) {
             const errorText = await response.text();
             console.error('API error response (roleplay):', errorText);
             // Throw specific errors (same as before)
             if (response.status === 400) throw new Error(`API error: 400 - Bad Request. Check model name ('${this.modelName}'), history structure, or parameters. Details: ${errorText}`);
             if (response.status === 401) throw new Error(`API error: 401 - Unauthorized. Your API key may be invalid or expired.`);
             if (response.status === 403) throw new Error(`API error: 403 - Forbidden. Your API key may not have access to '${this.modelName}' or you've exceeded quota.`);
             if (response.status === 404) throw new Error(`API error: 404 - Not Found. The specified model '${this.modelName}' may not exist or the URL is incorrect.`);
             if (response.status === 429) throw new Error(`API error: 429 - Too Many Requests. You've hit rate limits or quota restrictions.`);
             throw new Error(`API error (roleplay): ${response.status} - ${errorText || 'Unknown error'}`);
          }

          data = await response.json();
          success = true;

        } catch (err) {
          console.error(`Attempt ${4 - retries} failed (roleplay):`, err);
          retries--;
          if (retries > 0) {
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            throw err;
          }
        }
      }

      // Extract the model's response
        if (data.candidates && data.candidates[0]?.content?.parts?.length > 0) {
            // Safety check
            if (data.candidates[0].finishReason === 'SAFETY') {
                console.warn('Gemini response blocked due to safety settings.');
                 if (data.promptFeedback?.blockReason) {
                     console.warn(`Safety block reason: ${data.promptFeedback.blockReason}`);
                 }
                // Add a placeholder to history to maintain turn structure
                this.history.push({
                    role: 'model',
                    parts: [{ text: "[Response blocked due to safety settings]" }]
                });
                return "[Response blocked due to safety settings]";
            }

            const aiResponseText = data.candidates[0].content.parts[0].text;

            // Add AI response to history
            this.history.push({
                role: 'model',
                parts: [{ text: aiResponseText }]
            });

            return aiResponseText;
        } else if (data.promptFeedback?.blockReason) {
             // Handle cases where the prompt itself was blocked
             console.warn(`Gemini prompt blocked due to: ${data.promptFeedback.blockReason}`);
             // Add a placeholder to history
             this.history.push({
                 role: 'model', // Still the model's turn, even if it's just an error message
                 parts: [{ text: `[Prompt blocked due to safety settings: ${data.promptFeedback.blockReason}]` }]
             });
             return `[Prompt blocked due to safety settings: ${data.promptFeedback.blockReason}]`;
        }
        else {
            console.error('Unexpected roleplay API response structure:', data);
            // Don't add a potentially invalid response to history
            throw new Error('Invalid response format from Gemini API in roleplay');
        }
    } catch (error) {
      console.error('Error calling Gemini API (roleplay):', error);
      // Do not add user message to history if the API call failed before sending
      // However, it was already added at the start of the try block.
      // Consider adding a mechanism to remove the last user message if the API call fails critically.
      // For now, just re-throw.
      throw error;
    }
  }

  /**
   * Create the detailed system context from character and scenario
   * @private
   * @returns {string} - Formatted system context
   */
  _createSystemContext() {
    // Enhanced system context creation to better follow the narrative
    const { name, age, physicalDescription, background, personality, relationships, additionalNotes } = this.characterProfile || {};
    const { title, setting, initialSituation, otherCharacters, toneAndThemes, narrativeGoals } = this.scenarioDetails || {};

    // Create detailed system prompt with expanded narrative guidance
    return `
You are an AI assisting in a roleplaying scenario titled "${title || 'Untitled Scenario'}". Your primary function is to portray all characters and narrative elements EXCEPT the main protagonist, whose inputs will be provided by the user.

## Protagonist Character (User's Character)
Name: ${name || 'Unnamed'}
Age: ${age || 'Unknown'}
Physical Description: ${physicalDescription || 'Not provided'}
Background: ${background || 'Not provided'}
Personality: ${personality || 'Not provided'}

## Character Relationships
${relationships?.map(rel => `- ${rel.name} (${rel.relationshipType}): ${rel.description || 'No description.'}`).join('\n') || 'No relationships specified.'}

## Additional Character Notes
${additionalNotes || 'No additional notes.'}

## Scenario Setting
Location: ${setting?.location || 'Unspecified'}
Time: ${setting?.time || 'Unspecified'}
Atmosphere: ${setting?.atmosphere || 'Unspecified'}

## Initial Situation
${initialSituation || 'No initial situation provided.'}

## Narrative Goals
${narrativeGoals || 'No specific narrative goals specified.'}

## Other Characters (Portrayed by You, the AI)
${otherCharacters?.map(char => `
- ${char.name} (${char.role || 'NPC'}): ${char.description || 'No description.'}
  Relationship to protagonist: ${char.relationship || 'Not specified.'}
`).join('') || 'No other characters specified for you to portray.'}

## Tone and Themes
${toneAndThemes || 'No specific tone or themes specified.'}

## Core Roleplay Instructions for You (the AI):
1.  **Portray Non-Protagonist Roles:** You embody all characters listed under "Other Characters" and act as the narrator describing the environment and events. Do NOT act as the protagonist ('${name || 'Unnamed'}').
2.  **Stay In Character:** Maintain the personalities and motivations of the characters you portray. Use descriptive language for narration that aligns with the scenario's tone.
3.  **React Realistically:** Respond dynamically to the protagonist's dialogue, actions, and thoughts (marked as [DIALOGUE], [ACTION], [THOUGHT]).
4.  **Maintain Atmosphere:** Ensure your responses reflect the specified tone, themes, and setting atmosphere.
5.  **Follow the Narrative Arc:** Keep the story aligned with the specified narrative goals while allowing for user agency. Introduce appropriate challenges, developments, and interactions that move the story forward in the intended direction.
6.  **Format Clearly:** Use standard prose. Indicate dialogue using quotation marks (" "). Describe actions and scenery narratively. Avoid meta-commentary unless specifically instructed via a System Note.
7.  **Advance the Story:** Collaborate with the user to move the narrative forward based on their choices, while staying true to the scenario.
8.  **Response Length:** Aim for immersive yet reasonably concise responses (typically 1-4 paragraphs), unless the situation calls for more or less detail.
9.  **Authenticity:** Be creative, emotionally resonant, and consistent with the established world and characters.
10. **Honor Narrative Consistency:** Keep track of what has happened in the story so far and maintain consistency with previous events, character behaviors, and established facts.
11. **No Meta-Roleplay:** Do not mention that this is a roleplay, that you are an AI, or discuss the instructions themselves within your narrative responses.

When starting the roleplay, begin by setting the scene exactly as described in the initial situation, introducing the environment and context before any character actions occur.
`;
  }

  /**
   * Save the current chat history
   * @returns {Array<Object>} - The current chat history (array of user/model message objects)
   */
  exportChatHistory() {
    // Make a deep copy to prevent external modifications affecting the service's state
    return JSON.parse(JSON.stringify(this.history));
  }

  /**
   * Import an existing chat history, replacing the current one.
   * Validates the history format.
   * @param {Array<Object>} history - Previous chat history (must be an array of {role: 'user'|'model', parts: [{text: string}]})
   */
  importChatHistory(history) {
     // Basic validation
    if (!Array.isArray(history) || history.some(msg => !msg || typeof msg.role !== 'string' || !['user', 'model'].includes(msg.role) || !Array.isArray(msg.parts) || !msg.parts[0]?.text)) {
        console.error("Invalid history format provided to importChatHistory. History not imported.");
        throw new Error("Invalid history format. Expected array of {role: 'user'|'model', parts: [{text: string}]}.");
    }
    // Make a deep copy on import as well
    this.history = JSON.parse(JSON.stringify(history));
    console.log(`Imported chat history with ${this.history.length} messages.`);
  }

  /**
   * Clears the current chat history and resets context (keeps API key and model).
   * Re-initializes with existing character/scenario if available.
   */
  reset() {
    console.log("Resetting GeminiService chat history and context...");
    // Clear everything completely - don't reuse anything
    this.history = [];
    this.characterProfile = null;
    this.scenarioDetails = null;
    console.log("Service reset. Call initialize() to set up character and scenario again.");
  }
}

export default GeminiService;
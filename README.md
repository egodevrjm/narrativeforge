# NarrativeForge

A character-driven roleplay web application with Google Gemini AI integration.

## Features

- **AI-Powered Character Creation**: Generate detailed character profiles or enhance specific aspects
- **AI-Powered Scenario Building**: Create complete scenarios with narrative elements
- **Interactive Chat Interface**: Engage in roleplay with AI responses
- **Custom Roleplay Instructions**: Define specific rules and expectations for the AI to follow
- **Restart/Reset Functionality**: Start over from any point in the process
- **Template Support**: Use pre-built examples or create your own content
- **API Testing**: Verify your Gemini API key before proceeding
- **Scenario Information Panel**: View details about the current scenario at any time
- **Music/Ambience Panel**: Set the mood with ambient sounds (placeholder UI)
- **Settings Panel**: Customize the roleplay experience

## Project Overview

NarrativeForge allows you to create immersive roleplays with AI-generated responses. The application lets you:

1. Create detailed character profiles
2. Build scenarios with specific settings and situations
3. Engage in dynamic roleplay with AI-powered responses
4. Save and continue your stories

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A Google Cloud account with the Generative Language API enabled
- A valid API key for Google's Gemini API

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Using NarrativeForge

### Getting a Gemini API Key

1. Go to the [Google AI Studio](https://ai.google.dev/)
2. Create or sign in to your Google account
3. Navigate to the API keys section and create an API key
4. Make sure you have access to the `gemini-1.5-flash` model (this application uses that specific model)
5. Use this key when prompted in the application

**Troubleshooting API Issues:**

If you encounter errors when using Gemini features:
1. Check that your API key is correct and active
2. Verify that you have access to the `gemini-1.5-flash` model
3. Check the browser console for detailed error messages
4. Try refreshing the page and entering the API key again
5. Check the [Google Gemini API Documentation](https://ai.google.dev/docs) for the latest information

### Creating a Character

Fill out the character profile form with:
- Basic information (name, age)
- Physical description
- Background and history
- Personality traits
- Key relationships
- Additional notes

**AI-Powered Character Creation:**
- Click the "Generate Random Character" button to create a complete character profile using AI
- Use the magic wand button next to specific fields to enhance or expand your input for that attribute
- Type in a few details (e.g., "blue eyes, muscular build") and let AI fill in the rest

### Building a Scenario

Define your roleplay scenario with:
- Setting details (location, time, atmosphere)
- Initial situation
- Other characters
- Narrative goals
- Tone and themes
- **Roleplay instructions**

**Roleplay Instructions:**
- Define specific rules and expectations for how the AI should respond
- Set boundaries for player vs. AI control
- Establish the format and style of the interaction
- Customize these instructions at any point during the roleplay
- Instructions are provided to the AI but not displayed in the chat

**AI-Powered Scenario Creation:**
- Click the "Generate Random Scenario" button to create a complete scenario using AI
- The AI will generate a title, setting, initial situation, other characters, narrative goals, and thematic elements
- Customize any part of the generated scenario before saving

### Engaging in Roleplay

The chat interface allows you to:
- Choose between dialogue, actions, and thoughts
- Receive AI-generated responses based on your character and scenario
- Save your chat history

## Included Example

The application includes a pre-built example scenario based on the provided premise:
- A 19-year-old character from Pikeville, Kentucky
- Hidden musical talent and troubled background
- Betrayal scenario with the character's girlfriend
- Exploration of transforming pain into art

You can load this template by checking the option on the welcome screen.

## Development Roadmap

Future enhancements planned:
- User accounts and authentication
- Saving multiple character profiles and scenarios
- Exporting stories in different formats
- Audio integration for music/ambient sound
- Image generation for character visualization

## Technical Details

- Frontend: React
- State Management: React Context API
- AI Integration: Google Gemini 1.5 Flash
- Styling: Custom CSS
- Additional Features:
  - Retry logic with exponential backoff for API calls
  - Interactive UI panels for settings, music, and scenario information
  - Responsive design for various screen sizes

## License

This project is for personal use only.

## Acknowledgements

- Created by Ryan Morrison
- Uses Google's Generative Language API
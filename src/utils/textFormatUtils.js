/**
 * Automatically detect message type based on content
 * 
 * @param {string} text - The message text to analyze
 * @returns {string} - Detected message type: 'dialogue', 'action', 'thought', or 'social'
 */
export const detectMessageType = (text) => {
  if (!text || typeof text !== 'string') return 'dialogue';
  
  const lowerText = text.toLowerCase();
  
  // Check for social media content first
  if (lowerText.includes('@') || lowerText.includes('#') || 
      lowerText.includes('instagram') || lowerText.includes('tiktok') || 
      lowerText.includes('youtube') || lowerText.includes('twitter') ||
      lowerText.includes('followers') || lowerText.includes('likes') ||
      lowerText.includes('message requests:') || lowerText.includes('dm') ||
      lowerText.includes('post') || lowerText.includes('comment') ||
      lowerText.includes('notification')) {
    return 'social';
  }
  
  // Check for action patterns
  // Actions typically start with an "I" followed by a verb, or may be in third person style
  if (text.match(/^I [a-z]+/) || 
      text.match(/^\*[^*]+\*/) || // Text wrapped in asterisks like *walks away*
      lowerText.startsWith('you ') || 
      lowerText.includes(' walk') || lowerText.includes(' move') || 
      lowerText.includes(' pick') || lowerText.includes(' grab') || 
      lowerText.includes(' take') || lowerText.includes(' open') || 
      lowerText.includes(' close') || lowerText.includes(' put') ||
      lowerText.includes(' sit') || lowerText.includes(' stand') ||
      lowerText.includes(' go to ')) {
    return 'action';
  }
  
  // Check for thought patterns
  if (text.match(/^I think/) || text.match(/^I wonder/) || 
      text.match(/^I feel/) || text.match(/^I wish/) ||
      text.match(/^I hope/) || text.match(/^I worry/) ||
      text.match(/^I'm thinking/) || text.match(/^I'm wondering/) ||
      text.match(/^Maybe/) || text.match(/^Hmm/) ||
      text.match(/^\([^)]+\)/) || // Text in parentheses like (I wonder what's happening)
      text.match(/^\"[^"]+\"/) || // Text in quotes might be thoughts or dialogue
      lowerText.includes('to myself')) {
    return 'thought';
  }
  
  // Check if text is likely dialogue based on quotes or common speech patterns
  if (text.includes('"') || text.includes("'") || 
      text.includes('?') || text.includes('!') ||
      lowerText.includes('said') || lowerText.includes('says') ||
      lowerText.includes('asked') || lowerText.includes('tell') ||
      lowerText.includes('hello') || lowerText.includes('hi ')) {
    return 'dialogue';
  }
  
  // Default to dialogue for short messages
  if (text.length < 60) {
    return 'dialogue';
  }
  
  // For longer text without clear indicators, use a more sophisticated approach
  // Count indicators for each type
  let dialogueScore = 0;
  let actionScore = 0;
  let thoughtScore = 0;
  
  // Dialogue indicators
  dialogueScore += (text.match(/[?!]/g) || []).length * 2;
  dialogueScore += (text.match(/\b(say|tell|ask|speak|talk|respond|reply|answer)\b/gi) || []).length * 2;
  
  // Action indicators
  actionScore += (text.match(/\b(go|walk|move|turn|take|pick|grab|look|search|find|open|close|sit|stand)\b/gi) || []).length * 2;
  
  // Thought indicators
  thoughtScore += (text.match(/\b(think|wonder|consider|ponder|reflect|contemplate|feel|emotion|sense)\b/gi) || []).length * 2;
  thoughtScore += (text.match(/\b(maybe|perhaps|possibly|I guess|I suppose)\b/gi) || []).length * 3;
  
  // Determine the highest score
  if (thoughtScore > dialogueScore && thoughtScore > actionScore) {
    return 'thought';
  } else if (actionScore > dialogueScore) {
    return 'action';
  }
  
  // Default to dialogue
  return 'dialogue';
};

/**
 * Utility functions for text formatting in the NarrativeForge app
 */

/**
 * Ensures text has proper paragraph breaks
 * This function helps with the API responses that might lack proper spacing
 * 
 * @param {string} text - The text to format
 * @returns {string} - Formatted text with proper paragraph breaks
 */
export const ensureParagraphBreaks = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // Normalize line endings
  let formattedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Convert single periods at the end of sentences followed by a space to period + double newline
  formattedText = formattedText.replace(/\.(?=\s+[A-Z])/g, '.\n\n');
  
  // Ensure two newlines between paragraphs
  formattedText = formattedText.replace(/\n{3,}/g, '\n\n');
  
  // Convert blocks of text without breaks that are long into paragraphs
  const paragraphs = formattedText.split(/\n\s*\n/);
  
  const improvedParagraphs = paragraphs.map(paragraph => {
    // If paragraph is very long and has no internal breaks, split by sentences
    if (paragraph.length > 300 && !paragraph.includes('\n')) {
      const sentences = paragraph.split(/(?<=\. )/);
      
      // Group sentences into more digestible paragraphs
      let newParagraph = '';
      let currentGroup = '';
      
      sentences.forEach(sentence => {
        if (currentGroup.length + sentence.length > 200) {
          newParagraph += currentGroup + '\n\n';
          currentGroup = sentence;
        } else {
          currentGroup += sentence;
        }
      });
      
      if (currentGroup) {
        newParagraph += currentGroup;
      }
      
      return newParagraph;
    }
    
    return paragraph;
  });
  
  return improvedParagraphs.join('\n\n');
};

/**
 * Preprocesses messages from AI to improve formatting
 * 
 * @param {string} message - The message from AI to preprocess
 * @returns {string} - Formatted message with better spacing and line breaks
 */
export const preprocessAIMessage = (message) => {
  if (!message || typeof message !== 'string') return '';
  
  // Apply paragraph breaks
  let processedMessage = ensureParagraphBreaks(message);
  
  // Remove markdown bold formatting
  processedMessage = processedMessage.replace(/\*\*([^*]+)\*\*/g, '$1');
  
  // Add spacing after social media handles and hashtags
  processedMessage = processedMessage.replace(/@([a-zA-Z0-9_]+)/g, '@$1 ');
  processedMessage = processedMessage.replace(/#([a-zA-Z0-9_]+)/g, '#$1 ');
  
  return processedMessage;
};

/**
 * Apply special formatting for social media content
 * 
 * @param {string} content - Social media content to format
 * @returns {string} - Formatted social media content with proper platform separation
 */
export const formatSocialMediaContent = (content) => {
  if (!content || typeof content !== 'string') return '';
  
  // Remove markdown bold formatting
  let formattedContent = content.replace(/\*\*([^*]+)\*\*/g, '$1');
  
  // Add explicit paragraph breaks before each platform mention
  formattedContent = formattedContent
    .replace(/([^\n])(📱\s*Instagram|🎵\s*TikTok|▶️\s*YouTube|🐦\s*Twitter|👻\s*Snapchat)/g, '$1\n\n$2');

  // Find and format platform mentions with emojis
  formattedContent = formattedContent
    .replace(/Instagram/g, '📱 Instagram')
    .replace(/TikTok/g, '🎵 TikTok')
    .replace(/YouTube/g, '▶️ YouTube')
    .replace(/Twitter/g, '🐦 Twitter')
    .replace(/Snapchat/g, '👻 Snapchat')
    .replace(/trending/gi, '<span class="highlight">trending</span>')
    .replace(/(\d+)k?\s*followers/gi, '$1k followers 👥')
    .replace(/(\d+)k?\s*likes/gi, '$1k likes ❤️')
    .replace(/(\d+)k?\s*views/gi, '$1k views 👁️')
    .replace(/(\d+)k?\s*shares/gi, '$1k shares 🔄')
    .replace(/(\d+)k?\s*comments/gi, '$1k comments 💬');

  // Split content into paragraphs
  let paragraphs = formattedContent.split(/\n\n+/);
  
  // Mark each paragraph that starts with a platform indicator
  let processedParagraphs = paragraphs.map(para => {
    // Check if paragraph starts with a platform indicator
    if (para.match(/^(📱\s*Instagram|🎵\s*TikTok|▶️\s*YouTube|🐦\s*Twitter|👻\s*Snapchat)/)) {
      // Extract platform name
      const platformMatch = para.match(/^(📱\s*Instagram|🎵\s*TikTok|▶️\s*YouTube|🐦\s*Twitter|👻\s*Snapchat)/);
      let platformName = '';
      
      if (platformMatch) {
        if (platformMatch[0].includes('Instagram')) platformName = 'Instagram';
        else if (platformMatch[0].includes('TikTok')) platformName = 'TikTok';
        else if (platformMatch[0].includes('YouTube')) platformName = 'YouTube';
        else if (platformMatch[0].includes('Twitter')) platformName = 'Twitter';
        else if (platformMatch[0].includes('Snapchat')) platformName = 'Snapchat';
      }
      
      // Add platform marker
      return `[PLATFORM:${platformName}] ${para}`;
    }
    return para;
  });
  
  // Add extra line breaks between platform sections for better visual separation
  return processedParagraphs.join('\n\n\n');
};

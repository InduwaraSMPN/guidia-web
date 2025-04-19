/**
 * Service for handling AI API interactions using DeepSeek
 */
const { OpenAI } = require('openai');
require('dotenv').config();

class OpenAIService {
  constructor() {
    // Get the DeepSeek API key from environment variables
    this.apiKey = process.env.DEEPSEEK_API_KEY;

    // Debug logging
    console.log('Loading DeepSeek API key from environment variables');
    console.log('API key available:', !!this.apiKey);

    try {
      // Initialize the OpenAI client with DeepSeek base URL
      this.client = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: this.apiKey, // Use the API key from environment variables
        dangerouslyAllowBrowser: true // Allow browser usage
      });

      // Log the status for debugging
      if (!this.apiKey) {
        console.warn('DeepSeek API key is not set. Using fallback responses.');
        this.useAI = false;
      } else {
        console.log('DeepSeek API key is configured:', this.apiKey.substring(0, 5) + '...');
        this.useAI = true;
      }
    } catch (error) {
      console.error('Error initializing DeepSeek client:', error);
      this.useAI = false;
    }
  }

  /**
   * Send a message to OpenAI and get a response
   * @param {string} message - The user's message
   * @param {Array} history - Previous conversation history
   * @returns {Promise<string>} - The AI response
   */
  async sendMessage(message, history = []) {
    try {
      console.log('Sending message to DeepSeek:', { messageLength: message.length, historyLength: history.length });
      console.log('API key available:', !!this.apiKey);
      console.log('useAI flag:', this.useAI);

      // If API key is not available or we're not using AI, use fallback responses
      if (!this.apiKey || !this.useAI) {
        console.log('Using fallback response due to:', { noApiKey: !this.apiKey, useAIDisabled: !this.useAI });
        return this.getFallbackResponse(message);
      }

      // Format the conversation history for DeepSeek
      const messages = [
        {
          role: "system",
          content: "You are Guidia AI, powered by DeepSeek-chat, a helpful career guidance assistant. You provide advice on career paths, job opportunities, educational resources, and professional development. Be concise, friendly, and supportive. When asked about your model, identify yourself as DeepSeek-chat."
        },
        ...history.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      // Make the API request to DeepSeek using the OpenAI SDK
      console.log('Making API request to DeepSeek with client:', !!this.client);
      console.log('Request parameters:', {
        model: "deepseek-chat",
        messagesCount: messages.length,
        max_tokens: 500,
        temperature: 0.7
      });

      try {
        console.log('About to call DeepSeek API with model:', "deepseek-chat");

        // Try with deepseek-chat model instead of deepseek-v3
        const completion = await this.client.chat.completions.create({
          model: "deepseek-chat", // Using DeepSeek-chat model
          messages: messages,
          max_tokens: 500,
          temperature: 0.7
        });

        console.log('DeepSeek API response received:', {
          status: 'success',
          choicesLength: completion.choices?.length || 0
        });

        return completion.choices[0].message.content.trim();
      } catch (apiError) {
        console.error('DeepSeek API call failed:', apiError);
        console.error('Error details:', apiError.message);

        // Return a fallback response instead of throwing the error
        console.log('Using fallback response due to API error');
        return this.getFallbackResponse(message);
      }
    } catch (error) {
      console.error('Error in DeepSeek service:', error);
      throw error;
    }
  }

  /**
   * Generate a fallback response when API is not available
   * @param {string} message - The user's message
   * @returns {string} - A fallback response
   */
  getFallbackResponse(message) {
    // Simple keyword-based responses
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm Guidia AI, your career guidance assistant. How can I help you today?";
    }

    if (lowerMessage.includes('career') || lowerMessage.includes('job')) {
      return "Career development is a lifelong journey. Consider your interests, skills, and values when exploring career options. Would you like some specific advice about a particular career field?";
    }

    if (lowerMessage.includes('resume') || lowerMessage.includes('cv')) {
      return "A strong resume highlights your achievements, skills, and experience relevant to the job you're applying for. Make sure to tailor it for each application and use action verbs to describe your accomplishments.";
    }

    if (lowerMessage.includes('interview')) {
      return "Preparing for interviews involves researching the company, practicing common questions, preparing examples of your achievements, and having questions ready to ask the interviewer. Would you like specific interview tips?";
    }

    if (lowerMessage.includes('education') || lowerMessage.includes('degree') || lowerMessage.includes('study')) {
      return "Education is valuable for career advancement. Consider your career goals when choosing educational paths. Remember that formal degrees, certifications, and self-learning all have their place depending on your field.";
    }

    // Default response
    return "I'm here to help with career guidance and professional development. Feel free to ask about job searching, resume writing, interview preparation, or career planning.";
  }
}

module.exports = OpenAIService;
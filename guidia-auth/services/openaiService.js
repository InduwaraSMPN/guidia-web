/**
 * Service for handling AI API interactions using SambaNova.ai
 */
const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

class OpenAIService {
  constructor() {
    // Get the SambaNova API key from environment variables
    this.apiKey = process.env.SAMBANOVA_API_KEY;

    // Debug logging
    console.log('Loading SambaNova API key from environment variables');
    console.log('API key available:', !!this.apiKey);
    console.log('API key first 5 chars:', this.apiKey ? this.apiKey.substring(0, 5) : 'none');
    console.log('Environment variables loaded from:', path.resolve(__dirname, '../.env'));

    try {
      // Initialize the OpenAI client with SambaNova base URL
      this.client = new OpenAI({
        baseURL: 'https://api.sambanova.ai/v1',
        apiKey: this.apiKey, // Use the API key from environment variables
        dangerouslyAllowBrowser: true // Allow browser usage
      });

      // Log the status for debugging
      if (!this.apiKey) {
        console.warn('SambaNova API key is not set. Using fallback responses.');
        this.useAI = false;
      } else {
        console.log('SambaNova API key is configured:', this.apiKey.substring(0, 5) + '...');
        this.useAI = true;
      }
    } catch (error) {
      console.error('Error initializing SambaNova client:', error);
      this.useAI = false;
    }
  }

  /**
   * Send a message to OpenAI and get a response
   * @param {string} message - The user's message
   * @param {Array} history - Previous conversation history
   * @param {boolean} stream - Whether to stream the response
   * @returns {Promise<string|ReadableStream>} - The AI response or a stream
   */
  async sendMessage(message, history = [], stream = false) {
    try {
      console.log('Sending message to SambaNova:', { messageLength: message.length, historyLength: history.length, stream });
      console.log('API key available:', !!this.apiKey);
      console.log('useAI flag:', this.useAI);

      // If API key is not available or we're not using AI, use fallback responses
      if (!this.apiKey || !this.useAI) {
        console.log('Using fallback response due to:', { noApiKey: !this.apiKey, useAIDisabled: !this.useAI });
        return this.getFallbackResponse(message);
      }

      // Format the conversation history for SambaNova
      const messages = [
        {
          role: "system",
          content: "You are Guidia AI, powered by Meta-Llama-3.1-405B-Instruct on SambaNova, a helpful career guidance assistant. You provide advice on career paths, job opportunities, educational resources, and professional development. Be concise, friendly, and supportive. When asked about your model, identify yourself as Meta-Llama-3.1-405B-Instruct on SambaNova."
        },
        ...history.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      // Common request parameters
      const requestParams = {
        model: "Meta-Llama-3.1-405B-Instruct", // Using Meta-Llama-3.1-405B-Instruct model
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      };

      // Make the API request to SambaNova using the OpenAI SDK
      console.log('Making API request to SambaNova with client:', !!this.client);
      console.log('Request parameters:', {
        ...requestParams,
        stream
      });

      try {
        console.log('About to call SambaNova API with model:', "Meta-Llama-3.1-405B-Instruct");

        if (stream) {
          // Return a streaming response
          console.log('Creating streaming response');
          const streamResponse = await this.client.chat.completions.create({
            ...requestParams,
            stream: true
          });

          return streamResponse;
        } else {
          // Return a regular response
          const completion = await this.client.chat.completions.create(requestParams);

          console.log('SambaNova API response received:', {
            status: 'success',
            choicesLength: completion.choices?.length || 0
          });

          return completion.choices[0].message.content.trim();
        }
      } catch (apiError) {
        console.error('SambaNova API call failed:', apiError);
        console.error('Error details:', apiError.message);

        // Return a fallback response instead of throwing the error
        console.log('Using fallback response due to API error');
        return this.getFallbackResponse(message);
      }
    } catch (error) {
      console.error('Error in SambaNova service:', error);
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
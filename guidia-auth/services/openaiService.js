/**
 * Service for handling AI API interactions using SambaNova.ai and DeepSeek
 */
const { OpenAI } = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

class OpenAIService {
  constructor() {
    // Get the API keys from environment variables
    this.sambanovaApiKey = process.env.SAMBANOVA_API_KEY;
    this.deepseekApiKey = process.env.DEEPSEEK_API_KEY;

    // Set default provider based on available API keys
    if (this.sambanovaApiKey) {
      this.provider = 'sambanova';
    } else if (this.deepseekApiKey) {
      this.provider = 'deepseek';
    } else {
      this.provider = 'sambanova'; // Default fallback
    }

    // Debug logging
    console.log('Loading API keys from environment variables');
    console.log('SambaNova API key available:', !!this.sambanovaApiKey);
    console.log('SambaNova API key first 5 chars:', this.sambanovaApiKey ? this.sambanovaApiKey.substring(0, 5) : 'none');
    console.log('DeepSeek API key available:', !!this.deepseekApiKey);
    console.log('DeepSeek API key first 5 chars:', this.deepseekApiKey ? this.deepseekApiKey.substring(0, 5) : 'none');
    console.log('Environment variables loaded from:', path.resolve(__dirname, '../.env'));

    try {
      // Initialize the SambaNova client
      if (this.sambanovaApiKey) {
        this.sambanovaClient = new OpenAI({
          baseURL: 'https://api.sambanova.ai/v1',
          apiKey: this.sambanovaApiKey,
          dangerouslyAllowBrowser: true // Allow browser usage
        });
        console.log('SambaNova client initialized');
      }

      // Initialize the DeepSeek client
      if (this.deepseekApiKey) {
        this.deepseekClient = new OpenAI({
          baseURL: 'https://api.deepseek.com',
          apiKey: this.deepseekApiKey,
          dangerouslyAllowBrowser: true // Allow browser usage
        });
        console.log('DeepSeek client initialized');
      }

      // Log the status for debugging
      if (!this.sambanovaApiKey && !this.deepseekApiKey) {
        console.warn('No API keys are set. Using fallback responses.');
        this.useAI = false;
      } else {
        console.log('At least one API key is configured');
        this.useAI = true;
      }
    } catch (error) {
      console.error('Error initializing AI clients:', error);
      this.useAI = false;
    }
  }

  /**
   * Set the AI provider to use
   * @param {string} provider - The provider to use ('sambanova' or 'deepseek')
   */
  setProvider(provider) {
    if (provider === 'sambanova' || provider === 'deepseek') {
      this.provider = provider;
      console.log(`Provider set to ${provider}`);
    } else {
      console.warn(`Invalid provider: ${provider}. Using default provider: ${this.provider}`);
    }
  }

  /**
   * Send a message to OpenAI and get a response
   * @param {string} message - The user's message
   * @param {Array} history - Previous conversation history
   * @param {boolean} stream - Whether to stream the response
   * @param {string} provider - Optional provider override ('sambanova' or 'deepseek')
   * @returns {Promise<string|ReadableStream>} - The AI response or a stream
   */
  async sendMessage(message, history = [], stream = false, provider = null) {
    try {
      // Use provided provider or default to the class property
      let activeProvider = provider || this.provider;

      // If the requested provider doesn't have an API key, try the other one
      if (activeProvider === 'sambanova' && !this.sambanovaApiKey && this.deepseekApiKey) {
        console.log('SambaNova API key not available, switching to DeepSeek');
        activeProvider = 'deepseek';
      } else if (activeProvider === 'deepseek' && !this.deepseekApiKey && this.sambanovaApiKey) {
        console.log('DeepSeek API key not available, switching to SambaNova');
        activeProvider = 'sambanova';
      }

      console.log('Sending message to AI using provider:', activeProvider);
      console.log('Message details:', { messageLength: message.length, historyLength: history.length, stream });

      // Determine which client and API key to use
      let client, apiKey, model;

      if (activeProvider === 'sambanova') {
        client = this.sambanovaClient;
        apiKey = this.sambanovaApiKey;
        model = "Meta-Llama-3.1-405B-Instruct"; // SambaNova's Llama 3.1 model
      } else if (activeProvider === 'deepseek') {
        client = this.deepseekClient;
        apiKey = this.deepseekApiKey;
        model = "deepseek-chat"; // DeepSeek's model
      }

      console.log(`${activeProvider} API key available:`, !!apiKey);
      console.log('useAI flag:', this.useAI);

      // If API key is not available or we're not using AI, use fallback responses
      if (!apiKey || !this.useAI || !client) {
        console.log('Using fallback response due to:', {
          noApiKey: !apiKey,
          useAIDisabled: !this.useAI,
          noClient: !client
        });
        return this.getFallbackResponse(message);
      }

      // Format the conversation history
      const messages = [
        {
          role: "system",
          content: "You are Guidia AI, the official AI assistant for 'Guidia', the web-based platform streamlining career guidance at the University of Kelaniya's Career Guidance Unit (CGU). Your purpose is to support University of Kelaniya students, counselors, and potentially companies interacting with the platform.\nYour Core Functions:\nAnswer FAQs: Address common questions about CGU services, using the Guidia platform features (job applications, profile management, finding resources), career paths, and professional development.\nSurface Platform Content: Provide information about specific job postings, upcoming events, and news articles published on the Guidia platform when asked.\nNavigation Assistance: Help users find specific sections or information within the Guidia platform.\nReferral: Recognize when a question requires detailed, personalized counseling. In such cases, explain that you are an AI assistant for initial guidance and direct the user (especially students) to the process for scheduling an appointment with a human Career Counselor through the platform.\nYour Tone: Be helpful, friendly, supportive, professional, and concise. Ensure your responses are relevant to the University of Kelaniya context and the features described in the Guidia platform."
        },
        ...history.map(msg => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      // Common request parameters
      const requestParams = {
        model: model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      };

      // Make the API request using the OpenAI SDK
      console.log(`Making API request to ${activeProvider} with client:`, !!client);
      console.log('Request parameters:', {
        ...requestParams,
        stream
      });

      try {
        console.log(`About to call ${activeProvider} API with model:`, model);

        if (stream) {
          // Return a streaming response
          console.log('Creating streaming response');
          const streamResponse = await client.chat.completions.create({
            ...requestParams,
            stream: true
          });

          return streamResponse;
        } else {
          // Return a regular response
          const completion = await client.chat.completions.create(requestParams);

          console.log('AI API response received:', {
            status: 'success',
            choicesLength: completion.choices?.length || 0
          });

          return completion.choices[0].message.content.trim();
        }
      } catch (apiError) {
        console.error(`${activeProvider} API call failed:`, apiError);
        console.error('Error details:', apiError.message);

        // Try the other provider if available
        const alternateProvider = activeProvider === 'sambanova' ? 'deepseek' : 'sambanova';
        const alternateClient = activeProvider === 'sambanova' ? this.deepseekClient : this.sambanovaClient;
        const alternateApiKey = activeProvider === 'sambanova' ? this.deepseekApiKey : this.sambanovaApiKey;

        if (alternateClient && alternateApiKey) {
          console.log(`Trying alternate provider: ${alternateProvider}`);
          try {
            return await this.sendMessage(message, history, stream, alternateProvider);
          } catch (alternateError) {
            console.error(`Alternate provider ${alternateProvider} also failed:`, alternateError);
            // Fall back to the fallback response
            return this.getFallbackResponse(message);
          }
        } else {
          // Return a fallback response instead of throwing the error
          console.log('Using fallback response due to API error');
          return this.getFallbackResponse(message);
        }
      }
    } catch (error) {
      console.error('Error in AI service:', error);
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
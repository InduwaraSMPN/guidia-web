/**
 * Controller for handling AI API interactions with DeepSeek
 */
const OpenAIService = require('../services/openaiService');

const aiController = {
  /**
   * Send a message to the DeepSeek API and get a response
   */
  sendMessage: async (req, res) => {
    try {
      const { message, history } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      console.log('Controller received message request:', { messageLength: message?.length || 0, historyLength: history?.length || 0 });

      // Initialize AI service with API key from environment
      const aiService = new OpenAIService();
      console.log('AI service initialized');

      // Send message to DeepSeek
      console.log('Sending message to AI service');
      const response = await aiService.sendMessage(message, history || []);
      console.log('Response received from AI service:', { responseLength: response?.length || 0 });

      return res.status(200).json({
        success: true,
        data: { response }
      });
    } catch (error) {
      console.error('Error in AI controller:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get AI response',
        error: error.message
      });
    }
  }
};

module.exports = aiController;

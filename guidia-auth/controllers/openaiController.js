/**
 * Controller for handling AI API interactions with multiple providers (SambaNova, DeepSeek)
 */
const OpenAIService = require('../services/openaiService');

const aiController = {
  /**
   * Send a message to the AI API and get a response
   */
  sendMessage: async (req, res) => {
    try {
      const { message, history, stream = false, provider = null } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      console.log('Controller received message request:', {
        messageLength: message?.length || 0,
        historyLength: history?.length || 0,
        stream
      });

      // Initialize AI service with API key from environment
      const aiService = new OpenAIService();

      // Set the provider if specified
      if (provider) {
        aiService.setProvider(provider);
      }

      console.log('AI service initialized with provider:', provider || aiService.provider);

      // Handle streaming response
      if (stream) {
        try {
          // Set appropriate headers for SSE
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders();

          // Get streaming response from SambaNova
          console.log('Requesting streaming response from AI service');
          const streamResponse = await aiService.sendMessage(message, history || [], true);

          // Stream the response chunks to the client
          for await (const chunk of streamResponse) {
            if (chunk.choices && chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              // Send the content chunk to the client
              res.write(`data: ${JSON.stringify({ content })}

`);
            }
          }

          // End the stream
          res.write('data: [DONE]\n\n');
          res.end();
          console.log('Streaming response completed successfully');
        } catch (streamError) {
          console.error('Error in streaming response:', streamError);

          // Check if headers have been sent
          if (!res.headersSent) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();
          }

          res.write(`data: ${JSON.stringify({ error: 'Streaming error occurred' })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
        }
      } else {
        // Handle regular response
        console.log('Sending message to AI service');
        const response = await aiService.sendMessage(message, history || [], false);
        console.log('Response received from AI service:', { responseLength: response?.length || 0 });

        return res.status(200).json({
          success: true,
          data: { response }
        });
      }
    } catch (error) {
      console.error('Error in AI controller:', error);

      // If headers have been sent, it means we're in the middle of streaming
      if (res.headersSent) {
        try {
          res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
          res.write('data: [DONE]\n\n');
          res.end();
        } catch (writeError) {
          console.error('Error writing to stream after error:', writeError);
        }
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to get AI response',
          error: error.message
        });
      }
    }
  },

  /**
   * Stream a message to the AI API and get a streaming response
   * This is an alternative endpoint specifically for streaming
   */
  streamMessage: async (req, res) => {
    try {
      const { message, history, provider = null } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      console.log('Stream endpoint received message request:', {
        messageLength: message?.length || 0,
        historyLength: history?.length || 0
      });

      try {
        // Set appropriate headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // Initialize AI service
        const aiService = new OpenAIService();

        // Set the provider if specified
        if (provider) {
          aiService.setProvider(provider);
        }

        console.log('AI service initialized for streaming with provider:', provider || aiService.provider);

        // Get streaming response from SambaNova
        const streamResponse = await aiService.sendMessage(message, history || [], true);
        console.log('Streaming response object received');

        // Stream the response chunks to the client
        for await (const chunk of streamResponse) {
          if (chunk.choices && chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;
            // Send the content chunk to the client
            res.write(`data: ${JSON.stringify({ content })}

`);
          }
        }

        // End the stream
        res.write('data: [DONE]\n\n');
        res.end();
        console.log('Streaming completed successfully');
      } catch (streamError) {
        console.error('Error in streaming response:', streamError);

        // Check if headers have been sent
        if (!res.headersSent) {
          res.setHeader('Content-Type', 'text/event-stream');
          res.setHeader('Cache-Control', 'no-cache');
          res.setHeader('Connection', 'keep-alive');
          res.flushHeaders();
        }

        res.write(`data: ${JSON.stringify({ error: 'Streaming error occurred', details: streamError.message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    } catch (error) {
      console.error('Error in AI streaming controller:', error);

      // If headers have not been sent yet, set them
      if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
      }

      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
};

module.exports = aiController;

/**
 * Controller for handling AI API interactions with multiple providers (SambaNova, DeepSeek)
 */
const OpenAIService = require('../services/openaiService');
const pool = require('../config/db');

const aiController = {
  /**
   * Send a message to the AI API and get a response
   */
  sendMessage: async (req, res) => {
    try {
      const { message, history, stream = false, provider = null, conversationID = null } = req.body;
      const userID = req.user?.id; // User ID may be null for non-authenticated users

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      console.log('Controller received message request:', {
        messageLength: message?.length || 0,
        historyLength: history?.length || 0,
        stream,
        conversationID
      });

      // Initialize AI service with API key from environment
      const aiService = new OpenAIService();

      // Set the provider if specified
      if (provider) {
        aiService.setProvider(provider);
      }

      console.log('AI service initialized with provider:', provider || aiService.provider);

      // If user is authenticated and we have a conversationID, verify it belongs to the user
      let verifiedConversationID = null;
      if (userID && conversationID) {
        try {
          const [conversations] = await pool.query(
            'SELECT * FROM ai_chat_conversations WHERE conversationID = ? AND userID = ?',
            [conversationID, userID]
          );

          if (conversations.length > 0) {
            verifiedConversationID = conversationID;
          } else {
            console.warn(`Conversation ID ${conversationID} does not belong to user ${userID}`);
          }
        } catch (dbError) {
          console.error('Error verifying conversation ownership:', dbError);
        }
      }

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

          // For collecting the complete response
          let completeResponse = '';

          // Stream the response chunks to the client
          for await (const chunk of streamResponse) {
            if (chunk.choices && chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              completeResponse += content;

              // Send the content chunk to the client
              res.write(`data: ${JSON.stringify({ content })}

`);
            }
          }

          // Save the conversation and messages if user is authenticated
          if (userID) {
            try {
              await saveConversationAndMessages(
                userID,
                verifiedConversationID,
                message,
                completeResponse,
                history
              );
            } catch (saveError) {
              console.error('Error saving conversation:', saveError);
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

        // Save the conversation and messages if user is authenticated
        if (userID) {
          try {
            await saveConversationAndMessages(
              userID,
              verifiedConversationID,
              message,
              response,
              history
            );
          } catch (saveError) {
            console.error('Error saving conversation:', saveError);
          }
        }

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
      const { message, history, provider = null, conversationID = null } = req.body;
      const userID = req.user?.id; // User ID may be null for non-authenticated users

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      console.log('Stream endpoint received message request:', {
        messageLength: message?.length || 0,
        historyLength: history?.length || 0,
        conversationID
      });

      // If user is authenticated and we have a conversationID, verify it belongs to the user
      let verifiedConversationID = null;
      if (userID && conversationID) {
        try {
          const [conversations] = await pool.query(
            'SELECT * FROM ai_chat_conversations WHERE conversationID = ? AND userID = ?',
            [conversationID, userID]
          );

          if (conversations.length > 0) {
            verifiedConversationID = conversationID;
          } else {
            console.warn(`Conversation ID ${conversationID} does not belong to user ${userID}`);
          }
        } catch (dbError) {
          console.error('Error verifying conversation ownership:', dbError);
        }
      }

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

        // For collecting the complete response
        let completeResponse = '';

        // Stream the response chunks to the client
        for await (const chunk of streamResponse) {
          if (chunk.choices && chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;
            completeResponse += content;

            // Send the content chunk to the client
            res.write(`data: ${JSON.stringify({ content })}

`);
          }
        }

        // Save the conversation and messages if user is authenticated
        if (userID) {
          try {
            await saveConversationAndMessages(
              userID,
              verifiedConversationID,
              message,
              completeResponse,
              history
            );
          } catch (saveError) {
            console.error('Error saving conversation:', saveError);
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

/**
 * Helper function to save conversation and messages to the database
 * @param {number} userID - User ID
 * @param {number|null} conversationID - Existing conversation ID or null for new conversation
 * @param {string} userMessage - User's message
 * @param {string} aiResponse - AI's response
 * @param {Array} history - Previous conversation history
 * @returns {Promise<number>} - The conversation ID
 */
async function saveConversationAndMessages(userID, conversationID, userMessage, aiResponse, history) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // If no conversationID, create a new conversation
    if (!conversationID) {
      // Generate a title from the first user message
      const title = userMessage.length > 50
        ? `${userMessage.substring(0, 47)}...`
        : userMessage;

      const [result] = await connection.query(
        'INSERT INTO ai_chat_conversations (userID, title) VALUES (?, ?)',
        [userID, title]
      );

      conversationID = result.insertId;
      console.log(`Created new conversation with ID: ${conversationID}`);

      // If we have history, save it to the new conversation
      if (history && history.length > 0) {
        for (const msg of history) {
          await connection.query(
            'INSERT INTO ai_chat_messages (conversationID, content, isUserMessage, isRichText) VALUES (?, ?, ?, ?)',
            [conversationID, msg.content, msg.isUser ? 1 : 0, 0]
          );
        }
      }
    }

    // Save the user message
    await connection.query(
      'INSERT INTO ai_chat_messages (conversationID, content, isUserMessage, isRichText) VALUES (?, ?, ?, ?)',
      [conversationID, userMessage, 1, 0]
    );

    // Save the AI response
    await connection.query(
      'INSERT INTO ai_chat_messages (conversationID, content, isUserMessage, isRichText) VALUES (?, ?, ?, ?)',
      [conversationID, aiResponse, 0, 1]
    );

    // Update the conversation's updatedAt timestamp
    await connection.query(
      'UPDATE ai_chat_conversations SET updatedAt = CURRENT_TIMESTAMP WHERE conversationID = ?',
      [conversationID]
    );

    await connection.commit();
    return conversationID;
  } catch (error) {
    await connection.rollback();
    console.error('Error in saveConversationAndMessages:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = aiController;

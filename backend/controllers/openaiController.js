/**
 * Controller for handling AI API interactions with multiple providers (SambaNova, DeepSeek)
 */
const OpenAIService = require('../services/openaiService');
const DbContextService = require('../services/dbContextService');
const pool = require('../config/db');

const aiController = {
  /**
   * Send a message to the AI API and get a response
   */
  sendMessage: async (req, res) => {
    try {
      const { message, history, stream = false, provider = null, conversationID = null } = req.body;
      // Fix user ID inconsistency by checking all possible fields
      const userID = req.user?.userID || req.user?.userId || req.user?.id; // User ID may be null for non-authenticated users

      console.log('User ID from request:', {
        userID,
        'req.user.userID': req.user?.userID,
        'req.user.userId': req.user?.userId,
        'req.user.id': req.user?.id
      });

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

      // Fetch database context for the user if authenticated
      let dbContext = null;
      if (userID) {
        console.log('Fetching database context for user:', userID);
        try {
          // Get user profile information
          const userContext = await DbContextService.getUserContext(userID);

          // Get recent chat history
          const recentConversations = await DbContextService.getRecentChatHistory(userID, 2);

          // Check if the message is a job search query
          const isJobQuery = this.isJobSearchQuery(message);

          // Get jobs based on query or user profile
          let jobs = [];
          if (isJobQuery) {
            console.log('Detected job search query, searching for relevant jobs');
            const jobKeywords = this.extractJobKeywords(message);
            console.log(`Extracted job keywords: "${jobKeywords}"`);

            // Use the new getRelatedJobs method which combines user interests with the query
            jobs = await DbContextService.getRelatedJobs(userID, jobKeywords, 5);
            console.log(`Found ${jobs.length} jobs matching query and user interests`);
          } else {
            // Get relevant jobs based on user profile
            jobs = await DbContextService.getRelatedJobs(userID, '', 3);
          }

          // Get upcoming events
          const events = await DbContextService.getUpcomingEvents(2);

          // Get latest news
          const news = await DbContextService.getLatestNews(2);

          // Get user's meetings
          const meetings = await DbContextService.getUserMeetings(userID, 2);

          // Get user's job applications (for students)
          const jobApplications = await DbContextService.getUserJobApplications(userID, 3);

          // Combine context
          dbContext = {
            ...userContext,
            recentConversations,
            jobs,
            events,
            news,
            meetings,
            jobApplications
          };

          console.log('Database context fetched successfully');
        } catch (contextError) {
          console.error('Error fetching database context:', contextError);
          // Continue without context if there's an error
        }
      } else {
        console.log('No user ID available, skipping database context');
      }

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

          // Format database context for prompt if available
          let formattedDbContext = null;
          if (dbContext) {
            formattedDbContext = DbContextService.formatContextForPrompt(dbContext);
            console.log('Database context formatted for prompt');
          }

          // Get streaming response from AI service with database context
          console.log('Requesting streaming response from AI service');
          const streamResponse = await aiService.sendMessage(message, history || [], true, null, formattedDbContext);

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

        // Format database context for prompt if available
        let formattedDbContext = null;
        if (dbContext) {
          formattedDbContext = DbContextService.formatContextForPrompt(dbContext);
          console.log('Database context formatted for prompt');
        }

        const response = await aiService.sendMessage(message, history || [], false, null, formattedDbContext);
        console.log('Response received from AI service:', { responseLength: response?.length || 0 });

        // Save the conversation and messages if user is authenticated
        if (userID) {
          console.log('Attempting to save conversation for user:', userID);
          try {
            const savedConversationID = await saveConversationAndMessages(
              userID,
              verifiedConversationID,
              message,
              response,
              history
            );
            console.log('Successfully saved conversation with ID:', savedConversationID);

            // Verify the conversation was saved
            const [conversations] = await pool.query(
              'SELECT * FROM ai_chat_conversations WHERE conversationID = ?',
              [savedConversationID]
            );
            console.log(`Verification after save: Found ${conversations.length} conversations with ID ${savedConversationID}`);

            // Verify messages were saved
            const [messages] = await pool.query(
              'SELECT COUNT(*) as count FROM ai_chat_messages WHERE conversationID = ?',
              [savedConversationID]
            );
            console.log(`Verification after save: Found ${messages[0].count} messages for conversation ${savedConversationID}`);
          } catch (saveError) {
            console.error('Error saving conversation:', saveError);
            console.error('Error details:', saveError.message, saveError.stack);
          }
        } else {
          console.log('No user ID available, skipping conversation save');
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
      // Fix user ID inconsistency by checking all possible fields
      const userID = req.user?.userID || req.user?.userId || req.user?.id; // User ID may be null for non-authenticated users

      console.log('User ID from request (stream):', {
        userID,
        'req.user.userID': req.user?.userID,
        'req.user.userId': req.user?.userId,
        'req.user.id': req.user?.id
      });

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

        // Fetch database context for the user if authenticated
        let dbContext = null;
        let formattedDbContext = null;

        if (userID) {
          console.log('Fetching database context for user:', userID);
          try {
            // Get user profile information
            const userContext = await DbContextService.getUserContext(userID);

            // Get recent chat history
            const recentConversations = await DbContextService.getRecentChatHistory(userID, 2);

            // Check if the message is a job search query
            const isJobQuery = this.isJobSearchQuery(message);

            // Get jobs based on query or user profile
            let jobs = [];
            if (isJobQuery) {
              console.log('Detected job search query in streaming mode, searching for relevant jobs');
              const jobKeywords = this.extractJobKeywords(message);
              console.log(`Extracted job keywords: "${jobKeywords}"`);

              // Use the new getRelatedJobs method which combines user interests with the query
              jobs = await DbContextService.getRelatedJobs(userID, jobKeywords, 5);
              console.log(`Found ${jobs.length} jobs matching query and user interests`);
            } else {
              // Get relevant jobs based on user profile
              jobs = await DbContextService.getRelatedJobs(userID, '', 3);
            }

            // Get upcoming events
            const events = await DbContextService.getUpcomingEvents(2);

            // Get latest news
            const news = await DbContextService.getLatestNews(2);

            // Get user's meetings
            const meetings = await DbContextService.getUserMeetings(userID, 2);

            // Get user's job applications (for students)
            const jobApplications = await DbContextService.getUserJobApplications(userID, 3);

            // Combine context
            dbContext = {
              ...userContext,
              recentConversations,
              jobs,
              events,
              news,
              meetings,
              jobApplications
            };

            // Format database context for prompt
            formattedDbContext = DbContextService.formatContextForPrompt(dbContext);
            console.log('Database context fetched and formatted successfully');
          } catch (contextError) {
            console.error('Error fetching database context:', contextError);
            // Continue without context if there's an error
          }
        } else {
          console.log('No user ID available, skipping database context');
        }

        // Get streaming response from AI service with database context
        const streamResponse = await aiService.sendMessage(message, history || [], true, null, formattedDbContext);
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
  console.log('Saving conversation and messages:', {
    userID,
    conversationID: conversationID || 'new',
    messageLength: userMessage.length,
    responseLength: aiResponse.length,
    historyLength: history?.length || 0
  });

  if (!userID) {
    console.error('Cannot save conversation: No user ID provided');
    throw new Error('No user ID provided');
  }

  // Enhanced debugging: Check if the user exists in the database
  try {
    // Check with userID field (the correct field in the database)
    const [userCheck] = await pool.query('SELECT * FROM users WHERE userID = ?', [userID]);
    console.log(`User check for userID ${userID}:`, userCheck.length > 0 ? 'Found' : 'Not found');
  } catch (error) {
    console.error('Error checking user existence:', error);
  }

  const connection = await pool.getConnection();

  try {
    console.log('Beginning transaction with connection:', connection ? 'Valid connection' : 'Invalid connection');
    await connection.beginTransaction();

    // If no conversationID, create a new conversation
    if (!conversationID) {
      // Generate a title from the first user message
      const title = userMessage.length > 50
        ? `${userMessage.substring(0, 47)}...`
        : userMessage;

      console.log('Creating new conversation with title:', title);

      // Try to find the correct user ID field
      let effectiveUserID = userID;
      try {
        const [userRecord] = await connection.query('SELECT userID FROM users WHERE userID = ?', [userID]);
        console.log('User record found:', userRecord[0]);
        if (userRecord.length > 0) {
          // Use the userID field from the database
          effectiveUserID = userRecord[0].userID;
          console.log('Using effective userID:', effectiveUserID);
        }
      } catch (error) {
        console.error('Error finding effective userID:', error);
      }

      console.log('Attempting to insert new conversation with userID:', effectiveUserID);
      try {
        const [result] = await connection.query(
          'INSERT INTO ai_chat_conversations (userID, title) VALUES (?, ?)',
          [effectiveUserID, title]
        );

        conversationID = result.insertId;
        console.log(`Created new conversation with ID: ${conversationID} for userID: ${effectiveUserID}`);
      } catch (insertError) {
        console.error('Error inserting new conversation:', insertError);
        console.error('SQL Error:', insertError.sqlMessage);
        console.error('SQL State:', insertError.sqlState);
        throw insertError;
      }

      // If we have history, save it to the new conversation
      if (history && history.length > 0) {
        console.log(`Saving ${history.length} history messages to conversation ${conversationID}`);
        for (const msg of history) {
          await connection.query(
            'INSERT INTO ai_chat_messages (conversationID, content, isUserMessage, isRichText) VALUES (?, ?, ?, ?)',
            [conversationID, msg.content, msg.isUser ? 1 : 0, 0]
          );
        }
      }
    } else {
      console.log(`Using existing conversation with ID: ${conversationID}`);
    }

    // Save the user message
    console.log('Saving user message to conversation:', conversationID);
    try {
      const [userMsgResult] = await connection.query(
        'INSERT INTO ai_chat_messages (conversationID, content, isUserMessage, isRichText) VALUES (?, ?, ?, ?)',
        [conversationID, userMessage, 1, 0]
      );
      console.log('User message saved with ID:', userMsgResult.insertId);
    } catch (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      console.error('SQL Error:', userMsgError.sqlMessage);
      console.error('SQL State:', userMsgError.sqlState);
      throw userMsgError;
    }

    // Save the AI response
    console.log('Saving AI response to conversation:', conversationID);
    try {
      const [aiMsgResult] = await connection.query(
        'INSERT INTO ai_chat_messages (conversationID, content, isUserMessage, isRichText) VALUES (?, ?, ?, ?)',
        [conversationID, aiResponse, 0, 1]
      );
      console.log('AI response saved with ID:', aiMsgResult.insertId);
    } catch (aiMsgError) {
      console.error('Error saving AI response:', aiMsgError);
      console.error('SQL Error:', aiMsgError.sqlMessage);
      console.error('SQL State:', aiMsgError.sqlState);
      throw aiMsgError;
    }

    // Update the conversation's updatedAt timestamp
    console.log('Updating conversation timestamp');
    await connection.query(
      'UPDATE ai_chat_conversations SET updatedAt = CURRENT_TIMESTAMP WHERE conversationID = ?',
      [conversationID]
    );

    await connection.commit();
    console.log('Transaction committed successfully');

    // Verify the conversation exists after saving
    const [conversations] = await pool.query(
      'SELECT * FROM ai_chat_conversations WHERE conversationID = ?',
      [conversationID]
    );
    console.log(`Verification: Found ${conversations.length} conversations with ID ${conversationID}`);

    // Verify messages were saved
    const [messages] = await pool.query(
      'SELECT COUNT(*) as count FROM ai_chat_messages WHERE conversationID = ?',
      [conversationID]
    );
    console.log(`Verification: Found ${messages[0].count} messages for conversation ${conversationID}`);

    return conversationID;
  } catch (error) {
    console.error('Error in saveConversationAndMessages, rolling back transaction:', error);
    try {
      await connection.rollback();
      console.log('Transaction rolled back successfully');
    } catch (rollbackError) {
      console.error('Error rolling back transaction:', rollbackError);
    }
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Check if a message is a job search query
 * @param {string} message - The user's message
 * @returns {boolean} - Whether the message is a job search query
 */
function isJobSearchQuery(message) {
  if (!message) return false;

  // Common industry terms that indicate job search intent
  const industryTerms = [
    'banking', 'finance', 'accounting', 'marketing', 'sales', 'engineering',
    'software', 'development', 'IT', 'healthcare', 'medical', 'legal',
    'education', 'teaching', 'hospitality', 'retail', 'manufacturing',
    'construction', 'design', 'media', 'communications', 'human resources',
    'HR', 'administration', 'customer service', 'data', 'science', 'research'
  ];

  // Create a regex pattern to match industry terms (case insensitive, whole word)
  const industryPattern = new RegExp(`\\b(${industryTerms.join('|')})\\b`, 'gi');

  // Job-related terms
  const jobQueryPatterns = [
    /jobs?/i,
    /career/i,
    /position/i,
    /opening/i,
    /vacancy/i,
    /employment/i,
    /hire/i,
    /hiring/i,
    /work/i,
    /opportunity/i,
    /role/i,
    /apply/i,
    /application/i,
    /interview/i,
    /recruit/i
  ];

  // Question or search intent patterns
  const questionPatterns = [
    /are there/i,
    /is there/i,
    /do you have/i,
    /can i find/i,
    /looking for/i,
    /searching for/i,
    /interested in/i,
    /available/i,
    /show me/i,
    /tell me about/i,
    /any/i,
    /list/i,
    /what/i,
    /where/i,
    /how/i,
    /related to/i,
    /in the field of/i,
    /find/i,
    /search/i
  ];

  // Check if the message contains job-related terms
  const hasJobTerm = jobQueryPatterns.some(pattern => pattern.test(message));

  // Check if the message contains question patterns
  const hasQuestionPattern = questionPatterns.some(pattern => pattern.test(message));

  // Check if the message contains industry terms
  const hasIndustryTerm = industryPattern.test(message);

  // Consider it a job search query if:
  // 1. It contains both job-related terms and question patterns, OR
  // 2. It contains industry terms along with either job-related terms or question patterns
  return (hasJobTerm && hasQuestionPattern) ||
         (hasIndustryTerm && (hasJobTerm || hasQuestionPattern));
}

/**
 * Extract job keywords from a message
 * @param {string} message - The user's message
 * @returns {string} - Extracted job keywords
 */
function extractJobKeywords(message) {
  if (!message) return '';

  // Common industry terms to preserve
  const industryTerms = [
    'banking', 'finance', 'accounting', 'marketing', 'sales', 'engineering',
    'software', 'development', 'IT', 'healthcare', 'medical', 'legal',
    'education', 'teaching', 'hospitality', 'retail', 'manufacturing',
    'construction', 'design', 'media', 'communications', 'human resources',
    'HR', 'administration', 'customer service', 'data', 'science', 'research',
    'analyst', 'manager', 'director', 'assistant', 'specialist', 'coordinator',
    'executive', 'associate', 'consultant', 'technician', 'developer', 'engineer',
    'architect', 'designer', 'writer', 'editor', 'full-time', 'part-time', 'contract',
    'internship', 'entry-level', 'junior', 'senior', 'lead', 'head', 'chief'
  ];

  // Create a regex pattern to match industry terms (case insensitive, whole word)
  const industryPattern = new RegExp(`\\b(${industryTerms.join('|')})\\b`, 'gi');

  // Extract industry terms from the message
  const industryMatches = message.match(industryPattern) || [];

  // Remove common question phrases and job-related terms
  let cleanedMessage = message.replace(/are there|is there|do you have|can i find|looking for|searching for|interested in|available|show me|tell me about|any/gi, '');
  cleanedMessage = cleanedMessage.replace(/jobs?|career|position|opening|vacancy|employment|hire|hiring|work|opportunity/gi, '');

  // Remove common filler words
  cleanedMessage = cleanedMessage.replace(/\b(a|an|the|in|on|at|for|with|about|of|to|by|as|if|or|and|but)\b/gi, ' ');

  // Remove punctuation and extra spaces
  cleanedMessage = cleanedMessage.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // If we have industry terms, prioritize those
  if (industryMatches.length > 0) {
    // Remove duplicates and join
    const uniqueTerms = [...new Set(industryMatches.map(term => term.toLowerCase()))];

    // If we have both industry terms and other keywords, combine them
    if (cleanedMessage) {
      return uniqueTerms.join(' ') + ' ' + cleanedMessage;
    }

    return uniqueTerms.join(' ');
  }

  return cleanedMessage;
}

// Add the helper methods to the controller
aiController.isJobSearchQuery = isJobSearchQuery;
aiController.extractJobKeywords = extractJobKeywords;

module.exports = aiController;

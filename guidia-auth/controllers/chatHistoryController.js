/**
 * Controller for managing AI chat history
 */
const pool = require('../config/db');

const chatHistoryController = {
  /**
   * Create a new conversation
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  createConversation: async (req, res) => {
    try {
      const { title } = req.body;
      const userID = req.user.userID || req.user.userId;

      const [result] = await pool.query(
        'INSERT INTO ai_chat_conversations (userID, title) VALUES (?, ?)',
        [userID, title || 'New Conversation']
      );

      return res.status(201).json({
        success: true,
        data: {
          conversationID: result.insertId,
          title: title || 'New Conversation',
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create conversation',
        error: error.message
      });
    }
  },

  /**
   * Get all conversations for a user
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getUserConversations: async (req, res) => {
    try {
      // Use the userID field from the user object, with fallbacks
      const userID = req.user.userID || req.user.userId || req.user.id;
      let { page = 1, limit = 10, archived = false } = req.query;

      // Convert archived string to boolean
      if (typeof archived === 'string') {
        archived = archived.toLowerCase() === 'true';
      }

      console.log('Getting conversations for user:', userID);

      const offset = (page - 1) * limit;

      // Get total count for pagination
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM ai_chat_conversations WHERE userID = ? AND isArchived = ?',
        [userID, archived ? 1 : 0]
      );

      const total = countResult[0].total;

      // Get conversations with latest message preview
      const [conversations] = await pool.query(
        `SELECT c.*,
          (SELECT content FROM ai_chat_messages
           WHERE conversationID = c.conversationID
           ORDER BY timestamp DESC LIMIT 1) as lastMessage,
          (SELECT COUNT(*) FROM ai_chat_messages
           WHERE conversationID = c.conversationID) as messageCount
         FROM ai_chat_conversations c
         WHERE c.userID = ? AND c.isArchived = ?
         ORDER BY c.updatedAt DESC
         LIMIT ? OFFSET ?`,
        [userID, archived ? 1 : 0, parseInt(limit), offset]
      );

      // Check if we have any conversations in the database for this user
      const [allConversations] = await pool.query(
        'SELECT conversationID, isArchived FROM ai_chat_conversations WHERE userID = ?',
        [userID]
      );
      console.log('Total conversations in database for this user:', allConversations.length);

      // Check if we have any messages in the database for this user's conversations
      if (allConversations.length > 0) {
        const conversationIDs = allConversations.map(c => c.conversationID);
        const [messageCount] = await pool.query(
          'SELECT COUNT(*) as count FROM ai_chat_messages WHERE conversationID IN (?)',
          [conversationIDs]
        );
        console.log('Total messages for this user\'s conversations:', messageCount[0].count);

        // Check if any conversations have null isArchived values and fix them
        const nullArchivedConvs = allConversations.filter(c => c.isArchived === null);
        if (nullArchivedConvs.length > 0) {
          console.log('Found', nullArchivedConvs.length, 'conversations with null isArchived values');

          // Fix the null isArchived values
          for (const conv of nullArchivedConvs) {
            await pool.query(
              'UPDATE ai_chat_conversations SET isArchived = 0 WHERE conversationID = ?',
              [conv.conversationID]
            );
            console.log('Fixed isArchived for conversation', conv.conversationID);
          }

          // Retry the query with the fixed values
          console.log('Retrying query with fixed isArchived values...');
          const [fixedConversations] = await pool.query(
            `SELECT c.*,
              (SELECT content FROM ai_chat_messages
               WHERE conversationID = c.conversationID
               ORDER BY timestamp DESC LIMIT 1) as lastMessage,
              (SELECT COUNT(*) FROM ai_chat_messages
               WHERE conversationID = c.conversationID) as messageCount
             FROM ai_chat_conversations c
             WHERE c.userID = ? AND c.isArchived = ?
             ORDER BY c.updatedAt DESC
             LIMIT ? OFFSET ?`,
            [userID, archived ? 1 : 0, parseInt(limit), offset]
          );

          if (fixedConversations.length > 0) {
            console.log('Found', fixedConversations.length, 'conversations after fixing isArchived values');
            return res.status(200).json({
              success: true,
              data: {
                conversations: fixedConversations,
                pagination: {
                  total: countResult[0].total,
                  page: parseInt(page),
                  limit: parseInt(limit),
                  pages: Math.ceil(countResult[0].total / limit)
                }
              }
            });
          }
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          conversations,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get conversations',
        error: error.message
      });
    }
  },

  /**
   * Get a single conversation with all messages
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getConversation: async (req, res) => {
    try {
      const { conversationID } = req.params;
      // No need to check user ID since we're allowing access to any conversation

      // Get conversation details
      const [conversations] = await pool.query(
        'SELECT * FROM ai_chat_conversations WHERE conversationID = ?',
        [conversationID]
      );

      // If not found, return 404
      if (conversations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      // Get all messages in the conversation
      const [messages] = await pool.query(
        'SELECT * FROM ai_chat_messages WHERE conversationID = ? ORDER BY timestamp ASC',
        [conversationID]
      );

      // Get tags for the conversation
      const [tags] = await pool.query(
        `SELECT t.* FROM ai_chat_tags t
         JOIN ai_chat_conversation_tags ct ON t.tagID = ct.tagID
         WHERE ct.conversationID = ?`,
        [conversationID]
      );

      return res.status(200).json({
        success: true,
        data: {
          conversation: conversations[0],
          messages,
          tags
        }
      });
    } catch (error) {
      console.error('Error getting conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get conversation',
        error: error.message
      });
    }
  },

  /**
   * Add a message to a conversation
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  addMessage: async (req, res) => {
    try {
      const { conversationID } = req.params;
      const { content, isUserMessage, isRichText = false } = req.body;
      const userID = req.user.userID || req.user.userId || req.user.id;

      // Verify the conversation belongs to the user
      const [conversations] = await pool.query(
        'SELECT * FROM ai_chat_conversations WHERE conversationID = ? AND userID = ?',
        [conversationID, userID]
      );

      if (conversations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found or access denied'
        });
      }

      // Add the message
      const [result] = await pool.query(
        'INSERT INTO ai_chat_messages (conversationID, content, isUserMessage, isRichText) VALUES (?, ?, ?, ?)',
        [conversationID, content, isUserMessage ? 1 : 0, isRichText ? 1 : 0]
      );

      // Update the conversation's updatedAt timestamp
      await pool.query(
        'UPDATE ai_chat_conversations SET updatedAt = CURRENT_TIMESTAMP WHERE conversationID = ?',
        [conversationID]
      );

      return res.status(201).json({
        success: true,
        data: {
          messageID: result.insertId,
          conversationID,
          content,
          isUserMessage,
          isRichText,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error adding message:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add message',
        error: error.message
      });
    }
  },

  /**
   * Update conversation details
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateConversation: async (req, res) => {
    try {
      const { conversationID } = req.params;
      const { title, summary, isArchived } = req.body;
      const userID = req.user.userID || req.user.userId || req.user.id;

      // Verify the conversation belongs to the user
      const [conversations] = await pool.query(
        'SELECT * FROM ai_chat_conversations WHERE conversationID = ? AND userID = ?',
        [conversationID, userID]
      );

      if (conversations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found or access denied'
        });
      }

      // Build the update query dynamically based on provided fields
      let updateFields = [];
      let queryParams = [];

      if (title !== undefined) {
        updateFields.push('title = ?');
        queryParams.push(title);
      }

      if (summary !== undefined) {
        updateFields.push('summary = ?');
        queryParams.push(summary);
      }

      if (isArchived !== undefined) {
        updateFields.push('isArchived = ?');
        queryParams.push(isArchived ? 1 : 0);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      // Add conversationID to params
      queryParams.push(conversationID);

      // Execute the update
      await pool.query(
        `UPDATE ai_chat_conversations SET ${updateFields.join(', ')} WHERE conversationID = ?`,
        queryParams
      );

      return res.status(200).json({
        success: true,
        message: 'Conversation updated successfully'
      });
    } catch (error) {
      console.error('Error updating conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update conversation',
        error: error.message
      });
    }
  },

  /**
   * Delete a conversation and all its messages
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  deleteConversation: async (req, res) => {
    try {
      const { conversationID } = req.params;
      const userID = req.user.userID || req.user.userId || req.user.id;

      // Verify the conversation belongs to the user
      const [conversations] = await pool.query(
        'SELECT * FROM ai_chat_conversations WHERE conversationID = ? AND userID = ?',
        [conversationID, userID]
      );

      if (conversations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found or access denied'
        });
      }

      // Delete the conversation (cascade will delete messages)
      await pool.query(
        'DELETE FROM ai_chat_conversations WHERE conversationID = ?',
        [conversationID]
      );

      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete conversation',
        error: error.message
      });
    }
  },

  /**
   * Search conversations by keyword
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  searchConversations: async (req, res) => {
    console.log('searchConversations called with query params:', req.query);
    try {
      const { query, startDate, endDate, page = 1, limit = 10 } = req.query;
      const userID = req.user.userID || req.user.userId || req.user.id;
      console.log(`Search request from userID: ${userID}`);

      if (!query && !startDate && !endDate) {
        return res.status(400).json({
          success: false,
          message: 'At least one search parameter is required'
        });
      }

      const offset = (page - 1) * limit;
      let queryParams = [userID];
      let conditions = ['c.userID = ?'];

      // Add search conditions
      if (query) {
        conditions.push('(c.title LIKE ? OR c.summary LIKE ? OR EXISTS (SELECT 1 FROM ai_chat_messages m WHERE m.conversationID = c.conversationID AND m.content LIKE ?))');
        const likeParam = `%${query}%`;
        queryParams.push(likeParam, likeParam, likeParam);

        // Log search query
        console.log(`Logging search query to ai_chat_search_history: userID=${userID}, query=${query}`);
        try {
          const [result] = await pool.query(
            'INSERT INTO ai_chat_search_history (userID, query) VALUES (?, ?)',
            [userID, query]
          );
          console.log(`Search history logged successfully, insertId: ${result.insertId}`);
        } catch (error) {
          console.error('Error logging search query to history:', error);
          // Continue with the search even if logging fails
        }
      }

      if (startDate) {
        conditions.push('c.createdAt >= ?');
        queryParams.push(new Date(startDate));
      }

      if (endDate) {
        conditions.push('c.createdAt <= ?');
        queryParams.push(new Date(endDate));
      }

      // Get total count for pagination
      const [countResult] = await pool.query(
        `SELECT COUNT(*) as total FROM ai_chat_conversations c WHERE ${conditions.join(' AND ')}`,
        queryParams
      );

      const total = countResult[0].total;

      // Add pagination params
      queryParams.push(parseInt(limit), offset);

      // Get matching conversations
      const [conversations] = await pool.query(
        `SELECT c.*,
          (SELECT content FROM ai_chat_messages
           WHERE conversationID = c.conversationID
           ORDER BY timestamp DESC LIMIT 1) as lastMessage,
          (SELECT COUNT(*) FROM ai_chat_messages
           WHERE conversationID = c.conversationID) as messageCount
         FROM ai_chat_conversations c
         WHERE ${conditions.join(' AND ')}
         ORDER BY c.updatedAt DESC
         LIMIT ? OFFSET ?`,
        queryParams
      );

      return res.status(200).json({
        success: true,
        data: {
          conversations,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Error searching conversations:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to search conversations',
        error: error.message
      });
    }
  },

  /**
   * Manage tags for a conversation
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  manageTags: async (req, res) => {
    try {
      const { conversationID } = req.params;
      const { tags } = req.body;
      const userID = req.user.userID || req.user.userId || req.user.id;

      if (!Array.isArray(tags)) {
        return res.status(400).json({
          success: false,
          message: 'Tags must be an array'
        });
      }

      // Verify the conversation belongs to the user
      const [conversations] = await pool.query(
        'SELECT * FROM ai_chat_conversations WHERE conversationID = ? AND userID = ?',
        [conversationID, userID]
      );

      if (conversations.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found or access denied'
        });
      }

      // Start a transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Remove existing tags
        await connection.query(
          'DELETE FROM ai_chat_conversation_tags WHERE conversationID = ?',
          [conversationID]
        );

        // Add new tags
        for (const tagName of tags) {
          // Check if tag exists, create if not
          let tagID;
          const [existingTags] = await connection.query(
            'SELECT tagID FROM ai_chat_tags WHERE name = ?',
            [tagName]
          );

          if (existingTags.length > 0) {
            tagID = existingTags[0].tagID;
          } else {
            const [newTag] = await connection.query(
              'INSERT INTO ai_chat_tags (name) VALUES (?)',
              [tagName]
            );
            tagID = newTag.insertId;
          }

          // Associate tag with conversation
          await connection.query(
            'INSERT INTO ai_chat_conversation_tags (conversationID, tagID) VALUES (?, ?)',
            [conversationID, tagID]
          );
        }

        await connection.commit();

        return res.status(200).json({
          success: true,
          message: 'Tags updated successfully'
        });
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error managing tags:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to manage tags',
        error: error.message
      });
    }
  },

  /**
   * Get user preferences for chat history
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getUserPreferences: async (req, res) => {
    console.log('getUserPreferences called for user:', req.user);
    try {
      const userID = req.user.userID || req.user.userId || req.user.id;
      console.log(`Fetching preferences for userID: ${userID}`);

      const [preferences] = await pool.query(
        'SELECT * FROM ai_chat_user_preferences WHERE userID = ?',
        [userID]
      );

      console.log('Preferences query result:', preferences);

      if (preferences.length === 0) {
        // Create default preferences if not exist
        console.log(`No preferences found for userID: ${userID}, creating default preferences`);
        try {
          const [result] = await pool.query(
            'INSERT INTO ai_chat_user_preferences (userID, autoDeleteDays, defaultSummarize) VALUES (?, NULL, 0)',
            [userID]
          );
          console.log(`Default preferences created successfully, result:`, result);
        } catch (error) {
          console.error('Error creating default preferences:', error);
          // Continue with the response even if creation fails
        }

        return res.status(200).json({
          success: true,
          data: {
            userID,
            autoDeleteDays: null,
            defaultSummarize: false
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          ...preferences[0],
          defaultSummarize: !!preferences[0].defaultSummarize
        }
      });
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get user preferences',
        error: error.message
      });
    }
  },

  /**
   * Update user preferences for chat history
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  updateUserPreferences: async (req, res) => {
    console.log('updateUserPreferences called with body:', req.body);
    try {
      const { autoDeleteDays, defaultSummarize } = req.body;
      const userID = req.user.userID || req.user.userId || req.user.id;
      console.log(`Updating preferences for userID: ${userID}, autoDeleteDays: ${autoDeleteDays}, defaultSummarize: ${defaultSummarize}`);

      // Validate autoDeleteDays
      if (autoDeleteDays !== null && (isNaN(autoDeleteDays) || autoDeleteDays < 0)) {
        return res.status(400).json({
          success: false,
          message: 'autoDeleteDays must be a positive number or null'
        });
      }

      // Check if preferences exist
      const [preferences] = await pool.query(
        'SELECT * FROM ai_chat_user_preferences WHERE userID = ?',
        [userID]
      );

      if (preferences.length === 0) {
        // Create preferences
        console.log(`No existing preferences found for userID: ${userID}, creating new preferences`);
        try {
          const [result] = await pool.query(
            'INSERT INTO ai_chat_user_preferences (userID, autoDeleteDays, defaultSummarize) VALUES (?, ?, ?)',
            [userID, autoDeleteDays, defaultSummarize ? 1 : 0]
          );
          console.log(`Preferences created successfully, result:`, result);
        } catch (error) {
          console.error('Error creating preferences:', error);
          throw error; // Rethrow to be caught by the outer try/catch
        }
      } else {
        // Update preferences
        console.log(`Updating existing preferences for userID: ${userID}`);
        try {
          const [result] = await pool.query(
            'UPDATE ai_chat_user_preferences SET autoDeleteDays = ?, defaultSummarize = ? WHERE userID = ?',
            [autoDeleteDays, defaultSummarize ? 1 : 0, userID]
          );
          console.log(`Preferences updated successfully, result:`, result);
        } catch (error) {
          console.error('Error updating preferences:', error);
          throw error; // Rethrow to be caught by the outer try/catch
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Preferences updated successfully'
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update user preferences',
        error: error.message
      });
    }
  },

  /**
   * Get analytics about chat usage
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   */
  getChatAnalytics: async (req, res) => {
    try {
      const userID = req.user.id;

      // Get total conversations
      const [totalConversations] = await pool.query(
        'SELECT COUNT(*) as count FROM ai_chat_conversations WHERE userID = ?',
        [userID]
      );

      // Get total messages
      const [totalMessages] = await pool.query(
        `SELECT COUNT(*) as count FROM ai_chat_messages m
         JOIN ai_chat_conversations c ON m.conversationID = c.conversationID
         WHERE c.userID = ?`,
        [userID]
      );

      // Get messages by month (last 6 months)
      const [messagesByMonth] = await pool.query(
        `SELECT
           DATE_FORMAT(m.timestamp, '%Y-%m') as month,
           COUNT(*) as count
         FROM ai_chat_messages m
         JOIN ai_chat_conversations c ON m.conversationID = c.conversationID
         WHERE c.userID = ? AND m.timestamp >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
         GROUP BY month
         ORDER BY month ASC`,
        [userID]
      );

      // Get most active conversations
      const [mostActiveConversations] = await pool.query(
        `SELECT
           c.conversationID,
           c.title,
           COUNT(m.messageID) as messageCount,
           MAX(m.timestamp) as lastActivity
         FROM ai_chat_conversations c
         JOIN ai_chat_messages m ON c.conversationID = m.conversationID
         WHERE c.userID = ?
         GROUP BY c.conversationID
         ORDER BY messageCount DESC
         LIMIT 5`,
        [userID]
      );

      return res.status(200).json({
        success: true,
        data: {
          totalConversations: totalConversations[0].count,
          totalMessages: totalMessages[0].count,
          messagesByMonth,
          mostActiveConversations
        }
      });
    } catch (error) {
      console.error('Error getting chat analytics:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get chat analytics',
        error: error.message
      });
    }
  }
};

module.exports = chatHistoryController;

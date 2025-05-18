const express = require('express');
const router = express.Router();
const chatHistoryController = require('../controllers/chatHistoryController');
const { verifyToken } = require('../middleware/auth');

/**
 * Conversation routes
 */
// Create a new conversation
router.post('/conversations', verifyToken, chatHistoryController.createConversation);

// Get all conversations for a user
router.get('/conversations', verifyToken, chatHistoryController.getUserConversations);

// Get a single conversation with all messages
router.get('/conversations/:conversationID', verifyToken, chatHistoryController.getConversation);

// Update conversation details
router.put('/conversations/:conversationID', verifyToken, chatHistoryController.updateConversation);

// Delete a conversation
router.delete('/conversations/:conversationID', verifyToken, chatHistoryController.deleteConversation);

/**
 * Message routes
 */
// Add a message to a conversation
router.post('/conversations/:conversationID/messages', verifyToken, chatHistoryController.addMessage);

/**
 * Tag routes
 */
// Manage tags for a conversation
router.post('/conversations/:conversationID/tags', verifyToken, chatHistoryController.manageTags);

/**
 * Search routes
 */
// Search conversations
router.get('/search', verifyToken, chatHistoryController.searchConversations);

/**
 * User preferences routes
 */
// Get user preferences
router.get('/preferences', verifyToken, chatHistoryController.getUserPreferences);

// Update user preferences
router.put('/preferences', verifyToken, chatHistoryController.updateUserPreferences);

/**
 * Analytics routes
 */
// Get chat analytics
router.get('/analytics', verifyToken, chatHistoryController.getChatAnalytics);

module.exports = router;

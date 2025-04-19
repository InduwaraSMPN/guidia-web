const express = require('express');
const router = express.Router();
const aiController = require('../controllers/openaiController');

/**
 * Send a message to the DeepSeek AI API
 * POST /api/openai/chat
 * Body: { message: string, history: Array<{content: string, isUser: boolean}> }
 */
router.post('/chat', aiController.sendMessage);

module.exports = router;

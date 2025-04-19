const express = require('express');
const router = express.Router();
const aiController = require('../controllers/openaiController');

/**
 * Send a message to the SambaNova AI API
 * POST /api/openai/chat
 * Body: { message: string, history: Array<{content: string, isUser: boolean}>, stream?: boolean }
 *
 * If stream is true, the response will be a server-sent event stream.
 * Otherwise, it will be a regular JSON response.
 */
router.post('/chat', aiController.sendMessage);

/**
 * Stream a message to the SambaNova AI API
 * POST /api/openai/stream
 * Body: { message: string, history: Array<{content: string, isUser: boolean}> }
 *
 * This endpoint always returns a server-sent event stream.
 */
router.post('/stream', aiController.streamMessage);

module.exports = router;

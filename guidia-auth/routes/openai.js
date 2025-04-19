const express = require('express');
const router = express.Router();
const aiController = require('../controllers/openaiController');

/**
 * Send a message to the AI API (SambaNova or DeepSeek)
 * POST /api/openai/chat
 * Body: {
 *   message: string,
 *   history: Array<{content: string, isUser: boolean}>,
 *   stream?: boolean,
 *   provider?: 'sambanova' | 'deepseek'
 * }
 *
 * If stream is true, the response will be a server-sent event stream.
 * Otherwise, it will be a regular JSON response.
 *
 * If provider is specified, it will use that provider. Otherwise, it will use the default provider (SambaNova).
 */
router.post('/chat', aiController.sendMessage);

/**
 * Stream a message to the AI API (SambaNova or DeepSeek)
 * POST /api/openai/stream
 * Body: {
 *   message: string,
 *   history: Array<{content: string, isUser: boolean}>,
 *   provider?: 'sambanova' | 'deepseek'
 * }
 *
 * This endpoint always returns a server-sent event stream.
 *
 * If provider is specified, it will use that provider. Otherwise, it will use the default provider (SambaNova).
 */
router.post('/stream', aiController.streamMessage);

module.exports = router;

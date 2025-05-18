const pool = require('./config/db');

async function checkAPI() {
  try {
    // Mock the request object
    const req = {
      user: { id: 5 },
      query: { page: 1, limit: 10, archived: false }
    };
    
    // Mock the response object
    const res = {
      status: (code) => {
        console.log(`Response status: ${code}`);
        return {
          json: (data) => {
            console.log('Response data:', JSON.stringify(data, null, 2));
          }
        };
      }
    };
    
    // Get total count for pagination
    console.log('Executing count query...');
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM ai_chat_conversations WHERE userID = ? AND isArchived = ?',
      [req.user.id, req.query.archived ? 1 : 0]
    );

    const total = countResult[0].total;
    console.log('Total conversations found:', total);

    // Get conversations with latest message preview
    console.log('Executing conversations query...');
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
      [req.user.id, req.query.archived ? 1 : 0, parseInt(req.query.limit), (req.query.page - 1) * req.query.limit]
    );

    console.log('Conversations retrieved:', conversations.length);
    console.log('Conversation data:', conversations);
    
    // Return the response
    res.status(200).json({
      success: true,
      data: {
        conversations,
        pagination: {
          total,
          page: parseInt(req.query.page),
          limit: parseInt(req.query.limit),
          pages: Math.ceil(total / parseInt(req.query.limit))
        }
      }
    });
  } catch (error) {
    console.error('Error checking API:', error);
  } finally {
    process.exit();
  }
}

checkAPI();

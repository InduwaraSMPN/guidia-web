const pool = require('./config/db');

async function checkConversation() {
  try {
    const [conversations] = await pool.query(
      'SELECT * FROM ai_chat_conversations WHERE userID = ?',
      [5]
    );
    
    console.log('Conversations for user 5:', conversations);
    
    if (conversations.length > 0) {
      const conversationID = conversations[0].conversationID;
      
      const [messages] = await pool.query(
        'SELECT * FROM ai_chat_messages WHERE conversationID = ?',
        [conversationID]
      );
      
      console.log(`Messages for conversation ${conversationID}:`, messages);
    }
  } catch (error) {
    console.error('Error checking conversation:', error);
  } finally {
    process.exit();
  }
}

checkConversation();

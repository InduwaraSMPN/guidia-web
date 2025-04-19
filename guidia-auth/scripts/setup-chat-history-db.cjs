/**
 * Script to set up the database tables for chat history functionality
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('Setting up chat history database tables...');
  
  // Create connection pool
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Create conversations table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ai_chat_conversations (
        conversationID INT AUTO_INCREMENT PRIMARY KEY,
        userID INT NOT NULL,
        title VARCHAR(255) DEFAULT 'New Conversation',
        summary TEXT,
        isArchived TINYINT(1) DEFAULT 0,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);
    console.log('✅ ai_chat_conversations table created or already exists');

    // Create messages table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ai_chat_messages (
        messageID INT AUTO_INCREMENT PRIMARY KEY,
        conversationID INT NOT NULL,
        content TEXT NOT NULL,
        isUserMessage TINYINT(1) DEFAULT 0,
        isRichText TINYINT(1) DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversationID) REFERENCES ai_chat_conversations(conversationID) ON DELETE CASCADE
      )
    `);
    console.log('✅ ai_chat_messages table created or already exists');

    // Create tags table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ai_chat_tags (
        tagID INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ ai_chat_tags table created or already exists');

    // Create conversation tags table (many-to-many relationship)
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ai_chat_conversation_tags (
        conversationID INT NOT NULL,
        tagID INT NOT NULL,
        PRIMARY KEY (conversationID, tagID),
        FOREIGN KEY (conversationID) REFERENCES ai_chat_conversations(conversationID) ON DELETE CASCADE,
        FOREIGN KEY (tagID) REFERENCES ai_chat_tags(tagID) ON DELETE CASCADE
      )
    `);
    console.log('✅ ai_chat_conversation_tags table created or already exists');

    // Create user preferences table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ai_chat_user_preferences (
        userID INT PRIMARY KEY,
        autoDeleteDays INT NULL,
        defaultSummarize TINYINT(1) DEFAULT 0,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);
    console.log('✅ ai_chat_user_preferences table created or already exists');

    // Create search history table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS ai_chat_search_history (
        searchID INT AUTO_INCREMENT PRIMARY KEY,
        userID INT NOT NULL,
        query VARCHAR(255) NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE
      )
    `);
    console.log('✅ ai_chat_search_history table created or already exists');

    // Add indexes for performance
    await pool.execute(`
      CREATE INDEX IF NOT EXISTS idx_conversations_user ON ai_chat_conversations(userID);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON ai_chat_messages(conversationID);
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON ai_chat_messages(timestamp);
      CREATE INDEX IF NOT EXISTS idx_conversation_tags_tag ON ai_chat_conversation_tags(tagID);
    `);
    console.log('✅ Indexes created or already exist');

    console.log('✅ Chat history database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase();

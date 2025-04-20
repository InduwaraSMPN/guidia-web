/**
 * Script to set up the chat history database tables
 * Run with: node setup-chat-history-db.js
 */
import { config } from 'dotenv';
import mysql from 'mysql2/promise';

config();

async function setupDatabase() {
  console.log('Setting up chat history database tables...');

  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'guidia-web-db',
    multipleStatements: true
  });

  try {
    // SQL to create all tables
    const sql = `
    -- Table for storing chat conversations
    CREATE TABLE IF NOT EXISTS \`ai_chat_conversations\` (
      \`conversationID\` int NOT NULL AUTO_INCREMENT,
      \`userID\` int NOT NULL,
      \`title\` varchar(255) DEFAULT NULL,
      \`createdAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      \`summary\` text,
      \`isArchived\` tinyint(1) DEFAULT '0',
      PRIMARY KEY (\`conversationID\`),
      KEY \`idx_userID\` (\`userID\`),
      KEY \`idx_createdAt\` (\`createdAt\`),
      KEY \`idx_updatedAt\` (\`updatedAt\`),
      KEY \`idx_isArchived\` (\`isArchived\`),
      CONSTRAINT \`fk_ai_chat_conversations_users\` FOREIGN KEY (\`userID\`) REFERENCES \`users\` (\`userID\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

    -- Table for storing individual messages within conversations
    CREATE TABLE IF NOT EXISTS \`ai_chat_messages\` (
      \`messageID\` int NOT NULL AUTO_INCREMENT,
      \`conversationID\` int NOT NULL,
      \`content\` text NOT NULL,
      \`isUserMessage\` tinyint(1) NOT NULL,
      \`timestamp\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      \`isRichText\` tinyint(1) DEFAULT '0',
      PRIMARY KEY (\`messageID\`),
      KEY \`idx_conversationID\` (\`conversationID\`),
      KEY \`idx_timestamp\` (\`timestamp\`),
      CONSTRAINT \`fk_ai_chat_messages_conversations\` FOREIGN KEY (\`conversationID\`) REFERENCES \`ai_chat_conversations\` (\`conversationID\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

    -- Table for storing conversation tags for better organization and searching
    CREATE TABLE IF NOT EXISTS \`ai_chat_tags\` (
      \`tagID\` int NOT NULL AUTO_INCREMENT,
      \`name\` varchar(50) NOT NULL,
      PRIMARY KEY (\`tagID\`),
      UNIQUE KEY \`unique_tag_name\` (\`name\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

    -- Junction table for conversation-tag relationship (many-to-many)
    CREATE TABLE IF NOT EXISTS \`ai_chat_conversation_tags\` (
      \`conversationID\` int NOT NULL,
      \`tagID\` int NOT NULL,
      PRIMARY KEY (\`conversationID\`,\`tagID\`),
      KEY \`idx_tagID\` (\`tagID\`),
      CONSTRAINT \`fk_ai_chat_conversation_tags_conversations\` FOREIGN KEY (\`conversationID\`) REFERENCES \`ai_chat_conversations\` (\`conversationID\`) ON DELETE CASCADE,
      CONSTRAINT \`fk_ai_chat_conversation_tags_tags\` FOREIGN KEY (\`tagID\`) REFERENCES \`ai_chat_tags\` (\`tagID\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

    -- Table for storing search history
    CREATE TABLE IF NOT EXISTS \`ai_chat_search_history\` (
      \`searchID\` int NOT NULL AUTO_INCREMENT,
      \`userID\` int NOT NULL,
      \`query\` varchar(255) NOT NULL,
      \`timestamp\` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`searchID\`),
      KEY \`idx_userID\` (\`userID\`),
      KEY \`idx_timestamp\` (\`timestamp\`),
      CONSTRAINT \`fk_ai_chat_search_history_users\` FOREIGN KEY (\`userID\`) REFERENCES \`users\` (\`userID\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

    -- Table for storing user preferences for chat history
    CREATE TABLE IF NOT EXISTS \`ai_chat_user_preferences\` (
      \`userID\` int NOT NULL,
      \`autoDeleteDays\` int DEFAULT NULL,
      \`defaultSummarize\` tinyint(1) DEFAULT '0',
      \`updatedAt\` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`userID\`),
      CONSTRAINT \`fk_ai_chat_user_preferences_users\` FOREIGN KEY (\`userID\`) REFERENCES \`users\` (\`userID\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
    `;

    // Execute the SQL
    await connection.query(sql);
    console.log('Chat history database tables created successfully!');

    // Create default tags
    const defaultTags = [
      'Career Advice',
      'Job Search',
      'Resume Help',
      'Interview Prep',
      'Education',
      'Skills Development',
      'Industry Insights'
    ];

    for (const tag of defaultTags) {
      try {
        await connection.query('INSERT IGNORE INTO ai_chat_tags (name) VALUES (?)', [tag]);
      } catch (err) {
        // Ignore duplicate key errors
        if (err.code !== 'ER_DUP_ENTRY') {
          throw err;
        }
      }
    }

    console.log('Default tags created successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await connection.end();
    console.log('Database connection closed.');
  }
}

setupDatabase().catch(console.error);

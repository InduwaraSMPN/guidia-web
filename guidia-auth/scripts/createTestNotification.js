require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTestNotification() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    const query = `
      INSERT INTO notifications 
      (userID, notificationType, title, message, isRead, priority, targetUserRole) 
      VALUES 
      (58, 'PLATFORM_ANNOUNCEMENT', 'Test Notification', 'This is a test notification to verify the notification system is working.', 0, 'medium', 'Company')
    `;
    
    const [result] = await pool.query(query);
    console.log('Test notification created with ID:', result.insertId);
  } catch (error) {
    console.error('Error creating test notification:', error);
  } finally {
    await pool.end();
  }
}

createTestNotification();

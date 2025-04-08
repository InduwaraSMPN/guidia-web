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
      (33, 'NEW_JOB_POSTING', 'New Job Available', 'A new Software Engineer position has been posted by Microsoft that matches your profile.', 0, 'high', 'Student')
    `;
    
    const [result] = await pool.query(query);
    console.log('Student notification created with ID:', result.insertId);
  } catch (error) {
    console.error('Error creating student notification:', error);
  } finally {
    await pool.end();
  }
}

createTestNotification();

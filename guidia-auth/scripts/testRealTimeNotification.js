require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Test script to send a real-time notification to a specific user
 */
async function sendTestNotification() {
  // Create database connection
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
    // Get the socket service
    const NotificationSocketService = require('../services/notificationSocketService');
    const io = require('socket.io')();
    const notificationSocketService = new NotificationSocketService(io);

    // Create a notification in the database
    const userID = process.argv[2] || 58; // Default to user ID 58 if not provided
    const notificationType = 'PLATFORM_ANNOUNCEMENT';
    const title = 'Real-time Test Notification';
    const message = 'This is a test of the real-time notification system using WebSockets.';
    
    // Insert notification into database
    const query = `
      INSERT INTO notifications 
      (userID, notificationType, title, message, isRead, priority, targetUserRole) 
      VALUES 
      (?, ?, ?, ?, 0, 'high', 'Company')
    `;
    
    const [result] = await pool.query(query, [userID, notificationType, title, message]);
    console.log(`Created notification with ID: ${result.insertId}`);
    
    // Get the created notification
    const [notifications] = await pool.query(
      `SELECT * FROM notifications WHERE notificationID = ?`,
      [result.insertId]
    );
    
    if (notifications.length > 0) {
      const notification = notifications[0];
      
      // Parse metadata if it exists
      if (notification.metadata) {
        try {
          notification.metadata = JSON.parse(notification.metadata);
        } catch (e) {
          console.error('Error parsing notification metadata:', e);
        }
      }
      
      // Send notification via WebSocket
      const sent = notificationSocketService.sendNotificationToUser(userID, notification);
      
      if (sent) {
        console.log(`Successfully sent real-time notification to user ${userID}`);
      } else {
        console.log(`User ${userID} is not connected, notification saved in database only`);
      }
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error sending test notification:', error);
  } finally {
    await pool.end();
  }
}

sendTestNotification();

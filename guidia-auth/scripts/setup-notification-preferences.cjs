/**
 * Script to set up the notification_preferences table in the database
 * This table stores user preferences for different notification types
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupNotificationPreferencesTable() {
  let connection;

  try {
    // Create connection to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'guidia',
    });

    console.log('Connected to MySQL database');

    // Create notification_preferences table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        preferenceID INT NOT NULL AUTO_INCREMENT,
        userID INT NOT NULL,
        notificationType ENUM(
          'NEW_JOB_POSTING',
          'JOB_APPLICATION_UPDATE',
          'JOB_APPLICATION_DEADLINE',
          'JOB_POSTING_EXPIRING',
          'JOB_POSTING_STATS',
          'NEW_JOB_APPLICATION',
          'PROFILE_VIEW',
          'PROFILE_INCOMPLETE',
          'PROFILE_UPDATE',
          'RECOMMENDED_PROFILE',
          'NEW_MESSAGE',
          'UNREAD_MESSAGES',
          'GUIDANCE_REQUEST',
          'STUDENT_PROFILE_UPDATE',
          'STUDENT_JOB_APPLICATION',
          'NEW_USER_REGISTRATION',
          'USER_ACCOUNT_ISSUE',
          'VERIFICATION_REQUEST',
          'JOB_POSTING_REVIEW',
          'REPORTED_CONTENT',
          'SYSTEM_HEALTH_ALERT',
          'ACCOUNT_NOTIFICATION',
          'PLATFORM_ANNOUNCEMENT',
          'PERFORMANCE_METRIC',
          'SECURITY_ALERT',
          'SYSTEM_UPDATE',
          'SUPPORT_REQUEST',
          'MEETING_REQUESTED',
          'MEETING_ACCEPTED',
          'MEETING_DECLINED',
          'MEETING_REMINDER',
          'MEETING_FEEDBACK_REQUEST'
        ) NOT NULL,
        isEnabled TINYINT(1) NOT NULL DEFAULT 1,
        emailEnabled TINYINT(1) NOT NULL DEFAULT 1,
        pushEnabled TINYINT(1) NOT NULL DEFAULT 1,
        updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (preferenceID),
        UNIQUE KEY unique_user_notification_type (userID, notificationType),
        KEY idx_pref_userID (userID)
      )
    `);
    console.log('✅ notification_preferences table created or already exists');

    // Get all users
    const [users] = await connection.execute('SELECT userID FROM users');
    console.log(`Found ${users.length} users to initialize notification preferences for`);

    // Define default notification types
    const defaultNotificationTypes = [
      'NEW_JOB_POSTING',
      'JOB_APPLICATION_UPDATE',
      'JOB_APPLICATION_DEADLINE',
      'JOB_POSTING_EXPIRING',
      'JOB_POSTING_STATS',
      'NEW_JOB_APPLICATION',
      'PROFILE_VIEW',
      'PROFILE_INCOMPLETE',
      'PROFILE_UPDATE',
      'RECOMMENDED_PROFILE',
      'NEW_MESSAGE',
      'UNREAD_MESSAGES',
      'GUIDANCE_REQUEST',
      'STUDENT_PROFILE_UPDATE',
      'STUDENT_JOB_APPLICATION',
      'NEW_USER_REGISTRATION',
      'USER_ACCOUNT_ISSUE',
      'VERIFICATION_REQUEST',
      'JOB_POSTING_REVIEW',
      'REPORTED_CONTENT',
      'SYSTEM_HEALTH_ALERT',
      'ACCOUNT_NOTIFICATION',
      'PLATFORM_ANNOUNCEMENT',
      'PERFORMANCE_METRIC',
      'SECURITY_ALERT',
      'SYSTEM_UPDATE',
      'SUPPORT_REQUEST',
      'MEETING_REQUESTED',
      'MEETING_ACCEPTED',
      'MEETING_DECLINED',
      'MEETING_REMINDER',
      'MEETING_FEEDBACK_REQUEST'
    ];

    // Create default preferences for each user
    let createdCount = 0;
    for (const user of users) {
      for (const notificationType of defaultNotificationTypes) {
        // Check if preference already exists
        const [existing] = await connection.execute(
          'SELECT preferenceID FROM notification_preferences WHERE userID = ? AND notificationType = ?',
          [user.userID, notificationType]
        );

        // If preference doesn't exist, create it
        if (existing.length === 0) {
          await connection.execute(
            `INSERT INTO notification_preferences
            (userID, notificationType, isEnabled, emailEnabled, pushEnabled)
            VALUES (?, ?, 1, 1, 1)`,
            [user.userID, notificationType]
          );
          createdCount++;
        }
      }
    }

    console.log(`✅ Created ${createdCount} default notification preferences`);
    console.log('✅ Notification preferences setup completed successfully');

  } catch (error) {
    console.error('Error setting up notification preferences:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the setup function
setupNotificationPreferencesTable().catch(console.error);

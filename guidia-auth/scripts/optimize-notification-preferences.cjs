/**
 * Script to optimize notification preferences by converting individual preferences
 * to category-based preferences to reduce database footprint
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function optimizeNotificationPreferences() {
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

    // Create notification_category_preferences table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notification_category_preferences (
        preferenceID INT NOT NULL AUTO_INCREMENT,
        userID INT NOT NULL,
        category ENUM(
          'JOBS',
          'PROFILE',
          'MESSAGES',
          'MEETINGS',
          'SYSTEM',
          'ADMIN'
        ) NOT NULL,
        isEnabled TINYINT(1) NOT NULL DEFAULT 1,
        emailEnabled TINYINT(1) NOT NULL DEFAULT 1,
        pushEnabled TINYINT(1) NOT NULL DEFAULT 1,
        updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (preferenceID),
        UNIQUE KEY unique_user_category (userID, category),
        KEY idx_pref_userID (userID)
      )
    `);
    console.log('✅ notification_category_preferences table created or already exists');

    // Define notification type to category mapping
    const notificationTypeToCategory = {
      // Jobs category
      'NEW_JOB_POSTING': 'JOBS',
      'JOB_APPLICATION_UPDATE': 'JOBS',
      'JOB_APPLICATION_DEADLINE': 'JOBS',
      'JOB_POSTING_EXPIRING': 'JOBS',
      'JOB_POSTING_STATS': 'JOBS',
      'NEW_JOB_APPLICATION': 'JOBS',
      'STUDENT_JOB_APPLICATION': 'JOBS',
      'JOB_POSTING_REVIEW': 'JOBS',
      
      // Profile category
      'PROFILE_VIEW': 'PROFILE',
      'PROFILE_INCOMPLETE': 'PROFILE',
      'PROFILE_UPDATE': 'PROFILE',
      'RECOMMENDED_PROFILE': 'PROFILE',
      'STUDENT_PROFILE_UPDATE': 'PROFILE',
      
      // Messages category
      'NEW_MESSAGE': 'MESSAGES',
      'UNREAD_MESSAGES': 'MESSAGES',
      'GUIDANCE_REQUEST': 'MESSAGES',
      
      // Meetings category
      'MEETING_REQUESTED': 'MEETINGS',
      'MEETING_ACCEPTED': 'MEETINGS',
      'MEETING_DECLINED': 'MEETINGS',
      'MEETING_REMINDER': 'MEETINGS',
      'MEETING_FEEDBACK_REQUEST': 'MEETINGS',
      
      // System category
      'SECURITY_ALERT': 'SYSTEM',
      'SYSTEM_UPDATE': 'SYSTEM',
      'PLATFORM_ANNOUNCEMENT': 'SYSTEM',
      'ACCOUNT_NOTIFICATION': 'SYSTEM',
      'USER_ACCOUNT_ISSUE': 'SYSTEM',
      
      // Admin category
      'NEW_USER_REGISTRATION': 'ADMIN',
      'VERIFICATION_REQUEST': 'ADMIN',
      'REPORTED_CONTENT': 'ADMIN',
      'SYSTEM_HEALTH_ALERT': 'ADMIN',
      'PERFORMANCE_METRIC': 'ADMIN',
      'SUPPORT_REQUEST': 'ADMIN'
    };

    // Get all users
    const [users] = await connection.execute('SELECT DISTINCT userID FROM notification_preferences');
    console.log(`Found ${users.length} users to migrate notification preferences for`);

    // Migrate preferences for each user
    let migratedCount = 0;
    for (const user of users) {
      const userID = user.userID;
      
      // Get all notification preferences for this user
      const [preferences] = await connection.execute(
        'SELECT * FROM notification_preferences WHERE userID = ?',
        [userID]
      );
      
      // Group preferences by category
      const categoryPreferences = {};
      
      // Initialize all categories with default values
      ['JOBS', 'PROFILE', 'MESSAGES', 'MEETINGS', 'SYSTEM', 'ADMIN'].forEach(category => {
        categoryPreferences[category] = {
          isEnabled: true,
          emailEnabled: true,
          pushEnabled: true,
          count: 0
        };
      });
      
      // Process each preference
      for (const pref of preferences) {
        const category = notificationTypeToCategory[pref.notificationType] || 'SYSTEM';
        
        // Update category preferences based on individual preference
        categoryPreferences[category].isEnabled = categoryPreferences[category].isEnabled && pref.isEnabled;
        categoryPreferences[category].emailEnabled = categoryPreferences[category].emailEnabled && pref.emailEnabled;
        categoryPreferences[category].pushEnabled = categoryPreferences[category].pushEnabled && pref.pushEnabled;
        categoryPreferences[category].count++;
      }
      
      // Insert category preferences
      for (const [category, prefs] of Object.entries(categoryPreferences)) {
        // Only insert if we have preferences in this category
        if (prefs.count > 0) {
          await connection.execute(
            `INSERT INTO notification_category_preferences 
             (userID, category, isEnabled, emailEnabled, pushEnabled) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
             isEnabled = VALUES(isEnabled),
             emailEnabled = VALUES(emailEnabled),
             pushEnabled = VALUES(pushEnabled)`,
            [userID, category, prefs.isEnabled ? 1 : 0, prefs.emailEnabled ? 1 : 0, prefs.pushEnabled ? 1 : 0]
          );
          migratedCount++;
        }
      }
    }

    console.log(`✅ Migrated ${migratedCount} category preferences`);
    
    // Create a backup of the original table
    await connection.execute('CREATE TABLE IF NOT EXISTS notification_preferences_backup LIKE notification_preferences');
    await connection.execute('INSERT INTO notification_preferences_backup SELECT * FROM notification_preferences');
    console.log('✅ Created backup of original notification_preferences table');
    
    console.log('✅ Notification preferences optimization completed successfully');
    console.log('NOTE: The original notification_preferences table has been preserved as notification_preferences_backup');
    console.log('You can drop the original table after verifying the migration was successful');

  } catch (error) {
    console.error('Error optimizing notification preferences:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the optimization function
optimizeNotificationPreferences().catch(console.error);

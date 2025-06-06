/**
 * Service for handling notification preferences using categories
 * This is an optimized version that reduces database footprint
 */

class NotificationCategoryService {
  constructor(pool) {
    this.pool = pool;

    // Define notification type to category mapping
    this.notificationTypeToCategory = {
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
      'SUPPORT_REQUEST': 'ADMIN',
      'PENDING_REGISTRATIONS': 'ADMIN'
    };

    // Define categories with their notification types
    this.categories = {
      'JOBS': [
        'NEW_JOB_POSTING',
        'JOB_APPLICATION_UPDATE',
        'JOB_APPLICATION_DEADLINE',
        'JOB_POSTING_EXPIRING',
        'JOB_POSTING_STATS',
        'NEW_JOB_APPLICATION',
        'STUDENT_JOB_APPLICATION',
        'JOB_POSTING_REVIEW'
      ],
      'PROFILE': [
        'PROFILE_VIEW',
        'PROFILE_INCOMPLETE',
        'PROFILE_UPDATE',
        'RECOMMENDED_PROFILE',
        'STUDENT_PROFILE_UPDATE'
      ],
      'MESSAGES': [
        'NEW_MESSAGE',
        'UNREAD_MESSAGES',
        'GUIDANCE_REQUEST'
      ],
      'MEETINGS': [
        'MEETING_REQUESTED',
        'MEETING_ACCEPTED',
        'MEETING_DECLINED',
        'MEETING_REMINDER',
        'MEETING_FEEDBACK_REQUEST'
      ],
      'SYSTEM': [
        'SECURITY_ALERT',
        'SYSTEM_UPDATE',
        'PLATFORM_ANNOUNCEMENT',
        'ACCOUNT_NOTIFICATION',
        'USER_ACCOUNT_ISSUE'
      ],
      'ADMIN': [
        'NEW_USER_REGISTRATION',
        'VERIFICATION_REQUEST',
        'REPORTED_CONTENT',
        'SYSTEM_HEALTH_ALERT',
        'PERFORMANCE_METRIC',
        'SUPPORT_REQUEST',
        'PENDING_REGISTRATIONS'
      ]
    };
  }

  /**
   * Get category for a notification type
   * @param {string} notificationType - The notification type
   * @returns {string} - The category
   */
  getCategory(notificationType) {
    return this.notificationTypeToCategory[notificationType] || 'SYSTEM';
  }

  /**
   * Get user notification preferences
   * @param {number} userID - The user ID
   * @returns {Promise<Array>} - Array of notification preferences
   */
  async getUserPreferences(userID) {
    try {
      // Get category preferences
      const [categoryPreferences] = await this.pool.execute(
        'SELECT * FROM notification_category_preferences WHERE userID = ?',
        [userID]
      );

      // If no preferences found, initialize default preferences
      if (categoryPreferences.length === 0) {
        console.log(`No notification preferences found for userID: ${userID}, initializing defaults`);
        await this.initializeDefaultPreferences(userID);

        // Fetch the newly created preferences
        const [newPreferences] = await this.pool.execute(
          'SELECT * FROM notification_category_preferences WHERE userID = ?',
          [userID]
        );

        // Convert to individual notification type preferences for frontend compatibility
        return this.expandCategoryPreferences(newPreferences);
      }

      // Convert to individual notification type preferences for frontend compatibility
      return this.expandCategoryPreferences(categoryPreferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      throw error;
    }
  }

  /**
   * Expand category preferences to individual notification type preferences
   * @param {Array} categoryPreferences - Array of category preferences
   * @returns {Array} - Array of individual notification type preferences
   */
  expandCategoryPreferences(categoryPreferences) {
    const expandedPreferences = [];

    // Create a map of category to preference
    const categoryMap = {};
    categoryPreferences.forEach(pref => {
      categoryMap[pref.category] = pref;
    });

    // Expand each category to individual notification types
    for (const [category, types] of Object.entries(this.categories)) {
      const categoryPref = categoryMap[category] || {
        isEnabled: true,
        emailEnabled: true,
        pushEnabled: true
      };

      // Create a preference for each notification type in this category
      types.forEach(notificationType => {
        expandedPreferences.push({
          notificationType,
          isEnabled: categoryPref.isEnabled,
          emailEnabled: categoryPref.emailEnabled,
          pushEnabled: categoryPref.pushEnabled
        });
      });
    }

    return expandedPreferences;
  }

  /**
   * Initialize default notification preferences for a user
   * @param {number} userID - The user ID
   * @returns {Promise<void>}
   */
  async initializeDefaultPreferences(userID) {
    try {
      // Define default categories
      const categories = ['JOBS', 'PROFILE', 'MESSAGES', 'MEETINGS', 'SYSTEM', 'ADMIN'];

      // Create default preferences for each category
      for (const category of categories) {
        try {
          await this.pool.execute(
            `INSERT IGNORE INTO notification_category_preferences
             (userID, category, isEnabled, emailEnabled, pushEnabled)
             VALUES (?, ?, 1, 1, 1)`,
            [userID, category]
          );
        } catch (insertError) {
          console.error(`Error inserting preference for category ${category}:`, insertError);
          // Continue with other categories even if one fails
        }
      }

      // Also populate the individual notification_preferences table
      // This ensures both tables are populated and in sync
      try {
        // Define all notification types from all categories
        const allNotificationTypes = [];
        for (const types of Object.values(this.categories)) {
          allNotificationTypes.push(...types);
        }

        // Log the notification types for debugging
        console.log(`Initializing ${allNotificationTypes.length} individual notification preferences for userID: ${userID}`);

        // Create a single query with multiple inserts for better performance
        if (allNotificationTypes.length > 0) {
          // Create placeholders for the VALUES clause
          const placeholders = allNotificationTypes.map(() => '(?, ?, 1, 1, 1)').join(', ');

          // Create parameters array with userID and notificationType for each entry
          const params = [];
          allNotificationTypes.forEach(type => {
            params.push(userID, type);
          });

          // Execute the batch insert
          const query = `INSERT IGNORE INTO notification_preferences
                         (userID, notificationType, isEnabled, emailEnabled, pushEnabled)
                         VALUES ${placeholders}`;

          await this.pool.execute(query, params);
          console.log(`Successfully initialized ${allNotificationTypes.length} individual notification preferences for userID: ${userID}`);
        }
      } catch (individualError) {
        console.error('Error initializing individual notification preferences:', individualError);
        // Log the detailed error for debugging
        if (individualError.code) {
          console.error(`SQL Error Code: ${individualError.code}, SQL State: ${individualError.sqlState}`);
        }
        if (individualError.sql) {
          console.error(`SQL Query: ${individualError.sql}`);
        }
        // Continue even if individual preferences initialization fails
      }

      console.log(`Default notification preferences initialized for userID: ${userID}`);
    } catch (error) {
      console.error('Error initializing default notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update user notification preferences
   * @param {number} userID - The user ID
   * @param {string} notificationType - The notification type
   * @param {Object} preferences - The preferences to update
   * @returns {Promise<boolean>} - Success status
   */
  async updatePreference(userID, notificationType, preferences) {
    try {
      const { isEnabled, emailEnabled, pushEnabled } = preferences;

      // Get the category for this notification type
      const category = this.getCategory(notificationType);

      // Update the category preference
      const [result] = await this.pool.execute(
        `INSERT INTO notification_category_preferences
         (userID, category, isEnabled, emailEnabled, pushEnabled)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         isEnabled = VALUES(isEnabled),
         emailEnabled = VALUES(emailEnabled),
         pushEnabled = VALUES(pushEnabled)`,
        [userID, category, isEnabled ? 1 : 0, emailEnabled ? 1 : 0, pushEnabled ? 1 : 0]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating notification preference:', error);
      throw error;
    }
  }

  /**
   * Check if a notification should be sent based on user preferences
   * @param {number} userID - The user ID
   * @param {string} notificationType - The notification type
   * @returns {Promise<boolean>} - Whether the notification should be sent
   */
  async shouldSendNotification(userID, notificationType) {
    try {
      // Get the category for this notification type
      const category = this.getCategory(notificationType);

      // Check if the category is enabled
      const [preferences] = await this.pool.execute(
        'SELECT isEnabled FROM notification_category_preferences WHERE userID = ? AND category = ?',
        [userID, category]
      );

      // If no preference is set, create default and enable
      if (preferences.length === 0) {
        console.log(`No preference found for userID: ${userID}, category: ${category}, creating default`);

        try {
          // Insert default preference for this category
          await this.pool.execute(
            `INSERT IGNORE INTO notification_category_preferences
             (userID, category, isEnabled, emailEnabled, pushEnabled)
             VALUES (?, ?, 1, 1, 1)`,
            [userID, category]
          );
        } catch (insertError) {
          console.error(`Error creating default preference for ${category}:`, insertError);
          // Default to true if there's an error creating the preference
        }

        return true;
      }

      return preferences[0].isEnabled === 1;
    } catch (error) {
      console.error('Error checking notification preference:', error);
      // Default to sending notification if there's an error
      return true;
    }
  }

  /**
   * Update all preferences for a category
   * @param {number} userID - The user ID
   * @param {string} category - The category
   * @param {Object} preferences - The preferences to update
   * @returns {Promise<boolean>} - Success status
   */
  async updateCategoryPreference(userID, category, preferences) {
    try {
      const { isEnabled, emailEnabled, pushEnabled } = preferences;

      // Update the category preference
      const [result] = await this.pool.execute(
        `INSERT INTO notification_category_preferences
         (userID, category, isEnabled, emailEnabled, pushEnabled)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         isEnabled = VALUES(isEnabled),
         emailEnabled = VALUES(emailEnabled),
         pushEnabled = VALUES(pushEnabled)`,
        [userID, category, isEnabled ? 1 : 0, emailEnabled ? 1 : 0, pushEnabled ? 1 : 0]
      );

      // Also update all individual notification preferences for this category
      try {
        // Get all notification types for this category
        const notificationTypes = this.categories[category] || [];

        if (notificationTypes.length > 0) {
          console.log(`Updating ${notificationTypes.length} individual preferences for category ${category}, userID: ${userID}`);

          // First, ensure all notification types exist in the table
          // Create placeholders for the VALUES clause for INSERT IGNORE
          const insertPlaceholders = notificationTypes.map(() => '(?, ?, ?, ?, ?)').join(', ');

          // Create parameters array for INSERT IGNORE
          const insertParams = [];
          notificationTypes.forEach(type => {
            insertParams.push(
              userID,
              type,
              isEnabled ? 1 : 0,
              emailEnabled ? 1 : 0,
              pushEnabled ? 1 : 0
            );
          });

          // Execute the batch insert to ensure all types exist
          const insertQuery = `INSERT IGNORE INTO notification_preferences
                              (userID, notificationType, isEnabled, emailEnabled, pushEnabled)
                              VALUES ${insertPlaceholders}`;

          await this.pool.execute(insertQuery, insertParams);

          // Now update any existing preferences
          // Create placeholders for the IN clause
          const updatePlaceholders = notificationTypes.map(() => '?').join(',');

          // Update all notification preferences for this category
          const updateResult = await this.pool.execute(
            `UPDATE notification_preferences
             SET isEnabled = ?, emailEnabled = ?, pushEnabled = ?
             WHERE userID = ? AND notificationType IN (${updatePlaceholders})`,
            [
              isEnabled ? 1 : 0,
              emailEnabled ? 1 : 0,
              pushEnabled ? 1 : 0,
              userID,
              ...notificationTypes
            ]
          );

          console.log(`Updated ${updateResult[0].affectedRows} individual preferences for category ${category}, userID: ${userID}`);
        }
      } catch (individualError) {
        console.error(`Error updating individual preferences for category ${category}:`, individualError);
        // Log the detailed error for debugging
        if (individualError.code) {
          console.error(`SQL Error Code: ${individualError.code}, SQL State: ${individualError.sqlState}`);
        }
        if (individualError.sql) {
          console.error(`SQL Query: ${individualError.sql}`);
        }
        // Continue even if individual preferences update fails
      }

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating category preference:', error);
      throw error;
    }
  }

  /**
   * Get all category preferences for a user
   * @param {number} userID - The user ID
   * @returns {Promise<Array>} - Array of category preferences
   */
  async getCategoryPreferences(userID) {
    try {
      // Get category preferences
      const [categoryPreferences] = await this.pool.execute(
        'SELECT * FROM notification_category_preferences WHERE userID = ?',
        [userID]
      );

      // Check if individual preferences exist
      const [individualPreferencesCount] = await this.pool.execute(
        'SELECT COUNT(*) as count FROM notification_preferences WHERE userID = ?',
        [userID]
      );

      // If no preferences found or no individual preferences, initialize default preferences
      if (categoryPreferences.length === 0 || individualPreferencesCount[0].count === 0) {
        console.log(`No notification preferences found for userID: ${userID}, initializing defaults`);
        console.log(`Category preferences count: ${categoryPreferences.length}, Individual preferences count: ${individualPreferencesCount[0].count}`);

        await this.initializeDefaultPreferences(userID);

        // Fetch the newly created preferences
        const [newPreferences] = await this.pool.execute(
          'SELECT * FROM notification_category_preferences WHERE userID = ?',
          [userID]
        );

        return newPreferences;
      }

      return categoryPreferences;
    } catch (error) {
      console.error('Error fetching category preferences:', error);
      throw error;
    }
  }
}

module.exports = NotificationCategoryService;

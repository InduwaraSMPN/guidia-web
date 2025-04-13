const mysql = require('mysql2/promise');

/**
 * Service for handling notifications
 */
class NotificationService {
  constructor(pool, socketService = null) {
    this.pool = pool;
    this.socketService = socketService;
  }

  /**
   * Create a new notification
   * @param {Object} notification - The notification object
   * @returns {Promise<number>} - The ID of the created notification
   */
  async createNotification({
    userID,
    notificationType,
    title,
    message,
    relatedUserID = null,
    relatedJobID = null,
    relatedApplicationID = null,
    relatedProfileID = null,
    relatedMessageID = null,
    metadata = null,
    targetUserRole = null,
    priority = 'medium',
    expiresAt = null
  }) {
    try {
      // Convert metadata to JSON string if it's an object
      const metadataJson = metadata ? JSON.stringify(metadata) : null;

      const [result] = await this.pool.execute(
        `INSERT INTO notifications (
          userID, notificationType, title, message, relatedUserID,
          relatedJobID, relatedApplicationID, relatedProfileID,
          relatedMessageID, metadata, targetUserRole, priority, expiresAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userID, notificationType, title, message, relatedUserID,
          relatedJobID, relatedApplicationID, relatedProfileID,
          relatedMessageID, metadataJson, targetUserRole, priority,
          expiresAt
        ]
      );

      const notificationId = result.insertId;

      // Send real-time notification if socket service is available
      if (this.socketService) {
        // Fetch the created notification to get all fields
        const [notifications] = await this.pool.query(
          `SELECT * FROM notifications WHERE notificationID = ${notificationId}`
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
          this.socketService.sendNotificationToUser(userID, notification);
        }
      }

      return notificationId;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   * @param {number} userID - The user ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - Array of notifications
   */
  async getUserNotifications(userID, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        unreadOnly = false,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      // Use a different approach with direct query string
      let query;

      if (unreadOnly) {
        query = `
          SELECT * FROM notifications
          WHERE userID = ${userID}
          AND isRead = 0
          ORDER BY ${sortBy} ${sortOrder}
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        query = `
          SELECT * FROM notifications
          WHERE userID = ${userID}
          ORDER BY ${sortBy} ${sortOrder}
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      console.log('Executing query:', query);
      const [notifications] = await this.pool.query(query);

      // Parse metadata JSON
      return notifications.map(notification => {
        let parsedMetadata = null;

        if (notification.metadata) {
          // Check if metadata is already an object
          if (typeof notification.metadata === 'object' && notification.metadata !== null) {
            parsedMetadata = notification.metadata;
          } else {
            // Try to parse the metadata if it's a string
            try {
              parsedMetadata = JSON.parse(notification.metadata);
            } catch (e) {
              console.error('Error parsing notification metadata:', e);
              // Keep the original value if parsing fails
              parsedMetadata = notification.metadata;
            }
          }
        }

        return {
          ...notification,
          metadata: parsedMetadata
        };
      });
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   * @param {number} userID - The user ID
   * @returns {Promise<number>} - Count of unread notifications
   */
  async getUnreadCount(userID) {
    try {
      const query = `SELECT COUNT(*) as count FROM notifications WHERE userID = ${userID} AND isRead = 0`;

      console.log('Executing unread count query:', query);
      const [result] = await this.pool.query(query);
      return parseInt(result[0].count, 10) || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Mark notifications as read
   * @param {number} userID - The user ID
   * @param {Array<number>} notificationIDs - Array of notification IDs to mark as read
   * @returns {Promise<boolean>} - Success status
   */
  async markAsRead(userID, notificationIDs) {
    try {
      if (!notificationIDs || notificationIDs.length === 0) {
        return false;
      }

      // Create a comma-separated list of notification IDs
      const idList = notificationIDs.join(',');

      console.log('Marking notifications as read:', { userID, notificationIDs });

      const query = `UPDATE notifications SET isRead = 1
         WHERE userID = ${userID} AND notificationID IN (${idList})`;

      console.log('Executing mark as read query:', query);
      const [result] = await this.pool.query(query);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {number} userID - The user ID
   * @returns {Promise<boolean>} - Success status
   */
  async markAllAsRead(userID) {
    try {
      console.log('Marking all notifications as read for user:', userID);

      const query = `UPDATE notifications SET isRead = 1 WHERE userID = ${userID} AND isRead = 0`;

      console.log('Executing mark all as read query:', query);
      const [result] = await this.pool.query(query);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notifications
   * @param {number} userID - The user ID
   * @param {Array<number>} notificationIDs - Array of notification IDs to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteNotifications(userID, notificationIDs) {
    try {
      if (!notificationIDs || notificationIDs.length === 0) {
        return false;
      }

      // Create a comma-separated list of notification IDs
      const idList = notificationIDs.join(',');

      console.log('Deleting notifications:', { userID, notificationIDs });

      const query = `DELETE FROM notifications
         WHERE userID = ${userID} AND notificationID IN (${idList})`;

      console.log('Executing delete notifications query:', query);
      const [result] = await this.pool.query(query);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting notifications:', error);
      throw error;
    }
  }

  /**
   * Create a notification from a template
   * @param {number} userID - The recipient user ID
   * @param {string} notificationType - The notification type
   * @param {string} userRole - The user role
   * @param {Object} replacements - Template replacements
   * @param {Object} relatedIds - Related entity IDs
   * @returns {Promise<number>} - The ID of the created notification
   */
  async createFromTemplate(userID, notificationType, userRole, replacements = {}, relatedIds = {}) {
    try {
      // Get the template
      const [templates] = await this.pool.execute(
        'SELECT * FROM notification_templates WHERE notificationType = ? AND targetUserRole = ?',
        [notificationType, userRole]
      );

      if (templates.length === 0) {
        throw new Error(`Template not found for type ${notificationType} and role ${userRole}`);
      }

      const template = templates[0];

      // Replace placeholders in title and message
      let title = template.titleTemplate;
      let message = template.messageTemplate;

      // Replace all {{placeholder}} with actual values
      Object.entries(replacements).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        title = title.replace(placeholder, value);
        message = message.replace(placeholder, value);
      });

      // Create the notification
      return this.createNotification({
        userID,
        notificationType,
        title,
        message,
        targetUserRole: userRole,
        priority: template.defaultPriority,
        ...relatedIds
      });
    } catch (error) {
      console.error('Error creating notification from template:', error);
      throw error;
    }
  }

  /**
   * Get user notification preferences
   * @param {number} userID - The user ID
   * @returns {Promise<Array>} - Array of notification preferences
   */
  async getUserPreferences(userID) {
    try {
      const [preferences] = await this.pool.execute(
        'SELECT * FROM notification_preferences WHERE userID = ?',
        [userID]
      );
      return preferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
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

      // Check if preference exists
      const [existing] = await this.pool.execute(
        'SELECT preferenceID FROM notification_preferences WHERE userID = ? AND notificationType = ?',
        [userID, notificationType]
      );

      if (existing.length > 0) {
        // Update existing preference
        const [result] = await this.pool.execute(
          `UPDATE notification_preferences
           SET isEnabled = ?, emailEnabled = ?, pushEnabled = ?
           WHERE userID = ? AND notificationType = ?`,
          [isEnabled, emailEnabled, pushEnabled, userID, notificationType]
        );
        return result.affectedRows > 0;
      } else {
        // Insert new preference
        const [result] = await this.pool.execute(
          `INSERT INTO notification_preferences
           (userID, notificationType, isEnabled, emailEnabled, pushEnabled)
           VALUES (?, ?, ?, ?, ?)`,
          [userID, notificationType, isEnabled, emailEnabled, pushEnabled]
        );
        return result.insertId > 0;
      }
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
      const [preferences] = await this.pool.execute(
        'SELECT isEnabled FROM notification_preferences WHERE userID = ? AND notificationType = ?',
        [userID, notificationType]
      );

      // If no preference is set, default to enabled
      if (preferences.length === 0) {
        return true;
      }

      return preferences[0].isEnabled === 1;
    } catch (error) {
      console.error('Error checking notification preference:', error);
      // Default to sending notification if there's an error
      return true;
    }
  }
}

module.exports = NotificationService;

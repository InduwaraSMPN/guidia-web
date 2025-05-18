/**
 * Helper utility for sending notifications
 */

/**
 * Send a notification to a user
 * @param {Object} options - Notification options
 * @param {number} options.userID - User ID to send notification to
 * @param {string} options.notificationType - Type of notification
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {Object} options.metadata - Additional metadata for the notification
 * @param {string} options.targetUserRole - Role of the target user
 * @param {string} options.priority - Priority of the notification
 * @returns {Promise<Object>} - The created notification
 */
async function sendNotification(options) {
  try {
    // Get the notification service from the global app object
    const notificationService = global.notificationService;
    
    if (!notificationService) {
      console.error('Notification service not available');
      return null;
    }
    
    // Send the notification
    const notification = await notificationService.createNotification(options);
    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    return null;
  }
}

module.exports = {
  sendNotification
};

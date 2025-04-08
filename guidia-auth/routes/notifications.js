const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const NotificationService = require('../services/notificationService');

// Initialize notification service with the database pool
router.use((req, res, next) => {
  req.notificationService = new NotificationService(req.app.locals.pool);
  next();
});

/**
 * Get notifications for the authenticated user
 * GET /api/notifications
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { 
      limit = 50, 
      offset = 0, 
      unreadOnly = false,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    // Convert query parameters to appropriate types
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true',
      sortBy: ['createdAt', 'priority'].includes(sortBy) ? sortBy : 'createdAt',
      sortOrder: ['ASC', 'DESC'].includes(sortOrder) ? sortOrder : 'DESC'
    };

    const notifications = await req.notificationService.getUserNotifications(userID, options);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

/**
 * Get unread notification count
 * GET /api/notifications/unread-count
 */
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const count = await req.notificationService.getUnreadCount(userID);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
});

/**
 * Mark notifications as read
 * PATCH /api/notifications/mark-read
 */
router.patch('/mark-read', verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { notificationIDs } = req.body;

    if (!Array.isArray(notificationIDs)) {
      return res.status(400).json({ error: 'notificationIDs must be an array' });
    }

    const success = await req.notificationService.markAsRead(userID, notificationIDs);
    
    if (success) {
      res.json({ message: 'Notifications marked as read' });
    } else {
      res.status(404).json({ error: 'No notifications found or updated' });
    }
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

/**
 * Mark all notifications as read
 * PATCH /api/notifications/mark-all-read
 */
router.patch('/mark-all-read', verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const success = await req.notificationService.markAllAsRead(userID);
    
    if (success) {
      res.json({ message: 'All notifications marked as read' });
    } else {
      res.json({ message: 'No unread notifications found' });
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

/**
 * Delete notifications
 * DELETE /api/notifications
 */
router.delete('/', verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { notificationIDs } = req.body;

    if (!Array.isArray(notificationIDs)) {
      return res.status(400).json({ error: 'notificationIDs must be an array' });
    }

    const success = await req.notificationService.deleteNotifications(userID, notificationIDs);
    
    if (success) {
      res.json({ message: 'Notifications deleted' });
    } else {
      res.status(404).json({ error: 'No notifications found or deleted' });
    }
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({ error: 'Failed to delete notifications' });
  }
});

/**
 * Get notification preferences
 * GET /api/notifications/preferences
 */
router.get('/preferences', verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const preferences = await req.notificationService.getUserPreferences(userID);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ error: 'Failed to fetch notification preferences' });
  }
});

/**
 * Update notification preference
 * PATCH /api/notifications/preferences
 */
router.patch('/preferences', verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { notificationType, isEnabled, emailEnabled, pushEnabled } = req.body;

    if (!notificationType) {
      return res.status(400).json({ error: 'notificationType is required' });
    }

    const preferences = {
      isEnabled: isEnabled !== undefined ? isEnabled : true,
      emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
      pushEnabled: pushEnabled !== undefined ? pushEnabled : true
    };

    const success = await req.notificationService.updatePreference(
      userID, 
      notificationType, 
      preferences
    );
    
    if (success) {
      res.json({ message: 'Notification preference updated' });
    } else {
      res.status(500).json({ error: 'Failed to update notification preference' });
    }
  } catch (error) {
    console.error('Error updating notification preference:', error);
    res.status(500).json({ error: 'Failed to update notification preference' });
  }
});

module.exports = router;

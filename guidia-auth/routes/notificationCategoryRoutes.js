/**
 * Routes for notification category preferences
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.js');
const NotificationCategoryService = require('../services/notificationCategoryService');
// Use the pool from app.locals instead of requiring it directly
let pool;

// Initialize notification service in middleware
let notificationCategoryService;

/**
 * Get all notification category preferences for the authenticated user
 */
// Middleware to initialize the notification category service
router.use((req, res, next) => {
  // Get the pool from app.locals
  pool = req.app.locals.pool;
  // Initialize the service with the pool
  notificationCategoryService = new NotificationCategoryService(pool);
  next();
});

router.get('/category-preferences', verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const preferences = await notificationCategoryService.getCategoryPreferences(userID);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching notification category preferences:', error);
    res.status(500).json({ message: 'Error fetching notification preferences' });
  }
});

/**
 * Update a notification category preference
 */
router.patch('/category-preferences', verifyToken, async (req, res) => {
  try {
    const userID = req.user.id;
    const { category, isEnabled, emailEnabled, pushEnabled } = req.body;

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    const preferences = {};

    if (isEnabled !== undefined) {
      preferences.isEnabled = isEnabled;
    }

    if (emailEnabled !== undefined) {
      preferences.emailEnabled = emailEnabled;
    }

    if (pushEnabled !== undefined) {
      preferences.pushEnabled = pushEnabled;
    }

    if (Object.keys(preferences).length === 0) {
      return res.status(400).json({ message: 'No preferences to update' });
    }

    const success = await notificationCategoryService.updateCategoryPreference(userID, category, preferences);

    if (success) {
      res.json({ message: 'Notification preference updated successfully' });
    } else {
      res.status(500).json({ message: 'Failed to update notification preference' });
    }
  } catch (error) {
    console.error('Error updating notification category preference:', error);
    res.status(500).json({ message: 'Error updating notification preference' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { verifyToken, verifyOwnership } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrfProtection');

/**
 * Get current user profile
 * GET /api/users/profile
 * Headers: { Authorization: 'Bearer TOKEN' }
 * Response: { userID, username, email, roleID }
 */
router.get('/profile', verifyToken, require('../middleware/csrfProtection').csrfTokenGenerator, async (req, res) => {
  try {
    const userId = req.user.id;
    const pool = req.app.locals.pool;
    const [users] = await pool.query(
      'SELECT userID, username, email, roleID FROM users WHERE userID = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Explicitly generate and set CSRF token
    const csrfToken = require('../middleware/csrfProtection').generateCsrfToken(userId);
    res.set('X-CSRF-Token', csrfToken);
    
    // Set CORS headers to allow the custom header
    res.set('Access-Control-Expose-Headers', 'X-CSRF-Token');

    res.json(users[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get user profile'
    });
  }
});

/**
 * Change password endpoint
 * POST /api/users/change-password
 * Body: { currentPassword: string, newPassword: string }
 * Headers: { Authorization: 'Bearer TOKEN', X-CSRF-Token: 'CSRF_TOKEN' }
 */
router.post('/change-password', verifyToken, csrfProtection, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'Current password and new password are required'
      });
    }
    
    // Get user from database
    const pool = req.app.locals.pool;
    const [users] = await pool.query(
      'SELECT password FROM users WHERE userID = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }
    
    // Verify current password
    const passwordValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE userID = ?',
      [hashedPassword, userId]
    );
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to change password'
    });
  }
});

/**
 * Update user profile
 * PUT /api/users/profile
 * Body: { username: string, email: string, ... }
 * Headers: { Authorization: 'Bearer TOKEN', X-CSRF-Token: 'CSRF_TOKEN' }
 */
router.put('/profile', verifyToken, csrfProtection, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;
    
    // Validate required fields
    if (!username && !email) {
      return res.status(400).json({
        error: 'Bad request',
        message: 'At least one field to update is required'
      });
    }
    
    // Build update query
    const pool = req.app.locals.pool;
    let updates = [];
    let values = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    
    if (email) {
      // Check if email is already in use
      const [existingUsers] = await pool.query(
        'SELECT userID FROM users WHERE email = ? AND userID != ?',
        [email, userId]
      );
      
      if (existingUsers.length > 0) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Email is already in use'
        });
      }
      
      updates.push('email = ?');
      values.push(email);
    }
    
    // Add userId to values
    values.push(userId);
    
    // Update user
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE userID = ?`,
      values
    );
    
    // Get updated user
    const [updatedUser] = await pool.query(
      'SELECT userID, username, email, roleID FROM users WHERE userID = ?',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;


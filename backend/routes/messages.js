const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const firebaseMessageUtils = require('../utils/firebaseMessageUtils');
const admin = require('firebase-admin');

// Get chat messages between two users
router.get('/:userType/messages/:receiverId', verifyToken, async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    console.log(`Fetching messages between ${senderId} and ${receiverId} using Firebase`);

    // Get messages from Firebase
    const messages = await firebaseMessageUtils.getMessagesBetweenUsers(senderId, receiverId);

    // Get user details for sender and receiver to add names and images
    const pool = req.app.locals.pool;
    const [userDetails] = await pool.execute(`
      SELECT
        u.userID,
        CASE
          WHEN s.studentName IS NOT NULL THEN s.studentName
          WHEN c.counselorName IS NOT NULL THEN c.counselorName
          WHEN comp.companyName IS NOT NULL THEN comp.companyName
          ELSE u.username
        END as name,
        CASE
          WHEN s.studentProfileImagePath IS NOT NULL THEN s.studentProfileImagePath
          WHEN c.counselorProfileImagePath IS NOT NULL THEN c.counselorProfileImagePath
          WHEN comp.companyLogoPath IS NOT NULL THEN comp.companyLogoPath
          ELSE NULL
        END as image
      FROM users u
      LEFT JOIN students s ON u.userID = s.userID
      LEFT JOIN counselors c ON u.userID = c.userID
      LEFT JOIN companies comp ON u.userID = comp.userID
      WHERE u.userID IN (?, ?)
    `, [senderId, receiverId]);

    // Create a map of user details
    const userDetailsMap = {};
    userDetails.forEach(user => {
      userDetailsMap[user.userID] = {
        name: user.name,
        image: user.image
      };
    });

    // Add user details to messages
    const messagesWithDetails = messages.map(message => ({
      ...message,
      senderName: userDetailsMap[message.senderID]?.name || '',
      senderImage: userDetailsMap[message.senderID]?.image || ''
    }));

    // Mark messages as read
    await firebaseMessageUtils.markMessagesAsRead(senderId, receiverId);

    res.json(messagesWithDetails);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/', verifyToken, async (req, res) => {
  try {
    const { receiverId, message, messageType = 'text', mediaUrl = null, replyToId = null } = req.body;
    const senderId = req.user.id;

    console.log(`Sending message from ${senderId} to ${receiverId} using Firebase`);

    // Send message using Firebase
    const result = await firebaseMessageUtils.sendMessage(
      senderId,
      receiverId,
      message,
      messageType,
      mediaUrl,
      replyToId
    );

    res.status(201).json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all conversations for a user
router.get('/conversations', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(`Fetching conversations for user ${userId} using Firebase`);

    // Get conversations from Firebase
    const conversations = await firebaseMessageUtils.getUserConversations(userId);

    // Get user details for all participants
    const pool = req.app.locals.pool;
    const otherUserIds = conversations.map(conv => conv.otherUserId);

    if (otherUserIds.length === 0) {
      return res.json([]);
    }

    const placeholders = otherUserIds.map(() => '?').join(',');
    const [userDetails] = await pool.execute(`
      SELECT
        u.userID,
        CASE
          WHEN s.studentName IS NOT NULL THEN s.studentName
          WHEN c.counselorName IS NOT NULL THEN c.counselorName
          WHEN comp.companyName IS NOT NULL THEN comp.companyName
          ELSE u.username
        END as name,
        CASE
          WHEN s.studentProfileImagePath IS NOT NULL THEN s.studentProfileImagePath
          WHEN c.counselorProfileImagePath IS NOT NULL THEN c.counselorProfileImagePath
          WHEN comp.companyLogoPath IS NOT NULL THEN comp.companyLogoPath
          ELSE NULL
        END as image,
        CASE
          WHEN s.userID IS NOT NULL THEN 'student'
          WHEN c.userID IS NOT NULL THEN 'counselor'
          WHEN comp.userID IS NOT NULL THEN 'company'
          ELSE 'user'
        END as type
      FROM users u
      LEFT JOIN students s ON u.userID = s.userID
      LEFT JOIN counselors c ON u.userID = c.userID
      LEFT JOIN companies comp ON u.userID = comp.userID
      WHERE u.userID IN (${placeholders})
    `, otherUserIds);

    // Create a map of user details
    const userDetailsMap = {};
    userDetails.forEach(user => {
      userDetailsMap[user.userID] = {
        name: user.name,
        image: user.image,
        type: user.type
      };
    });

    // Format conversations with user details
    const formattedConversations = conversations.map(conv => ({
      userId: conv.otherUserId,
      name: userDetailsMap[conv.otherUserId]?.name || 'Unknown User',
      image: userDetailsMap[conv.otherUserId]?.image || null,
      type: userDetailsMap[conv.otherUserId]?.type || 'user',
      lastMessage: conv.lastMessage,
      timestamp: conv.timestamp,
      unreadCount: conv.unreadCount
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Mark all messages as read
router.post('/mark-all-read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Marking all messages as read for user ${userId} using Firebase`);

    // Get all conversations for this user
    const database = admin.database();
    const conversationsRef = database.ref('messages/conversations');
    const snapshot = await conversationsRef.once('value');
    const conversations = snapshot.val() || {};

    let totalMarked = 0;
    const updates = {};

    // Find all conversations where this user is a participant
    for (const [conversationId, conversation] of Object.entries(conversations)) {
      if (!conversation.participants || !conversation.participants[userId]) {
        continue;
      }

      // Find unread messages sent to this user
      if (conversation.messages) {
        for (const [messageId, message] of Object.entries(conversation.messages)) {
          if (!message.read && message.receiver === userId.toString()) {
            updates[`messages/conversations/${conversationId}/messages/${messageId}/read`] = true;
            totalMarked++;
          }
        }
      }
    }

    // Apply updates if there are any
    if (Object.keys(updates).length > 0) {
      await database.ref().update(updates);
    }

    res.status(200).json({
      message: 'All messages marked as read',
      count: totalMarked
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Get unread message count for a user by user type
// This endpoint handles both /api/:userType/messages/unread-count and /api/messages/:userType/messages/unread-count
router.get('/:userType/messages/unread-count', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching unread message count for user ${userId} using Firebase`);

    // Get detailed unread messages from Firebase
    const unreadMessages = await firebaseMessageUtils.getDetailedUnreadMessages(userId);

    // Get sender details for these messages
    const pool = req.app.locals.pool;
    const senderIds = [...new Set(unreadMessages.map(msg => msg.senderID))];

    if (senderIds.length > 0) {
      const placeholders = senderIds.map(() => '?').join(',');
      const [senderDetails] = await pool.execute(`
        SELECT
          u.userID,
          CASE
            WHEN s.studentName IS NOT NULL THEN s.studentName
            WHEN c.counselorName IS NOT NULL THEN c.counselorName
            WHEN comp.companyName IS NOT NULL THEN comp.companyName
            ELSE u.username
          END as senderName
        FROM users u
        LEFT JOIN students s ON u.userID = s.userID
        LEFT JOIN counselors c ON u.userID = c.userID
        LEFT JOIN companies comp ON u.userID = comp.userID
        WHERE u.userID IN (${placeholders})
      `, senderIds);

      // Create a map of sender names
      const senderNamesMap = {};
      senderDetails.forEach(sender => {
        senderNamesMap[sender.userID] = sender.senderName;
      });

      // Add sender names to messages
      unreadMessages.forEach(message => {
        message.senderName = senderNamesMap[message.senderID] || 'Unknown User';
      });
    }

    // Return both count and details for debugging
    res.json({
      count: unreadMessages.length,
      messages: unreadMessages
    });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ error: 'Failed to fetch unread message count' });
  }
});

// Additional endpoint to handle direct access without userType
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Fetching unread message count for user ${userId} (direct endpoint) using Firebase`);

    // Get unread count from Firebase
    const count = await firebaseMessageUtils.getUnreadMessageCount(userId);

    console.log(`Unread message count for user ${userId}: ${count}`);
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ error: 'Failed to fetch unread message count' });
  }
});

module.exports = router;

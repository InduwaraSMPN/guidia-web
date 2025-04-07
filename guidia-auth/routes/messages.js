const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Get chat messages between two users
router.get('/:userType/messages/:receiverId', verifyToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    const [messages] = await pool.execute(`
      SELECT 
        m.*,
        CASE 
          WHEN s.studentName IS NOT NULL THEN s.studentName
          WHEN c.counselorName IS NOT NULL THEN c.counselorName
          WHEN comp.companyName IS NOT NULL THEN comp.companyName
        END as senderName,
        CASE 
          WHEN s.studentProfileImagePath IS NOT NULL THEN s.studentProfileImagePath
          WHEN c.counselorProfileImagePath IS NOT NULL THEN c.counselorProfileImagePath
          WHEN comp.companyLogoPath IS NOT NULL THEN comp.companyLogoPath
        END as senderImage,
        m.senderID = ? as isSender
      FROM messages m
      LEFT JOIN students s ON m.senderID = s.userID
      LEFT JOIN counselors c ON m.senderID = c.userID
      LEFT JOIN companies comp ON m.senderID = comp.userID
      WHERE (m.senderID = ? AND m.receiverID = ?)
         OR (m.senderID = ? AND m.receiverID = ?)
      ORDER BY m.timestamp ASC
    `, [senderId, senderId, receiverId, receiverId, senderId]);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/', verifyToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    const [result] = await pool.execute(
      'INSERT INTO messages (senderID, receiverID, message) VALUES (?, ?, ?)',
      [senderId, receiverId, message]
    );

    res.status(201).json({
      messageId: result.insertId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all conversations for a user
router.get('/conversations', verifyToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const userId = req.user.id;

    const [conversations] = await pool.execute(`
      SELECT 
        DISTINCT 
        CASE 
          WHEN m.senderID = ? THEN m.receiverID
          ELSE m.senderID
        END as userId,
        CASE 
          WHEN m.senderID = ? THEN 
            CASE 
              WHEN s2.studentName IS NOT NULL THEN s2.studentName
              WHEN c2.counselorName IS NOT NULL THEN c2.counselorName
              WHEN comp2.companyName IS NOT NULL THEN comp2.companyName
            END
          ELSE 
            CASE 
              WHEN s1.studentName IS NOT NULL THEN s1.studentName
              WHEN c1.counselorName IS NOT NULL THEN c1.counselorName
              WHEN comp1.companyName IS NOT NULL THEN comp1.companyName
            END
        END as name,
        CASE 
          WHEN m.senderID = ? THEN 
            CASE 
              WHEN s2.studentProfileImagePath IS NOT NULL THEN s2.studentProfileImagePath
              WHEN c2.counselorProfileImagePath IS NOT NULL THEN c2.counselorProfileImagePath
              WHEN comp2.companyLogoPath IS NOT NULL THEN comp2.companyLogoPath
            END
          ELSE 
            CASE 
              WHEN s1.studentProfileImagePath IS NOT NULL THEN s1.studentProfileImagePath
              WHEN c1.counselorProfileImagePath IS NOT NULL THEN c1.counselorProfileImagePath
              WHEN comp1.companyLogoPath IS NOT NULL THEN comp1.companyLogoPath
            END
        END as image,
        CASE 
          WHEN m.senderID = ? THEN 
            CASE 
              WHEN s2.userID IS NOT NULL THEN 'student'
              WHEN c2.userID IS NOT NULL THEN 'counselor'
              WHEN comp2.userID IS NOT NULL THEN 'company'
            END
          ELSE 
            CASE 
              WHEN s1.userID IS NOT NULL THEN 'student'
              WHEN c1.userID IS NOT NULL THEN 'counselor'
              WHEN comp1.userID IS NOT NULL THEN 'company'
            END
        END as type,
        m.message as lastMessage,
        m.timestamp,
        COUNT(CASE WHEN m2.isRead = 0 AND m2.receiverID = ? THEN 1 END) as unreadCount
      FROM messages m
      LEFT JOIN messages m2 ON 
        ((m2.senderID = m.senderID AND m2.receiverID = m.receiverID) OR 
         (m2.senderID = m.receiverID AND m2.receiverID = m.senderID))
      LEFT JOIN students s1 ON m.senderID = s1.userID
      LEFT JOIN counselors c1 ON m.senderID = c1.userID
      LEFT JOIN companies comp1 ON m.senderID = comp1.userID
      LEFT JOIN students s2 ON m.receiverID = s2.userID
      LEFT JOIN counselors c2 ON m.receiverID = c2.userID
      LEFT JOIN companies comp2 ON m.receiverID = comp2.userID
      WHERE m.senderID = ? OR m.receiverID = ?
      GROUP BY 
        CASE WHEN m.senderID = ? THEN m.receiverID ELSE m.senderID END,
        name,
        image,
        type,
        m.message,
        m.timestamp
      ORDER BY m.timestamp DESC
    `, [userId, userId, userId, userId, userId, userId, userId, userId]);

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Mark all messages as read
router.post('/mark-all-read', verifyToken, async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const userId = req.user.id;

    await pool.execute(
      'UPDATE messages SET isRead = 1 WHERE receiverID = ? AND isRead = 0',
      [userId]
    );

    res.status(200).json({ message: 'All messages marked as read' });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

module.exports = router;




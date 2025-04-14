const admin = require('firebase-admin');

// Helper function to create conversation ID
function getConversationId(userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join('_');
}

// Get messages between two users
async function getMessagesBetweenUsers(senderId, receiverId) {
  const conversationId = getConversationId(senderId, receiverId);
  const messagesRef = admin.database().ref(`messages/conversations/${conversationId}/messages`);
  
  const snapshot = await messagesRef.once('value');
  const messagesData = snapshot.val() || {};
  
  // Convert to array and format
  const messages = Object.entries(messagesData).map(([id, message]) => ({
    messageID: id,
    senderID: message.sender,
    receiverID: message.receiver,
    message: message.content,
    timestamp: message.timestamp ? new Date(message.timestamp).toISOString() : new Date().toISOString(),
    isSender: senderId.toString() === message.sender,
    read: message.read || false,
    status: message.read ? 'read' : 'sent',
    is_edited: message.isEdited || false,
    edited_at: message.editedAt ? new Date(message.editedAt).toISOString() : null,
    reply_to_id: message.replyToId || null,
    message_type: message.messageType || 'text',
    media_url: message.mediaUrl || null
  }));
  
  // Sort by timestamp
  return messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Send a new message
async function sendMessage(senderId, receiverId, messageContent, messageType = 'text', mediaUrl = null, replyToId = null) {
  const conversationId = getConversationId(senderId, receiverId);
  
  // Ensure the conversation exists with participants
  const participantsRef = admin.database().ref(`messages/conversations/${conversationId}/participants`);
  const participantsSnapshot = await participantsRef.once('value');
  
  if (!participantsSnapshot.exists()) {
    await participantsRef.set({
      [senderId]: true,
      [receiverId]: true
    });
  }
  
  // Create the message
  const messagesRef = admin.database().ref(`messages/conversations/${conversationId}/messages`);
  const newMessageRef = messagesRef.push();
  
  const messageData = {
    sender: senderId.toString(),
    receiver: receiverId.toString(),
    content: messageContent,
    timestamp: admin.database.ServerValue.TIMESTAMP,
    read: false,
    messageType: messageType,
    mediaUrl: mediaUrl,
    replyToId: replyToId
  };
  
  // Save the message
  await newMessageRef.set(messageData);
  
  return {
    messageId: newMessageRef.key,
    timestamp: new Date().toISOString()
  };
}

// Get all conversations for a user
async function getUserConversations(userId) {
  const conversationsRef = admin.database().ref('messages/conversations');
  const snapshot = await conversationsRef.once('value');
  const conversations = snapshot.val() || {};
  
  const userConversations = [];
  
  // Filter conversations where the user is a participant
  for (const [conversationId, conversation] of Object.entries(conversations)) {
    if (!conversation.participants || !conversation.participants[userId]) {
      continue;
    }
    
    // Get the other participant
    const otherUserId = Object.keys(conversation.participants)
      .find(participantId => participantId !== userId.toString());
    
    if (!otherUserId) {
      continue;
    }
    
    // Get the last message
    let lastMessage = null;
    let unreadCount = 0;
    
    if (conversation.messages) {
      const messages = Object.entries(conversation.messages)
        .map(([id, message]) => ({
          id,
          ...message,
          timestamp: message.timestamp || 0
        }))
        .sort((a, b) => b.timestamp - a.timestamp);
      
      if (messages.length > 0) {
        lastMessage = messages[0];
        
        // Count unread messages
        unreadCount = messages.filter(
          message => !message.read && message.receiver === userId.toString()
        ).length;
      }
    }
    
    if (lastMessage) {
      userConversations.push({
        conversationId,
        otherUserId,
        lastMessage: lastMessage.content,
        timestamp: lastMessage.timestamp ? new Date(lastMessage.timestamp).toISOString() : new Date().toISOString(),
        unreadCount
      });
    }
  }
  
  // Sort by timestamp (most recent first)
  return userConversations.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
}

// Mark messages as read
async function markMessagesAsRead(senderId, receiverId) {
  const conversationId = getConversationId(senderId, receiverId);
  const messagesRef = admin.database().ref(`messages/conversations/${conversationId}/messages`);
  
  const snapshot = await messagesRef.once('value');
  const messages = snapshot.val() || {};
  
  const updates = {};
  
  // Find unread messages sent to the current user
  for (const [messageId, message] of Object.entries(messages)) {
    if (!message.read && message.receiver === senderId.toString()) {
      updates[`${messageId}/read`] = true;
    }
  }
  
  // Apply updates if there are any
  if (Object.keys(updates).length > 0) {
    await messagesRef.update(updates);
    return Object.keys(updates).length;
  }
  
  return 0;
}

// Get unread message count for a user
async function getUnreadMessageCount(userId) {
  const conversationsRef = admin.database().ref('messages/conversations');
  const snapshot = await conversationsRef.once('value');
  const conversations = snapshot.val() || {};
  
  let unreadCount = 0;
  
  // Count unread messages across all conversations
  for (const [conversationId, conversation] of Object.entries(conversations)) {
    if (!conversation.participants || !conversation.participants[userId]) {
      continue;
    }
    
    if (conversation.messages) {
      // Count unread messages sent to this user
      for (const message of Object.values(conversation.messages)) {
        if (!message.read && message.receiver === userId.toString()) {
          unreadCount++;
        }
      }
    }
  }
  
  return unreadCount;
}

// Get detailed unread messages for a user
async function getDetailedUnreadMessages(userId) {
  const conversationsRef = admin.database().ref('messages/conversations');
  const snapshot = await conversationsRef.once('value');
  const conversations = snapshot.val() || {};
  
  const unreadMessages = [];
  
  // Collect unread messages across all conversations
  for (const [conversationId, conversation] of Object.entries(conversations)) {
    if (!conversation.participants || !conversation.participants[userId]) {
      continue;
    }
    
    if (conversation.messages) {
      // Get unread messages sent to this user
      for (const [messageId, message] of Object.entries(conversation.messages)) {
        if (!message.read && message.receiver === userId.toString()) {
          unreadMessages.push({
            messageID: messageId,
            senderID: message.sender,
            receiverID: message.receiver,
            message: message.content,
            timestamp: message.timestamp ? new Date(message.timestamp).toISOString() : new Date().toISOString()
          });
        }
      }
    }
  }
  
  // Sort by timestamp (most recent first)
  return unreadMessages.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
}

module.exports = {
  getMessagesBetweenUsers,
  sendMessage,
  getUserConversations,
  markMessagesAsRead,
  getUnreadMessageCount,
  getDetailedUnreadMessages,
  getConversationId
};

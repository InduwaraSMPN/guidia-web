import { database } from '../firebase/config';
import { ref, get, set, serverTimestamp } from 'firebase/database';
import { getConversationId } from './conversationUtils';

/**
 * Debugs a conversation between two users and logs detailed information
 * @param userId1 First user's ID
 * @param userId2 Second user's ID
 * @returns Detailed information about the conversation
 */
export async function debugConversation(userId1: string, userId2: string): Promise<any> {
  if (!database) {
    console.error('Firebase database not initialized');
    throw new Error('Firebase database not initialized');
  }

  try {
    // Generate the conversation ID
    const conversationId = getConversationId(userId1, userId2);
    console.log(`Debugging conversation ${conversationId} between ${userId1} and ${userId2}`);

    // Check if the conversation exists
    const conversationRef = ref(database, `messages/conversations/${conversationId}`);
    const snapshot = await get(conversationRef);

    if (!snapshot.exists()) {
      console.log(`Conversation ${conversationId} does not exist`);
      return {
        exists: false,
        conversationId,
        userId1,
        userId2
      };
    }

    // Get conversation data
    const conversationData = snapshot.val();
    console.log(`Conversation ${conversationId} data:`, conversationData);

    // Check participants
    const participants = conversationData.participants || {};
    const hasUser1 = participants[userId1] === true;
    const hasUser2 = participants[userId2] === true;
    console.log(`Participants check: User ${userId1} exists: ${hasUser1}, User ${userId2} exists: ${hasUser2}`);

    // Check messages
    const messages = conversationData.messages || {};
    const messageCount = Object.keys(messages).length;
    console.log(`Conversation has ${messageCount} messages`);

    // Get message details
    const messageDetails = Object.entries(messages).map(([id, message]: [string, any]) => ({
      id,
      sender: message.sender,
      receiver: message.receiver,
      content: message.content,
      timestamp: message.timestamp,
      read: message.read
    }));

    return {
      exists: true,
      conversationId,
      userId1,
      userId2,
      hasUser1,
      hasUser2,
      messageCount,
      messages: messageDetails,
      createdAt: conversationData.createdAt,
      lastUpdated: conversationData.lastUpdated
    };
  } catch (error) {
    console.error('Error debugging conversation:', error);
    throw error;
  }
}

/**
 * Fixes a conversation between two users by ensuring it exists and has at least one message
 * @param userId1 First user's ID
 * @param userId2 Second user's ID
 * @returns Information about the fixed conversation
 */
export async function fixConversation(userId1: string, userId2: string): Promise<any> {
  if (!database) {
    console.error('Firebase database not initialized');
    throw new Error('Firebase database not initialized');
  }

  try {
    // First debug the conversation
    const debugInfo = await debugConversation(userId1, userId2);
    
    // Generate the conversation ID
    const conversationId = getConversationId(userId1, userId2);
    
    // If conversation doesn't exist, create it
    if (!debugInfo.exists) {
      console.log(`Creating conversation ${conversationId} between ${userId1} and ${userId2}`);
      
      const conversationRef = ref(database, `messages/conversations/${conversationId}`);
      await set(conversationRef, {
        participants: {
          [userId1]: true,
          [userId2]: true
        },
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      
      console.log(`Conversation ${conversationId} created`);
    }
    
    // If conversation has no messages, add a system message
    if (debugInfo.exists && debugInfo.messageCount === 0) {
      console.log(`Adding system message to conversation ${conversationId}`);
      
      const messageRef = ref(database, `messages/conversations/${conversationId}/messages/system_msg`);
      await set(messageRef, {
        sender: userId2,
        receiver: userId1,
        content: `System message: This conversation was created between users ${userId1} and ${userId2}`,
        timestamp: serverTimestamp(),
        read: false
      });
      
      console.log(`System message added to conversation ${conversationId}`);
    }
    
    // Debug again to verify fixes
    const updatedDebugInfo = await debugConversation(userId1, userId2);
    
    return {
      before: debugInfo,
      after: updatedDebugInfo,
      fixed: true
    };
  } catch (error) {
    console.error('Error fixing conversation:', error);
    throw error;
  }
}

import { database } from '../firebase/config';
import { ref, set, serverTimestamp } from 'firebase/database';

/**
 * Creates a specific conversation in Firebase Realtime Database between two users
 * This is a utility function for testing and fixing issues
 */
export async function createSpecificConversation(userId1: string, userId2: string, initialMessage: string = 'Hello! This is a test message.') {
  if (!database) {
    console.error('Firebase database not initialized');
    return;
  }

  try {
    // Create conversation ID (sort user IDs to ensure consistency)
    const userIds = [userId1, userId2].sort();
    const conversationId = userIds.join('_');

    // Create conversation with participants
    const conversationRef = ref(database, `messages/conversations/${conversationId}`);
    await set(conversationRef, {
      participants: {
        [userId1]: true,
        [userId2]: true
      },
      createdAt: serverTimestamp()
    });

    // Add a test message
    const messagesRef = ref(database, `messages/conversations/${conversationId}/messages/msg1`);
    await set(messagesRef, {
      sender: userId2,
      receiver: userId1,
      content: initialMessage,
      timestamp: serverTimestamp(),
      read: false
    });

    console.log(`Conversation created with ID: ${conversationId}`);
    return conversationId;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

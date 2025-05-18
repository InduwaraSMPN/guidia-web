import { database } from '../firebase/config';
import { ref, set, serverTimestamp } from 'firebase/database';

/**
 * Creates a test conversation in Firebase Realtime Database
 * This is a utility function for testing purposes only
 */
export async function createTestConversation(userId: string, otherUserId: string) {
  if (!database) {
    console.error('Firebase database not initialized');
    return;
  }

  try {
    // Create conversation ID (sort user IDs to ensure consistency)
    const userIds = [userId, otherUserId].sort();
    const conversationId = userIds.join('_');

    // Create conversation with participants
    const conversationRef = ref(database, `messages/conversations/${conversationId}`);
    await set(conversationRef, {
      participants: {
        [userId]: true,
        [otherUserId]: true
      },
      createdAt: serverTimestamp()
    });

    // Add a test message
    const messagesRef = ref(database, `messages/conversations/${conversationId}/messages/msg1`);
    await set(messagesRef, {
      sender: otherUserId,
      receiver: userId,
      content: 'Hello! This is a test message.',
      timestamp: serverTimestamp(),
      read: false
    });

    console.log(`Test conversation created with ID: ${conversationId}`);
    return conversationId;
  } catch (error) {
    console.error('Error creating test conversation:', error);
    throw error;
  }
}

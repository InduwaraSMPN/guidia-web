import { database } from '../firebase/config';
import { ref, get, set, update, serverTimestamp } from 'firebase/database';
import { getConversationId } from './conversationUtils';

/**
 * Gets an existing conversation or creates a new one if it doesn't exist
 * @param userId1 First user's ID
 * @param userId2 Second user's ID
 * @returns The conversation ID
 */
export async function getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
  if (!database) {
    console.error('Firebase database not initialized');
    throw new Error('Firebase database not initialized');
  }

  try {
    // Generate the conversation ID
    const conversationId = getConversationId(userId1, userId2);
    console.log(`Checking for conversation ${conversationId} between ${userId1} and ${userId2}`);

    // Check if the conversation exists
    const conversationRef = ref(database, `messages/conversations/${conversationId}`);
    const snapshot = await get(conversationRef);

    // If conversation already exists, ensure participants are properly set
    if (snapshot.exists()) {
      console.log(`Conversation ${conversationId} already exists`);

      // Get current participants
      const data = snapshot.val();
      const participants = data?.participants || {};

      // Check if both users are in participants
      const hasUser1 = participants[userId1] === true;
      const hasUser2 = participants[userId2] === true;

      console.log(`Participants check: User ${userId1} exists: ${hasUser1}, User ${userId2} exists: ${hasUser2}`);

      // If any participant is missing, update the participants
      if (!hasUser1 || !hasUser2) {
        console.log(`Updating participants for conversation ${conversationId}`);

        // Update participants
        const participantsRef = ref(database, `messages/conversations/${conversationId}/participants`);
        await update(participantsRef, {
          [userId1]: true,
          [userId2]: true
        });

        console.log(`Participants updated for conversation ${conversationId}`);
      }

      return conversationId;
    }

    // If conversation doesn't exist, create it
    console.log(`Creating new conversation ${conversationId} between ${userId1} and ${userId2}`);

    // Create conversation with participants
    const conversationData = {
      participants: {
        [userId1]: true,
        [userId2]: true
      },
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp()
    };

    await set(conversationRef, conversationData);
    console.log(`Conversation ${conversationId} created with participants:`, Object.keys(conversationData.participants));

    return conversationId;
  } catch (error) {
    console.error('Error getting or creating conversation:', error);
    throw error;
  }
}

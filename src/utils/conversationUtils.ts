/**
 * Generates a consistent conversation ID between two users
 * This ensures the same conversation ID is generated regardless of who initiates the conversation
 * @param userId1 First user's ID
 * @param userId2 Second user's ID
 * @returns A consistent conversation ID
 */
export const getConversationId = (userId1: string, userId2: string): string => {
  // Sort the IDs to ensure consistency
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

/**
 * Extracts the other user's ID from a conversation ID
 * @param conversationId The conversation ID
 * @param currentUserId The current user's ID
 * @returns The other user's ID
 */
export const getOtherUserId = (conversationId: string, currentUserId: string): string => {
  const ids = conversationId.split('_');
  return ids[0] === currentUserId ? ids[1] : ids[0];
};

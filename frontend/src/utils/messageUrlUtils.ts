/**
 * Utility functions for handling message URL formats
 */

/**
 * Converts a legacy message URL to the new format
 * @param userType The type of user (student, counselor, company)
 * @param userId The ID of the current user
 * @param receiverId The ID of the message recipient
 * @param receiverType The type of the recipient (optional)
 * @returns The new format URL
 */
export const getLegacyMessageUrl = (
  userType: string,
  receiverId: string,
  receiverType?: string
): string => {
  const typeParam = receiverType ? `?type=${receiverType}` : '';
  return `/${userType.toLowerCase()}/messages/${receiverId}${typeParam}`;
};

/**
 * Converts to the new message URL format
 * @param userType The type of user (student, counselor, company)
 * @param userId The ID of the current user
 * @param receiverId The ID of the message recipient
 * @param receiverType The type of the recipient (optional)
 * @returns The new format URL
 */
export const getNewMessageUrl = (
  userType: string,
  userId: string,
  receiverId: string,
  receiverType?: string
): string => {
  const typeParam = receiverType ? `?type=${receiverType}` : '';
  return `/${userType.toLowerCase()}/${userId}/messages/${receiverId}${typeParam}`;
};

/**
 * Determines if a URL is using the legacy message format
 * @param pathname The URL pathname
 * @returns True if the URL is using the legacy format
 */
export const isLegacyMessageUrl = (pathname: string): boolean => {
  // Legacy format: /:userType/messages/:receiverId
  // New format: /:userType/:userID/messages/:receiverId
  const parts = pathname.split('/').filter(Boolean);
  return parts.length === 3 && parts[1] === 'messages';
};

/**
 * Extracts user type, user ID, and receiver ID from a message URL
 * @param pathname The URL pathname
 * @returns An object with userType, userId (if available), and receiverId
 */
export const parseMessageUrl = (pathname: string): { 
  userType: string; 
  userId?: string; 
  receiverId?: string;
} => {
  const parts = pathname.split('/').filter(Boolean);
  
  if (isLegacyMessageUrl(pathname)) {
    // Legacy format: /:userType/messages/:receiverId
    return {
      userType: parts[0],
      receiverId: parts[2]
    };
  } else {
    // New format: /:userType/:userID/messages/:receiverId
    return {
      userType: parts[0],
      userId: parts[1],
      receiverId: parts[3]
    };
  }
};

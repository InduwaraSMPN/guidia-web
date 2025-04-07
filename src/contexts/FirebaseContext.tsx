import React, { createContext, useContext, useEffect, useState } from 'react';
import { database, auth } from '../firebase/config';
import { ref, onValue, push, set, serverTimestamp, get } from 'firebase/database';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from './AuthContext';
import { getOrCreateConversation } from '../utils/getOrCreateConversation';

interface FirebaseContextType {
  sendMessage: (conversationId: string, receiverId: string, message: string, senderId?: string) => Promise<void>;
  listenToMessages: (conversationId: string, callback: (messages: any[]) => void, currentUserId?: string) => () => void;
  markMessagesAsRead: (conversationId: string, messageIds: string[]) => Promise<void>;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
  isFirebaseReady: boolean;
  firebaseError: string | null;
}

const FirebaseContext = createContext<FirebaseContextType | null>(null);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [firebaseError, setFirebaseError] = useState<Error | null>(null);

  useEffect(() => {
    // Log the current user from AuthContext
    console.log("AuthContext user:", user ? {
      userID: user.userID,
      userType: user.userType,
      email: user.email
    } : "No user");

    if (!auth) {
      console.warn("Firebase auth not initialized");
      // Allow the app to work without authentication in development
      if (import.meta.env.DEV) {
        console.log("Development mode: allowing Firebase access without authentication");
        setIsFirebaseReady(true);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth,
      (firebaseUser) => {
        console.log("Firebase auth state changed:", firebaseUser ? "User authenticated" : "No user");
        if (firebaseUser) {
          console.log("Firebase user ID:", firebaseUser.uid);
          console.log("Is anonymous:", firebaseUser.isAnonymous);
          setIsFirebaseReady(true);
          setFirebaseError(null);
        } else {
          // In development, allow the app to work without authentication
          if (import.meta.env.DEV) {
            console.log("Development mode: allowing Firebase access without authentication");
            setIsFirebaseReady(true);
          } else {
            setIsFirebaseReady(false);
          }
        }
      },
      (error) => {
        console.error("Firebase auth state error:", error);
        setFirebaseError(error);

        // In development, allow the app to work even with auth errors
        if (import.meta.env.DEV) {
          console.log("Development mode: allowing Firebase access despite authentication error");
          setIsFirebaseReady(true);
        } else {
          setIsFirebaseReady(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Function to send a message
  const sendMessage = async (conversationId: string, receiverId: string, message: string, senderId?: string) => {
    // Use provided senderId or fall back to authenticated user
    const actualSenderId = senderId || user?.userID;

    if (!actualSenderId || !isFirebaseReady || !database) {
      console.error("Prerequisites not met:", {
        senderId: actualSenderId,
        isFirebaseReady,
        database: !!database
      });
      throw new Error("Cannot send message - Firebase not ready or missing sender ID");
    }

    console.log(`FirebaseContext: Sending message in conversation ${conversationId}`);
    console.log(`- From: ${actualSenderId}`);
    console.log(`- To: ${receiverId}`);
    console.log(`- Message length: ${message.length} characters`);

    try {
      // Ensure the conversation exists using our utility function
      await getOrCreateConversation(actualSenderId, receiverId);
      console.log(`FirebaseContext: Conversation ${conversationId} confirmed/created`);

      // Add the message
      const messagesRef = ref(database, `messages/conversations/${conversationId}/messages`);
      const newMessageRef = push(messagesRef);

      // Create message object
      const messageData = {
        sender: actualSenderId,
        receiver: receiverId,
        content: message,
        timestamp: serverTimestamp(),
        read: false
      };

      // Save message to Firebase
      await set(newMessageRef, messageData);
      console.log(`FirebaseContext: Message saved successfully with ID: ${newMessageRef.key}`);

      // Return the message ID for reference
      return newMessageRef.key;
    } catch (error) {
      console.error("Error sending message:", error);

      // Check for specific Firebase errors
      const errorCode = (error as any)?.code;
      if (errorCode === 'PERMISSION_DENIED') {
        console.warn('Firebase permission denied. Make sure Firebase security rules are properly configured.');
        console.warn('See FIREBASE_SETUP.md for instructions on setting up security rules.');
      }

      throw error;
    }
  };

  // Function to listen to messages in a conversation
  const listenToMessages = (conversationId: string, callback: (messages: any[]) => void, currentUserId?: string) => {
    if (!isFirebaseReady) {
      console.warn(`FirebaseContext: Cannot listen to messages - Firebase not ready`);
      return () => {}; // Return empty function if Firebase is not ready
    }

    // Use provided currentUserId or fall back to authenticated user
    const actualUserId = currentUserId || user?.userID;
    console.log(`FirebaseContext: Listening to messages in conversation ${conversationId}`);
    console.log(`- User ID: ${actualUserId}`);
    console.log(`- Path: messages/conversations/${conversationId}/messages`);

    const messagesRef = ref(database, `messages/conversations/${conversationId}/messages`);

    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        console.log(`FirebaseContext: No messages found for conversation ${conversationId}`);
        callback([]);
        return;
      }

      console.log(`FirebaseContext: Received ${Object.keys(data).length} messages for conversation ${conversationId}`);

      const messageList = Object.entries(data).map(([id, message]: [string, any]) => ({
        messageID: id,
        senderID: message.sender,
        receiverID: message.receiver,
        message: message.content,
        timestamp: message.timestamp ? new Date(message.timestamp).toISOString() : new Date().toISOString(),
        isSender: actualUserId ? message.sender === actualUserId : false,
        read: message.read || false
      }));

      // Sort messages by timestamp
      messageList.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      callback(messageList);
    });

    return unsubscribe;
  };

  // Function to mark messages as read
  const markMessagesAsRead = async (conversationId: string, messageIds: string[]) => {
    if (!isFirebaseReady || messageIds.length === 0) return;

    try {
      // Update each message individually instead of using a multi-path update
      const promises = messageIds.map(messageId => {
        const messageRef = ref(database, `messages/conversations/${conversationId}/messages/${messageId}/read`);
        return set(messageRef, true);
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  };

  // Function to send typing indicator
  const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
    if (!user || !isFirebaseReady) return;

    try {
      const typingRef = ref(database, `messages/conversations/${conversationId}/typing/${user.userID}`);
      set(typingRef, isTyping ? new Date().getTime() : null);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
  };

  if (firebaseError) {
    console.error("Firebase initialization error:", firebaseError);
    // You might want to show a user-friendly error message here
  }

  return (
    <FirebaseContext.Provider value={{
      sendMessage,
      listenToMessages,
      markMessagesAsRead,
      sendTypingIndicator,
      isFirebaseReady,
      firebaseError: firebaseError?.message || null
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};



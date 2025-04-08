# Firebase Setup for Chat Functionality

This document provides instructions for setting up Firebase Realtime Database for the chat functionality in the Guidia Web application.

## 1. Firebase Security Rules

To allow the chat functionality to work properly, you need to set up the correct security rules in your Firebase Realtime Database. Follow these steps:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "guidia-web"
3. In the left sidebar, click on "Realtime Database"
4. Click on the "Rules" tab
5. Replace the current rules with the following:

```json
{
  "rules": {
    "messages": {
      "conversations": {
        "$conversationId": {
          // Allow read/write if the user is authenticated
          ".read": "auth != null",
          ".write": "auth != null",
          
          "messages": {
            ".read": "auth != null",
            ".write": "auth != null"
          },
          
          "typing": {
            ".read": "auth != null",
            ".write": "auth != null"
          },
          
          "participants": {
            ".read": "auth != null",
            ".write": "auth != null"
          }
        }
      }
    }
  }
}
```

6. Click "Publish" to save the rules

## 2. Database Structure

The Firebase Realtime Database is structured as follows:

```
/messages
  /conversations
    /{conversationId}  // Format: "userId1_userId2" (sorted alphabetically)
      /participants
        /{userId}: true
      /messages
        /{messageId}
          sender: "userId"
          receiver: "userId"
          content: "Message text"
          timestamp: timestamp
          read: boolean
      /typing
        /{userId}: timestamp or null
```

## 3. Authentication

The application uses Firebase Anonymous Authentication to allow users to access the database. This is automatically set up when the application starts.

## 4. Troubleshooting

If you encounter permission errors like:

```
FIREBASE WARNING: set at /messages/conversations/33_58/typing/33 failed: permission_denied
```

Make sure:

1. The Firebase security rules are correctly set up
2. The application is properly authenticated with Firebase
3. The database URL in the Firebase configuration is correct

## 5. Migration from MySQL

The current implementation maintains compatibility with the existing MySQL database structure. If you want to completely migrate to Firebase:

1. Create a migration script to move existing messages from MySQL to Firebase
2. Update the API endpoints to use Firebase instead of MySQL
3. Remove the MySQL-related code once the migration is complete

## 6. Additional Resources

- [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database)
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/database/security)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)

# Guidia AI Chat History System

This document provides an overview of the chat history management system for the Guidia AI Assistant.

## Overview

The chat history system allows users to:
- Save and retrieve their conversations with Guidia AI
- Search through past conversations by keyword, date range, and content
- Organize conversations with tags
- Archive or delete conversations
- View analytics about their chat usage

## Database Schema

The system uses the following database tables:

### `ai_chat_conversations`
Stores metadata about each conversation.
- `conversationID`: Primary key
- `userID`: Foreign key to the users table
- `title`: Title of the conversation (auto-generated from first message)
- `createdAt`: When the conversation was created
- `updatedAt`: When the conversation was last updated
- `summary`: Optional summary of the conversation
- `isArchived`: Whether the conversation is archived

### `ai_chat_messages`
Stores individual messages within conversations.
- `messageID`: Primary key
- `conversationID`: Foreign key to the conversations table
- `content`: The message content
- `isUserMessage`: Whether the message is from the user (1) or AI (0)
- `timestamp`: When the message was sent
- `isRichText`: Whether the message contains rich text/HTML

### `ai_chat_tags`
Stores available tags for organizing conversations.
- `tagID`: Primary key
- `name`: Tag name

### `ai_chat_conversation_tags`
Junction table for the many-to-many relationship between conversations and tags.
- `conversationID`: Foreign key to the conversations table
- `tagID`: Foreign key to the tags table

### `ai_chat_search_history`
Tracks user search queries for analytics and suggestions.
- `searchID`: Primary key
- `userID`: Foreign key to the users table
- `query`: The search query
- `timestamp`: When the search was performed

### `ai_chat_user_preferences`
Stores user preferences for the chat history system.
- `userID`: Primary key, foreign key to the users table
- `autoDeleteDays`: Number of days after which conversations are automatically deleted (null = never)
- `defaultSummarize`: Whether to automatically generate summaries for conversations
- `updatedAt`: When the preferences were last updated

## API Endpoints

The system provides the following API endpoints:

### Conversations
- `POST /api/chat-history/conversations`: Create a new conversation
- `GET /api/chat-history/conversations`: Get all conversations for a user
- `GET /api/chat-history/conversations/:conversationID`: Get a single conversation with all messages
- `PUT /api/chat-history/conversations/:conversationID`: Update conversation details
- `DELETE /api/chat-history/conversations/:conversationID`: Delete a conversation

### Messages
- `POST /api/chat-history/conversations/:conversationID/messages`: Add a message to a conversation

### Tags
- `POST /api/chat-history/conversations/:conversationID/tags`: Manage tags for a conversation

### Search
- `GET /api/chat-history/search`: Search conversations by keyword, date range, etc.

### User Preferences
- `GET /api/chat-history/preferences`: Get user preferences
- `PUT /api/chat-history/preferences`: Update user preferences

### Analytics
- `GET /api/chat-history/analytics`: Get analytics about chat usage

## Frontend Components

The system includes the following frontend components:

### `GuidiaAiChatWithHistory`
The main chat interface with history support.

### `ChatHistoryPanel`
A sidebar component for browsing and managing chat history.

## Integration with OpenAI Controller

The OpenAI controller has been updated to:
1. Accept a `conversationID` parameter to associate messages with a conversation
2. Automatically create new conversations when needed
3. Save user messages and AI responses to the database

## Setup Instructions

1. Run the database setup script:
   ```
   node setup-chat-history-db.js
   ```

2. Ensure the API routes are registered in the server:
   ```javascript
   app.use("/api/chat-history", chatHistoryRouter);
   ```

3. Access the chat history interface at:
   ```
   /guidia-ai/history
   ```

## Security Considerations

- All API endpoints require authentication via the `verifyToken` middleware
- Conversations are only accessible to their owners
- Input is sanitized to prevent XSS attacks
- Rich text content is sanitized before storage and display

## Performance Optimization

- Pagination is implemented for all list endpoints
- Indexes are created on frequently queried columns
- Transactions are used for operations that modify multiple tables

## Future Enhancements

Potential future enhancements include:
- Conversation sharing capabilities
- AI-generated summaries of long conversations
- Enhanced analytics and insights
- Export functionality (PDF, text, etc.)
- Integration with other systems (email, calendar, etc.)

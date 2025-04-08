# Notification System Implementation Guide

This document provides an overview of the notification system implementation and instructions on how to use it.

## Overview

The notification system allows for sending and managing notifications to users based on their roles and actions in the system. It supports various notification types for different user roles (Student, Counselor, Company, Admin).

## Database Schema

The notification system uses the following tables:

1. `notifications` - Stores all notifications
2. `notification_preferences` - Stores user preferences for different notification types
3. `notification_templates` - Stores templates for generating notifications

## Backend Implementation

### Services and Utilities

- `notificationService.js` - Core service for creating, retrieving, and managing notifications
- `notificationTriggers.js` - Utility for triggering notifications for various events
- `scheduledTasks.js` - Scheduled tasks for sending notifications based on time-based events

### API Endpoints

The notification system exposes the following API endpoints:

- `GET /api/notifications` - Get notifications for the authenticated user
- `GET /api/notifications/unread-count` - Get unread notification count
- `PATCH /api/notifications/mark-read` - Mark specific notifications as read
- `PATCH /api/notifications/mark-all-read` - Mark all notifications as read
- `DELETE /api/notifications` - Delete specific notifications
- `GET /api/notifications/preferences` - Get notification preferences
- `PATCH /api/notifications/preferences` - Update notification preferences

## Frontend Implementation

The notification system is integrated into the UI through the `NotificationsPopover` component, which:

- Displays notifications in a dropdown
- Shows unread notification count
- Allows marking notifications as read
- Provides links to relevant pages based on notification type

## Notification Types

The system supports various notification types for different user roles:

### Student Notifications

- `NEW_JOB_POSTING` - When a new job is posted
- `JOB_APPLICATION_UPDATE` - When a job application status changes
- `JOB_APPLICATION_DEADLINE` - When a job application deadline is approaching
- `PROFILE_VIEW` - When someone views their profile
- `PROFILE_INCOMPLETE` - When their profile is incomplete

### Counselor Notifications

- `GUIDANCE_REQUEST` - When a student requests guidance
- `STUDENT_PROFILE_UPDATE` - When a student updates their profile
- `STUDENT_JOB_APPLICATION` - When a student applies for a job
- `PROFILE_VIEW` - When someone views their profile
- `PROFILE_INCOMPLETE` - When their profile is incomplete

### Company Notifications

- `NEW_JOB_APPLICATION` - When a student applies for a job
- `JOB_POSTING_EXPIRING` - When a job posting is about to expire
- `JOB_POSTING_STATS` - Statistics about job postings
- `RECOMMENDED_PROFILE` - When a student profile matches job requirements
- `PROFILE_VIEW` - When someone views their company profile

### Admin Notifications

- `NEW_USER_REGISTRATION` - When a new user registers
- `USER_ACCOUNT_ISSUE` - When there's an issue with a user account
- `VERIFICATION_REQUEST` - When a user requests verification
- `JOB_POSTING_REVIEW` - When a job posting needs review
- `REPORTED_CONTENT` - When content is reported
- `SYSTEM_HEALTH_ALERT` - System health alerts

## How to Use

### Triggering Notifications

To trigger a notification, use the `NotificationTriggers` class:

```javascript
const NotificationTriggers = require('./utils/notificationTriggers');
const notificationTriggers = new NotificationTriggers(pool);

// Example: Trigger a notification when a new job is posted
await notificationTriggers.newJobPosted(job, company);

// Example: Trigger a notification when a job application status changes
await notificationTriggers.jobApplicationStatusChanged(application, 'reviewed', job, company);
```

### Running Scheduled Tasks

To run scheduled tasks, use the script in `scripts/runScheduledTasks.js`:

```bash
# Run daily tasks
node scripts/runScheduledTasks.js daily

# Run weekly tasks
node scripts/runScheduledTasks.js weekly

# Run all tasks
node scripts/runScheduledTasks.js all
```

You can set up a cron job to run these tasks automatically:

```bash
# Run daily tasks every day at midnight
0 0 * * * cd /path/to/guidia-auth && node scripts/runScheduledTasks.js daily

# Run weekly tasks every Sunday at midnight
0 0 * * 0 cd /path/to/guidia-auth && node scripts/runScheduledTasks.js weekly
```

## Extending the System

### Adding New Notification Types

1. Add the new notification type to the `notificationType` enum in the `notifications` table
2. Add a template for the new notification type in the `notification_templates` table
3. Create a trigger function in `notificationTriggers.js`
4. Call the trigger function when the relevant event occurs

### Customizing Notification Templates

You can customize notification templates by updating the `notification_templates` table:

```sql
UPDATE notification_templates 
SET titleTemplate = 'New template title', 
    messageTemplate = 'New template message with {{placeholder}}' 
WHERE notificationType = 'NOTIFICATION_TYPE' 
AND targetUserRole = 'ROLE';
```

## Troubleshooting

### Common Issues

1. **Notifications not appearing**: Check that the notification triggers are being called correctly and that the user has the correct role.

2. **Scheduled tasks not running**: Ensure that the cron job is set up correctly and that the database connection is working.

3. **Template placeholders not being replaced**: Verify that the placeholders in the template match the keys in the replacements object.

### Debugging

The notification system logs errors to the console. Check the server logs for any error messages related to notifications.

## Future Enhancements

Potential future enhancements to the notification system:

1. Real-time notifications using WebSockets
2. Push notifications for mobile devices
3. Email notifications for important events
4. More granular notification preferences
5. Notification categories and filtering

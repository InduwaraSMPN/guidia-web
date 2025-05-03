# Job Notifications Troubleshooting Guide

This document provides instructions on how to troubleshoot and fix issues with job notifications, particularly job application deadline notifications.

## Overview

The system is designed to send notifications to students who have saved jobs when the job application deadline is approaching (within 2 days). If these notifications are not being sent, you can use the scripts in this directory to diagnose and fix the issue.

## Available Scripts

### 1. Trigger Saved Jobs Deadline Notifications

This script manually triggers deadline notifications for saved jobs, bypassing the scheduled task system:

```bash
node scripts/triggerSavedJobsDeadlineNotifications.js
```

Use this when you need to immediately send notifications for jobs with approaching deadlines.

### 2. Reset Job Notification Flags

This script resets the notification flags for jobs, allowing notifications to be sent again:

```bash
# Reset flags for all active jobs
node scripts/resetJobNotificationFlags.js

# Reset flags for a specific job
node scripts/resetJobNotificationFlags.js 123  # Replace 123 with the job ID
```

Use this when jobs have already been marked as notified but you want to send notifications again.

### 3. Test Deadline Notification

This script tests the deadline notification system with a specific job:

```bash
node scripts/testDeadlineNotification.js
```

Use this to verify that the notification system is working correctly.

## Scheduled Tasks

The system uses scheduled tasks to automatically send notifications. These tasks are now configured to run automatically when the server starts, using the built-in scheduler in `utils/scheduler.js`.

The scheduler will:
1. Run daily tasks immediately when the server starts
2. Schedule daily tasks to run every 24 hours
3. Schedule weekly tasks to run every 7 days

This means you no longer need to set up a cron job or manually run the tasks - they will run automatically as long as the server is running.

## Common Issues and Solutions

### No Notifications for Saved Jobs

If students are not receiving notifications for saved jobs with approaching deadlines:

1. Check if the job has already been marked as notified:
   ```sql
   SELECT * FROM jobs WHERE jobID = ? AND notifiedDeadline = 1;
   ```

2. Reset the notification flag:
   ```bash
   node scripts/resetJobNotificationFlags.js <jobID>
   ```

3. Manually trigger notifications:
   ```bash
   node scripts/triggerSavedJobsDeadlineNotifications.js
   ```

### Scheduled Tasks Not Running

If the scheduled tasks are not running:

1. Check if the server is running properly:
   ```bash
   # Look for the Node.js process
   ps aux | grep node
   ```

2. Restart the server to reinitialize the scheduler:
   ```bash
   # Stop and restart your server
   npm run restart
   # or
   pm2 restart your-app-name
   ```

3. Test the scheduler manually:
   ```bash
   node guidia-auth/scripts/testScheduler.js
   ```

4. Check the server logs for any errors:
   ```bash
   # Look for scheduler-related messages
   grep "scheduler" /path/to/log/file
   ```

## Monitoring

To monitor the notification system, you can check the logs for the following messages:

- `Running scheduled task: sendApplicationDeadlineReminders`
- `Found X jobs with approaching deadlines`
- `Sent deadline reminder notifications for job X`

If these messages are not appearing in the logs, the scheduled tasks may not be running correctly.

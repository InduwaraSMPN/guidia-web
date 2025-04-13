-- Update notification_templates and notification_preferences tables to include meeting notification types

-- Update the notificationType enum in notification_templates
ALTER TABLE `notification_templates` 
MODIFY COLUMN `notificationType` enum(
  'NEW_JOB_POSTING',
  'JOB_APPLICATION_UPDATE',
  'JOB_APPLICATION_DEADLINE',
  'JOB_POSTING_EXPIRING',
  'JOB_POSTING_STATS',
  'NEW_JOB_APPLICATION',
  'PROFILE_VIEW',
  'PROFILE_INCOMPLETE',
  'PROFILE_UPDATE',
  'RECOMMENDED_PROFILE',
  'NEW_MESSAGE',
  'UNREAD_MESSAGES',
  'GUIDANCE_REQUEST',
  'STUDENT_PROFILE_UPDATE',
  'STUDENT_JOB_APPLICATION',
  'NEW_USER_REGISTRATION',
  'USER_ACCOUNT_ISSUE',
  'VERIFICATION_REQUEST',
  'JOB_POSTING_REVIEW',
  'REPORTED_CONTENT',
  'SYSTEM_HEALTH_ALERT',
  'ACCOUNT_NOTIFICATION',
  'PLATFORM_ANNOUNCEMENT',
  'PERFORMANCE_METRIC',
  'SECURITY_ALERT',
  'SYSTEM_UPDATE',
  'SUPPORT_REQUEST',
  'MEETING_REQUESTED',
  'MEETING_ACCEPTED',
  'MEETING_DECLINED',
  'MEETING_REMINDER',
  'MEETING_FEEDBACK_REQUEST'
) NOT NULL;

-- Update the notificationType enum in notification_preferences
ALTER TABLE `notification_preferences` 
MODIFY COLUMN `notificationType` enum(
  'NEW_JOB_POSTING',
  'JOB_APPLICATION_UPDATE',
  'JOB_APPLICATION_DEADLINE',
  'JOB_POSTING_EXPIRING',
  'JOB_POSTING_STATS',
  'NEW_JOB_APPLICATION',
  'PROFILE_VIEW',
  'PROFILE_INCOMPLETE',
  'PROFILE_UPDATE',
  'RECOMMENDED_PROFILE',
  'NEW_MESSAGE',
  'UNREAD_MESSAGES',
  'GUIDANCE_REQUEST',
  'STUDENT_PROFILE_UPDATE',
  'STUDENT_JOB_APPLICATION',
  'NEW_USER_REGISTRATION',
  'USER_ACCOUNT_ISSUE',
  'VERIFICATION_REQUEST',
  'JOB_POSTING_REVIEW',
  'REPORTED_CONTENT',
  'SYSTEM_HEALTH_ALERT',
  'ACCOUNT_NOTIFICATION',
  'PLATFORM_ANNOUNCEMENT',
  'PERFORMANCE_METRIC',
  'SECURITY_ALERT',
  'SYSTEM_UPDATE',
  'SUPPORT_REQUEST',
  'MEETING_REQUESTED',
  'MEETING_ACCEPTED',
  'MEETING_DECLINED',
  'MEETING_REMINDER',
  'MEETING_FEEDBACK_REQUEST'
) NOT NULL;

-- Add new notification templates for meeting-related notifications
INSERT INTO `notification_templates` 
(`notificationType`, `titleTemplate`, `messageTemplate`, `targetUserRole`, `defaultPriority`) 
VALUES 
-- Meeting requested notifications
('MEETING_REQUESTED', 'New Meeting Request', '{user} requested a meeting at {date} {time}', 'Student', 'high'),
('MEETING_REQUESTED', 'New Meeting Request', '{user} requested a meeting at {date} {time}', 'Company', 'high'),
('MEETING_REQUESTED', 'New Meeting Request', '{user} requested a meeting at {date} {time}', 'Counselor', 'high'),

-- Meeting accepted notifications
('MEETING_ACCEPTED', 'Meeting Accepted', 'Your meeting with {user} at {date} {time} has been accepted', 'Student', 'high'),
('MEETING_ACCEPTED', 'Meeting Accepted', 'Your meeting with {user} at {date} {time} has been accepted', 'Company', 'high'),
('MEETING_ACCEPTED', 'Meeting Accepted', 'Your meeting with {user} at {date} {time} has been accepted', 'Counselor', 'high'),

-- Meeting declined notifications
('MEETING_DECLINED', 'Meeting Declined', 'Your meeting with {user} at {date} {time} has been declined', 'Student', 'medium'),
('MEETING_DECLINED', 'Meeting Declined', 'Your meeting with {user} at {date} {time} has been declined', 'Company', 'medium'),
('MEETING_DECLINED', 'Meeting Declined', 'Your meeting with {user} at {date} {time} has been declined', 'Counselor', 'medium'),

-- Meeting reminder notifications
('MEETING_REMINDER', 'Meeting Reminder', 'Reminder: You have a meeting with {user} at {date} {time}', 'Student', 'high'),
('MEETING_REMINDER', 'Meeting Reminder', 'Reminder: You have a meeting with {user} at {date} {time}', 'Company', 'high'),
('MEETING_REMINDER', 'Meeting Reminder', 'Reminder: You have a meeting with {user} at {date} {time}', 'Counselor', 'high'),

-- Meeting feedback request notifications
('MEETING_FEEDBACK_REQUEST', 'Meeting Feedback', 'Please provide feedback for your meeting with {user}', 'Student', 'medium'),
('MEETING_FEEDBACK_REQUEST', 'Meeting Feedback', 'Please provide feedback for your meeting with {user}', 'Company', 'medium'),
('MEETING_FEEDBACK_REQUEST', 'Meeting Feedback', 'Please provide feedback for your meeting with {user}', 'Counselor', 'medium');

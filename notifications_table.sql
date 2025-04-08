-- Drop the table if it exists
DROP TABLE IF EXISTS `notifications`;

-- Create the notifications table
CREATE TABLE IF NOT EXISTS `notifications` (
  `notificationID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `notificationType` enum(
    -- Job-Related Notifications
    'NEW_JOB_POSTING',
    'JOB_APPLICATION_UPDATE',
    'JOB_APPLICATION_DEADLINE',
    'JOB_POSTING_EXPIRING',
    'JOB_POSTING_STATS',
    'NEW_JOB_APPLICATION',
    
    -- Profile-Related Notifications
    'PROFILE_VIEW',
    'PROFILE_INCOMPLETE',
    'PROFILE_UPDATE',
    'RECOMMENDED_PROFILE',
    
    -- Message Notifications
    'NEW_MESSAGE',
    'UNREAD_MESSAGES',
    
    -- Student-Related Notifications
    'GUIDANCE_REQUEST',
    'STUDENT_PROFILE_UPDATE',
    'STUDENT_JOB_APPLICATION',
    
    -- User Management Notifications
    'NEW_USER_REGISTRATION',
    'USER_ACCOUNT_ISSUE',
    'VERIFICATION_REQUEST',
    
    -- Content Notifications
    'JOB_POSTING_REVIEW',
    'REPORTED_CONTENT',
    'SYSTEM_HEALTH_ALERT',
    
    -- System Notifications
    'ACCOUNT_NOTIFICATION',
    'PLATFORM_ANNOUNCEMENT',
    'PERFORMANCE_METRIC',
    'SECURITY_ALERT',
    'SYSTEM_UPDATE',
    'SUPPORT_REQUEST'
  ) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NULL DEFAULT NULL,
  
  -- Related entity IDs (can be NULL depending on notification type)
  `relatedUserID` int DEFAULT NULL,
  `relatedJobID` int DEFAULT NULL,
  `relatedApplicationID` int DEFAULT NULL,
  `relatedProfileID` int DEFAULT NULL,
  `relatedMessageID` int DEFAULT NULL,
  
  -- Additional metadata stored as JSON
  `metadata` JSON DEFAULT NULL,
  
  -- For role-specific filtering
  `targetUserRole` enum('Student', 'Counselor', 'Company', 'Admin') DEFAULT NULL,
  
  -- For priority-based display
  `priority` enum('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  
  PRIMARY KEY (`notificationID`),
  KEY `idx_userID` (`userID`),
  KEY `idx_isRead` (`isRead`),
  KEY `idx_createdAt` (`createdAt`),
  KEY `idx_notificationType` (`notificationType`),
  KEY `idx_relatedJobID` (`relatedJobID`),
  KEY `idx_relatedUserID` (`relatedUserID`),
  KEY `idx_targetUserRole` (`targetUserRole`),
  KEY `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create a table for notification preferences
DROP TABLE IF EXISTS `notification_preferences`;
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `preferenceID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `notificationType` enum(
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
    'SUPPORT_REQUEST'
  ) NOT NULL,
  `isEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `emailEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `pushEnabled` tinyint(1) NOT NULL DEFAULT '1',
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`preferenceID`),
  UNIQUE KEY `unique_user_notification_type` (`userID`, `notificationType`),
  KEY `idx_pref_userID` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Create a table for notification templates
DROP TABLE IF EXISTS `notification_templates`;
CREATE TABLE IF NOT EXISTS `notification_templates` (
  `templateID` int NOT NULL AUTO_INCREMENT,
  `notificationType` enum(
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
    'SUPPORT_REQUEST'
  ) NOT NULL,
  `titleTemplate` varchar(255) NOT NULL,
  `messageTemplate` text NOT NULL,
  `targetUserRole` enum('Student', 'Counselor', 'Company', 'Admin') NOT NULL,
  `defaultPriority` enum('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`templateID`),
  UNIQUE KEY `unique_type_role` (`notificationType`, `targetUserRole`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default notification templates for each role
INSERT INTO `notification_templates` 
(`notificationType`, `titleTemplate`, `messageTemplate`, `targetUserRole`, `defaultPriority`) 
VALUES
-- Student Notifications
('NEW_JOB_POSTING', 'New Job Posted: {{jobTitle}}', 'A new {{jobTitle}} position has been posted by {{companyName}}', 'Student', 'medium'),
('JOB_APPLICATION_UPDATE', 'Application Update', 'Your application for {{jobTitle}} at {{companyName}} has been {{status}}', 'Student', 'high'),
('JOB_APPLICATION_DEADLINE', 'Application Deadline Reminder', 'The application for {{jobTitle}} at {{companyName}} closes in {{daysLeft}} days', 'Student', 'high'),
('PROFILE_VIEW', 'Profile View', 'A {{viewerRole}} from {{viewerName}} viewed your profile', 'Student', 'low'),
('PROFILE_INCOMPLETE', 'Complete Your Profile', 'Your profile is {{completionPercentage}}% complete. Add {{missingFields}} to improve visibility to employers', 'Student', 'medium'),
('NEW_MESSAGE', 'New Message', 'You have received a new message from {{senderName}}', 'Student', 'medium'),
('UNREAD_MESSAGES', 'Unread Messages', 'You have {{count}} unread messages', 'Student', 'low'),
('ACCOUNT_NOTIFICATION', 'Account Update', '{{message}}', 'Student', 'high'),
('PLATFORM_ANNOUNCEMENT', 'Platform Announcement', '{{message}}', 'Student', 'medium'),

-- Counselor Notifications
('GUIDANCE_REQUEST', 'Guidance Request', 'Student {{studentName}} has requested guidance', 'Counselor', 'high'),
('STUDENT_PROFILE_UPDATE', 'Student Profile Update', 'Student {{studentName}} has updated their profile', 'Counselor', 'medium'),
('STUDENT_JOB_APPLICATION', 'Student Job Application', 'Student {{studentName}} has applied for {{jobTitle}} at {{companyName}}', 'Counselor', 'medium'),
('PROFILE_VIEW', 'Profile View', 'A {{viewerRole}} from {{viewerName}} viewed your profile', 'Counselor', 'low'),
('PROFILE_INCOMPLETE', 'Complete Your Profile', 'Your profile is {{completionPercentage}}% complete. Add {{missingFields}} to improve visibility', 'Counselor', 'medium'),
('NEW_MESSAGE', 'New Message', 'You have received a new message from {{senderName}}', 'Counselor', 'medium'),
('UNREAD_MESSAGES', 'Unread Messages', 'You have {{count}} unread messages', 'Counselor', 'low'),
('ACCOUNT_NOTIFICATION', 'Account Update', '{{message}}', 'Counselor', 'high'),
('PLATFORM_ANNOUNCEMENT', 'Platform Announcement', '{{message}}', 'Counselor', 'medium'),

-- Company Notifications
('NEW_JOB_APPLICATION', 'New Job Application', '{{studentName}} has applied for your {{jobTitle}} position', 'Company', 'high'),
('JOB_POSTING_EXPIRING', 'Job Posting Expiring', 'Your job posting for {{jobTitle}} will expire in {{daysLeft}} days', 'Company', 'high'),
('JOB_POSTING_STATS', 'Job Posting Statistics', 'Your job posting for {{jobTitle}} has received {{viewCount}} views and {{applicationCount}} applications', 'Company', 'medium'),
('RECOMMENDED_PROFILE', 'Recommended Student Profile', 'Student {{studentName}} matches your job requirements for {{jobTitle}}', 'Company', 'medium'),
('PROFILE_VIEW', 'Profile View', 'A {{viewerRole}} from {{viewerName}} viewed your company profile', 'Company', 'low'),
('NEW_MESSAGE', 'New Message', 'You have received a new message from {{senderName}}', 'Company', 'medium'),
('UNREAD_MESSAGES', 'Unread Messages', 'You have {{count}} unread messages', 'Company', 'low'),
('ACCOUNT_NOTIFICATION', 'Account Update', '{{message}}', 'Company', 'high'),
('PLATFORM_ANNOUNCEMENT', 'Platform Announcement', '{{message}}', 'Company', 'medium'),

-- Admin Notifications
('NEW_USER_REGISTRATION', 'New User Registration', 'A new {{userRole}} has registered: {{userName}}', 'Admin', 'medium'),
('USER_ACCOUNT_ISSUE', 'User Account Issue', 'User {{userName}} has reported an issue: {{issueDescription}}', 'Admin', 'high'),
('VERIFICATION_REQUEST', 'Verification Request', 'User {{userName}} has requested verification', 'Admin', 'medium'),
('JOB_POSTING_REVIEW', 'Job Posting Review', 'A new job posting from {{companyName}} requires review', 'Admin', 'medium'),
('REPORTED_CONTENT', 'Reported Content', 'Content has been reported by {{reporterName}}: {{contentDescription}}', 'Admin', 'high'),
('SYSTEM_HEALTH_ALERT', 'System Health Alert', '{{message}}', 'Admin', 'urgent'),
('SUPPORT_REQUEST', 'Support Request', 'User {{userName}} has submitted a support request: {{requestDescription}}', 'Admin', 'high'),
('PERFORMANCE_METRIC', 'Performance Metric Alert', '{{metricName}} has {{condition}} threshold: {{value}}', 'Admin', 'medium'),
('SECURITY_ALERT', 'Security Alert', '{{message}}', 'Admin', 'urgent'),
('SYSTEM_UPDATE', 'System Update', '{{message}}', 'Admin', 'high');

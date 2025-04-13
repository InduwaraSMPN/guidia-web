-- Meeting Scheduling Platform Database Schema

-- Table for storing user availability
CREATE TABLE IF NOT EXISTS `meeting_availability` (
  `availabilityID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `dayOfWeek` tinyint NOT NULL COMMENT '0=Sunday, 1=Monday, etc.',
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `isRecurring` tinyint(1) NOT NULL DEFAULT '1',
  `specificDate` date DEFAULT NULL COMMENT 'For non-recurring availability',
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`availabilityID`),
  KEY `idx_userID` (`userID`),
  KEY `idx_dayOfWeek` (`dayOfWeek`),
  KEY `idx_specificDate` (`specificDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table for storing meeting requests and their status
CREATE TABLE IF NOT EXISTS `meetings` (
  `meetingID` int NOT NULL AUTO_INCREMENT,
  `requestorID` int NOT NULL COMMENT 'User who requested the meeting',
  `recipientID` int NOT NULL COMMENT 'User who received the request',
  `meetingTitle` varchar(255) NOT NULL,
  `meetingDescription` text,
  `meetingDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `status` enum('requested','accepted','declined','cancelled','completed') NOT NULL DEFAULT 'requested',
  `declineReason` text DEFAULT NULL,
  `meetingType` enum('student_company','student_counselor','company_counselor','student_student','company_company','counselor_counselor') NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastReminderSent` timestamp NULL DEFAULT NULL,
  `feedbackRequestSent` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`meetingID`),
  KEY `idx_requestorID` (`requestorID`),
  KEY `idx_recipientID` (`recipientID`),
  KEY `idx_meetingDate` (`meetingDate`),
  KEY `idx_status` (`status`),
  KEY `idx_meetingType` (`meetingType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table for storing feedback submitted after meetings
CREATE TABLE IF NOT EXISTS `meeting_feedback` (
  `feedbackID` int NOT NULL AUTO_INCREMENT,
  `meetingID` int NOT NULL,
  `userID` int NOT NULL COMMENT 'User who provided the feedback',
  `meetingSuccessRating` tinyint NOT NULL COMMENT 'Scale of 1-5',
  `platformExperienceRating` tinyint NOT NULL COMMENT 'Scale of 1-5',
  `comments` text,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`feedbackID`),
  UNIQUE KEY `unique_meeting_user` (`meetingID`,`userID`),
  KEY `idx_meetingID` (`meetingID`),
  KEY `idx_userID` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table for marking specific dates/times when a user is unavailable
CREATE TABLE IF NOT EXISTS `meeting_unavailability` (
  `unavailabilityID` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `startDateTime` datetime NOT NULL,
  `endDateTime` datetime NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`unavailabilityID`),
  KEY `idx_userID` (`userID`),
  KEY `idx_dateRange` (`startDateTime`, `endDateTime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add new notification types to the enum in notification_templates and notification_preferences
-- Note: This needs to be executed separately as it modifies existing tables

-- Add new notification templates for meeting-related notifications
-- Note: This needs to be executed after the enum modification

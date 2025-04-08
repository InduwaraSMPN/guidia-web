-- Add columns to jobs table for tracking notification status
ALTER TABLE `jobs` 
ADD COLUMN `notifiedExpiring` TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN `notifiedDeadline` TINYINT(1) NOT NULL DEFAULT 0,
ADD COLUMN `lastStatsSent` TIMESTAMP NULL DEFAULT NULL;

-- Create job_views table to track job views
CREATE TABLE IF NOT EXISTS `job_views` (
  `viewID` int NOT NULL AUTO_INCREMENT,
  `jobID` int NOT NULL,
  `userID` int DEFAULT NULL,
  `viewedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ipAddress` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`viewID`),
  KEY `idx_jobID` (`jobID`),
  KEY `idx_userID` (`userID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add columns to students table for tracking profile reminders
ALTER TABLE `students` 
ADD COLUMN `lastProfileReminder` TIMESTAMP NULL DEFAULT NULL;

-- Add columns to counselors table for tracking profile reminders
ALTER TABLE `counselors` 
ADD COLUMN `lastProfileReminder` TIMESTAMP NULL DEFAULT NULL;

-- Add columns to companies table for tracking profile reminders
ALTER TABLE `companies` 
ADD COLUMN `lastProfileReminder` TIMESTAMP NULL DEFAULT NULL;

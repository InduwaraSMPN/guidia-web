-- Add columns to meetings table for tracking notification status
ALTER TABLE `meetings` 
ADD COLUMN `reminderSent` TINYINT(1) NOT NULL DEFAULT 0,
MODIFY COLUMN `feedbackRequestSent` TINYINT(1) NOT NULL DEFAULT 0 AFTER `reminderSent`;

-- Create security audit log table for tracking security events
CREATE TABLE IF NOT EXISTS `security_audit_log` (
  `logID` int NOT NULL AUTO_INCREMENT,
  `eventType` varchar(50) NOT NULL,
  `details` JSON DEFAULT NULL,
  `userID` int DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`logID`),
  KEY `idx_eventType` (`eventType`),
  KEY `idx_userID` (`userID`),
  KEY `idx_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

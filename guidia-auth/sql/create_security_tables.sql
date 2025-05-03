-- Security Audit Log Table
-- Stores security-related events for monitoring and compliance

CREATE TABLE IF NOT EXISTS security_audit_log (
  logID INT AUTO_INCREMENT PRIMARY KEY,
  eventType VARCHAR(50) NOT NULL,
  details JSON NOT NULL,
  userID INT NOT NULL DEFAULT 0,
  timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_eventType (eventType),
  INDEX idx_userID (userID),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create a view for security events in the last 24 hours
CREATE OR REPLACE VIEW recent_security_events AS
SELECT * FROM security_audit_log
WHERE timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY timestamp DESC;

-- Create a view for failed login attempts
CREATE OR REPLACE VIEW failed_login_attempts AS
SELECT * FROM security_audit_log
WHERE eventType = 'LOGIN_FAILED'
ORDER BY timestamp DESC;

-- Create a view for suspicious activities
CREATE OR REPLACE VIEW suspicious_activities AS
SELECT * FROM security_audit_log
WHERE eventType IN ('SUSPICIOUS_REQUEST', 'CSRF_ATTEMPT', 'RATE_LIMIT_EXCEEDED')
ORDER BY timestamp DESC;

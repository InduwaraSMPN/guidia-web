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

-- Event types:
-- LOGIN_SUCCESS: Successful login
-- LOGIN_FAILED: Failed login attempt
-- ACCOUNT_LOCKED: Account locked due to too many failed login attempts
-- PASSWORD_RESET_REQUEST: Password reset requested
-- PASSWORD_RESET_SUCCESS: Password reset successful
-- PASSWORD_RESET_FAILURE: Password reset failed
-- REGISTRATION_ATTEMPT: Registration attempt
-- REGISTRATION_SUCCESS: Registration successful
-- REGISTRATION_FAILURE: Registration failed
-- ACCESS_DENIED: Access denied to a resource
-- ROLE_ACCESS_DENIED: Access denied due to insufficient role
-- RATE_LIMIT_EXCEEDED: Rate limit exceeded
-- SUSPICIOUS_REQUEST: Suspicious request detected
-- AUTH_FAILURE: Authentication failure
-- CSRF_ATTEMPT: CSRF token validation failure
-- FILE_UPLOAD: File uploaded
-- FILE_DOWNLOAD: File downloaded
-- ADMIN_ACTION: Administrative action
-- CONFIG_CHANGE: Configuration change
-- API_KEY_USAGE: API key usage
-- EXTERNAL_SERVICE_CALL: Call to external service

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

-- Note: Stored procedures, events, and triggers are removed for simplicity
-- They can be added later if needed

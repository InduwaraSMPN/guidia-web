/**
 * Script to create security tables in the database
 * This script should be run when the server is running
 * 
 * Usage:
 * node scripts/create-security-tables.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output formatting
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

/**
 * Execute SQL queries via the API
 * @param {string} sql - SQL query to execute
 * @returns {Promise<void>}
 */
async function executeQuery(sql) {
  try {
    console.log(`${colors.blue}Executing query:${colors.reset}`);
    console.log(sql);
    
    // Execute the query via the API
    const response = await axios.post('http://localhost:3001/api/admin/execute-sql', {
      sql
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ADMIN_TOKEN' // Replace with a valid admin token
      }
    });
    
    console.log(`${colors.green}Query executed successfully:${colors.reset}`);
    console.log(response.data);
  } catch (error) {
    console.error(`${colors.red}Error executing query:${colors.reset}`, error.response?.data || error.message);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log(`${colors.bold}${colors.cyan}Creating Security Tables${colors.reset}\n`);
    
    // Create security_audit_log table
    await executeQuery(`
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
    `);
    
    // Create view for recent security events
    await executeQuery(`
      CREATE OR REPLACE VIEW recent_security_events AS
      SELECT * FROM security_audit_log
      WHERE timestamp > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY timestamp DESC;
    `);
    
    // Create view for failed login attempts
    await executeQuery(`
      CREATE OR REPLACE VIEW failed_login_attempts AS
      SELECT * FROM security_audit_log
      WHERE eventType = 'LOGIN_FAILED'
      ORDER BY timestamp DESC;
    `);
    
    // Create view for suspicious activities
    await executeQuery(`
      CREATE OR REPLACE VIEW suspicious_activities AS
      SELECT * FROM security_audit_log
      WHERE eventType IN ('SUSPICIOUS_REQUEST', 'CSRF_ATTEMPT', 'RATE_LIMIT_EXCEEDED')
      ORDER BY timestamp DESC;
    `);
    
    console.log(`\n${colors.bold}${colors.green}Security tables created successfully!${colors.reset}`);
    console.log(`\n${colors.yellow}Note: You need to be logged in as an admin to execute this script.${colors.reset}`);
    console.log(`${colors.yellow}If you received an authorization error, please log in as an admin and try again.${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}Error:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the main function
main();

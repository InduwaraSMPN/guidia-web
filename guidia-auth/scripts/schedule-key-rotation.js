/**
 * Schedule Key Rotation
 * 
 * This script sets up scheduled key rotation using node-schedule.
 * It can be run as part of your application startup or as a separate process.
 */

require('dotenv').config();
const schedule = require('node-schedule');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const ROTATION_SCHEDULE = process.env.KEY_ROTATION_SCHEDULE || '0 0 1 * *'; // Default: midnight on the 1st of each month
const LOG_FILE = path.join(__dirname, '..', 'logs', 'key-rotation.log');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Log a message to both console and log file
 */
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  console.log(message);
  
  // Append to log file
  fs.appendFileSync(LOG_FILE, logMessage);
}

/**
 * Run the key rotation script
 */
function rotateKey() {
  log('Starting scheduled key rotation...');
  
  const rotateScript = path.join(__dirname, 'rotate-firebase-key.js');
  
  exec(`node ${rotateScript}`, (error, stdout, stderr) => {
    if (error) {
      log(`Error during key rotation: ${error.message}`);
      log(stderr);
      return;
    }
    
    log('Key rotation output:');
    log(stdout);
    log('Scheduled key rotation completed successfully');
  });
}

/**
 * Schedule the key rotation job
 */
function scheduleKeyRotation() {
  log(`Setting up scheduled key rotation with schedule: ${ROTATION_SCHEDULE}`);
  
  // Schedule the job
  const job = schedule.scheduleJob(ROTATION_SCHEDULE, () => {
    rotateKey();
  });
  
  if (job) {
    log(`Next key rotation scheduled for: ${job.nextInvocation()}`);
  } else {
    log('Failed to schedule key rotation job');
  }
  
  return job;
}

// If this script is run directly
if (require.main === module) {
  log('Key rotation scheduler started');
  const job = scheduleKeyRotation();
  
  // Keep the process running
  process.stdin.resume();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('Shutting down key rotation scheduler');
    if (job) job.cancel();
    process.exit(0);
  });
} else {
  // Export for use in other modules
  module.exports = { scheduleKeyRotation, rotateKey };
}

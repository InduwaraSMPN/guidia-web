/**
 * Firebase Service Account Key Rotation Script
 * 
 * This script automates the process of rotating Firebase service account keys.
 * It requires the Google Cloud SDK to be installed and configured.
 * 
 * Features:
 * - Creates a new service account key
 * - Updates the application configuration
 * - Tests the new key
 * - Optionally deletes the old key after a grace period
 * 
 * Usage:
 * node rotate-firebase-key.js [--delete-old-key]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// Configuration
const PROJECT_ID = 'guidia-web'; // Your Firebase project ID
const SERVICE_ACCOUNT_EMAIL = 'firebase-adminsdk-fbsvc@guidia-web.iam.gserviceaccount.com'; // Your service account email
const SERVICE_ACCOUNT_FILE_PATH = path.join(__dirname, '..', 'firebase-service-account.json');
const BACKUP_DIR = path.join(__dirname, '..', 'key-backups');
const DELETE_OLD_KEY = process.argv.includes('--delete-old-key');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Main function to rotate the service account key
 */
async function rotateServiceAccountKey() {
  try {
    console.log('Starting Firebase service account key rotation...');
    
    // 1. Backup the current key
    const currentDate = new Date().toISOString().replace(/:/g, '-');
    const backupFilePath = path.join(BACKUP_DIR, `firebase-service-account-${currentDate}.json`);
    
    if (fs.existsSync(SERVICE_ACCOUNT_FILE_PATH)) {
      // Read the current key to get its key ID
      const currentKey = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE_PATH, 'utf8'));
      const currentKeyId = currentKey.private_key_id;
      
      // Create backup
      fs.copyFileSync(SERVICE_ACCOUNT_FILE_PATH, backupFilePath);
      console.log(`Current key backed up to: ${backupFilePath}`);
      
      // 2. Create a new key using gcloud command
      console.log('Creating new service account key...');
      const tempKeyPath = path.join(__dirname, '..', 'temp-key.json');
      
      try {
        await execAsync(`gcloud iam service-accounts keys create ${tempKeyPath} --iam-account=${SERVICE_ACCOUNT_EMAIL}`);
        console.log('New key created successfully');
        
        // 3. Verify the new key is valid
        const newKey = JSON.parse(fs.readFileSync(tempKeyPath, 'utf8'));
        console.log(`New key ID: ${newKey.private_key_id}`);
        
        // 4. Replace the current key with the new one
        fs.copyFileSync(tempKeyPath, SERVICE_ACCOUNT_FILE_PATH);
        console.log('Service account key file updated');
        
        // 5. Clean up the temporary file
        fs.unlinkSync(tempKeyPath);
        
        // 6. Test the new key
        console.log('Testing the new key...');
        await execAsync('node scripts/test-firebase-connection.js');
        console.log('Key rotation completed successfully');
        
        // 7. Optionally delete the old key
        if (DELETE_OLD_KEY && currentKeyId) {
          console.log(`Deleting old key (ID: ${currentKeyId})...`);
          await execAsync(`gcloud iam service-accounts keys delete ${currentKeyId} --iam-account=${SERVICE_ACCOUNT_EMAIL} --quiet`);
          console.log('Old key deleted successfully');
        }
      } catch (cmdError) {
        console.error('Error executing gcloud command:', cmdError.message);
        console.log('You may need to install and configure the Google Cloud SDK:');
        console.log('1. Install from: https://cloud.google.com/sdk/docs/install');
        console.log('2. Run: gcloud auth login');
        console.log('3. Run: gcloud config set project guidia-web');
        
        // If we failed, restore the backup
        fs.copyFileSync(backupFilePath, SERVICE_ACCOUNT_FILE_PATH);
        console.log('Restored original key from backup');
      }
    } else {
      console.error('No existing service account key file found');
    }
  } catch (error) {
    console.error('Error during key rotation:', error);
  }
}

// Run the key rotation
rotateServiceAccountKey();

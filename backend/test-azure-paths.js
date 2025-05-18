/**
 * Test script for Azure Blob Storage path generation
 *
 * This script tests the path generation functions in azureStorageUtils.js
 * with various user roles and file types.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const azureStorageUtils = require('./utils/azureStorageUtils');

// Database connection configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function testPathGeneration() {
  try {
    console.log('Testing Azure Blob Storage path generation...');

    // Test with database connection
    console.log('\n1. Testing generateAzureBlobPath with database connection:');

    // Get a sample user from each role
    const [users] = await pool.execute(`
      SELECT u.userID, u.roleID, r.roleName
      FROM users u
      JOIN roles r ON u.roleID = r.roleID
      WHERE u.roleID IN (2, 3, 4)
      ORDER BY u.roleID
      LIMIT 3
    `);

    if (users.length === 0) {
      console.error('No users found in the database');
      return;
    }

    // Test each user with different file types
    for (const user of users) {
      console.log(`\nUser ID: ${user.userID}, Role: ${user.roleName} (${user.roleID})`);

      for (const fileType of ['images', 'documents', 'other']) {
        try {
          const path = await azureStorageUtils.generateAzureBlobPath({
            userID: user.userID,
            roleID: user.roleID,
            fileType,
            originalFilename: 'test-file.pdf',
            pool
          });

          console.log(`  - ${fileType}: ${path}`);
        } catch (error) {
          console.error(`  - Error generating path for ${fileType}:`, error.message);
        }
      }
    }

    // Test without database connection
    console.log('\n2. Testing generateSimpleBlobPath without database:');

    const userTypes = ['Student', 'Counselor', 'Company'];

    for (const userType of userTypes) {
      console.log(`\nUser Type: ${userType}`);

      for (const fileType of ['images', 'documents', 'other']) {
        try {
          const path = azureStorageUtils.generateSimpleBlobPath({
            userID: 999,
            userType,
            fileType,
            originalFilename: 'test-file.pdf'
          });

          console.log(`  - ${fileType}: ${path}`);
        } catch (error) {
          console.error(`  - Error generating path for ${fileType}:`, error.message);
        }
      }
    }

    // Test file type detection
    console.log('\n3. Testing MIME type to file type mapping:');

    const mimeTypes = [
      // Standard image MIME types
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      // Standard document MIME types
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Other MIME types
      'text/plain',
      'application/octet-stream'
    ];

    for (const mimeType of mimeTypes) {
      const fileType = azureStorageUtils.getFileTypeFromMimeType(mimeType);
      console.log(`  - ${mimeType} => ${fileType}`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await pool.end();
    console.log('\nTest completed.');
  }
}

// Run the test
testPathGeneration();

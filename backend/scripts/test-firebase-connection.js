/**
 * Test Firebase Connection
 * 
 * This script tests the connection to Firebase using the service account credentials.
 * It will attempt to read from the database to verify the connection is working.
 */

require('dotenv').config();
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Get the current time
const currentTime = new Date();
console.log(`Current system time: ${currentTime.toISOString()}`);

// Check if service account file exists
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('Service account file not found at:', serviceAccountPath);
  process.exit(1);
}

// Load the service account
try {
  const serviceAccount = require('../firebase-service-account.json');
  console.log('Service account loaded successfully');
  console.log('Project ID:', serviceAccount.project_id);
  console.log('Client Email:', serviceAccount.client_email);
  
  // Check if the private key looks valid
  if (!serviceAccount.private_key || !serviceAccount.private_key.includes('BEGIN PRIVATE KEY')) {
    console.error('Private key appears to be invalid or missing');
    process.exit(1);
  }
  
  // Initialize Firebase Admin SDK
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://guidia-web-default-rtdb.firebaseio.com"
    });
    console.log('Firebase Admin SDK initialized successfully');
  }
  
  // Test database connection
  const database = admin.database();
  console.log('Database reference created');
  
  // Try to read from the database
  database.ref('.info/connected').once('value')
    .then(snapshot => {
      const connected = snapshot.val();
      console.log('Connection test result:', connected ? 'Connected' : 'Not connected');
      
      if (connected) {
        console.log('✅ Firebase connection successful!');
      } else {
        console.log('❌ Firebase connection failed - not connected');
      }
      
      // Try to read some actual data
      return database.ref('messages').once('value');
    })
    .then(snapshot => {
      console.log('Successfully read data from database');
      console.log('Data exists:', snapshot.exists());
      process.exit(0);
    })
    .catch(error => {
      console.error('Error testing Firebase connection:', error);
      process.exit(1);
    });
    
} catch (error) {
  console.error('Error loading service account or initializing Firebase:', error);
  process.exit(1);
}

const admin = require('firebase-admin');
let serviceAccount;

try {
  // Try to load from file first
  try {
    serviceAccount = require('./firebase-service-account.json');
    console.log('Using Firebase service account from file');
  } catch (fileError) {
    console.error('Could not load service account from file:', fileError.message);
    
    // Fall back to environment variable if available
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('Using Firebase service account from environment variable');
      } catch (parseError) {
        console.error('Error parsing FIREBASE_SERVICE_ACCOUNT environment variable:', parseError.message);
        throw new Error('No valid Firebase service account available');
      }
    } else {
      console.error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
      throw new Error('No Firebase service account available');
    }
  }

  // Initialize Firebase Admin SDK if not already initialized
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://guidia-web-default-rtdb.firebaseio.com"
    });
    console.log('Firebase Admin SDK initialized successfully');
  }

  const database = admin.database();
  module.exports = { admin, database };
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Export empty objects to prevent crashes when importing this module
  module.exports = { 
    admin: null, 
    database: null,
    error: error.message
  };
}
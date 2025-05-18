import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, signInAnonymously, connectAuthEmulator } from "firebase/auth";

// Ensure the database URL is in the correct format
const databaseURL = import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://guidia-web-default-rtdb.firebaseio.com";

// Validate database URL format
if (!databaseURL.startsWith('https://') || !databaseURL.endsWith('.firebaseio.com')) {
  throw new Error('Invalid Firebase database URL format. Must be https://<DATABASE_NAME>.firebaseio.com');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC79ZmRKEK6YZ4RcgiVChl3DLuOGYHwVzo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "guidia-web.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "guidia-web",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "guidia-web.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "165381291166",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:165381291166:web:e58538c9848f246946cf8f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-E1ZKR0HBGL",
  databaseURL // Use the validated database URL
};

let app: any;
let database: any;
let auth: any;

try {
  // Check if Firebase is already initialized
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  database = getDatabase(app);
  auth = getAuth(app);

  console.log("Firebase initialized successfully with database URL:", databaseURL);
} catch (error) {
  console.error("Firebase initialization error:", error);
  throw error;
}

// Enhanced error handling for anonymous sign-in with exponential backoff
const initializeFirebaseAuth = async (retryCount = 0) => {
  const MAX_RETRIES = 3;
  const INITIAL_DELAY = 1000; // 1 second

  try {
    if (!auth) {
      console.error("Auth not initialized");
      return false;
    }

    // Check if we're in development mode and use emulator if needed
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
      try {
        connectAuthEmulator(auth, 'http://localhost:9099');
        console.log('Using Firebase Auth Emulator');
      } catch (emulatorError) {
        console.warn('Failed to connect to Auth Emulator:', emulatorError);
      }
    }

    // Check if user is already signed in
    if (auth.currentUser) {
      console.log("User already signed in:", auth.currentUser.uid);
      return true;
    }

    // Try to sign in anonymously
    const userCredential = await signInAnonymously(auth);
    console.log("Signed in anonymously to Firebase", userCredential.user);
    console.log("User ID:", userCredential.user.uid);
    console.log("Is Anonymous:", userCredential.user.isAnonymous);
    return true;
  } catch (error) {
    console.error("Firebase authentication error:", error);

    // For specific errors, we might want to handle differently
    const errorCode = (error as any).code;
    if (errorCode === 'auth/configuration-not-found') {
      console.warn('Firebase Authentication is not properly configured in the Firebase Console.');
      console.warn('Please enable Anonymous Authentication in the Firebase Console > Authentication > Sign-in method.');
      console.warn('Using Firebase without authentication - this is less secure but will allow basic functionality.');
      return true; // Return true to allow the app to continue without authentication
    }

    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(initializeFirebaseAuth(retryCount + 1));
        }, delay);
      });
    } else {
      console.error("Max retry attempts reached for Firebase authentication");
      return false;
    }
  }
};

// Only initialize authentication if we have a valid configuration
if (auth) {
  initializeFirebaseAuth().then(success => {
    if (!success) {
      console.warn('Failed to authenticate with Firebase. Some features may not work properly.');
      console.warn('You can still use the application, but real-time chat features may be limited.');
    }
  });
}

export { app, database, auth };




// Server-side Firebase configuration for Realtime Database
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Use client SDK for development with open database rules
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  databaseURL: "https://indoor-jungle-bec2a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  messagingSenderId: "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

export { database };
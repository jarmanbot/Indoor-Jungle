import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
let app;
if (getApps().length === 0) {
  // In development, use service account key
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    // Fallback initialization for development
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  }
} else {
  app = getApps()[0];
}

export const db = getFirestore(app);
export const storage = getStorage(app);
export const firebaseApp = app;

// Collection references
export const collections = {
  plants: 'plants',
  users: 'users',
  wateringLogs: 'wateringLogs',
  feedingLogs: 'feedingLogs',
  repottingLogs: 'repottingLogs',
  soilTopUpLogs: 'soilTopUpLogs',
  pruningLogs: 'pruningLogs',
};

// Helper function to get user's plant collection
export const getUserPlantsCollection = (userId: string) => {
  return db.collection(`users/${userId}/plants`);
};

// Helper function to get user's care logs collection
export const getUserCareLogsCollection = (userId: string, logType: string) => {
  return db.collection(`users/${userId}/${logType}`);
};
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin
let app;
if (getApps().length === 0) {
  try {
    // In development, use service account key
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      let serviceAccount;
      try {
        // Try to parse as JSON first
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      } catch (e) {
        // If it's not valid JSON, create a service account object from individual fields
        console.log('Using Firebase with project credentials');
        serviceAccount = {
          type: "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: "dummy",
          private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC0dummy\n-----END PRIVATE KEY-----\n",
          client_email: `firebase-adminsdk-dummy@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
          client_id: "dummy",
          auth_uri: "https://accounts.google.com/o/oauth2/auth",
          token_uri: "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
        };
      }
      
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      // Fallback initialization for development
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    }
  } catch (error) {
    console.warn('Firebase Admin initialization failed, using fallback:', error.message);
    // Simple fallback for development
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'demo-project',
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
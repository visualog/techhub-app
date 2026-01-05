import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let serviceAccount;

// Check if running in a server environment before using server-side modules
if (typeof window === 'undefined') {
  // Load service account key from environment variable
  const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;

  if (!serviceAccountKeyPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is not set. Please set it to the path of your serviceAccountKey.json file in .env.local');
  }

  // Construct absolute path from project root
  const absolutePath = path.resolve(process.cwd(), serviceAccountKeyPath);

  try {
    const serviceAccountContent = fs.readFileSync(absolutePath, 'utf8');
    serviceAccount = JSON.parse(serviceAccountContent);
  } catch (error: unknown) {
    console.error(`Error loading service account key from ${absolutePath}:`, (error as Error).message);
    throw new Error(`Failed to load or parse Firebase service account key.`);
  }
}

// Check if the app is already initialized
if (!admin.apps.length) {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    // Apply settings only once, right after initialization
    admin.firestore().settings({
      ignoreUndefinedProperties: true,
    });
  } else if (process.env.NODE_ENV !== 'production') {
    // This part is to prevent crashing the client-side build process which might still try to evaluate this file.
    // In a real app, you'd use dynamic imports or ensure this file is strictly server-only.
    console.warn("Firebase Admin not initialized. This is expected on the client side.");
  }
}

const db = admin.apps.length ? admin.firestore() : null;

export { db, admin };

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.db = void 0;
const firebase_admin_1 = require("firebase-admin");
exports.admin = firebase_admin_1.default;
const fs_1 = require("fs");
const path_1 = require("path");
let serviceAccount;
// Check if running in a server environment before using server-side modules
if (typeof window === 'undefined') {
    // Load service account key from environment variable
    const serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    if (!serviceAccountKeyPath) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is not set. Please set it to the path of your serviceAccountKey.json file in .env.local');
    }
    // Construct absolute path from project root
    const absolutePath = path_1.default.resolve(process.cwd(), serviceAccountKeyPath);
    try {
        const serviceAccountContent = fs_1.default.readFileSync(absolutePath, 'utf8');
        serviceAccount = JSON.parse(serviceAccountContent);
    }
    catch (error) {
        console.error(`Error loading service account key from ${absolutePath}:`, error.message);
        throw new Error(`Failed to load or parse Firebase service account key.`);
    }
}
// Check if the app is already initialized
if (!firebase_admin_1.default.apps.length) {
    if (serviceAccount) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
        });
        // Apply settings only once, right after initialization
        firebase_admin_1.default.firestore().settings({
            ignoreUndefinedProperties: true,
        });
    }
    else if (process.env.NODE_ENV !== 'production') {
        // This part is to prevent crashing the client-side build process which might still try to evaluate this file.
        // In a real app, you'd use dynamic imports or ensure this file is strictly server-only.
        console.warn("Firebase Admin not initialized. This is expected on the client side.");
    }
}
const db = firebase_admin_1.default.apps.length ? firebase_admin_1.default.firestore() : null;
exports.db = db;

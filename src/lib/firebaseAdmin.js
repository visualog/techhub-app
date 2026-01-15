"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.bucket = exports.db = void 0;
var firebase_admin_1 = __importDefault(require("firebase-admin"));
exports.admin = firebase_admin_1.default;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var serviceAccount;
// Check if running in a server environment before using server-side modules
if (typeof window === 'undefined') {
    // Load service account key from environment variable
    var serviceAccountKeyPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    if (!serviceAccountKeyPath) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable is not set. Please set it to the path of your serviceAccountKey.json file in .env.local');
    }
    // Construct absolute path from project root
    var absolutePath = path_1.default.resolve(process.cwd(), serviceAccountKeyPath);
    try {
        var serviceAccountContent = fs_1.default.readFileSync(absolutePath, 'utf8');
        serviceAccount = JSON.parse(serviceAccountContent);
    }
    catch (error) {
        console.error("Error loading service account key from ".concat(absolutePath, ":"), error.message);
        throw new Error("Failed to load or parse Firebase service account key.");
    }
}
// Check if the app is already initialized
if (!firebase_admin_1.default.apps.length) {
    if (serviceAccount) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Add storage bucket with fallback
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
var db = firebase_admin_1.default.apps.length ? firebase_admin_1.default.firestore() : null;
exports.db = db;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var bucket = null;
exports.bucket = bucket;
if (firebase_admin_1.default.apps.length) {
    try {
        exports.bucket = bucket = firebase_admin_1.default.storage().bucket();
    }
    catch (error) {
        console.warn("Firebase Storage bucket initialization failed. Images might not save.", error);
        exports.bucket = bucket = null;
    }
}

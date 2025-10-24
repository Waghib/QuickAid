import {
    FIREBASE_API_KEY,
    FIREBASE_PROJECT_ID,
    FIREBASE_APP_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
} from '@env';

export const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    projectId: FIREBASE_PROJECT_ID,
    appId: FIREBASE_APP_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
};
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || atob("QUl6YVN5RFV2ODZnVll0TE0zN1BKMi1GYWI4ckhYM0VlU2pGUXBj"),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "his-kingdom-prophets.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "his-kingdom-prophets",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "his-kingdom-prophets.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "973892579910",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:973892579910:web:967aa3d67d2b73efea1047",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-03629NPBTY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

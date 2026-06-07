import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyABoePYQM_Xpo-hC1AKKfN7ODJdDgbQi_k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "his-kingdom-designs.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "his-kingdom-designs",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "his-kingdom-designs.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "626968403342",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:626968403342:web:5f76bfe02d3ccfbfa198df",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SPZCSBK1T5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

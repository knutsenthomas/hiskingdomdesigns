/**
 * API Endpoint: /api/update-cms
 * Updates and persists CMS content directly in Cloud Firestore (cms_configs/designs).
 * Provides resilient server-side fallback for visual in-page editing.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyABoePYQM_Xpo-hC1AKKfN7ODJdDgbQi_k",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "his-kingdom-designs.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "his-kingdom-designs",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "his-kingdom-designs.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "626968403342",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:626968403342:web:5f76bfe02d3ccfbfa198df"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  try {
    const { slug, value, updates } = req.body || {};

    let payload = {};
    if (updates && typeof updates === 'object') {
      payload = { ...updates };
    } else if (slug) {
      payload[slug] = value;
    } else {
      res.status(400).json({ success: false, error: 'Mangler slug eller updates' });
      return;
    }

    payload.updatedAt = serverTimestamp();

    const cmsDocRef = doc(db, 'cms_configs', 'designs');
    await setDoc(cmsDocRef, payload, { merge: true });

    res.status(200).json({ 
      success: true, 
      updatedKeys: Object.keys(payload).filter(k => k !== 'updatedAt')
    });
  } catch (err) {
    console.error('[CMS Update Error]:', err);
    res.status(500).json({ success: false, error: err.message || 'Kunne ikke lagre CMS' });
  }
}

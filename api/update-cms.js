/**
 * API Endpoint: /api/update-cms
 * Updates CMS content in Cloud Firestore (cms_configs/designs).
 * Only logged-in admins may write (verified server-side with verifyAdminAuth).
 *
 * Writing: if a Google service account with Firestore access is configured
 * (GA4_SERVICE_ACCOUNT_KEY, see _google-sa.js), the endpoint writes through the
 * Firestore REST API, which is not affected by security rules. That lets the
 * rules for cms_configs be locked to read-only for the public. Until the service
 * account has access, it falls back to the client SDK (requires open rules).
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { verifyAdminAuth } from './_admin-auth.js';
import { getServiceAccount, googleFetch } from './_google-sa.js';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyABoePYQM_Xpo-hC1AKKfN7ODJdDgbQi_k",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "his-kingdom-designs.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "his-kingdom-designs",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "his-kingdom-designs.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "626968403342",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:626968403342:web:5f76bfe02d3ccfbfa198df"
};

const ALLOWED_ORIGINS = [
  'https://hiskingdomdesigns.no',
  'https://www.hiskingdomdesigns.no',
  'http://localhost:5173',
  'http://localhost:3000'
];

const MAX_FIELDS = 50;
const MAX_VALUE_LENGTH = 20000;

function toFirestoreValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}

// Field paths with characters other than letters, digits and _ must be quoted with backticks.
const fieldPath = (k) => (/^[A-Za-z_][A-Za-z0-9_]*$/.test(k) ? k : '`' + k.replace(/\\/g, '\\\\').replace(/`/g, '\\`') + '`');

async function writeWithServiceAccount(payload) {
  const projectId = firebaseConfig.projectId;
  const fields = {};
  for (const [k, v] of Object.entries(payload)) fields[k] = toFirestoreValue(v);
  fields.updatedAt = { timestampValue: new Date().toISOString() };
  const mask = Object.keys(fields).map(k => `updateMask.fieldPaths=${encodeURIComponent(fieldPath(k))}`).join('&');
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cms_configs/designs?${mask}`;
  await googleFetch(url, ['https://www.googleapis.com/auth/datastore'], {
    method: 'PATCH',
    body: JSON.stringify({ fields })
  });
}

async function writeWithClientSdk(payload) {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const db = getFirestore(app);
  await setDoc(doc(db, 'cms_configs', 'designs'), { ...payload, updatedAt: serverTimestamp() }, { merge: true });
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
    return;
  }

  const auth = await verifyAdminAuth(req);
  if (!auth.authorized) {
    res.status(401).json({ success: false, error: 'Du må være logget inn som admin for å lagre.' });
    return;
  }

  try {
    const { slug, value, updates } = req.body || {};

    let payload = {};
    if (updates && typeof updates === 'object' && !Array.isArray(updates)) {
      payload = { ...updates };
    } else if (typeof slug === 'string' && slug) {
      payload[slug] = value;
    } else {
      res.status(400).json({ success: false, error: 'Mangler slug eller updates' });
      return;
    }

    delete payload.updatedAt;
    const keys = Object.keys(payload);
    if (keys.length === 0 || keys.length > MAX_FIELDS) {
      res.status(400).json({ success: false, error: 'Ugyldig antall felt' });
      return;
    }
    for (const [k, v] of Object.entries(payload)) {
      if (k.length > 200 || (typeof v === 'string' && v.length > MAX_VALUE_LENGTH) || (v && typeof v === 'object')) {
        res.status(400).json({ success: false, error: `Ugyldig verdi for ${k}` });
        return;
      }
    }

    let via = 'client_sdk';
    if (getServiceAccount()) {
      try {
        await writeWithServiceAccount(payload);
        via = 'service_account';
      } catch (saErr) {
        console.warn('[CMS Update] Service account write failed, falling back to client SDK:', saErr.message);
        await writeWithClientSdk(payload);
      }
    } else {
      await writeWithClientSdk(payload);
    }

    res.status(200).json({ success: true, via, updatedKeys: keys });
  } catch (err) {
    console.error('[CMS Update Error]:', err);
    res.status(500).json({ success: false, error: 'Kunne ikke lagre CMS' });
  }
}

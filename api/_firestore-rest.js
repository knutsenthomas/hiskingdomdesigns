/**
 * Minimal Firestore REST client for serverless endpoints.
 * Uses the Google service account (GA4_SERVICE_ACCOUNT_KEY) when configured, so it
 * works when the security rules block browser access. Without a service account,
 * requests go unauthenticated and are subject to the rules.
 */
import { getServiceAccount, getAccessToken } from './_google-sa.js';

const PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'his-kingdom-designs';
const API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyABoePYQM_Xpo-hC1AKKfN7ODJdDgbQi_k';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

export function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'object') return { mapValue: { fields: toFields(v) } };
  return { stringValue: String(v) };
}

export function toFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) if (v !== undefined) fields[k] = toValue(v);
  return fields;
}

export function fromValue(v) {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromValue);
  if ('mapValue' in v) return fromFields(v.mapValue.fields || {});
  return null;
}

export function fromFields(fields = {}) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = fromValue(v);
  return out;
}

const docFromRest = (d) => ({ id: d.name.split('/').pop(), ...fromFields(d.fields) });

async function send(path, method, body, useServiceAccount) {
  const headers = { 'Content-Type': 'application/json' };
  let url = `${BASE}${path}`;
  if (useServiceAccount) {
    headers.Authorization = `Bearer ${await getAccessToken(['https://www.googleapis.com/auth/datastore'])}`;
  } else {
    url += (url.includes('?') ? '&' : '?') + `key=${API_KEY}`;
  }
  return fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
}

async function request(path, { method = 'GET', body } = {}) {
  let r;
  if (getServiceAccount()) {
    try {
      r = await send(path, method, body, true);
    } catch (e) {
      console.warn('[firestore-rest] service account token failed:', e.message);
    }
    // Service account without Firestore access yet: fall back to rule-based access.
    if (r && (r.status === 401 || r.status === 403)) {
      console.warn('[firestore-rest] service account has no Firestore access, falling back');
      r = null;
    }
  }
  if (!r) r = await send(path, method, body, false);
  const text = await r.text();
  const data = text ? JSON.parse(text) : {};
  if (!r.ok) {
    const err = new Error(data?.error?.message || `Firestore HTTP ${r.status}`);
    err.status = r.status;
    throw err;
  }
  return data;
}

const enc = (s) => encodeURIComponent(s);

export async function getDocument(collection, id) {
  try {
    return docFromRest(await request(`/${enc(collection)}/${enc(id)}`));
  } catch (e) {
    if (e.status === 404) return null;
    throw e;
  }
}

export async function setDocument(collection, id, data) {
  return docFromRest(await request(`/${enc(collection)}/${enc(id)}`, { method: 'PATCH', body: { fields: toFields(data) } }));
}

export async function updateFields(collection, id, data) {
  const mask = Object.keys(data).map(k => `updateMask.fieldPaths=${enc(k)}`).join('&');
  return docFromRest(await request(`/${enc(collection)}/${enc(id)}?${mask}&currentDocument.exists=true`, {
    method: 'PATCH', body: { fields: toFields(data) }
  }));
}

export async function addDocument(collection, data) {
  return docFromRest(await request(`/${enc(collection)}`, { method: 'POST', body: { fields: toFields(data) } }));
}

export async function deleteDocument(collection, id) {
  await request(`/${enc(collection)}/${enc(id)}`, { method: 'DELETE' });
}

export async function queryEqual(collection, field, value) {
  const rows = await request(':runQuery', {
    method: 'POST',
    body: {
      structuredQuery: {
        from: [{ collectionId: collection }],
        where: { fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: toValue(value) } }
      }
    }
  });
  return (Array.isArray(rows) ? rows : []).filter(r => r.document).map(r => docFromRest(r.document));
}

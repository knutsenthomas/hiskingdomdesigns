import { SignJWT, importPKCS8 } from 'jose';

// Reads the Google service account key from Vercel env (same account as GA4).
// Handles the case where GA4_PROPERTY_ID and GA4_SERVICE_ACCOUNT_KEY are swapped.
export function getServiceAccount() {
  let a = process.env.GA4_SERVICE_ACCOUNT_KEY || '';
  const b = process.env.GA4_PROPERTY_ID || '';
  if (!a.trim().startsWith('{') && b.trim().startsWith('{')) a = b;
  if (!a.trim().startsWith('{')) return null;
  try {
    const key = JSON.parse(a);
    if (!key.client_email || !key.private_key) return null;
    return { email: key.client_email, privateKey: key.private_key.replace(/\\n/g, '\n') };
  } catch {
    return null;
  }
}

const tokenCache = new Map();

// OAuth access token for the given scopes, via a signed JWT (no extra dependencies).
export async function getAccessToken(scopes) {
  const sa = getServiceAccount();
  if (!sa) throw new Error('Service account not configured (GA4_SERVICE_ACCOUNT_KEY)');
  const scope = scopes.join(' ');
  const cached = tokenCache.get(scope);
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;

  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(sa.privateKey, 'RS256');
  const assertion = await new SignJWT({ scope })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(sa.email)
    .setAudience('https://oauth2.googleapis.com/token')
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(`Token error: ${data.error_description || data.error || r.status}`);
  tokenCache.set(scope, { token: data.access_token, expires: Date.now() + data.expires_in * 1000 });
  return data.access_token;
}

export async function googleFetch(url, scopes, options = {}) {
  const token = await getAccessToken(scopes);
  const r = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const text = await r.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text.slice(0, 500) }; }
  if (!r.ok) {
    const msg = data?.error?.message || data?.raw || `HTTP ${r.status}`;
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }
  return data;
}

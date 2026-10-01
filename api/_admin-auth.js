import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Shared Admin Authentication Helper for Serverless Endpoints
 * Verifies admin identity via:
 * 1. x-admin-key header (for server-to-server / automated tasks)
 * 2. Firebase Auth ID Bearer token (from authenticated HKM / HKD admins)
 * 3. Wix Member Bearer token (from logged-in Wix member in HKD store)
 */

export const ADMIN_EMAILS = [
  'knutsenthomas@gmail.com',
  'thomas@hiskingdomministry.no',
  'thomas@hiskingdomministry',
  'hildekarin@gmail.com',
  'hildekarin@hiskingdomministry.no',
  'thomas@tk-design.no'
];

export const ADMIN_MEMBER_IDS = [
  '18cf516e-0caa-430c-9bb5-6150854fcd6f'
];

const ALLOWED_FIREBASE_PROJECTS = [
  'his-kingdom-ministry',
  'his-kingdom-designs'
];

let cachedJwks = null;
function getFirebaseJwks() {
  if (!cachedJwks) {
    cachedJwks = createRemoteJWKSet(
      new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com')
    );
  }
  return cachedJwks;
}

export async function verifyAdminAuth(req) {
  // 1. Secret API Key check (for backend automation / webhooks / direct admin calls)
  const adminKey = req.headers['x-admin-key'];
  if (process.env.ADMIN_API_KEY && adminKey && adminKey === process.env.ADMIN_API_KEY) {
    return { authorized: true, role: 'admin_key' };
  }

  // 2. Bearer Token check (Firebase Auth or Wix Member)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      // 2A. Check Firebase ID Token (JWT RS256 verified against Google's public JWKS)
      try {
        const jwks = getFirebaseJwks();
        const { payload } = await jwtVerify(token, jwks);
        if (payload && ALLOWED_FIREBASE_PROJECTS.includes(payload.aud)) {
          const email = (payload.email || '').toLowerCase().trim();
          if (email && ADMIN_EMAILS.includes(email)) {
            return { authorized: true, user: payload, role: 'firebase_admin' };
          }
        }
      } catch (jwtErr) {
        // Not a Firebase JWT or signature invalid for Google JWKS; fall through
      }

      // 2B. Firebase REST verification fallback (Google Identity Toolkit)
      try {
        const hkmKey = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyAelVsZnTU5xjQsjewWG7RjYEsQSHH-bkE';
        const restRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${hkmKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: token })
        });
        if (restRes.ok) {
          const restData = await restRes.json();
          const user = restData.users?.[0];
          const email = (user?.email || '').toLowerCase().trim();
          if (email && ADMIN_EMAILS.includes(email)) {
            return { authorized: true, user, role: 'firebase_admin_rest' };
          }
        }
      } catch (restErr) {
        // REST check failed; fall through to Wix check
      }

      // 2C. Wix Member Bearer Token check (from logged-in admin in store)
      try {
        const memberRes = await fetch('https://www.wixapis.com/members/v1/members/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (memberRes.ok) {
          const data = await memberRes.json();
          const member = data.member;
          const email = (member?.loginEmail || member?.profile?.email || '').toLowerCase().trim();
          const memberId = member?._id || member?.id;

          if (
            (email && ADMIN_EMAILS.includes(email)) ||
            (memberId && ADMIN_MEMBER_IDS.includes(memberId))
          ) {
            return { authorized: true, member, role: 'wix_admin' };
          }
        }
      } catch (err) {
        console.warn('verifyAdminAuth: Error validating member token:', err);
      }
    }
  }

  return { authorized: false, reason: 'Invalid or missing admin credentials' };
}

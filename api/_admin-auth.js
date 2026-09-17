/**
 * Shared Admin Authentication Helper for Serverless Endpoints
 * Verifies admin identity via x-admin-key header or Wix Member Bearer token.
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

export async function verifyAdminAuth(req) {
  // 1. Secret API Key check (for backend automation / webhooks / direct admin calls)
  const adminKey = req.headers['x-admin-key'];
  if (process.env.ADMIN_API_KEY && adminKey && adminKey === process.env.ADMIN_API_KEY) {
    return { authorized: true, role: 'admin_key' };
  }

  // 2. Wix Member Bearer Token check (from logged-in admin in browser)
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
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

import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { orders } from '@wix/ecom';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { orderPage } from '../lib/wix-order-history.js';

const audience = 'https://hiskingdomdesigns.no/api/wix-orders-sync';
const serviceAccount = '791237361706-compute@developer.gserviceaccount.com';
const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const client = createClient({ modules: { orders }, auth: ApiKeyStrategy({
  siteId: process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7', apiKey: process.env.WIX_API_KEY,
}) });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method-not-allowed' });
  try {
    const token = /^Bearer (\S+)$/.exec(req.headers.authorization || '')?.[1];
    if (!token) throw new Error('missing-token');
    const { payload } = await jwtVerify(token, googleKeys, { audience, issuer: ['https://accounts.google.com', 'accounts.google.com'], algorithms: ['RS256'] });
    if (payload.email !== serviceAccount || payload.email_verified !== true) throw new Error('wrong-service');
  } catch { return res.status(401).json({ error: 'unauthorized' }); }
  try {
    const page = await orderPage(search => client.orders.searchOrders(search), req.body || {});
    return res.status(200).json({ success: true, ...page });
  } catch { return res.status(502).json({ error: 'wix-orders-unavailable' }); }
}

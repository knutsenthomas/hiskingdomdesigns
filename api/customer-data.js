/**
 * API Endpoint: /api/customer-data
 * Server-side access to customer data in Firestore (returns and affiliate applications),
 * so the browser no longer reads or writes these collections directly.
 *
 * Customer actions require a logged-in Wix member and only touch that member's own data.
 * Admin actions require verifyAdminAuth.
 */
import { verifyAdminAuth } from './_admin-auth.js';
import { getDocument, setDocument, updateFields, addDocument, deleteDocument, queryEqual } from './_firestore-rest.js';

const ALLOWED_ORIGINS = [
  'https://hiskingdomdesigns.no',
  'https://www.hiskingdomdesigns.no',
  'http://localhost:5173',
  'http://localhost:3000'
];

const str = (v, max = 2000) => (typeof v === 'string' ? v.slice(0, max) : '');

async function getMember(req) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const r = await fetch('https://www.wixapis.com/members/v1/members/my?fieldsets=FULL', {
    headers: { Authorization: authHeader }
  });
  if (!r.ok) return null;
  const data = await r.json();
  const m = data.member;
  const id = m?._id || m?.id;
  if (!id) return null;
  return { id, email: (m.loginEmail || m.profile?.email || '').toLowerCase() };
}

const CUSTOMER_ACTIONS = {
  async 'returns.list'(member) {
    const rows = await queryEqual('order_returns', 'memberId', member.id);
    return { returns: rows };
  },
  async 'returns.create'(member, d) {
    const items = Array.isArray(d.items) ? d.items.slice(0, 50).map(i => ({
      _id: str(i?._id, 100),
      name: str(i?.name, 300),
      quantity: Math.max(0, Math.min(100, parseInt(i?.quantity, 10) || 0))
    })).filter(i => i.quantity > 0) : [];
    if (!str(d.orderId, 100) || items.length === 0) throw Object.assign(new Error('Mangler ordre eller varer'), { status: 400 });
    const doc = await addDocument('order_returns', {
      memberId: member.id,
      memberName: str(d.memberName, 200),
      memberEmail: member.email || str(d.memberEmail, 200),
      orderId: str(d.orderId, 100),
      items,
      reason: str(d.reason, 500),
      comments: str(d.comments, 3000),
      status: 'Mottatt',
      createdAt: new Date().toISOString()
    });
    return { id: doc.id };
  },
  async 'affiliate.get'(member) {
    const doc = await getDocument('affiliate_applications', member.id);
    return { status: doc?.status || null };
  },
  async 'affiliate.apply'(member, d) {
    const existing = await getDocument('affiliate_applications', member.id);
    if (existing?.status === 'approved') return { status: 'approved' };
    await setDocument('affiliate_applications', member.id, {
      memberId: member.id,
      name: str(d.name, 200),
      email: str(d.email, 200),
      address: str(d.address, 500),
      socialMedia: str(d.socialMedia, 1000),
      motivation: str(d.motivation, 3000),
      status: 'pending',
      appliedAt: new Date().toISOString()
    });
    return { status: 'pending' };
  }
};

const ADMIN_ACTIONS = {
  async 'affiliate.list'(d) {
    const [pending, approved] = await Promise.all([
      queryEqual('affiliate_applications', 'status', 'pending'),
      queryEqual('affiliate_applications', 'status', 'approved')
    ]);
    const list = d.status === 'approved' ? approved : pending;
    list.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
    return { applications: list, pendingCount: pending.length, approvedCount: approved.length };
  },
  async 'affiliate.approve'(d) {
    if (!str(d.id, 100)) throw Object.assign(new Error('Mangler id'), { status: 400 });
    await updateFields('affiliate_applications', d.id, { status: 'approved' });
    return { ok: true };
  },
  async 'affiliate.reject'(d) {
    if (!str(d.id, 100)) throw Object.assign(new Error('Mangler id'), { status: 400 });
    await deleteDocument('affiliate_applications', d.id);
    return { ok: true };
  }
};

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { action, data = {} } = req.body || {};
  try {
    if (ADMIN_ACTIONS[action]) {
      const auth = await verifyAdminAuth(req);
      if (!auth.authorized) return res.status(401).json({ error: 'Krever admin-innlogging' });
      return res.status(200).json(await ADMIN_ACTIONS[action](data));
    }
    if (CUSTOMER_ACTIONS[action]) {
      const member = await getMember(req);
      if (!member) return res.status(401).json({ error: 'Du må være logget inn' });
      return res.status(200).json(await CUSTOMER_ACTIONS[action](member, data));
    }
    return res.status(400).json({ error: 'Ukjent handling' });
  } catch (err) {
    console.error('[customer-data]', action, err);
    return res.status(err.status === 400 ? 400 : 500).json({ error: err.status === 400 ? err.message : 'Noe gikk galt' });
  }
}

const SITE_ID = process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';

// Never accept contact IDs or moderation/verified flags from the browser.
export function createReviewHandler({ fetchImpl = fetch, apiKey = process.env.WIX_API_KEY } = {}) {
  const attempts = new Map();
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    const origin = req.headers?.origin;
    if (origin && !['https://hiskingdomdesigns.no', 'https://www.hiskingdomdesigns.no', 'http://localhost:5173'].includes(origin)) {
      return res.status(403).json({ error: 'INVALID_ORIGIN' });
    }
    const { productId, name, email, title, body, rating } = req.body || {};
    if (typeof productId !== 'string' || !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(productId) ||
        typeof name !== 'string' || !name.trim() || name.length > 100 ||
        typeof email !== 'string' || email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof title !== 'string' || !title.trim() || title.length > 3000 ||
        typeof body !== 'string' || !body.trim() || body.length > 3000 ||
        !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'INVALID_REVIEW' });
    }
    if (!apiKey) return res.status(503).json({ error: 'REVIEWS_UNAVAILABLE' });
    // Bound bursts per server instance; Wix still enforces one review per contact/product.
    const address = req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();
    for (const [key, entry] of attempts) if (entry.until <= now) attempts.delete(key);
    const entry = attempts.get(address) || { count: 0, until: now + 600000 };
    if (entry.count >= 5) return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS' });
    if (attempts.size >= 10000 && !attempts.has(address)) return res.status(429).json({ error: 'TOO_MANY_ATTEMPTS' });
    entry.count += 1;
    attempts.set(address, entry);
    const call = async (path, payload) => {
      const response = await fetchImpl(`https://www.wixapis.com${path}`, {
        method: 'POST',
        headers: { Authorization: apiKey, 'wix-site-id': SITE_ID, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error('Wix request failed');
        error.status = response.status;
        error.requestId = response.headers?.get('x-wix-request-id');
        throw error;
      }
      return data;
    };
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const findContact = () => call('/contacts/v4/contacts/query', {
        query: { filter: { 'primaryInfo.email': { $eq: normalizedEmail } }, paging: { limit: 1 } },
      });
      let contactId = (await findContact()).contacts?.[0]?.id;
      if (!contactId) {
        try {
          const created = await call('/contacts/v4/contacts', {
            info: { name: { first: name.trim() }, emails: { items: [{ email: normalizedEmail }] } },
            allowDuplicates: false,
          });
          contactId = created.contact?.id;
        } catch (error) {
          if (error.status !== 409) throw error;
          contactId = (await findContact()).contacts?.[0]?.id;
        }
      }
      if (!contactId) throw new Error('Missing contact ID');
      const data = await call('/reviews/v1/reviews', { review: {
        namespace: 'stores', entityId: productId,
        author: { contactId, authorName: name.trim() },
        content: { title: title.trim(), body: body.trim(), rating },
      } });
      if (!data.review?.id) throw new Error('Missing review ID');
      return res.status(201).json({ success: true, reviewId: data.review.id });
    } catch (error) {
      console.error('Review submission failed', { status: error.status, requestId: error.requestId });
      return res.status(error.status === 409 ? 409 : 502).json({
        error: error.status === 409 ? 'DUPLICATE_REVIEW' : 'REVIEW_FAILED',
      });
    }
  };
}

export default createReviewHandler();

import { loadCatalog } from '../server/catalog.js';

// IndexNow: tells Bing (and other IndexNow engines) about changed product pages,
// so they are recrawled quickly. Runs daily as a Vercel cron (see vercel.json).
// The key is public by design; it is also served at /<key>.txt.
export const INDEXNOW_KEY = 'bd6eebe586119ebdbc984ffccce0716d';
const HOST = 'hiskingdomdesigns.no';
const WINDOW_MS = 26 * 60 * 60 * 1000; // a bit more than a day, so nothing falls between runs

function isAuthorized(req) {
  const secret = process.env.CRON_SECRET;
  if (secret) return req.headers?.authorization === `Bearer ${secret}`;
  return /vercel-cron/i.test(req.headers?.['user-agent'] || '');
}

export function changedProductUrls(products, now = Date.now()) {
  return products
    .filter(p => p.visible !== false && (p._id || p.id))
    .filter(p => {
      const raw = p.lastUpdated || p._updatedDate || p.updatedDate;
      const t = raw ? new Date(raw).getTime() : NaN;
      return Number.isFinite(t) && now - t <= WINDOW_MS;
    })
    .map(p => `https://${HOST}/produkt/${p._id || p.id}`);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!isAuthorized(req)) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  try {
    const { products } = await loadCatalog();
    const urlList = changedProductUrls(products);
    if (urlList.length === 0) {
      res.status(200).json({ submitted: 0 });
      return;
    }
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urlList.slice(0, 10000),
      }),
    });
    res.status(200).json({ submitted: urlList.length, indexnowStatus: r.status });
  } catch (error) {
    console.error('IndexNow failed:', error);
    res.status(500).json({ error: 'indexnow failed' });
  }
}

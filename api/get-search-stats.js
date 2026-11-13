import { verifyAdminAuth } from './_admin-auth.js';
import { googleFetch } from './_google-sa.js';

// Search Console + Merchant Center status for hiskingdomdesigns.no, read with the
// GA4 service account (needs read access in both, and the APIs enabled in its
// Google Cloud project). Access: admin login, or ?key=<STATS_READ_KEY>.
//   ?days=28      period for clicks/impressions (1–90)
//   ?inspect=1    also URL-inspect the home page and a few product pages

const SITE = 'https://hiskingdomdesigns.no/';
const MERCHANT_ID = '5753624417';
const GSC_SCOPE = ['https://www.googleapis.com/auth/webmasters.readonly'];
const MC_SCOPE = ['https://www.googleapis.com/auth/content'];

const day = d => d.toISOString().slice(0, 10);

async function searchConsole(days, inspect) {
  const end = new Date(Date.now() - 2 * 864e5); // GSC data lags ~2 days
  const start = new Date(end.getTime() - (days - 1) * 864e5);
  const base = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}`;
  const query = body => googleFetch(`${base}/searchAnalytics/query`, GSC_SCOPE, {
    method: 'POST',
    body: JSON.stringify({ startDate: day(start), endDate: day(end), ...body }),
  });

  const [totals, queries, pages, sitemaps] = await Promise.all([
    query({}),
    query({ dimensions: ['query'], rowLimit: 15 }),
    query({ dimensions: ['page'], rowLimit: 15 }),
    googleFetch(`${base}/sitemaps`, GSC_SCOPE),
  ]);
  const row = r => ({ key: r.keys?.[0], clicks: r.clicks, impressions: r.impressions, ctr: +(r.ctr * 100).toFixed(1), position: +r.position.toFixed(1) });
  const t = totals.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  const result = {
    period: { start: day(start), end: day(end) },
    totals: { clicks: t.clicks, impressions: t.impressions, ctr: +(t.ctr * 100).toFixed(1), position: +(t.position || 0).toFixed(1) },
    topQueries: (queries.rows || []).map(row),
    topPages: (pages.rows || []).map(row),
    sitemaps: (sitemaps.sitemap || []).map(s => ({
      path: s.path, lastSubmitted: s.lastSubmitted, lastDownloaded: s.lastDownloaded,
      errors: Number(s.errors || 0), warnings: Number(s.warnings || 0),
      submitted: (s.contents || []).reduce((n, c) => n + Number(c.submitted || 0), 0),
    })),
  };

  if (inspect) {
    const urls = [SITE, ...result.topPages.map(p => p.key).filter(u => u && u !== SITE).slice(0, 4)];
    result.inspection = await Promise.all(urls.map(async url => {
      try {
        const r = await googleFetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', GSC_SCOPE, {
          method: 'POST', body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE, languageCode: 'no' }),
        });
        const s = r.inspectionResult?.indexStatusResult || {};
        return { url, verdict: s.verdict, coverage: s.coverageState, lastCrawl: s.lastCrawlTime };
      } catch (e) {
        return { url, error: e.message };
      }
    }));
  }
  return result;
}

async function merchantSearch(query) {
  const rows = [];
  let pageToken;
  for (const version of ['v1', 'v1beta']) {
    try {
      do {
        const data = await googleFetch(`https://merchantapi.googleapis.com/reports/${version}/accounts/${MERCHANT_ID}/reports:search`, MC_SCOPE, {
          method: 'POST', body: JSON.stringify({ query, pageSize: 1000, ...(pageToken ? { pageToken } : {}) }),
        });
        rows.push(...(data.results || []));
        pageToken = data.nextPageToken;
      } while (pageToken);
      return rows;
    } catch (e) {
      if (version === 'v1beta' || e.status !== 404) throw e;
      rows.length = 0;
      pageToken = undefined;
    }
  }
  return rows;
}

async function merchantCenter(days) {
  const products = await merchantSearch(
    'SELECT product_view.id, product_view.offer_id, product_view.title, product_view.availability, product_view.aggregated_reporting_context_status, product_view.item_issues FROM product_view'
  );
  const status = {};
  const availability = {};
  const issues = {};
  for (const r of products) {
    const p = r.productView || {};
    const s = p.aggregatedReportingContextStatus || 'UNKNOWN';
    status[s] = (status[s] || 0) + 1;
    const a = p.availability || 'UNKNOWN';
    availability[a] = (availability[a] || 0) + 1;
    for (const i of p.itemIssues || []) {
      const code = i.type?.code || 'unknown';
      if (!issues[code]) issues[code] = { code, count: 0, severity: i.severity?.aggregatedSeverity || i.severity, example: p.title, products: [] };
      issues[code].count++;
      if (issues[code].products.length < 50) issues[code].products.push({ id: p.offerId || p.id, title: p.title });
    }
  }

  let performance = null;
  try {
    const end = new Date(Date.now() - 864e5);
    const start = new Date(end.getTime() - (days - 1) * 864e5);
    const perf = await merchantSearch(
      `SELECT clicks, impressions FROM product_performance_view WHERE date BETWEEN '${day(start)}' AND '${day(end)}'`
    );
    performance = perf.reduce((acc, r) => {
      const m = r.productPerformanceView || {};
      acc.clicks += Number(m.clicks || 0);
      acc.impressions += Number(m.impressions || 0);
      return acc;
    }, { clicks: 0, impressions: 0, period: { start: day(start), end: day(end) } });
  } catch (e) {
    performance = { error: e.message };
  }

  return {
    totalProducts: products.length,
    status,
    availability,
    topIssues: Object.values(issues).sort((a, b) => b.count - a.count).slice(0, 15),
    performance,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-Admin-Key, Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const readKey = process.env.STATS_READ_KEY;
  const keyOk = !!readKey && req.query?.key === readKey;
  if (!keyOk) {
    const auth = await verifyAdminAuth(req);
    if (!auth.authorized) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }
  }

  const days = Math.min(90, Math.max(1, parseInt(req.query?.days, 10) || 28));
  const inspect = req.query?.inspect === '1';

  const [gsc, mc] = await Promise.allSettled([searchConsole(days, inspect), merchantCenter(days)]);
  res.status(200).json({
    success: true,
    generatedAt: new Date().toISOString(),
    searchConsole: gsc.status === 'fulfilled' ? gsc.value : { error: gsc.reason?.message },
    merchantCenter: mc.status === 'fulfilled' ? mc.value : { error: mc.reason?.message },
  });
}

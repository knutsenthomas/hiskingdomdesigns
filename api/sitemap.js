import { loadCatalog } from '../server/catalog.js';
import { canonicalCategoryPath } from '../src/lib/seoCanonical.js';

const DOMAIN = 'https://hiskingdomdesigns.no';
const WIX_CLIENT_ID = '82b2b70d-fb70-4b76-abfd-a2a70f38ac06';

// Date of the last site-wide change to the server-rendered page content.
// Bump this when templates change for every page, so Google recrawls them.
export const SEO_CONTENT_DATE = '2026-10-28';

// Newest of the product's own update date and the last site-wide content change, as YYYY-MM-DD.
export function productLastmod(product, floor = SEO_CONTENT_DATE) {
  const raw = product?.lastUpdated || product?._updatedDate || product?.updatedDate;
  const time = raw ? new Date(raw).getTime() : NaN;
  const own = Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : null;
  return own && own > floor ? own : floor;
}

// Define static routes and priority SEO topic clusters with their canonical URLs
const staticRoutes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily'
  },
  {
    path: '/kristne-gaver',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    path: '/category/kristne-klaer',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    path: '/category/kristne-t-skjorter',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    path: '/category/kristne-gensere',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    path: '/category/kristen-streetwear',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    path: '/category/klaer-med-bibelvers',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    path: '/category/kristne-plakater',
    priority: '0.8',
    changefreq: 'daily'
  },
  {
    path: '/category/kristne-kopper',
    priority: '0.8',
    changefreq: 'daily'
  },
  {
    path: '/category/kristne-klistermerker',
    priority: '0.8',
    changefreq: 'daily'
  },
  {
    path: '/produkter',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    path: '/om-oss',
    priority: '0.7',
    changefreq: 'weekly'
  },
  {
    path: '/vart-team',
    priority: '0.6',
    changefreq: 'weekly'
  },
  {
    path: '/frakt-og-retur',
    priority: '0.6',
    changefreq: 'weekly'
  },
  {
    path: '/faq',
    priority: '0.6',
    changefreq: 'weekly'
  },
  {
    path: '/personvern',
    priority: '0.5',
    changefreq: 'monthly'
  },
  {
    path: '/betingelser',
    priority: '0.5',
    changefreq: 'monthly'
  }
];

export function createSitemapHandler(catalogLoader = loadCatalog) {
 return async function handler(req, res) {
  // Set cache control for 1 hour, stale-while-revalidate
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const {products:allProducts, collections:allCollections} = await catalogLoader();

    // 2. Generate XML Sitemap with 100% 200-OK Canonical URLs & Valid Self-Referencing Hreflang
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    // Helper function to append canonical URL nodes with compliant self-referencing alternates
    const seen = new Set();
    const appendUrl = (path, changefreq, priority, lastmod = SEO_CONTENT_DATE) => {
      if (seen.has(path)) return;
      seen.add(path);
      const formattedPath = path === '/' ? '/' : path;
      const loc = `${DOMAIN}${formattedPath}`;

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="no" href="${loc}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    };

    // 3. Add static pages to sitemap
    staticRoutes.forEach(route => {
      appendUrl(route.path, route.changefreq, route.priority);
    });

    for (const collection of allCollections) {
      if (collection.slug && collection.visible !== false) appendUrl(canonicalCategoryPath(`/category/${encodeURIComponent(collection.slug)}`), 'weekly', '0.7');
    }

    // 4. Add dynamic product pages (only canonical /produkt/:id)
    allProducts.forEach(p => {
      if (p.visible === false) return;
      const id = p._id || p.id;
      if (!id) return;
      appendUrl(`/produkt/${id}`, 'weekly', '0.8', productLastmod(p));
    });

    xml += `</urlset>\n`;

    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    let errXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    errXml += `<error><message>Catalog temporarily unavailable</message></error>`;
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Retry-After', '300');
    res.status(503).send(errXml);
  }
}

}
export default createSitemapHandler();

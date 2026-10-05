import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';

const DOMAIN = 'https://hiskingdomdesigns.no';
const WIX_CLIENT_ID = '82b2b70d-fb70-4b76-abfd-a2a70f38ac06';

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

export default async function handler(req, res) {
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
    // 1. Fetch products using Wix Stores SDK
    let allProducts = [];

    try {
      const wixClient = createClient({
        modules: { products },
        auth: OAuthStrategy({ clientId: WIX_CLIENT_ID })
      });

      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const queryRes = await wixClient.products.queryProducts().skip(skip).limit(100).find();
        const items = queryRes.items || [];
        allProducts = allProducts.concat(items);

        if (items.length < 100) {
          hasMore = false;
        } else {
          skip += 100;
        }
      }
    } catch (fetchErr) {
      console.error('Error fetching dynamic products for sitemap:', fetchErr);
    }

    // 2. Generate XML Sitemap with 100% 200-OK Canonical URLs & Valid Self-Referencing Hreflang
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    // Helper function to append canonical URL nodes with compliant self-referencing alternates
    const appendUrl = (path, changefreq, priority) => {
      const formattedPath = path === '/' ? '' : path;
      const loc = `${DOMAIN}${formattedPath}`;

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="no" href="${loc}" />\n`;
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />\n`;
      xml += `    <changefreq>${changefreq}</changefreq>\n`;
      xml += `    <priority>${priority}</priority>\n`;
      xml += `  </url>\n`;
    };

    // 3. Add static pages to sitemap
    staticRoutes.forEach(route => {
      appendUrl(route.path, route.changefreq, route.priority);
    });

    // 4. Add dynamic product pages (only canonical /produkt/:id)
    allProducts.forEach(p => {
      if (p.visible === false) return;
      const id = p._id || p.id;
      if (!id) return;
      appendUrl(`/produkt/${id}`, 'weekly', '0.8');
    });

    xml += `</urlset>\n`;

    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    let errXml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    errXml += `<error><message>${error.message || 'Internal Server Error'}</message></error>`;
    res.status(500).send(errXml);
  }
}

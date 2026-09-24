const SITE_ID = process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = process.env.WIX_API_KEY;

const DOMAIN = 'https://hiskingdomdesigns.no';

// Define static routes and priority SEO topic clusters with their translations
const staticRoutes = [
  {
    no: '/',
    en: '/',
    priority: '1.0',
    changefreq: 'daily'
  },
  {
    no: '/kristne-gaver',
    en: '/kristne-gaver',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    no: '/category/kristne-klaer',
    en: '/category/kristne-klaer',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    no: '/category/kristne-t-skjorter',
    en: '/category/kristne-t-skjorter',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    no: '/category/kristne-gensere',
    en: '/category/kristne-gensere',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    no: '/category/kristen-streetwear',
    en: '/category/kristen-streetwear',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    no: '/category/klaer-med-bibelvers',
    en: '/category/klaer-med-bibelvers',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    no: '/category/kristne-plakater',
    en: '/category/kristne-plakater',
    priority: '0.8',
    changefreq: 'daily'
  },
  {
    no: '/category/kristne-kopper',
    en: '/category/kristne-kopper',
    priority: '0.8',
    changefreq: 'daily'
  },
  {
    no: '/category/kristne-klistermerker',
    en: '/category/kristne-klistermerker',
    priority: '0.8',
    changefreq: 'daily'
  },
  {
    no: '/produkter',
    en: '/products',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    no: '/om-oss',
    en: '/about',
    priority: '0.7',
    changefreq: 'weekly'
  },
  {
    no: '/vart-team',
    en: '/team',
    priority: '0.6',
    changefreq: 'weekly'
  },
  {
    no: '/frakt-og-retur',
    en: '/shipping',
    priority: '0.6',
    changefreq: 'weekly'
  },
  {
    no: '/faq',
    en: '/faq',
    priority: '0.6',
    changefreq: 'weekly'
  },
  {
    no: '/personvern',
    en: '/privacy',
    priority: '0.5',
    changefreq: 'monthly'
  },
  {
    no: '/betingelser',
    en: '/terms',
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
    // 1. Fetch products from Wix
    let allProducts = [];
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const queryRes = await fetch('https://www.wixapis.com/stores/v1/products/query', {
        method: 'POST',
        headers: {
          'Authorization': API_KEY,
          'wix-site-id': SITE_ID,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: {
            paging: {
              limit: 100,
              offset: skip
            }
          }
        })
      });

      if (!queryRes.ok) {
        throw new Error(`Failed to fetch from Wix API: ${queryRes.status} ${queryRes.statusText}`);
      }

      const queryData = await queryRes.json();
      const products = queryData.products || [];
      allProducts = allProducts.concat(products);

      if (products.length < 100) {
        hasMore = false;
      } else {
        skip += 100;
      }
    }

    // 2. Generate XML Sitemap
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

    // Helper function to append URL nodes with alternates
    const appendUrl = (noPath, enPath, changefreq, priority) => {
      const paths = { no: noPath, en: enPath };
      const langs = ['no', 'en'];

      // Ensure each unique URL path gets only one <loc> node with full hreflang cluster
      const uniquePaths = Array.from(new Set([noPath, enPath].filter(Boolean)));

      uniquePaths.forEach(path => {
        const formattedPath = path === '/' ? '' : path;
        const loc = `${DOMAIN}${formattedPath}`;

        xml += `  <url>\n`;
        xml += `    <loc>${loc}</loc>\n`;
        
        // Add alternate links for languages only if separate language routes exist
        if (noPath !== enPath && enPath) {
          langs.forEach(altLang => {
            const altPath = paths[altLang] === '/' ? '' : paths[altLang];
            xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${DOMAIN}${altPath}" />\n`;
          });
          const defaultPath = paths['no'] === '/' ? '' : paths['no'];
          xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}${defaultPath}" />\n`;
        } else {
          const defaultPath = noPath === '/' ? '' : noPath;
          xml += `    <xhtml:link rel="alternate" hreflang="no" href="${DOMAIN}${defaultPath}" />\n`;
          xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}${defaultPath}" />\n`;
        }

        xml += `    <changefreq>${changefreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += `  </url>\n`;
      });
    };

    // 3. Add static pages to sitemap
    staticRoutes.forEach(route => {
      appendUrl(route.no, route.en, route.changefreq, route.priority);
    });

    // 4. Add dynamic product pages
    allProducts.forEach(p => {
      if (p.visible === false) return;
      const id = p.id;
      const noPath = `/produkt/${id}`;
      const enPath = `/product/${id}`;
      appendUrl(noPath, enPath, 'weekly', '0.8');
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

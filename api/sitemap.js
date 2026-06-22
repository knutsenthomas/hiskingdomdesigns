const SITE_ID = process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = process.env.WIX_API_KEY || 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';

const DOMAIN = 'https://hiskingdomdesigns.no';

// Define static routes with their translations
const staticRoutes = [
  {
    no: '/',
    en: '/',
    es: '/',
    priority: '1.0',
    changefreq: 'daily'
  },
  {
    no: '/produkter',
    en: '/products',
    es: '/productos',
    priority: '0.9',
    changefreq: 'daily'
  },
  {
    no: '/om-oss',
    en: '/about',
    es: '/sobre-somos-nosotros', // Wait, let's verify if es is '/sobre-nosotros'
    priority: '0.7',
    changefreq: 'weekly'
  },
  {
    no: '/vart-team',
    en: '/team',
    es: '/equipo',
    priority: '0.6',
    changefreq: 'weekly'
  },
  {
    no: '/frakt-og-retur',
    en: '/shipping',
    es: '/envios',
    priority: '0.6',
    changefreq: 'weekly'
  },
  {
    no: '/faq',
    en: '/faq',
    es: '/preguntas-frecuentes',
    priority: '0.6',
    changefreq: 'weekly'
  },
  {
    no: '/personvern',
    en: '/privacy',
    es: '/privacidad',
    priority: '0.5',
    changefreq: 'monthly'
  },
  {
    no: '/betingelser',
    en: '/terms',
    es: '/condiciones',
    priority: '0.5',
    changefreq: 'monthly'
  }
];

// Correct es for about from localizedRoutes.js is '/sobre-nosotros'
staticRoutes[2].es = '/sobre-nosotros';

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
    const appendUrl = (noPath, enPath, esPath, changefreq, priority) => {
      const paths = { no: noPath, en: enPath, es: esPath };
      const langs = ['no', 'en', 'es'];

      langs.forEach(lang => {
        const currentPath = paths[lang];
        const formattedPath = currentPath === '/' ? '' : currentPath;
        const loc = `${DOMAIN}${formattedPath}`;

        xml += `  <url>\n`;
        xml += `    <loc>${loc}</loc>\n`;
        
        // Add alternate links for all languages
        langs.forEach(altLang => {
          const altPath = paths[altLang] === '/' ? '' : paths[altLang];
          xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${DOMAIN}${altPath}" />\n`;
        });
        
        // Add x-default (using Norwegian as default)
        const defaultPath = paths['no'] === '/' ? '' : paths['no'];
        xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}${defaultPath}" />\n`;

        xml += `    <changefreq>${changefreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += `  </url>\n`;
      });
    };

    // 3. Add static pages to sitemap
    staticRoutes.forEach(route => {
      appendUrl(route.no, route.en, route.es, route.changefreq, route.priority);
    });

    // 4. Add dynamic product pages
    allProducts.forEach(p => {
      if (p.visible === false) return;
      const id = p.id;
      const noPath = `/produkt/${id}`;
      const enPath = `/product/${id}`;
      const esPath = `/producto/${id}`;
      appendUrl(noPath, enPath, esPath, 'weekly', '0.8');
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

import fs from 'fs';
import path from 'path';

const SITE_ID = process.env.WIX_SITE_ID || '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = process.env.WIX_API_KEY || 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';
const DOMAIN = 'https://hiskingdomdesigns.no';

// In-memory cache for products and base HTML
let cachedHtml = null;
let productsCache = { data: null, timestamp: 0 };
const CACHE_TTL_MS = 1000 * 60 * 15; // 15 minutes

const routeTranslations = {
  about: { no: '/om-oss', en: '/about', es: '/sobre-nosotros' },
  team: { no: '/vart-team', en: '/team', es: '/equipo' },
  shipping: { no: '/frakt-og-retur', en: '/shipping', es: '/envios' },
  faq: { no: '/faq', en: '/faq', es: '/preguntas-frecuentes' },
  privacy: { no: '/personvern', en: '/privacy', es: '/privacidad' },
  betingelser: { no: '/betingelser', en: '/terms', es: '/condiciones' },
  cart: { no: '/handlekurv', en: '/cart', es: '/carrito' },
  products: { no: '/produkter', en: '/products', es: '/productos' },
  profile: { no: '/profil', en: '/profile', es: '/perfil' },
  cancellation: { no: '/angre-kjop', en: '/cancel-order', es: '/cancelar-pedido' }
};

const staticContent = {
  home: {
    no: {
      title: 'His Kingdom Designs | Bær troen med stolthet - Norsk Kristen Nettbutikk',
      description: 'Oppdag eksklusive kristne klær, hettegensere, t-skjorter og tilbehør med meningsfulle budskap. Høy kvalitet og rask levering fra Norge.',
      h1: 'Bær troen med stolthet'
    },
    en: {
      title: 'His Kingdom Designs | Wear Your Faith with Pride - Christian Apparel',
      description: 'Discover exclusive Christian clothing, hoodies, t-shirts, and accessories with meaningful messages. Premium quality and fast shipping from Norway.',
      h1: 'Wear Your Faith with Pride'
    },
    es: {
      title: 'His Kingdom Designs | Lleva tu fe con orgullo - Ropa Cristiana',
      description: 'Descubre ropa cristiana exclusiva, sudaderas con capucha, camisetas y accesorios con mensajes significativos. Calidad premium y envío rápido.',
      h1: 'Lleva tu fe con orgullo'
    }
  },
  products: {
    no: {
      title: 'Våre Produkter | His Kingdom Designs',
      description: 'Se hele vårt utvalg av kristne klær, gensere, t-skjorter, kopper og tilbehør. Høy kvalitet med rask levering fra Norge.',
      h1: 'Våre Produkter & Kolleksjoner'
    },
    en: {
      title: 'Our Products | His Kingdom Designs',
      description: 'Browse our full collection of Christian clothing, hoodies, t-shirts, mugs, and accessories. Premium quality with fast delivery.',
      h1: 'Our Products & Collections'
    },
    es: {
      title: 'Nuestros Productos | His Kingdom Designs',
      description: 'Explora nuestra colección completa de ropa cristiana, sudaderas, camisetas, tazas y accesorios.',
      h1: 'Nuestros Productos y Colecciones'
    }
  },
  about: {
    no: {
      title: 'Om Oss | His Kingdom Designs',
      description: 'Lær mer om historien, visjonen og hjertet bak His Kingdom Designs og His Kingdom Ministry.',
      h1: 'Om His Kingdom Designs'
    },
    en: {
      title: 'About Us | His Kingdom Designs',
      description: 'Learn more about the story, vision, and heart behind His Kingdom Designs and His Kingdom Ministry.',
      h1: 'About His Kingdom Designs'
    },
    es: {
      title: 'Sobre Nosotros | His Kingdom Designs',
      description: 'Conoce la historia, la visión y el corazón detrás de His Kingdom Designs y His Kingdom Ministry.',
      h1: 'Sobre His Kingdom Designs'
    }
  },
  team: {
    no: {
      title: 'Vårt Team | His Kingdom Designs',
      description: 'Møt teamet bak His Kingdom Designs og vår lidenskap for å spre evangeliet gjennom meningsfull design.',
      h1: 'Møt Vårt Team'
    },
    en: {
      title: 'Our Team | His Kingdom Designs',
      description: 'Meet the team behind His Kingdom Designs and our passion for spreading the gospel through meaningful design.',
      h1: 'Meet Our Team'
    },
    es: {
      title: 'Nuestro Equipo | His Kingdom Designs',
      description: 'Conoce al equipo detrás de His Kingdom Designs y nuestra pasión por difundir el evangelio.',
      h1: 'Nuestro Equipo'
    }
  },
  shipping: {
    no: {
      title: 'Frakt og Retur | His Kingdom Designs',
      description: 'Informasjon om leveringstid, fraktpriser og enkel retur hos His Kingdom Designs.',
      h1: 'Frakt- og Returinformasjon'
    },
    en: {
      title: 'Shipping and Returns | His Kingdom Designs',
      description: 'Information on delivery times, shipping rates, and easy returns at His Kingdom Designs.',
      h1: 'Shipping & Returns'
    },
    es: {
      title: 'Envíos y Devoluciones | His Kingdom Designs',
      description: 'Información sobre tiempos de entrega, tarifas de envío y devoluciones fáciles en His Kingdom Designs.',
      h1: 'Envíos y Devoluciones'
    }
  },
  faq: {
    no: {
      title: 'Ofte Stilte Spørsmål (FAQ) | His Kingdom Designs',
      description: 'Finn svar på vanlige spørsmål om bestilling, betaling, størrelser og levering hos His Kingdom Designs.',
      h1: 'Ofte Stilte Spørsmål'
    },
    en: {
      title: 'Frequently Asked Questions (FAQ) | His Kingdom Designs',
      description: 'Find answers to frequently asked questions regarding orders, payment, sizes, and shipping at His Kingdom Designs.',
      h1: 'Frequently Asked Questions'
    },
    es: {
      title: 'Preguntas Frecuentes (FAQ) | His Kingdom Designs',
      description: 'Encuentra respuestas a preguntas frecuentes sobre pedidos, pagos, tallas y envíos en His Kingdom Designs.',
      h1: 'Preguntas Frecuentes'
    }
  },
  privacy: {
    no: {
      title: 'Personvernerklæring | His Kingdom Designs',
      description: 'Les om hvordan His Kingdom Designs behandler dine personopplysninger i henhold til GDPR.',
      h1: 'Personvernerklæring'
    },
    en: {
      title: 'Privacy Policy | His Kingdom Designs',
      description: 'Learn how His Kingdom Designs processes your personal data in accordance with GDPR.',
      h1: 'Privacy Policy'
    },
    es: {
      title: 'Política de Privacidad | His Kingdom Designs',
      description: 'Conoce cómo His Kingdom Designs trata tus datos personales de acuerdo con el RGPD.',
      h1: 'Política de Privacidad'
    }
  },
  betingelser: {
    no: {
      title: 'Kjøpsbetingelser | His Kingdom Designs',
      description: 'Vilkår og betingelser for kjøp hos His Kingdom Designs.',
      h1: 'Kjøpsbetingelser'
    },
    en: {
      title: 'Terms of Service | His Kingdom Designs',
      description: 'Terms and conditions for purchases at His Kingdom Designs.',
      h1: 'Terms of Service'
    },
    es: {
      title: 'Términos y Condiciones | His Kingdom Designs',
      description: 'Términos y condiciones de compra en His Kingdom Designs.',
      h1: 'Términos y Condiciones'
    }
  },
  cancellation: {
    no: {
      title: 'Angrerett og Avbestilling | His Kingdom Designs',
      description: 'Informasjon og skjema for angrerett og avbestilling hos His Kingdom Designs.',
      h1: 'Angrerett og Avbestilling'
    },
    en: {
      title: 'Cancellation and Return Policy | His Kingdom Designs',
      description: 'Information and guidelines for cancellations and returns at His Kingdom Designs.',
      h1: 'Cancellation Policy'
    },
    es: {
      title: 'Derecho de Desistimiento | His Kingdom Designs',
      description: 'Información y formulario de desistimiento en His Kingdom Designs.',
      h1: 'Desistimiento'
    }
  }
};

const getBaseHtml = () => {
  if (cachedHtml) return cachedHtml;
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      cachedHtml = fs.readFileSync(p, 'utf-8');
      return cachedHtml;
    }
  }

  return `<!DOCTYPE html><html lang="no"><head><meta charset="UTF-8"><title>His Kingdom Designs</title></head><body><div id="root"></div></body></html>`;
};

const getWixImageUrl = (url, width = 1200, height = 630) => {
  if (!url || typeof url !== 'string') return `${DOMAIN}/hero_fashion.webp`;
  if (url.startsWith('wix:image://')) {
    const match = url.match(/wix:image:\/\/v1\/([^\/]+)\/([^\s#?]+)/);
    if (match && match[1]) {
      const imageId = match[1];
      const filename = match[2].replace(/\.(jpg|jpeg|png|avif|webp)$/i, '.webp');
      return `https://static.wixstatic.com/media/${imageId}/v1/fill/w_${width},h_${height},q_85/${filename}`;
    }
  }
  if (url.includes('static.wixstatic.com/media/')) {
    const mediaPrefix = 'static.wixstatic.com/media/';
    const index = url.indexOf(mediaPrefix);
    const pathAfter = url.substring(index + mediaPrefix.length);
    const segments = pathAfter.split('/');
    const imageId = segments[0];
    return `https://static.wixstatic.com/media/${imageId}/v1/fill/w_${width},h_${height},q_85/image.webp`;
  }
  return url;
};

const fetchProducts = async () => {
  const now = Date.now();
  if (productsCache.data && now - productsCache.timestamp < CACHE_TTL_MS) {
    return productsCache.data;
  }

  try {
    let all = [];
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
            paging: { limit: 100, offset: skip }
          }
        })
      });

      if (!queryRes.ok) break;

      const data = await queryRes.json();
      const items = data.products || [];
      all = all.concat(items);

      if (items.length < 100) hasMore = false;
      else skip += 100;
    }

    productsCache = { data: all, timestamp: now };
    return all;
  } catch (err) {
    console.error('SSR fetchProducts error:', err);
    return productsCache.data || [];
  }
};

const stripHtml = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
};

export default async function handler(req, res) {
  try {
    // 1. Resolve requested path
    const rawUrl = req.url || '/';
    const parsedUrl = new URL(rawUrl, DOMAIN);
    const cleanPath = '/' + parsedUrl.pathname.replace(/^\/+|\/+$/g, '');

    // 2. Detect language
    let lang = 'no';
    if (
      cleanPath.startsWith('/product/') ||
      cleanPath.startsWith('/products') ||
      cleanPath === '/about' ||
      cleanPath === '/team' ||
      cleanPath === '/shipping' ||
      cleanPath === '/privacy' ||
      cleanPath === '/terms' ||
      cleanPath === '/cart' ||
      cleanPath === '/profile' ||
      cleanPath === '/cancel-order'
    ) {
      lang = 'en';
    } else if (
      cleanPath.startsWith('/producto/') ||
      cleanPath.startsWith('/productos') ||
      cleanPath === '/sobre-nosotros' ||
      cleanPath === '/equipo' ||
      cleanPath === '/envios' ||
      cleanPath === '/preguntas-frecuentes' ||
      cleanPath === '/privacidad' ||
      cleanPath === '/condiciones' ||
      cleanPath === '/carrito' ||
      cleanPath === '/perfil' ||
      cleanPath === '/cancelar-pedido'
    ) {
      lang = 'es';
    }

    // 3. Determine Route Type
    let routeKey = null;
    if (cleanPath === '/' || cleanPath === '') {
      routeKey = 'home';
    } else {
      for (const [key, langs] of Object.entries(routeTranslations)) {
        for (const [, pathVal] of Object.entries(langs)) {
          if (cleanPath === pathVal) {
            routeKey = key;
            break;
          }
        }
        if (routeKey) break;
      }
    }

    let isProduct = false;
    let productId = null;
    const productMatch = cleanPath.match(/^\/(produkt|product|producto)\/([^/]+)/);
    if (productMatch) {
      isProduct = true;
      productId = productMatch[2];
    }

    const isCategory = cleanPath.startsWith('/category/');
    const categoryName = isCategory ? cleanPath.replace('/category/', '').replace(/-/g, ' ') : '';

    // 4. Default Meta Data
    let title = 'His Kingdom Designs | Bær troen med stolthet';
    let description = 'Eksklusive kristne klær, hettegensere, t-skjorter og tilbehør med meningsfulle budskap. Høy kvalitet og rask levering fra Norge.';
    let ogImage = `${DOMAIN}/hero_fashion.webp`;
    let ogType = 'website';
    let h1Text = 'His Kingdom Designs';
    let bodySnippet = '<p>Bær troen med stolthet. Norsk kristen klesmerke med fokus på kvalitet og misjon.</p>';
    let extraJsonLd = '';

    // Hreflang alternates
    let hreflangs = [];
    const canonicalUrl = `${DOMAIN}${cleanPath === '/' ? '' : cleanPath}`;

    if (routeKey === 'home') {
      const data = staticContent.home[lang] || staticContent.home.no;
      title = data.title;
      description = data.description;
      h1Text = data.h1;
      hreflangs = [
        { lang: 'no', href: `${DOMAIN}/` },
        { lang: 'en', href: `${DOMAIN}/` },
        { lang: 'es', href: `${DOMAIN}/` },
        { lang: 'x-default', href: `${DOMAIN}/` }
      ];
    } else if (routeKey && staticContent[routeKey]) {
      const data = staticContent[routeKey][lang] || staticContent[routeKey].no;
      title = data.title;
      description = data.description;
      h1Text = data.h1;
      const trans = routeTranslations[routeKey];
      hreflangs = [
        { lang: 'no', href: `${DOMAIN}${trans.no}` },
        { lang: 'en', href: `${DOMAIN}${trans.en}` },
        { lang: 'es', href: `${DOMAIN}${trans.es}` },
        { lang: 'x-default', href: `${DOMAIN}${trans.no}` }
      ];
    } else if (isCategory) {
      const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      title = `${formattedCategory} | His Kingdom Designs`;
      description = `Utforsk vår kolleksjon av ${formattedCategory}. Høy kvalitet og rask levering fra His Kingdom Designs.`;
      h1Text = formattedCategory;
      hreflangs = [
        { lang: 'no', href: `${DOMAIN}${cleanPath}` },
        { lang: 'en', href: `${DOMAIN}${cleanPath}` },
        { lang: 'es', href: `${DOMAIN}${cleanPath}` },
        { lang: 'x-default', href: `${DOMAIN}${cleanPath}` }
      ];
    } else if (isProduct && productId) {
      const products = await fetchProducts();
      const product = products.find(p => p.id === productId || p.slug === productId);

      if (product) {
        title = `${product.name} | His Kingdom Designs`;
        const rawDesc = stripHtml(product.description);
        description = rawDesc.length > 155 ? `${rawDesc.substring(0, 152)}...` : (rawDesc || `Kjøp ${product.name} hos His Kingdom Designs. Rask levering og god kvalitet.`);
        ogImage = getWixImageUrl(product.media?.mainMedia?.image?.url || product.imageUrl);
        ogType = 'product';
        h1Text = product.name;
        
        const priceVal = product.price?.price || product.price || 0;
        bodySnippet = `
          <div class="product-summary" style="margin-top: 1rem;">
            <p class="price" style="font-weight: bold; font-size: 1.25rem; color: #a34e36;">${priceVal} NOK</p>
            <p class="description" style="margin: 1rem 0; line-height: 1.6;">${rawDesc || 'Eksklusivt design fra His Kingdom Designs.'}</p>
            <img src="${ogImage}" alt="${product.name}" width="600" height="600" style="max-width: 100%; height: auto; border-radius: 12px;" />
          </div>
        `;

        extraJsonLd = `
          <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": ${JSON.stringify(product.name)},
            "image": ${JSON.stringify(ogImage)},
            "description": ${JSON.stringify(description)},
            "offers": {
              "@type": "Offer",
              "priceCurrency": "NOK",
              "price": "${priceVal}",
              "availability": "${product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}",
              "url": "${canonicalUrl}"
            }
          }
          </script>
        `;
      } else {
        title = 'Produkt | His Kingdom Designs';
        h1Text = 'Vårt Produkt';
      }

      hreflangs = [
        { lang: 'no', href: `${DOMAIN}/produkt/${productId}` },
        { lang: 'en', href: `${DOMAIN}/product/${productId}` },
        { lang: 'es', href: `${DOMAIN}/producto/${productId}` },
        { lang: 'x-default', href: `${DOMAIN}/produkt/${productId}` }
      ];
    }

    // 5. Navigation Links for Crawler Link Graph
    const navLinksHtml = `
      <nav aria-label="Hovednavigasjon" style="margin-top: 2rem; padding: 1.5rem; background: #f8f6f0; border-radius: 12px;">
        <h2 style="font-size: 1.1rem; margin-bottom: 0.75rem; font-weight: 600;">Utforsk His Kingdom Designs</h2>
        <ul style="display: flex; flex-wrap: wrap; gap: 1rem; list-style: none; padding: 0; margin: 0;">
          <li><a href="/" style="color: #151a21; text-decoration: underline;">Hjem</a></li>
          <li><a href="/produkter" style="color: #151a21; text-decoration: underline;">Alle Produkter</a></li>
          <li><a href="/category/hettegensere" style="color: #151a21; text-decoration: underline;">Hettegensere</a></li>
          <li><a href="/category/t-skjorter" style="color: #151a21; text-decoration: underline;">T-skjorter</a></li>
          <li><a href="/category/kopper" style="color: #151a21; text-decoration: underline;">Kopper</a></li>
          <li><a href="/category/tilbehor" style="color: #151a21; text-decoration: underline;">Tilbehør</a></li>
          <li><a href="/om-oss" style="color: #151a21; text-decoration: underline;">Om Oss</a></li>
          <li><a href="/vart-team" style="color: #151a21; text-decoration: underline;">Vårt Team</a></li>
          <li><a href="/frakt-og-retur" style="color: #151a21; text-decoration: underline;">Frakt og Retur</a></li>
          <li><a href="/faq" style="color: #151a21; text-decoration: underline;">FAQ</a></li>
          <li><a href="/personvern" style="color: #151a21; text-decoration: underline;">Personvern</a></li>
          <li><a href="/betingelser" style="color: #151a21; text-decoration: underline;">Kjøpsbetingelser</a></li>
        </ul>
      </nav>
    `;

    // 6. Build Head Tags
    let headInject = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${canonicalUrl}" />
`;

    hreflangs.forEach(hl => {
      headInject += `    <link rel="alternate" hreflang="${hl.lang}" href="${hl.href}" />\n`;
    });

    headInject += `    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="His Kingdom Designs" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${extraJsonLd}`;

    // 7. Inject into Base HTML Template
    let html = getBaseHtml();

    // Replace HTML lang
    html = html.replace(/<html lang="[^"]*"/i, `<html lang="${lang}"`);

    // Strip static fallback meta tags from template to avoid duplicates
    html = html.replace(/<title>.*?<\/title>/i, '');
    html = html.replace(/<meta name="description"[^>]*>/i, '');
    html = html.replace(/<link rel="canonical"[^>]*>/i, '');
    html = html.replace(/<link rel="alternate"[^>]*hreflang[^>]*>/gi, '');

    html = html.replace('</head>', `${headInject}\n</head>`);

    // Inject semantic crawler markup inside <div id="root">
    const semanticCrawlerHtml = `<div id="root"><header style="padding: 1rem 0;"><a href="/" style="font-size: 1.5rem; font-weight: bold; text-decoration: none; color: #151a21;">His Kingdom Designs</a></header><main style="max-width: 1200px; margin: 0 auto; padding: 1rem;"><h1 style="font-size: 2rem; margin-bottom: 1rem;">${h1Text}</h1>${bodySnippet}${navLinksHtml}</main></div>`;

    html = html.replace(/<div id="root"><\/div>/i, semanticCrawlerHtml);

    // 8. Send Response
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch (error) {
    console.error('SSR Render Handler Error:', error);
    // Fallback to base HTML
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(getBaseHtml());
  }
}

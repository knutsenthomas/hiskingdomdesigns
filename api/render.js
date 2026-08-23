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
      title: 'His Kingdom Designs | Bær troen med stolthet',
      description: 'Oppdag eksklusive kristne klær, hettegensere, t-skjorter og tilbehør med meningsfulle budskap. Høy kvalitet og rask levering fra Norge.',
      h1: 'Bær troen med stolthet'
    },
    en: {
      title: 'His Kingdom Designs | Wear Your Faith with Pride',
      description: 'Discover exclusive Christian clothing, hoodies, t-shirts, and accessories with meaningful messages. Premium quality and fast shipping from Norway.',
      h1: 'Wear Your Faith with Pride'
    },
    es: {
      title: 'His Kingdom Designs | Lleva tu fe con orgullo',
      description: 'Descubre ropa cristiana exclusiva, sudaderas con capucha, camisetas y accesorios con mensajes significativos. Calidad premium y envío rápido.',
      h1: 'Lleva tu fe con orgullo'
    }
  },
  products: {
    no: {
      title: 'Våre Produkter | His Kingdom Designs',
      description: 'Se hele vårt utvalg av kristne klær, gensere, t-skjorter, kopper og tilbehør. Høy kvalitet med rask levering fra norsk nettbutikk.',
      h1: 'Våre Produkter & Kolleksjoner'
    },
    en: {
      title: 'Our Products | His Kingdom Designs',
      description: 'Browse our full collection of Christian clothing, hoodies, t-shirts, mugs, and accessories. Premium quality with fast delivery from Norway.',
      h1: 'Our Products & Collections'
    },
    es: {
      title: 'Nuestros Productos | His Kingdom Designs',
      description: 'Explora nuestra colección completa de ropa cristiana, sudaderas, camisetas, tazas y accesorios con entrega rápida y calidad premium.',
      h1: 'Nuestros Productos y Colecciones'
    }
  },
  about: {
    no: {
      title: 'Om Oss | His Kingdom Designs',
      description: 'Lær mer om historien, visjonen og hjertet bak His Kingdom Designs og His Kingdom Ministry. Vi brenner for å spre troen gjennom design.',
      h1: 'Om His Kingdom Designs'
    },
    en: {
      title: 'About Us | His Kingdom Designs',
      description: 'Learn more about the story, vision, and heart behind His Kingdom Designs and His Kingdom Ministry. Sharing faith through modern apparel.',
      h1: 'About His Kingdom Designs'
    },
    es: {
      title: 'Sobre Nosotros | His Kingdom Designs',
      description: 'Conoce la historia, la visión y el corazón detrás de His Kingdom Designs y His Kingdom Ministry. Difundiendo la fe a través del diseño.',
      h1: 'Sobre His Kingdom Designs'
    }
  },
  team: {
    no: {
      title: 'Vårt Team | His Kingdom Designs',
      description: 'Møt teamet bak His Kingdom Designs og vår lidenskap for å spre evangeliet gjennom meningsfull design og kristen streetwear i Norge.',
      h1: 'Møt Vårt Team'
    },
    en: {
      title: 'Our Team | His Kingdom Designs',
      description: 'Meet the team behind His Kingdom Designs and our passion for spreading the gospel through meaningful design and Christian streetwear.',
      h1: 'Meet Our Team'
    },
    es: {
      title: 'Nuestro Equipo | His Kingdom Designs',
      description: 'Conoce al equipo detrás de His Kingdom Designs y nuestra pasión por difundir el evangelio a través del diseño de ropa cristiana.',
      h1: 'Nuestro Equipo'
    }
  },
  shipping: {
    no: {
      title: 'Frakt og Retur | His Kingdom Designs',
      description: 'Informasjon om leveringstid, fraktpriser og enkel 14 dagers angrerett og retur ved kjøp i nettbutikken His Kingdom Designs.',
      h1: 'Frakt- og Returinformasjon'
    },
    en: {
      title: 'Shipping & Returns | His Kingdom Designs',
      description: 'Information on delivery times, shipping rates, and easy 14-day returns when shopping at His Kingdom Designs Christian apparel.',
      h1: 'Shipping & Returns'
    },
    es: {
      title: 'Envíos y Devoluciones | His Kingdom Designs',
      description: 'Información sobre tiempos de entrega, tarifas de envío y política de devolución fácil de 14 días en His Kingdom Designs.',
      h1: 'Envíos y Devoluciones'
    }
  },
  faq: {
    no: {
      title: 'FAQ - Spørsmål & Svar | His Kingdom Designs',
      description: 'Finn svar på vanlige spørsmål om bestilling, betaling, størrelser og levering hos den norske kristne nettbutikken His Kingdom Designs.',
      h1: 'Ofte Stilte Spørsmål (FAQ)'
    },
    en: {
      title: 'FAQ - Common Questions | His Kingdom Designs',
      description: 'Find answers to common questions about orders, payments, sizing, and shipping for His Kingdom Designs Christian apparel.',
      h1: 'Frequently Asked Questions'
    },
    es: {
      title: 'Preguntas Frecuentes | His Kingdom Designs',
      description: 'Encuentra respuestas a preguntas frecuentes sobre pedidos, pagos, tallas y envíos en la tienda His Kingdom Designs.',
      h1: 'Preguntas Frecuentes'
    }
  },
  privacy: {
    no: {
      title: 'Personvernerklæring | His Kingdom Designs',
      description: 'Les om hvordan His Kingdom Designs samler inn, behandler og beskytter dine personopplysninger i henhold til GDPR og gjeldende lovverk.',
      h1: 'Personvernerklæring'
    },
    en: {
      title: 'Privacy Policy | His Kingdom Designs',
      description: 'Read how His Kingdom Designs collects, processes, and protects your personal data in full compliance with GDPR regulations.',
      h1: 'Privacy Policy'
    },
    es: {
      title: 'Política de Privacidad | His Kingdom Designs',
      description: 'Conoce cómo His Kingdom Designs recopila, procesa y protege tus datos personales de conformidad con el RGPD.',
      h1: 'Política de Privacidad'
    }
  },
  terms: {
    no: {
      title: 'Kjøpsbetingelser | His Kingdom Designs',
      description: 'Salgs- og leveringsbetingelser for bestillinger hos His Kingdom Designs. Trygg handel, 14 dagers angrerett og sikre betalinger.',
      h1: 'Kjøpsbetingelser'
    },
    en: {
      title: 'Terms of Service | His Kingdom Designs',
      description: 'Sales and delivery terms for orders at His Kingdom Designs. Secure shopping, 14-day return policy, and reliable payment methods.',
      h1: 'Terms of Service'
    },
    es: {
      title: 'Condiciones de Compra | His Kingdom Designs',
      description: 'Términos y condiciones de compra en His Kingdom Designs. Compra segura, 14 días de derecho de desistimiento y pagos fiables.',
      h1: 'Condiciones de Compra'
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

const isProductOceaniaExclusive = (p) => {
  if (!p) return false;
  const desc = ((p.description || '') + ' ' + (p.additionalInfoSections?.map(s => s.description).join(' ') || '')).replace(/<[^>]*>/g, ' ');
  const lower = desc.toLowerCase();
  
  return (
    lower.includes('oceania exclusive') ||
    lower.includes('shipping: us, ca and oceania exclusive') ||
    lower.includes('shipping: us, ca & oceania exclusive') ||
    lower.includes('shipping exclusively usa, canada and oceania') ||
    lower.includes('shipping exclusively us, canada and oceania') ||
    lower.includes('shipping: usa, ca and oceania') ||
    lower.includes('usa, canada and oceania') ||
    lower.includes('us, ca and oceania') ||
    lower.includes('us, ca, oceania') ||
    (lower.includes('oceania') && (lower.includes('shipping') || lower.includes('exclusive') || lower.includes('levering')))
  );
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

const categorySeoData = {
  'kristne-klaer': {
    no: {
      title: 'Kristne klær & Streetwear i Norge | His Kingdom Designs',
      description: 'Oppdag eksklusive kristne klær med meningsfulle budskap. Hettegensere, t-skjorter og streetwear med bibelvers. Høy kvalitet og rask levering fra Norge.',
      h1: 'Kristne klær & Streetwear',
      intro: 'Utforsk vårt utvalg av kristne klær for dame, herre og barn. Hvert plagg er nøye designet for å kombinere moderne streetwear-snitt med oppmuntrende budskap og bibelvers.'
    },
    en: {
      title: 'Christian Clothing & Streetwear | His Kingdom Designs',
      description: 'Discover exclusive Christian apparel, hoodies, t-shirts, and faith-based streetwear with biblical messages. High quality, fast shipping from Norway.',
      h1: 'Christian Clothing & Streetwear',
      intro: 'Explore our curated collection of Christian apparel. Designed to share faith with style and comfort.'
    },
    es: {
      title: 'Ropa Cristiana y Streetwear | His Kingdom Designs',
      description: 'Descubre ropa cristiana exclusiva, sudaderas y camisetas con versículos y mensajes de fe. Calidad premium.',
      h1: 'Ropa Cristiana y Streetwear',
      intro: 'Explora nuestra colección de ropa cristiana con mensajes de fe y diseño urbano moderno.'
    }
  },
  'kristne-t-skjorter': {
    no: {
      title: 'Kristne T-skjorter med budskap & kors | His Kingdom Designs',
      description: 'Kjøp kristne t-skjorter i 100% organisk bomull. Stilrene tees med kors, bibelvers og trosbudskap. Norsk design og rask levering.',
      h1: 'Kristne T-skjorter',
      intro: 'Oppdag våre kristne t-skjorter i organisk bomull med stilrene kors, oppmuntrende bibelvers og meningsfylte budskap til hverdagsbruk.'
    },
    en: {
      title: 'Christian T-Shirts & Scripture Tees | His Kingdom Designs',
      description: 'Shop organic cotton Christian t-shirts with crosses, Bible verses, and faith graphics. Fast delivery.',
      h1: 'Christian T-Shirts',
      intro: 'Discover our premium Christian t-shirts crafted from organic cotton with inspiring scripture and faith messages.'
    },
    es: {
      title: 'Camisetas Cristianas con Versículos | His Kingdom Designs',
      description: 'Camisetas cristianas de algodón orgánico con versículos bíblicos y mensajes de fe.',
      h1: 'Camisetas Cristianas',
      intro: 'Descubre nuestras camisetas cristianas con mensajes de fe y citas bíblicas inspiradoras.'
    }
  },
  'kristne-gensere': {
    no: {
      title: 'Kristne gensere & hettegensere (Hoodies) | His Kingdom Designs',
      description: 'Varme og behagelige kristne gensere og hettegensere med Jesus-budskap og bibelvers. Premium kvalitet og rask levering fra Norge.',
      h1: 'Kristne gensere & hettegensere',
      intro: 'Hold deg varm med våre behagelige kristne hettegensere, hoodies og sweatshirts med inspirerende budskap og moderne design.'
    },
    en: {
      title: 'Christian Hoodies & Sweatshirts | His Kingdom Designs',
      description: 'Cozy and stylish Christian hoodies and sweatshirts featuring Jesus and scripture messages. Fast shipping.',
      h1: 'Christian Hoodies & Sweatshirts',
      intro: 'Stay warm with our premium Christian hoodies and sweatshirts designed for comfort and faith expression.'
    },
    es: {
      title: 'Sudaderas Cristianas y Hoodies | His Kingdom Designs',
      description: 'Sudaderas cristianas cómodas y modernas con mensajes de Jesús y versículos bíblicos.',
      h1: 'Sudaderas Cristianas y Hoodies',
      intro: 'Sudaderas y hoodies cristianas de alta calidad para llevar tu fe con comodidad.'
    }
  },
  'kristen-streetwear': {
    no: {
      title: 'Kristen Streetwear & Urban Fashion | His Kingdom Designs',
      description: 'Oppdag urban kristen streetwear: oversized hettegensere, t-skjorter, caps og minimalistisk trosdesign. Bær troen din med stil.',
      h1: 'Kristen Streetwear',
      intro: 'Urban mote møter kristen tro. Utforsk vår streetwear-kolleksjon med oversized hettegensere, t-skjorter, caps og grafiske elementer.'
    },
    en: {
      title: 'Christian Streetwear & Urban Faith Fashion | His Kingdom Designs',
      description: 'Discover urban Christian streetwear: oversized hoodies, graphic tees, caps, and faith-inspired fashion.',
      h1: 'Christian Streetwear',
      intro: 'Urban fashion meets Christian faith. Explore our modern streetwear collection crafted with purpose.'
    },
    es: {
      title: 'Streetwear Cristiano y Moda Urbana | His Kingdom Designs',
      description: 'Moda urbana cristiana: sudaderas oversized, camisetas gráficas y gorras con mensajes de fe.',
      h1: 'Streetwear Cristiano',
      intro: 'Moda urbana y fe cristiana unidas en prendas de alta calidad y diseño contemporáneo.'
    }
  },
  'klaer-med-bibelvers': {
    no: {
      title: 'Klær med bibelvers & kristne sitater | His Kingdom Designs',
      description: 'Se vårt utvalg av klær med bibelvers og skriftsteder fra Bibelen. Johannes 3:16, Salmene, Jesaja og oppmuntrende Guds ord på t-skjorter og gensere.',
      h1: 'Klær med bibelvers',
      intro: 'Bær Guds ord i hverdagen. Våre klær med bibelvers formidler håp, tro og kjærlighet gjennom estetisk og moderne typografi.'
    },
    en: {
      title: 'Bible Verse Clothing & Scripture Apparel | His Kingdom Designs',
      description: 'Shop clothing featuring powerful Bible verses, Psalms, Isaiah, and gospel messages from His Kingdom Designs.',
      h1: 'Bible Verse Clothing',
      intro: 'Wear scripture every day. Beautifully crafted apparel featuring verses from Psalms, John, and Isaiah.'
    },
    es: {
      title: 'Ropa con Versículos Bíblicos | His Kingdom Designs',
      description: 'Colección de ropa y camisetas con versículos de la Biblia y citas cristianas inspiradoras.',
      h1: 'Ropa con Versículos Bíblicos',
      intro: 'Lleva la palabra de Dios cada día con nuestras prendas diseñadas con versículos bíblicos.'
    }
  }
};

export default async function handler(req, res) {
  try {
    // 0. Enforce Canonical Domain (301 redirect www -> non-www)
    const host = req.headers['x-forwarded-host'] || req.headers['host'] || '';
    if (host.startsWith('www.')) {
      res.writeHead(301, {
        Location: `https://hiskingdomdesigns.no${req.url || '/'}`
      });
      res.end();
      return;
    }

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
        { lang: 'x-default', href: `${DOMAIN}/` }
      ];
    } else if (routeKey && staticContent[routeKey]) {
      const data = staticContent[routeKey][lang] || staticContent[routeKey].no;
      title = data.title;
      description = data.description;
      h1Text = data.h1;
      const trans = routeTranslations[routeKey];
      if (trans.no !== trans.en) {
        hreflangs = [
          { lang: 'no', href: `${DOMAIN}${trans.no}` },
          { lang: 'en', href: `${DOMAIN}${trans.en}` },
          { lang: 'es', href: `${DOMAIN}${trans.es}` },
          { lang: 'x-default', href: `${DOMAIN}${trans.no}` }
        ];
      } else {
        hreflangs = [
          { lang: 'no', href: `${DOMAIN}${trans.no}` },
          { lang: 'x-default', href: `${DOMAIN}${trans.no}` }
        ];
      }
    } else if (isCategory) {
      const catSlug = cleanPath.replace('/category/', '').toLowerCase();
      const seoData = categorySeoData[catSlug]?.[lang] || categorySeoData[catSlug]?.no;
      
      const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      const rawTitle = seoData?.title || `${formattedCategory} | His Kingdom Designs`;
      title = rawTitle.length > 58 ? `${rawTitle.substring(0, 55)}...` : rawTitle;
      
      let rawDesc = seoData?.description || `Utforsk vår kolleksjon av ${formattedCategory}. Høy kvalitet og rask levering fra His Kingdom Designs.`;
      if (rawDesc.length < 110) {
        rawDesc = `${rawDesc} Kjøp hos His Kingdom Designs med rask levering og god kvalitet.`;
      }
      description = rawDesc.length > 155 ? `${rawDesc.substring(0, 150).trim()}...` : rawDesc;
      h1Text = seoData?.h1 || formattedCategory;
      
      const products = await fetchProducts();
      let matchedProducts = products;

      if (catSlug === 'kristne-t-skjorter' || catSlug === 't-skjorter' || catSlug === 't-shirts') {
        matchedProducts = products.filter(p => {
          const nameLower = (p.name || '').toLowerCase();
          return nameLower.includes('t-skjorte') || nameLower.includes('tskjorte') || nameLower.includes('t-shirt') || nameLower.includes('tee') || nameLower.includes('trøye');
        });
      } else if (catSlug === 'kristne-gensere' || catSlug === 'gensere' || catSlug === 'genser' || catSlug === 'hettegensere') {
        matchedProducts = products.filter(p => {
          const nameLower = (p.name || '').toLowerCase();
          return nameLower.includes('genser') || nameLower.includes('hoodie') || nameLower.includes('sweatshirt') || nameLower.includes('hettejakke') || nameLower.includes('hettegenser');
        });
      } else if (catSlug === 'kristen-streetwear' || catSlug === 'streetwear') {
        matchedProducts = products.filter(p => {
          const nameLower = (p.name || '').toLowerCase();
          return nameLower.includes('hoodie') || nameLower.includes('genser') || nameLower.includes('oversized') || nameLower.includes('street') || nameLower.includes('caps') || nameLower.includes('hat') || nameLower.includes('joggebukse');
        });
      } else if (catSlug === 'klaer-med-bibelvers' || catSlug === 'bibelvers') {
        matchedProducts = products.filter(p => {
          const nameLower = (p.name || '').toLowerCase();
          const descLower = (p.description || '').toLowerCase();
          return nameLower.includes('vers') || nameLower.includes('psalm') || nameLower.includes('salme') || nameLower.includes('jesaja') || nameLower.includes('joh') || nameLower.includes('john') || nameLower.includes('matteus') || nameLower.includes('korint') || nameLower.includes('ester') || nameLower.includes('mirakel') || nameLower.includes('velsign') || nameLower.includes('gud') || nameLower.includes('jesus') || descLower.includes('bibel') || descLower.includes('vers');
        });
      } else if (catSlug === 'kristne-klaer' || catSlug === 'klær' || catSlug === 'kler' || catSlug === 'klaer') {
        matchedProducts = products.filter(p => {
          const catLower = (p.category || '').toLowerCase();
          return catLower.includes('klær') || catLower.includes('kler') || catLower.includes('clothing');
        });
      }

      if (lang !== 'en') {
        matchedProducts = matchedProducts.filter(p => !isProductOceaniaExclusive(p));
      }

      bodySnippet = `
        <div class="category-summary" style="margin-top: 1rem;">
          <p class="intro-text" style="font-size: 1.1rem; line-height: 1.6; color: #4b5563; margin-bottom: 2rem;">
            ${seoData?.intro || description}
          </p>
          <div class="products-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem;">
            ${matchedProducts.slice(0, 16).map(p => `
              <div class="product-card" style="background: #fff; border-radius: 12px; padding: 1rem; border: 1px solid #e5e7eb;">
                <a href="/produkt/${p.id}" style="text-decoration: none; color: inherit;">
                  <img src="${getWixImageUrl(p.media?.mainMedia?.image?.url || p.imageUrl)}" alt="${p.name}" width="200" height="200" style="width: 100%; height: auto; border-radius: 8px; object-fit: contain;" />
                  <h3 style="font-size: 1rem; margin: 0.75rem 0 0.25rem; font-weight: 600;">${p.name}</h3>
                  <p style="color: #a34e36; font-weight: bold; margin: 0;">${p.price?.price || p.price || ''} NOK</p>
                </a>
              </div>
            `).join('')}
          </div>
        </div>
      `;

      extraJsonLd = `
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": ${JSON.stringify(h1Text)},
          "description": ${JSON.stringify(description)},
          "url": "${canonicalUrl}",
          "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": ${matchedProducts.length},
            "itemListElement": ${JSON.stringify(matchedProducts.slice(0, 10).map((p, idx) => ({
              "@type": "ListItem",
              "position": idx + 1,
              "url": `${DOMAIN}/produkt/${p.id}`,
              "name": p.name,
              "image": getWixImageUrl(p.media?.mainMedia?.image?.url || p.imageUrl)
            })))}
          }
        }
        </script>
      `;

      hreflangs = [
        { lang: 'no', href: `${DOMAIN}${cleanPath}` },
        { lang: 'x-default', href: `${DOMAIN}${cleanPath}` }
      ];
    } else if (isProduct && productId) {
      const products = await fetchProducts();
      const product = products.find(p => p.id === productId || p.slug === productId);

      if (product) {
        const cleanName = (product.name || '').trim();
        if (cleanName.length > 35) {
          title = `${cleanName.substring(0, 32)}... | His Kingdom Designs`;
        } else {
          title = `${cleanName} | His Kingdom Designs`;
        }

        const rawText = stripHtml(product.description || '');
        let prodDesc = rawText;
        if (prodDesc.length < 110) {
          prodDesc = `Kjøp ${cleanName} hos His Kingdom Designs. Rask levering i Norge, førsteklasses kvalitet og kristen design.`;
        } else if (prodDesc.length > 155) {
          prodDesc = `${prodDesc.substring(0, 150).trim()}...`;
        }
        description = prodDesc;
        ogImage = getWixImageUrl(product.media?.mainMedia?.image?.url || product.imageUrl);
        ogType = 'product';
        h1Text = product.name;
        
        const priceVal = product.price?.price || product.price || 0;
        bodySnippet = `
          <div class="product-summary" style="margin-top: 1rem;">
            <p class="price" style="font-weight: bold; font-size: 1.25rem; color: #a34e36;">${priceVal} NOK</p>
            <p class="description" style="margin: 1rem 0; line-height: 1.6;">${description}</p>
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
          <li><a href="/category/kristne-klaer" style="color: #151a21; text-decoration: underline;">Kristne klær</a></li>
          <li><a href="/category/kristne-t-skjorter" style="color: #151a21; text-decoration: underline;">Kristne T-skjorter</a></li>
          <li><a href="/category/kristne-gensere" style="color: #151a21; text-decoration: underline;">Kristne gensere</a></li>
          <li><a href="/category/kristen-streetwear" style="color: #151a21; text-decoration: underline;">Kristen streetwear</a></li>
          <li><a href="/category/klaer-med-bibelvers" style="color: #151a21; text-decoration: underline;">Klær med bibelvers</a></li>
          <li><a href="/category/bilder-og-plakater" style="color: #151a21; text-decoration: underline;">Plakater</a></li>
          <li><a href="/category/cups-bottles" style="color: #151a21; text-decoration: underline;">Kopper & Flasker</a></li>
          <li><a href="/om-oss" style="color: #151a21; text-decoration: underline;">Om Oss</a></li>
          <li><a href="/vart-team" style="color: #151a21; text-decoration: underline;">Vårt Team</a></li>
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

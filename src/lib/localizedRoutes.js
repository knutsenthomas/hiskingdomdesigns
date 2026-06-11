// Dictionary of route translations for Norwegian (no), English (en), and Spanish (es)
export const routeTranslations = {
  about: {
    no: '/om-oss',
    en: '/about',
    es: '/sobre-nosotros'
  },
  team: {
    no: '/vart-team',
    en: '/team',
    es: '/equipo'
  },
  shipping: {
    no: '/frakt-og-retur',
    en: '/shipping',
    es: '/envios'
  },
  faq: {
    no: '/faq',
    en: '/faq',
    es: '/preguntas-frecuentes'
  },
  privacy: {
    no: '/personvern',
    en: '/privacy',
    es: '/privacidad'
  },
  betingelser: {
    no: '/betingelser',
    en: '/terms',
    es: '/condiciones'
  },
  cart: {
    no: '/handlekurv',
    en: '/cart',
    es: '/carrito'
  },
  products: {
    no: '/produkter',
    en: '/products',
    es: '/productos'
  },
  profile: {
    no: '/profil',
    en: '/profile',
    es: '/perfil'
  },
  admin: {
    no: '/admin',
    en: '/admin',
    es: '/admin'
  }
};

/**
 * Get the localized path for a given route key and language.
 * Falls back to the key name prefixed with '/' if not found.
 */
export const getLocalizedPath = (key, lang) => {
  // Strip leading slash if key is provided as '/about'
  const cleanKey = key.startsWith('/') ? key.substring(1) : key;
  
  // Extract productId from product/ prefix
  if (cleanKey.startsWith('product/')) {
    const productId = cleanKey.substring(8); // Length of 'product/' is 8
    let prefix = '/product';
    if (lang === 'no') prefix = '/produkt';
    if (lang === 'es') prefix = '/producto';
    return `${prefix}/${productId}`;
  }

  const translation = routeTranslations[cleanKey];
  
  if (translation) {
    return translation[lang] || translation['no'] || `/${cleanKey}`;
  }
  return key.startsWith('/') ? key : `/${key}`;
};

/**
 * Detect language based on the URL pathname.
 * Returns 'no', 'en', 'es', or null if no translation matches.
 */
export const detectLanguageFromPath = (pathname) => {
  if (!pathname || pathname === '/') return null;
  
  // Normalize pathname (remove trailing slashes, keep leading slash)
  const cleanPath = '/' + pathname.replace(/^\/+|\/+$/g, '');
  
  for (const [key, langs] of Object.entries(routeTranslations)) {
    for (const [lang, pathVal] of Object.entries(langs)) {
      if (cleanPath === pathVal) {
        return lang;
      }
    }
  }
  
  // Also support dynamic subpaths (like /category/cups or /produkt/123)
  if (cleanPath.startsWith('/produkt/') || cleanPath.startsWith('/produkter/')) return 'no';
  if (cleanPath.startsWith('/producto/') || cleanPath.startsWith('/productos/')) return 'es';
  if (cleanPath.startsWith('/product/') || cleanPath.startsWith('/products/')) return 'en';
  
  return null;
};

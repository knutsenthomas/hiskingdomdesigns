// Dictionary of canonical routes for His Kingdom Designs
export const routeTranslations = {
  about: {
    no: '/om-oss',
    en: '/om-oss',
    es: '/om-oss'
  },
  team: {
    no: '/vart-team',
    en: '/vart-team',
    es: '/vart-team'
  },
  shipping: {
    no: '/frakt-og-retur',
    en: '/frakt-og-retur',
    es: '/frakt-og-retur'
  },
  faq: {
    no: '/faq',
    en: '/faq',
    es: '/faq'
  },
  privacy: {
    no: '/personvern',
    en: '/personvern',
    es: '/personvern'
  },
  betingelser: {
    no: '/betingelser',
    en: '/betingelser',
    es: '/betingelser'
  },
  cart: {
    no: '/handlekurv',
    en: '/handlekurv',
    es: '/handlekurv'
  },
  checkout: {
    no: '/kasse',
    en: '/kasse',
    es: '/kasse'
  },
  products: {
    no: '/produkter',
    en: '/produkter',
    es: '/produkter'
  },
  produkter: {
    no: '/produkter',
    en: '/produkter',
    es: '/produkter'
  },
  profile: {
    no: '/profil',
    en: '/profil',
    es: '/profil'
  },
  cancellation: {
    no: '/angre-kjop',
    en: '/angre-kjop',
    es: '/angre-kjop'
  },
  admin: {
    no: '/admin',
    en: '/admin',
    es: '/admin'
  }
};

/**
 * Get the localized path for a given route key and language.
 * Always resolves to canonical 200-OK paths (avoiding internal 301 redirects).
 */
export const getLocalizedPath = (key, lang) => {
  if (!key) return '/';
  // Strip leading slash if key is provided as '/about'
  const cleanKey = key.startsWith('/') ? key.substring(1) : key;
  
  // Extract productId from product/ or produkt/ prefix -> ALWAYS canonical /produkt/:id
  if (cleanKey.startsWith('product/') || cleanKey.startsWith('produkt/') || cleanKey.startsWith('producto/')) {
    const productId = cleanKey.replace(/^(product|produkt|producto)\//, '');
    return `/produkt/${productId}`;
  }

  const translation = routeTranslations[cleanKey];
  
  if (translation) {
    return translation.no || `/${cleanKey}`;
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

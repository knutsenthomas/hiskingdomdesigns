import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { routeTranslations } from '@/lib/localizedRoutes';

/**
 * Custom hook to dynamically update page metadata (Title, Description, and Open Graph tags) for SEO.
 * 
 * @param {string} title Page title
 * @param {string} description Page meta description
 * @param {object} ogProperties Optional Open Graph metadata (e.g. { type: 'product', image: '...' })
 */
export default function useMeta(title, description, ogProperties = null) {
  const { language } = useLanguage();

  useEffect(() => {
    // 1. Update document title
    const formattedTitle = title ? `${title} | His Kingdom Designs` : "His Kingdom Designs";
    document.title = formattedTitle;

    // Helper to get or create a meta tag
    const getOrCreateMetaTag = (nameAttr, propertyAttr) => {
      let element = null;
      if (nameAttr) {
        element = document.querySelector(`meta[name="${nameAttr}"]`);
      } else if (propertyAttr) {
        element = document.querySelector(`meta[property="${propertyAttr}"]`);
      }

      if (!element) {
        element = document.createElement('meta');
        if (nameAttr) element.setAttribute('name', nameAttr);
        if (propertyAttr) element.setAttribute('property', propertyAttr);
        document.head.appendChild(element);
      }
      return element;
    };

    // 2. Update meta description
    if (description) {
      const descMeta = getOrCreateMetaTag('description');
      descMeta.setAttribute('content', description);
    }

    // 3. Update standard Open Graph tags for social sharing
    const ogTitle = getOrCreateMetaTag(null, 'og:title');
    ogTitle.setAttribute('content', formattedTitle);

    if (description) {
      const ogDesc = getOrCreateMetaTag(null, 'og:description');
      ogDesc.setAttribute('content', description);
    }

    const ogUrl = getOrCreateMetaTag(null, 'og:url');
    ogUrl.setAttribute('content', window.location.href);

    // 4. Update optional custom OG properties (e.g., product image, price, etc.)
    if (ogProperties) {
      Object.entries(ogProperties).forEach(([key, val]) => {
        if (val) {
          const ogMeta = getOrCreateMetaTag(null, `og:${key}`);
          ogMeta.setAttribute('content', val);
        }
      });
    }

    // 5. Update Canonical and Hreflang Alternates (SEO & GEO)
    const currentPath = window.location.pathname;
    const cleanPath = '/' + currentPath.replace(/^\/+|\/+$/g, '');

    // Check if the current path is a product details page
    let isProduct = false;
    let productId = null;
    const productMatch = cleanPath.match(/^\/(produkt|product|producto)\/([^/]+)/);
    if (productMatch) {
      isProduct = true;
      productId = productMatch[2];
    }

    // Determine the route key for standard pages
    let routeKey = null;
    if (cleanPath === '/' || cleanPath === '') {
      routeKey = 'home';
    } else {
      for (const [key, langs] of Object.entries(routeTranslations)) {
        for (const [lang, pathVal] of Object.entries(langs)) {
          if (cleanPath === pathVal) {
            routeKey = key;
            break;
          }
        }
        if (routeKey) break;
      }
    }

    const isCategory = cleanPath.startsWith('/category/');

    // Update canonical link
    const canonicalUrl = `https://hiskingdomdesigns.no${cleanPath === '/' ? '' : cleanPath}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Remove existing alternate hreflang tags to prevent duplication
    const existingAlternates = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingAlternates.forEach(el => el.remove());

    const addAlternateLink = (hreflang, path) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', hreflang);
      const formattedPath = path === '/' ? '' : path;
      link.setAttribute('href', `https://hiskingdomdesigns.no${formattedPath}`);
      document.head.appendChild(link);
    };

    // Add new alternate hreflang tags
    if (routeKey === 'home') {
      addAlternateLink('no', '/');
      addAlternateLink('en', '/');
      addAlternateLink('es', '/');
      addAlternateLink('x-default', '/');
    } else if (routeKey && routeTranslations[routeKey]) {
      const translation = routeTranslations[routeKey];
      addAlternateLink('no', translation.no);
      addAlternateLink('en', translation.en);
      addAlternateLink('es', translation.es);
      addAlternateLink('x-default', translation.no); // Default to Norwegian
    } else if (isProduct && productId) {
      addAlternateLink('no', `/produkt/${productId}`);
      addAlternateLink('en', `/product/${productId}`);
      addAlternateLink('es', `/producto/${productId}`);
      addAlternateLink('x-default', `/produkt/${productId}`);
    } else if (isCategory) {
      addAlternateLink('no', cleanPath);
      addAlternateLink('en', cleanPath);
      addAlternateLink('es', cleanPath);
      addAlternateLink('x-default', cleanPath);
    }

    // Update HTML lang attribute dynamically for accessibility and localized search
    document.documentElement.setAttribute('lang', language);

  }, [title, description, ogProperties, language]);
}

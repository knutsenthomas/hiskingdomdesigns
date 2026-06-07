import { useEffect } from 'react';

/**
 * Custom hook to dynamically update page metadata (Title, Description, and Open Graph tags) for SEO.
 * 
 * @param {string} title Page title
 * @param {string} description Page meta description
 * @param {object} ogProperties Optional Open Graph metadata (e.g. { type: 'product', image: '...' })
 */
export default function useMeta(title, description, ogProperties = null) {
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
  }, [title, description, ogProperties]);
}

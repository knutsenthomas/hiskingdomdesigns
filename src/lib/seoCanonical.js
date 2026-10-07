// Public storefront URLs only; checkout and Wix API routes are deliberately excluded.
export const categoryAliases = {
  't-skjorter': 'kristne-t-skjorter', 't-shirts': 'kristne-t-skjorter',
  gensere: 'kristne-gensere', genser: 'kristne-gensere', hettegensere: 'kristne-gensere',
  streetwear: 'kristen-streetwear', bibelvers: 'klaer-med-bibelvers',
  klaer: 'kristne-klaer', kler: 'kristne-klaer', 'klær': 'kristne-klaer',
  plakater: 'kristne-plakater', 'bilder-og-plakater': 'kristne-plakater',
  kopper: 'kristne-kopper', 'cups-bottles': 'kristne-kopper',
  klistermerker: 'kristne-klistermerker', klistremerker: 'kristne-klistermerker',
  stickers: 'kristne-klistermerker',
};

export function canonicalCategoryPath(pathname) {
  const match = pathname.match(/^\/category\/([^/]+)\/?$/);
  if (!match) return pathname;
  let slug;
  try { slug = decodeURIComponent(match[1]).toLowerCase(); } catch { return pathname; }
  const target = categoryAliases[slug];
  return target ? `/category/${target}` : pathname;
}

export function canonicalProductPath(product) {
  return `/produkt/${encodeURIComponent(product._id || product.id)}`;
}

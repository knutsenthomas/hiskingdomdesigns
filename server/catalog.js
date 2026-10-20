import { createClient, OAuthStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';
import { productTaxonomy, isProductOceaniaExclusive } from '../src/lib/catalogSelection.js';

const clientId = '82b2b70d-fb70-4b76-abfd-a2a70f38ac06';
export function createCatalogLoader(clientFactory = () => createClient({modules:{products,collections},auth:OAuthStrategy({clientId})})) {
  let cached;
  let pending;
  return async function loadCatalog() {
    if (cached && Date.now() - cached.time < 15 * 60 * 1000) return cached.value;
    if (pending) return pending;
    pending = (async () => {
      const client = clientFactory();
      const readAll = async query => {
        const all = [];
        for (let skip = 0; ; skip += 100) {
          const page = await query().skip(skip).limit(100).find();
          if (!Array.isArray(page.items)) throw new Error('Incomplete Wix catalog response');
          all.push(...page.items);
          if (page.items.length < 100) return all;
        }
      };
      const [items, categories] = await Promise.all([
        readAll(() => client.products.queryProducts().descending('createdDate')),
        readAll(() => client.collections.queryCollections())
      ]);
      const names = Object.fromEntries(categories.map(c => [c._id, c.name]));
      const catalogProducts = items.filter(p => p.visible !== false).map(p => {
        const price = p.price?.discountedPrice ?? p.price?.price ?? 0;
        const original = p.price?.price ?? 0;
        const taxonomy = productTaxonomy(p, names);
        return {...p, id:p._id || p.id, ...taxonomy,
          isSale:price < original || taxonomy.subcategories.some(c => c.toUpperCase() === 'SALG'),
          isOceaniaExclusive:isProductOceaniaExclusive(p)};
      });
      const value = {products:catalogProducts, collections:categories.filter(c => c.name?.toLowerCase() !== 'all products').map(c=>({...c,id:c._id}))};
      cached = {time:Date.now(),value};
      return value;
    })();
    try { return await pending; } finally { pending = null; }
  };
}
export const loadCatalog = createCatalogLoader();

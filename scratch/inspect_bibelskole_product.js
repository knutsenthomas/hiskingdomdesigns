import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';

const wixClient = createClient({
  modules: {
    products,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  console.log('Querying all products...');
  const res = await wixClient.products.queryProducts().limit(100).find();
  
  if (res.items && res.items.length > 0) {
    console.log(`Found ${res.items.length} total products. Filtering...`);
    for (const item of res.items) {
      const name = item.name || '';
      if (name.toLowerCase().includes('varna') || name.toLowerCase().includes('bibel') || name.toLowerCase().includes('skole') || name.toLowerCase().includes('evangelie')) {
        console.log('--- Matching Product ---');
        console.log('Product Found:', item.name);
        console.log('ID:', item._id);
        console.log('Collections/Categories:', JSON.stringify(item.collections, null, 2));
        console.log('Custom fields or other properties:', JSON.stringify({
          sku: item.sku,
          ribbon: item.ribbon,
          productType: item.productType,
        }, null, 2));
      }
    }
  } else {
    console.log('No products found in the store.');
  }
}

main().catch(console.error);

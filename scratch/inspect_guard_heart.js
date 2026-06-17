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
  console.log('Querying all products from Wix store with pagination...');
  try {
    let allProducts = [];
    let query = wixClient.products.queryProducts().limit(100);
    let res = await query.find();
    allProducts = allProducts.concat(res.items);
    
    while (res.hasNext()) {
      res = await res.next();
      allProducts = allProducts.concat(res.items);
    }
    
    console.log(`Total products fetched: ${allProducts.length}`);
    const matches = allProducts.filter(item => 
      item.name.toLowerCase().includes('guard') || 
      item.name.toLowerCase().includes('heart')
    );
    
    console.log(`Found ${matches.length} matching products:`);
    for (const item of matches) {
      console.log(`\n- Name: "${item.name}"`);
      console.log(`  ID: ${item._id}`);
      console.log(`  Main Image: ${item.media?.mainMedia?.image?.url}`);
      console.log(`  Media Items count:`, item.media?.items?.length);
      console.log(`  Media Items urls:`, item.media?.items?.map(i => i.image?.url || i.video?.files?.[0]?.url));
    }
  } catch (err) {
    console.error('Search failed:', err.message);
  }
}

main().catch(console.error);

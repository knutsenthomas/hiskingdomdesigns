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
  let res = await wixClient.products.queryProducts().limit(100).find();
  let allItems = [...res.items];
  while (res.hasNext()) {
    res = await res.next();
    allItems = [...allItems, ...res.items];
  }
  console.log(`Found ${allItems.length} products total.`);
  
  const targets = allItems.filter(p => 
    p.name.toLowerCase().includes('kingdom life') || 
    p.name.toLowerCase().includes('velsigne')
  );

  console.log(`Matching target products: ${targets.length}`);
  targets.forEach(p => {
    console.log(`\n===================================`);
    console.log(`Name: ${p.name}`);
    console.log(`ID: ${p._id}`);
    console.log(`Media mainMedia:`, JSON.stringify(p.media?.mainMedia, null, 2));
  });
}

main().catch(console.error);

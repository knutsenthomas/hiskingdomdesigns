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

const targets = [
  'Kingdom Life',
  'Floral',
  'Grace',
  'Disciple',
  'velsigne',
  'Klistermerke',
  'Guds Fred',
  'Beanie',
  'Phone Case',
  'Tote Bag',
  'Salme 23'
];

async function main() {
  console.log('Querying all products...');
  let res = await wixClient.products.queryProducts().limit(100).find();
  let allItems = [...res.items];
  while (res.hasNext()) {
    res = await res.next();
    allItems = [...allItems, ...res.items];
  }
  console.log(`Found ${allItems.length} products total.`);

  targets.forEach(keyword => {
    console.log(`\n--- Matches for "${keyword}": ---`);
    const matches = allItems.filter(p => p.name.toLowerCase().includes(keyword.toLowerCase()));
    if (matches.length === 0) {
      console.log('  No matches found.');
    } else {
      matches.slice(0, 3).forEach(p => {
        console.log(`  - Name: ${p.name}`);
        console.log(`    Image URL: ${p.media?.mainMedia?.image?.url}`);
      });
    }
  });
}

main().catch(console.error);

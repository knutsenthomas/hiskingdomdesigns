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
  console.log('Querying all products to look for size measurements...');
  const res = await wixClient.products.queryProducts().limit(100).find();
  
  let count = 0;
  for (const item of res.items) {
    const desc = item.description || '';
    if (desc.toLowerCase().includes('measurements') || desc.toLowerCase().includes('kroppslengde') || desc.toLowerCase().includes('brystvidde')) {
      count++;
      console.log(`\n================== PRODUCT ${count}: ${item.name} ==================`);
      console.log(desc);
    }
  }
}

main().catch(console.error);

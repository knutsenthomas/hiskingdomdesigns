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
  console.log('Querying for Praise the Lord...');
  try {
    const res = await wixClient.products.queryProducts().contains('name', 'Praise the Lord').find();
    console.log(JSON.stringify(res.items, null, 2));
  } catch (err) {
    console.error('Query failed:', err.message);
  }
}

main().catch(console.error);

import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';

const client = createClient({
  modules: { products },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  const res = await client.products.queryProducts().limit(5).find();
  const product = res.items[0];
  console.log('Product keys:', Object.keys(product));
  console.log('Full product JSON:', JSON.stringify(product, null, 2));
}

main().catch(console.error);

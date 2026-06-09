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
  const id = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
  const item = await wixClient.products.getProduct(id);
  console.log('Product Details:');
  console.log(JSON.stringify(item, null, 2));
}

main().catch(console.error);

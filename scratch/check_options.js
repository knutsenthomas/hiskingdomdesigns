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
  const res = await wixClient.products.getProduct('4d1004f2-ab8f-22d7-8e62-08df7e014f27');
  console.log('Product:', JSON.stringify(res.product || res, null, 2));
}

main().catch(console.error);

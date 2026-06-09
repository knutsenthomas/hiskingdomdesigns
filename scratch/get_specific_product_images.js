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
  const ids = [
    '05527eb8-68f0-8292-ac72-44874f1795f4', // Baseball Cap
    'bfed2b58-37bc-4d20-b11a-8c025294a73e'  // Hoodie
  ];
  for (const id of ids) {
    try {
      const p = await wixClient.products.getProduct(id);
      console.log(`Name: ${p.product.name}`);
      console.log(`Image URL: ${p.product.media?.mainMedia?.image?.url}`);
    } catch (e) {
      console.error(`Error for ${id}:`, e.message);
    }
  }
}

main().catch(console.error);

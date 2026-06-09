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
  const response = await wixClient.products.queryProducts().limit(100).find();
  response.items.forEach(p => {
    console.log(`Product: "${p.name}"`);
    console.log(`  Image: ${p.media?.mainMedia?.image?.url}`);
  });
}

main().catch(console.error);

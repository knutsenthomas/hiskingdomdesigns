import { createClient, OAuthStrategy } from '@wix/sdk';
import { collections } from '@wix/stores';

const wixClient = createClient({
  modules: {
    collections,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  const response = await wixClient.collections.queryCollections().limit(100).find();
  response.items.forEach(c => {
    if (c.media?.mainMedia?.image || c.numberOfProducts > 0) {
      console.log(`Name: "${c.name}", Slug: "${c.slug}"`);
      console.log(`  Image object:`, JSON.stringify(c.media?.mainMedia?.image || null));
    }
  });
}

main().catch(console.error);

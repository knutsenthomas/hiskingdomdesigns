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
  console.log('Fetching collections from Wix...');
  const response = await wixClient.collections.queryCollections().limit(100).find();
  console.log(`Total collections fetched: ${response.items.length}`);
  response.items.forEach(c => {
    console.log(`- ID: ${c._id}, Name: "${c.name}", Slug: "${c.slug}"`);
  });
}

main().catch(console.error);

import { createClient, OAuthStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';

const wixClient = createClient({
  modules: {
    products,
    collections,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  console.log('Querying products and collections...');
  const collectionsList = await wixClient.collections.queryCollections().limit(100).find();
  const collectionsMap = {};
  collectionsList.items.forEach(c => {
    collectionsMap[c._id] = c.name;
  });

  let response = await wixClient.products.queryProducts().limit(100).find();
  let allItems = [...response.items];
  while (response.hasNext()) {
    response = await response.next();
    allItems = [...allItems, ...response.items];
  }
  console.log(`Fetched ${allItems.length} products total.`);

  const mapped = allItems.map(item => {
    const nameLower = item.name.toLowerCase();
    const resolvedCollections = item.collectionIds?.map(id => collectionsMap[id]).filter(Boolean) || [];
    const isBestseller = resolvedCollections.includes('Bestselgere') || resolvedCollections.includes('Populære produkter');
    return {
      id: item._id,
      name: item.name,
      image: item.media?.mainMedia?.image?.url || '',
      isBestseller: isBestseller,
      collections: resolvedCollections
    };
  });

  const bestsellers = mapped.filter(p => p.isBestseller);
  console.log(`\nFound ${bestsellers.length} bestsellers in Wix products.`);
  bestsellers.forEach(p => {
    console.log(`- ID: ${p.id}, Name: ${p.name}, Image: ${p.image}, Collections: ${p.collections.join(', ')}`);
  });
}

main().catch(console.error);

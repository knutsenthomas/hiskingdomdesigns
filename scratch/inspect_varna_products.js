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
  const collectionId = '00759154-2fea-b819-3f33-2d667c6d2fd0';
  console.log('Querying products in collection:', collectionId);
  
  const res = await wixClient.products.queryProducts()
    .eq('collectionIds', collectionId)
    .find();
    
  console.log(`Found ${res.items ? res.items.length : 0} products.`);
  if (res.items) {
    res.items.forEach(item => {
      console.log('Product Name:', item.name);
      console.log('Product ID:', item._id);
      console.log('Collections:', JSON.stringify(item.collections, null, 2));
    });
  }
}

main().catch(console.error);

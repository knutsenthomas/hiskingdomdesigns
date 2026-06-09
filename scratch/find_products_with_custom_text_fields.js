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
  console.log('Querying products with custom text fields...');
  let response = await wixClient.products.queryProducts().limit(100).find();
  let allItems = [...response.items];
  while (response.hasNext()) {
    response = await response.next();
    allItems = [...allItems, ...response.items];
  }

  const withFields = allItems.filter(p => p.customTextFields && p.customTextFields.length > 0);
  console.log(`Found ${withFields.length} products with custom text fields:`);
  withFields.forEach(p => {
    console.log(`- ID: ${p._id}, Name: ${p.name}`);
    console.log('  Fields:', JSON.stringify(p.customTextFields, null, 2));
    console.log('  Options:', JSON.stringify(p.productOptions, null, 2));
  });
}

main().catch(console.error);

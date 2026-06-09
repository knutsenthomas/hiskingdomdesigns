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
  console.log('Querying products to find one with variants...');
  const res = await wixClient.products.queryProducts().limit(100).find();
  const prod = res.items.find(p => p.manageVariants === true);
  if (prod) {
    console.log('Found product with variants:');
    console.log(`- ID: ${prod._id}`);
    console.log(`- Name: ${prod.name}`);
    console.log(`- Options:`, JSON.stringify(prod.productOptions, null, 2));
    console.log(`- First Variant Choices:`, JSON.stringify(prod.variants?.[0]?.choices, null, 2));
    console.log(`- First Variant ID:`, prod.variants?.[0]?._id);
  } else {
    console.log('No products with manageVariants === true found.');
  }
}

main().catch(console.error);

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
  console.log('Querying products from Wix store...');
  try {
    const res = await wixClient.products.queryProducts().limit(100).find();
    console.log(`Found ${res.items.length} products:`);
    for (const item of res.items) {
      console.log(`\n- Name: "${item.name}"`);
      console.log(`  ID: ${item._id}`);
      console.log(`  Price: ${item.price?.price}`);
      console.log(`  ManageVariants: ${item.manageVariants}`);
      console.log(`  ProductOptions:`, JSON.stringify(item.productOptions?.map(o => ({ name: o.name, optionType: o.optionType, choicesCount: o.choices?.length })), null, 2));
      if (item.manageVariants && item.variants) {
        console.log(`  Variants (first 3):`, JSON.stringify(item.variants.slice(0, 3).map(v => ({ id: v._id, choices: v.choices, stock: v.stock })), null, 2));
      }
    }
  } catch (err) {
    console.error('Query failed:', err.message);
  }
}

main().catch(console.error);

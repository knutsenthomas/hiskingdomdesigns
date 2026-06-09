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
  console.log('Searching for specific products in Wix...');
  try {
    const res = await wixClient.products.queryProducts().limit(100).find();
    const matches = res.items.filter(item => 
      item.name.toLowerCase().includes('praise') || 
      item.name.toLowerCase().includes('fader') ||
      item.name.toLowerCase().includes('t-shirt') ||
      item.name.toLowerCase().includes('tskjorte')
    );
    console.log(`Found ${matches.length} matching products:`);
    for (const item of matches) {
      console.log(`\n- Name: "${item.name}"`);
      console.log(`  ID: ${item._id}`);
      console.log(`  ManageVariants: ${item.manageVariants}`);
      console.log(`  ProductOptions:`, JSON.stringify(item.productOptions?.map(o => ({ name: o.name, optionType: o.optionType, choices: o.choices?.map(c => ({ value: c.value, description: c.description })) })), null, 2));
      if (item.manageVariants && item.variants) {
        console.log(`  Variants (first 3):`, JSON.stringify(item.variants.slice(0, 3).map(v => ({ id: v._id, choices: v.choices, stock: v.stock })), null, 2));
      }
    }
  } catch (err) {
    console.error('Search failed:', err.message);
  }
}

main().catch(console.error);

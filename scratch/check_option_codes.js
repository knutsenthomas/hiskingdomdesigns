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
  console.log('Fetching all products to inspect options...');
  try {
    const res = await wixClient.products.queryProducts().limit(100).find();
    const uniqueOptions = new Set();
    res.items.forEach(p => {
      p.productOptions?.forEach(opt => {
        uniqueOptions.add(`${opt.name} (${opt.optionType})`);
      });
    });
    console.log('Unique options found in database:');
    uniqueOptions.forEach(opt => console.log(` - ${opt}`));
  } catch (err) {
    console.error('Query failed:', err.message);
  }
}

main().catch(console.error);

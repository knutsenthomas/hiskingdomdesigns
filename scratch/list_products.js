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
  console.log('Querying products...');
  const res = await wixClient.products.queryProducts().limit(20).find();
  res.items.forEach(p => {
    console.log(`- ID: ${p._id}, Name: ${p.name}, Type: ${p.productType}, InStock: ${p.stock.inStock}, Visible: ${p.visible}`);
  });
}

main().catch(console.error);

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
  const id = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
  const item = await wixClient.products.getProduct(id);
  const option = item.product.productOptions[0];
  console.log('Option Name:', option.name);
  console.log('Choices:');
  option.choices.forEach(c => {
    const codes = [];
    for (let i = 0; i < c.value.length; i++) {
      codes.push(c.value.charCodeAt(i));
    }
    console.log(`- Value: "${c.value}" (length: ${c.value.length})`);
    console.log(`  Codes: ${JSON.stringify(codes)}`);
  });
}

main().catch(console.error);

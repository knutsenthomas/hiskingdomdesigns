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
  const title = item.product.customTextFields[0].title;
  console.log('Title:', title);
  console.log('Char codes:');
  const codes = [];
  for (let i = 0; i < title.length; i++) {
    codes.push(title.charCodeAt(i));
  }
  console.log(JSON.stringify(codes));
}

main().catch(console.error);

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
  const productId = 'd1e7976b-0087-2849-08c7-8639237fc92b'; // Ny skapning - Hettejakke
  console.log('Fetching product details for ID:', productId);
  
  const res = await wixClient.products.getProduct(productId);
  if (res && res.product) {
    console.log('Product Name:', res.product.name);
    console.log('Description HTML:');
    console.log('-------------------------------------------');
    console.log(res.product.description);
    console.log('-------------------------------------------');
  } else {
    console.log('Product not found.');
  }
}

main().catch(console.error);

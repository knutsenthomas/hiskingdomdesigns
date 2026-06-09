import { createClient, OAuthStrategy } from '@wix/sdk';
import { currentCart } from '@wix/ecom';

const wixClient = createClient({
  modules: {
    currentCart,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  console.log('Fetching cart status...');
  try {
    const cart = await wixClient.currentCart.getCurrentCart();
    console.log('Cart ID:', cart._id);
    console.log('Line items count:', cart.lineItems?.length || 0);
    cart.lineItems?.forEach((item, idx) => {
      console.log(`  [${idx}] ${item.productName?.translated || item.productName?.original} - Qty: ${item.quantity}`);
      console.log(`      Options: ${JSON.stringify(item.catalogReference.options)}`);
    });
  } catch (err) {
    console.error('Failed to get cart:', err.message);
  }
}

main().catch(console.error);

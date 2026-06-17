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
  console.log('=== TEST 1: getCurrentCart ===');
  let cart;
  try {
    cart = await wixClient.currentCart.getCurrentCart();
    console.log('getCurrentCart keys:', Object.keys(cart));
    console.log('getCurrentCart sample (lineItems count):', cart.lineItems?.length || 0);
  } catch (err) {
    console.log('getCurrentCart failed:', err.message);
  }

  console.log('=== TEST 2: addToCurrentCart ===');
  try {
    const res = await wixClient.currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: 'ac9164e3-51cc-7616-7786-03b3f78de1e0',
          },
          quantity: 1,
        }
      ]
    });
    console.log('addToCurrentCart keys:', Object.keys(res));
    if (res.cart) {
      console.log('res.cart keys:', Object.keys(res.cart));
    }
  } catch (err) {
    console.log('addToCurrentCart failed:', err.message);
  }
}

main().catch(console.error);

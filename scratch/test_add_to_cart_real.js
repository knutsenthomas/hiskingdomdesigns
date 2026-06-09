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
  // Use a real product ID from the stores catalog: ac9164e3-51cc-7616-7786-03b3f78de1e0
  const itemId = 'ac9164e3-51cc-7616-7786-03b3f78de1e0';
  
  console.log('1. Clearing current cart...');
  try {
    const cart = await wixClient.currentCart.getCurrentCart();
    if (cart.lineItems && cart.lineItems.length > 0) {
      await wixClient.currentCart.removeLineItemsFromCurrentCart(cart.lineItems.map(item => item._id));
      console.log('Cart cleared.');
    }
  } catch (err) {
    console.log('Cart was empty or error:', err.message);
  }

  console.log('\n2. Testing adding a real product without options...');
  try {
    const res = await wixClient.currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
          },
          quantity: 1,
        }
      ]
    });
    console.log('Response cart lineItems count:', res.cart?.lineItems?.length || 0);
    console.log('Line items:', JSON.stringify(res.cart?.lineItems || [], null, 2));
  } catch (err) {
    console.error('Failed to add to cart:', err.message);
  }
}

main().catch(console.error);

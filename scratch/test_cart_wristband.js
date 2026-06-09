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
  const itemId = 'a6923c4f-5cdb-7ebc-c6ef-228cac3c669e'; // Optionless wristband
  
  console.log('Clearing current cart...');
  try {
    const cart = await wixClient.currentCart.getCurrentCart();
    if (cart.lineItems && cart.lineItems.length > 0) {
      await wixClient.currentCart.removeLineItemsFromCurrentCart(cart.lineItems.map(item => item._id));
      console.log('Cart cleared.');
    }
  } catch (err) {
    console.log('Cart was empty or failed:', err.message);
  }

  console.log('Adding wristband to cart...');
  try {
    const added = await wixClient.currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
          },
          quantity: 1
        }
      ]
    });
    console.log('Result lineItems count:', added.cart.lineItems.length);
    if (added.cart.lineItems.length > 0) {
      console.log('Success! Item in cart:', added.cart.lineItems[0].productName.original);
    }
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main().catch(console.error);

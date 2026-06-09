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
  const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
  
  console.log('1. Clearing current cart...');
  try {
    const cart = await wixClient.currentCart.getCurrentCart();
    if (cart.lineItems && cart.lineItems.length > 0) {
      await wixClient.currentCart.removeLineItemsFromCurrentCart(cart.lineItems.map(item => item._id));
      console.log('Cart cleared.');
    } else {
      console.log('Cart was already empty.');
    }
  } catch (err) {
    console.log('Cart fetch/clear failed (probably empty):', err.message);
  }

  console.log('\n2. Adding item to current cart...');
  try {
    const added = await wixClient.currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              options: {
                "Choose Your Option": "Mystery Norsk/English Sticker"
              }
            },
            customTextFields: [
              {
                title: "Bestille en spesiell sticker? Fortell oss hvilken!",
                value: "Vilkårlig motiv"
              }
            ]
          },
          quantity: 2,
        }
      ]
    });
    console.log('Added successfully. Cart lineItems count:', added.cart.lineItems.length);
    console.log('Line items in cart:', JSON.stringify(added.cart.lineItems, null, 2));
  } catch (err) {
    console.error('Failed to add to cart:', err.message);
    return;
  }

  console.log('\n3. Creating checkout from current cart...');
  try {
    const checkoutResult = await wixClient.currentCart.createCheckoutFromCurrentCart({
      channelType: 'WEB'
    });
    console.log('Checkout created. Result:', JSON.stringify(checkoutResult, null, 2));
  } catch (err) {
    console.error('Failed to create checkout from cart:', err.message);
  }
}

main().catch(console.error);

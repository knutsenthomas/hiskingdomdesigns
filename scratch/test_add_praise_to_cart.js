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
  const plakatId = '64bc2f66-b418-7794-9661-4d16c575d764';
  const tshirtId = '9e6a4b75-d8da-753e-ea15-93e76bf63e27'; // Praise the Lord Classic Tee

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

  console.log('\n2. Adding Plakat and T-shirt to Wix currentCart...');
  const lineItems = [
    {
      catalogReference: {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: plakatId
      },
      quantity: 1
    },
    {
      catalogReference: {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: tshirtId,
        options: {
          options: {
            "Farge": "#a211e1",
            "Størrelse": "XS"
          }
        }
      },
      quantity: 1
    }
  ];

  try {
    const res = await wixClient.currentCart.addToCurrentCart({
      lineItems
    });
    console.log('Success! Wix currentCart updated.');
    console.log('Line items count in cart:', res.cart?.lineItems?.length || 0);
    res.cart?.lineItems?.forEach((item, idx) => {
      console.log(`  [${idx}] ${item.productName?.translated || item.productName?.original} - Qty: ${item.quantity}`);
    });
  } catch (err) {
    console.error('Failed to add to cart:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
  }
}

main().catch(console.error);

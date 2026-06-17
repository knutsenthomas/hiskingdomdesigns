import { createClient, OAuthStrategy } from '@wix/sdk';
import { currentCart, checkout } from '@wix/ecom';
import { redirects } from '@wix/redirects';

const wixClient = createClient({
  modules: {
    currentCart,
    checkout,
    redirects,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  const plakatId = '64bc2f66-b418-7794-9661-4d16c575d764';
  const tshirtId = '9e6a4b75-d8da-753e-ea15-93e76bf63e27'; // Praise the Lord Classic Tee

  console.log('1. Adding items to Wix currentCart...');
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
            "Farge": "Lilla",
            "Størrelse": "XS"
          }
        }
      },
      quantity: 1
    }
  ];

  const cartRes = await wixClient.currentCart.addToCurrentCart({ lineItems });
  console.log('Cart updated. Cart ID:', cartRes.cart._id);
  console.log('Cart line items:');
  cartRes.cart.lineItems.forEach(item => {
    console.log(`  - ${item.productName?.translated || item.productName?.original} (Qty: ${item.quantity})`);
  });

  console.log('\n2. Creating checkout from current cart...');
  const checkoutRes = await wixClient.currentCart.createCheckoutFromCurrentCart({
    channelType: 'WEB'
  });
  console.log('Checkout response:', JSON.stringify(checkoutRes, null, 2));

  console.log('\n3. Creating redirect session for this checkout...');
  const redirectRes = await wixClient.redirects.createRedirectSession({
    ecomCheckout: {
      checkoutId: checkoutRes.checkoutId
    },
    callbacks: {
      postFlowUrl: 'https://hiskingdomdesigns.no/cart',
      thankYouPageUrl: 'https://hiskingdomdesigns.no/profile'
    }
  });
  console.log('Redirect URL:', redirectRes.fullUrl || redirectRes.redirectSession?.fullUrl);
}

main().catch(console.error);

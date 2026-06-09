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
  const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
  
  console.log('1. Adding item to current cart...');
  try {
    await wixClient.currentCart.addToCurrentCart({
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
    console.log('Added successfully.');
  } catch (err) {
    console.error('Failed to add to cart:', err.message);
  }

  console.log('\n2. Creating checkout from current cart...');
  let checkoutId;
  try {
    const res = await wixClient.currentCart.createCheckoutFromCurrentCart({
      channelType: 'WEB'
    });
    checkoutId = res.checkoutId || res._id || res.checkout?._id;
    console.log('Checkout created from cart. ID:', checkoutId);
  } catch (err) {
    console.error('Failed to create checkout from cart:', err.message);
    return;
  }

  console.log('\n3. Creating redirect session...');
  try {
    const redirectSession = await wixClient.redirects.createRedirectSession({
      ecomCheckout: {
        checkoutId: checkoutId
      },
      callbacks: {
        postFlowUrl: 'https://hiskingdomdesigns.vercel.app/cart',
        thankYouPageUrl: 'https://hiskingdomdesigns.vercel.app/profile'
      }
    });
    const redirectUrl = redirectSession.fullUrl || redirectSession.redirectSession?.fullUrl;
    console.log('Redirect URL:', redirectUrl);
  } catch (err) {
    console.error('Redirect Session failed:', err.message);
  }
}

main().catch(console.error);

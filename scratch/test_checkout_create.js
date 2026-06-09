import { createClient, OAuthStrategy } from '@wix/sdk';
import { checkout } from '@wix/ecom';
import { redirects } from '@wix/redirects';

const wixClient = createClient({
  modules: {
    checkout,
    redirects,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
  
  console.log('Creating checkout...');
  let checkoutId;
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
          },
          quantity: 1,
        }
      ],
      channelType: 'WEB'
    });
    checkoutId = res._id;
    console.log('Checkout created successfully:', checkoutId);
  } catch (err) {
    console.error('Checkout failed:', err.message);
    return;
  }

  console.log('Creating redirect session...');
  try {
    const redirectSession = await wixClient.redirects.createRedirectSession({
      ecomCheckout: {
        checkoutId: checkoutId
      },
      callbacks: {
        postFlowUrl: 'https://localhost:3000/cart',
        thankYouPageUrl: 'https://localhost:3000/profile'
      }
    });
    console.log('Redirect Session response:', JSON.stringify(redirectSession, null, 2));
  } catch (err) {
    console.error('Redirect Session failed:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
    else console.log('Full error:', err);
  }
}

main().catch(console.error);

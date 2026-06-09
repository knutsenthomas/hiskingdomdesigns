import { createClient, OAuthStrategy } from '@wix/sdk';
import { checkout } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import fetch from 'node-fetch';

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
  
  console.log('1. Creating checkout...');
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

  console.log('2. Creating redirect session...');
  let redirectUrl;
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
    redirectUrl = redirectSession.fullUrl || redirectSession.redirectSession?.fullUrl;
    console.log('Redirect URL:', redirectUrl);
  } catch (err) {
    console.error('Redirect Session failed:', err.message);
    return;
  }

  if (!redirectUrl) {
    console.error('No redirect URL found.');
    return;
  }

  console.log('3. Fetching redirect URL to see response...');
  let nextUrl = redirectUrl;
  let response;
  
  for (let i = 0; i < 5; i++) {
    console.log(`\nStep ${i+1} fetching: ${nextUrl}`);
    response = await fetch(nextUrl, { redirect: 'manual' });
    console.log('Status:', response.status);
    const location = response.headers.get('location');
    console.log('Location header:', location);
    
    if (!location) {
      const text = await response.text();
      console.log('No location header. Response body preview:', text.substring(0, 500));
      break;
    }
    
    // Resolve relative locations if any
    if (location.startsWith('/')) {
      const urlObj = new URL(nextUrl);
      nextUrl = urlObj.origin + location;
    } else {
      nextUrl = location;
    }
  }
}

main().catch(console.error);

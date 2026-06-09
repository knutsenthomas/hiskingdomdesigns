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
  const itemId = 'a6923c4f-5cdb-7ebc-c6ef-228cac3c669e'; // Optionless physical product
  
  console.log('1. Creating checkout with 1 item...');
  let checkoutResult;
  try {
    checkoutResult = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
          },
          quantity: 2,
        }
      ],
      channelType: 'WEB'
    });
    console.log('Checkout created. ID:', checkoutResult._id);
    console.log('Full created checkout response:', JSON.stringify(checkoutResult, null, 2));
  } catch (err) {
    console.error('Failed to create checkout:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
    return;
  }

  const checkoutId = checkoutResult._id;

  console.log('\n2. Fetching checkout by ID to verify it exists and has items...');
  try {
    const fetched = await wixClient.checkout.getCheckout(checkoutId);
    console.log('Fetched Checkout ID:', fetched._id);
    console.log('Fetched Line items:', JSON.stringify(fetched.lineItems, null, 2));
  } catch (err) {
    console.error('Failed to fetch checkout:', err.message);
  }

  console.log('\n3. Creating redirect session for checkout...');
  try {
    const redirectSession = await wixClient.redirects.createRedirectSession({
      ecomCheckout: {
        checkoutId: checkoutId
      },
      callbacks: {
        postFlowUrl: 'https://www.hiskingdomdesigns.no/cart',
        thankYouPageUrl: 'https://www.hiskingdomdesigns.no/profile'
      }
    });
    console.log('Redirect Session response:', JSON.stringify(redirectSession, null, 2));
    const url = redirectSession.fullUrl || redirectSession.redirectSession?.fullUrl;
    console.log('\nGenerated Redirect URL:\n', url);
  } catch (err) {
    console.error('Failed to create redirect session:', err.message);
  }
}

main().catch(console.error);

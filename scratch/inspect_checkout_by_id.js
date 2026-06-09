import { createClient, OAuthStrategy } from '@wix/sdk';
import { checkout } from '@wix/ecom';

const wixClient = createClient({
  modules: {
    checkout,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  const checkoutId = 'ca727402-c56e-4b51-8973-c31e3956e548';
  console.log(`Fetching checkout details for ID: ${checkoutId}...`);
  try {
    const res = await wixClient.checkout.getCheckout(checkoutId);
    console.log('Checkout retrieved:');
    console.log(JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Failed to get checkout:', err.message);
    if (err.details) {
      console.error('Details:', JSON.stringify(err.details, null, 2));
    }
  }
}

main().catch(console.error);

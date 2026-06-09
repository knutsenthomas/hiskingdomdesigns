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
  const checkoutId = 'ca727402-4791-4549-90e5-9cf3226e9c23';
  console.log('Fetching checkout:', checkoutId);
  try {
    const res = await wixClient.checkout.getCheckout(checkoutId);
    console.log('Checkout response:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Failed to get checkout:', err.message);
  }
}

main().catch(console.error);

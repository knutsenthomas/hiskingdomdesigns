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
  const itemId = '3e73238f-61cc-982c-08f0-3f33534faa30';
  const variantId = '7c20abe6-ca99-4caf-9797-a5bf8d5a8a01';
  
  console.log('Creating checkout with variant...');
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              variantId: variantId
            }
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result lineItems count:', res.lineItems.length);
    if (res.lineItems.length > 0) {
      console.log('Item in checkout:', res.lineItems[0].productName);
    }
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main().catch(console.error);

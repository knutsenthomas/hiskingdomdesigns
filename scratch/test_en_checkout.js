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
  const tshirtId = '9e6a4b75-d8da-753e-ea15-93e76bf63e27'; // Praise the Lord Tee
  
  console.log('Creating checkout with English option names...');
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: tshirtId,
            options: {
              options: {
                "Color": "Purple",
                "Size": "XS"
              }
            }
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Success! Checkout ID:', res._id);
    console.log('Line items count:', res.lineItems.length);
    res.lineItems.forEach(item => {
      console.log(`  - ${item.productName?.translated || item.productName?.original} (Qty: ${item.quantity})`);
    });
  } catch (err) {
    console.error('Failed to create checkout:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
  }
}

main().catch(console.error);

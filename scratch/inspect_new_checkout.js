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
  // Use a real product ID from the stores catalog
  const itemId = 'ac9164e3-51cc-7616-7786-03b3f78de1e0';
  
  console.log('1. Creating checkout...');
  let checkoutObj;
  try {
    checkoutObj = await wixClient.checkout.createCheckout({
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
    console.log('Checkout created successfully.');
  } catch (err) {
    console.error('Checkout creation failed:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
    return;
  }

  console.log('\n2. Inspecting checkout details...');
  console.log('Checkout ID:', checkoutObj._id);
  console.log('Checkout State:', checkoutObj.state);
  console.log('Totals:', JSON.stringify(checkoutObj.priceSummary, null, 2));
  console.log('Line Items:', JSON.stringify(checkoutObj.lineItems, null, 2));
  console.log('Checkout Problems/Issues:', JSON.stringify(checkoutObj.problems || [], null, 2));
}

main().catch(console.error);

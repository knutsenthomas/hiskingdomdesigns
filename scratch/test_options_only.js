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
  const itemId = '4d1004f2-ab8f-22d7-8e62-08df7e014f27';

  // Option Structure 1: Flat options: options: { "Klistremerke sett": "1" }
  console.log('Testing Structure 1 (Flat options directly under options)...');
  try {
    const res1 = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              "Klistremerke sett": "1"
            }
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result 1 lineItems:', res1.lineItems.length);
  } catch (err) {
    console.log('Failed 1:', err.message);
  }

  // Option Structure 2: Nested options: options: { options: { "Klistremerke sett": "1" } }
  console.log('\nTesting Structure 2 (Nested options.options)...');
  try {
    const res2 = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              options: {
                "Klistremerke sett": "1"
              }
            }
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result 2 lineItems:', res2.lineItems.length);
  } catch (err) {
    console.log('Failed 2:', err.message);
  }

  // Option Structure 3: Nested choices: options: { choices: { "Klistremerke sett": "1" } }
  console.log('\nTesting Structure 3 (Nested options.choices)...');
  try {
    const res3 = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              choices: {
                "Klistremerke sett": "1"
              }
            }
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result 3 lineItems:', res3.lineItems.length);
  } catch (err) {
    console.log('Failed 3:', err.message);
  }

  // Option Structure 4: NO options passed at all
  console.log('\nTesting Structure 4 (No options passed)...');
  try {
    const res4 = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result 4 lineItems:', res4.lineItems.length);
  } catch (err) {
    console.log('Failed 4:', err.message);
  }
}

main().catch(console.error);

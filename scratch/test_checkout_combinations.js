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

const tshirtId = '9e6a4b75-d8da-753e-ea15-93e76bf63e27';

async function testCombination(name, options) {
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: tshirtId,
            options: {
              options
            }
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log(`- Combination "${name}": success! Line items count: ${res.lineItems.length}`);
  } catch (err) {
    console.log(`- Combination "${name}": failed! Error: ${err.message}`);
  }
}

async function main() {
  console.log('Testing combinations...');
  
  // 1. Norwegian keys, Norwegian values
  await testCombination('NO keys, NO values', {
    "Farge": "Lilla",
    "Størrelse": "XS"
  });

  // 2. Norwegian keys, English values
  await testCombination('NO keys, EN values', {
    "Farge": "Purple",
    "Størrelse": "XS"
  });

  // 3. English keys, Norwegian values
  await testCombination('EN keys, NO values', {
    "Color": "Lilla",
    "Size": "XS"
  });

  // 4. English keys, English values
  await testCombination('EN keys, EN values', {
    "Color": "Purple",
    "Size": "XS"
  });
}

main().catch(console.error);

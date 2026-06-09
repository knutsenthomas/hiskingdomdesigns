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
  const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';

  // Structure A: options and customTextFields nested INSIDE catalogReference
  console.log('Testing Structure A (Nested inside catalogReference)...');
  try {
    const resA = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              options: {
                "Choose Your Option": "Mystery Norsk/English Sticker"
              }
            },
            customTextFields: [
              {
                title: "Bestille en spesiell sticker? Fortell oss hvilken!",
                value: "Vilkårlig motiv"
              }
            ]
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result A lineItems:', resA.lineItems.length);
  } catch (err) {
    console.log('Failed A:', err.message);
  }

  // Structure B: options and customTextFields outside catalogReference (at lineItem root)
  console.log('\nTesting Structure B (At lineItem root)...');
  try {
    const resB = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId
          },
          options: {
            options: {
              "Choose Your Option": "Mystery Norsk/English Sticker"
            }
          },
          customTextFields: [
            {
              title: "Bestille en spesiell sticker? Fortell oss hvilken!",
              value: "Vilkårlig motiv"
            }
          ],
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result B lineItems:', resB.lineItems.length);
  } catch (err) {
    console.log('Failed B:', err.message);
  }

  // Structure C: options nested in catalogReference, customTextFields outside
  console.log('\nTesting Structure C (options inside catalogReference, customTextFields outside)...');
  try {
    const resC = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              options: {
                "Choose Your Option": "Mystery Norsk/English Sticker"
              }
            }
          },
          customTextFields: [
            {
              title: "Bestille en spesiell sticker? Fortell oss hvilken!",
              value: "Vilkårlig motiv"
            }
          ],
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result C lineItems:', resC.lineItems.length);
  } catch (err) {
    console.log('Failed C:', err.message);
  }

  // Structure D: catalogReference.options is flat key-value, customTextFields outside
  console.log('\nTesting Structure D (options flat inside catalogReference, customTextFields outside)...');
  try {
    const resD = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              "Choose Your Option": "Mystery Norsk/English Sticker"
            }
          },
          customTextFields: [
            {
              title: "Bestille en spesiell sticker? Fortell oss hvilken!",
              value: "Vilkårlig motiv"
            }
          ],
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result D lineItems:', resD.lineItems.length);
  } catch (err) {
    console.log('Failed D:', err.message);
  }
}

main().catch(console.error);

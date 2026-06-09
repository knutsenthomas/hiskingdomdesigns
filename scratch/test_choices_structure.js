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

  // Structure E: choices inside catalogReference.options, customTextFields inside catalogReference
  console.log('Testing Structure E (choices inside options, customTextFields inside catalogReference)...');
  try {
    const resE = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              choices: {
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
    console.log('Result E lineItems:', resE.lineItems.length);
  } catch (err) {
    console.log('Failed E:', err.message);
  }

  // Structure F: choices inside catalogReference.options, customTextFields outside catalogReference (at lineItem root)
  console.log('\nTesting Structure F (choices inside options, customTextFields outside at lineItem root)...');
  try {
    const resF = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              choices: {
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
    console.log('Result F lineItems:', resF.lineItems.length);
    if (resF.lineItems.length > 0) {
      console.log('Success! ResF line items:', JSON.stringify(resF.lineItems, null, 2));
    }
  } catch (err) {
    console.log('Failed F:', err.message);
  }
}

main().catch(console.error);

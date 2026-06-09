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

  console.log('Testing Structure with freeTextSettings.value inside catalogReference...');
  try {
    const res = await wixClient.checkout.createCheckout({
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
                freeTextSettings: {
                  value: "Vilkårlig motiv"
                }
              }
            ]
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });
    console.log('Result lineItems count:', res.lineItems.length);
    console.log('Calculation Errors:', JSON.stringify(res.calculationErrors, null, 2));
    if (res.lineItems.length > 0) {
      console.log('Success! Line items:', JSON.stringify(res.lineItems, null, 2));
    } else {
      console.log('Full checkout response:', JSON.stringify(res, null, 2));
    }
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main().catch(console.error);

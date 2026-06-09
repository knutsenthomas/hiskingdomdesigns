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
  const itemId = '8ad0fd79-4c27-4d18-61e9-3d0f441be21a';
  const appId = '215238eb-22a5-4c36-9e7b-e7c08025e04e';

  console.log('Testing other sticker product 8ad0fd79-4c27-4d18-61e9-3d0f441be21a...');
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId,
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
    console.log('Result lineItems count:', res.lineItems.length);
    if (res.lineItems.length > 0) {
      console.log('Success! Line items:', JSON.stringify(res.lineItems, null, 2));
    } else {
      console.log('Validation errors:', JSON.stringify(res.calculationErrors, null, 2));
    }
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

main().catch(console.error);

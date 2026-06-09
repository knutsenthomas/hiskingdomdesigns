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
  const appId = '215238eb-22a5-4c36-9e7b-e7c08025e04e';
  const title = "Bestille en spesiell sticker? Fortell oss hvilken!";
  const val = "Vilkårlig motiv";

  console.log('Testing exact map structure for customTextFields...');

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
              },
              customTextFields: {
                [title]: val
              }
            }
          },
          quantity: 1
        }
      ],
      channelType: 'WEB'
    });

    if (res.lineItems && res.lineItems.length > 0) {
      console.log('[SUCCESS] Added customized sticker successfully!');
      console.log('Line items response:', JSON.stringify(res.lineItems, null, 2));
    } else {
      console.log('[FAILED] added item but lineItems is empty');
      console.log('Full checkout response:', JSON.stringify(res, null, 2));
    }
  } catch (err) {
    console.error('[ERROR] Failed to create checkout:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
  }
}

main().catch(console.error);

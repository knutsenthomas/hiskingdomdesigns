import { createClient, OAuthStrategy } from '@wix/sdk';
import { currentCart } from '@wix/ecom';

const wixClient = createClient({
  modules: {
    currentCart,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
  
  try {
    console.log('Adding item to current cart...');
    await wixClient.currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
            options: {
              options: {
                "Choose Your Option": "Mystery Norsk/English Sticker"
              },
              customTextFields: {
                "Bestille en spesiell sticker? Fortell oss hvilken!": "Vilkårlig motiv"
              }
            }
          },
          quantity: 1
        }
      ]
    });

    console.log('Estimating totals...');
    const res = await wixClient.currentCart.estimateCurrentCartTotals({
      shippingAddress: { country: 'NO', postalCode: '4580', city: 'Lyngdal' }
    });

    console.log('Estimate response keys:', Object.keys(res));
    console.log('priceSummary:', JSON.stringify(res.priceSummary, null, 2));
    console.log('shippingInfo:', JSON.stringify(res.shippingInfo, null, 2));
    console.log('eligibleShippingOptions:', JSON.stringify(res.eligibleShippingOptions, null, 2));
  } catch (err) {
    console.error('Failed:', err);
  }
}

main().catch(console.error);

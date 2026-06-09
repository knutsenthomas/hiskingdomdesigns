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
    console.log('[SUCCESS] Added to cart');

    // Test estimates
    const addresses = [
      { country: 'NO' },
      { country: 'NO', postalCode: '0001', city: 'Oslo' },
      { country: 'NO', postalCode: '4580', city: 'Lyngdal' }
    ];

    for (const addr of addresses) {
      try {
        console.log('Estimating with address:', JSON.stringify(addr));
        const res = await wixClient.currentCart.estimateCurrentCartTotals({
          shippingAddress: addr
        });
        console.log('  Shipping cost:', res.priceSummary?.shipping?.amount);
        console.log('  Total cost:', res.priceSummary?.total?.amount);
      } catch (err) {
        console.error('  Failed:', err.message, JSON.stringify(err.details || err));
      }
    }
  } catch (err) {
    console.error('Failed main:', err);
  }
}

main().catch(console.error);

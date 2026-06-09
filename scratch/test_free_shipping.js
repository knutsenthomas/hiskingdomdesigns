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
  const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef'; // 10 kr sticker
  
  try {
    console.log('Adding 200 items (2000 kr) to current cart...');
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
          quantity: 200
        }
      ]
    });
    console.log('[SUCCESS] Added to cart');

    // Test estimates
    const res = await wixClient.currentCart.estimateCurrentCartTotals({
      shippingAddress: { country: 'NO' }
    });
    console.log('  Shipping cost:', res.priceSummary?.shipping?.amount);
    console.log('  Subtotal cost:', res.priceSummary?.subtotal?.amount);
    console.log('  Total cost:', res.priceSummary?.total?.amount);
  } catch (err) {
    console.error('Failed:', err);
  }
}

main().catch(console.error);

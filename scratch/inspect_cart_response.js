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
  const appId = '215238eb-22a5-4c36-9e7b-e7c08025e04e';
  const title = "Bestille en spesiell sticker? Fortell oss hvilken!";
  const val = "Vilkårlig motiv";

  console.log('Adding product to current cart...');
  try {
    const res = await wixClient.currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            appId,
            catalogItemId: itemId,
            options: {
              options: {
                "Choose Your Option": "Mystery Norsk/English Sticker"
              }
            }
          },
          customTextFields: [
            {
              title: title,
              value: val
            }
          ],
          quantity: 1
        }
      ]
    });
    console.log('Cart Response Keys:', Object.keys(res));
    console.log('Cart:', JSON.stringify(res.cart, null, 2));
  } catch (err) {
    console.error('Error adding to cart:', err);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
  }
}

main().catch(console.error);

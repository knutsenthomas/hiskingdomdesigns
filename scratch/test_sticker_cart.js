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

async function runTest(label, lineItem) {
  console.log(`\nTesting cart: ${label}...`);
  try {
    const res = await wixClient.currentCart.addToCurrentCart({
      lineItems: [lineItem]
    });
    console.log(`[SUCCESS] ${label} - added item, cart total items:`, res.cart.lineItems.length);
    return true;
  } catch (err) {
    console.log(`[ERROR] ${label} - Status ${err.status || 'unknown'}: ${err.message}`);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
    return false;
  }
}

async function main() {
  const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
  const appId = '215238eb-22a5-4c36-9e7b-e7c08025e04e';
  const title = "Bestille en spesiell sticker? Fortell oss hvilken!";
  const val = "Vilkårlig motiv";

  // Test 1: options + customTextFields inside catalogReference
  await runTest('10-pack Sticker with custom text and options', {
    catalogReference: {
      appId,
      catalogItemId: '8ad0fd79-4c27-4d18-61e9-3d0f441be21a',
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
  });
}

main().catch(console.error);

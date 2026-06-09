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

async function testCheckout(label, lineItems) {
  console.log(`\n--- Test: ${label} ---`);
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems,
      channelType: 'WEB'
    });
    console.log(`Success! Checkout ID: ${res._id}`);
    console.log(`Line items count in response: ${res.lineItems.length}`);
    res.lineItems.forEach((item, idx) => {
      console.log(`  [${idx}] ${item.productName?.translated || item.productName?.original} - Qty: ${item.quantity}`);
    });
  } catch (err) {
    console.error(`Failed: ${err.message}`);
    if (err.details) {
      console.error('Details:', JSON.stringify(err.details, null, 2));
    }
  }
}

async function main() {
  const plakatId = '64bc2f66-b418-7794-9661-4d16c575d764';
  const tshirtId = '094e286f-767f-4aa2-b03b-4050ea1f12d3';

  // Option 1: Using options (color & size) matching the choices
  const itemsWithOptions1 = [
    {
      catalogReference: {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: plakatId,
      },
      quantity: 1
    },
    {
      catalogReference: {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: tshirtId,
        options: {
          options: {
            "Color": "Black",
            "Size": "M"
          }
        }
      },
      quantity: 1
    }
  ];

  // Option 2: Using variantId (from variant matching "Black" and "M")
  // Let's first search or assume a variantId, or try first variant ID if known
  // In search_specific_products.js, first variant choices were "Color": "Ice Grey", "Size": "S"
  // with variantId: "e7c6413b-8cac-4522-8f83-392df770188d"
  const itemsWithVariantId = [
    {
      catalogReference: {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: plakatId,
      },
      quantity: 1
    },
    {
      catalogReference: {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: tshirtId,
        options: {
          variantId: "e7c6413b-8cac-4522-8f83-392df770188d"
        }
      },
      quantity: 1
    }
  ];

  await testCheckout("Standard options mapping (Black / M)", itemsWithOptions1);
  await testCheckout("Variant ID mapping (Ice Grey / S)", itemsWithVariantId);
}

main().catch(console.error);

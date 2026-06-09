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

async function runTest(label, lineItem) {
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems: [lineItem],
      channelType: 'WEB'
    });
    if (res.lineItems && res.lineItems.length > 0) {
      console.log(`[SUCCESS] ${label}`);
      console.log('Line items response:', JSON.stringify(res.lineItems, null, 2));
      return true;
    } else {
      console.log(`[FAILED] ${label} - lineItems is empty`);
      return false;
    }
  } catch (err) {
    console.log(`[ERROR] ${label} - ${err.message}`);
    return false;
  }
}

async function main() {
  const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
  const appId = '215238eb-22a5-4c36-9e7b-e7c08025e04e';
  const title = "Bestille en spesiell sticker? Fortell oss hvilken!";
  const val = "Vilkårlig motiv";

  // Test 1: variantId + customTextFields inside catalogReference
  console.log('Testing Test 1 (variantId + customTextFields inside catalogReference)...');
  await runTest('variantId + customTextFields inside catalogReference', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        variantId: "00000000-0000-0000-0000-000000000000"
      },
      customTextFields: [
        {
          title: title,
          value: val
        }
      ]
    },
    quantity: 1
  });

  // Test 2: variantId + options + customTextFields inside catalogReference
  console.log('\nTesting Test 2 (variantId + options + customTextFields inside)...');
  await runTest('variantId + options + customTextFields inside', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        variantId: "00000000-0000-0000-0000-000000000000",
        options: {
          "Choose Your Option": "Mystery Norsk/English Sticker"
        }
      },
      customTextFields: [
        {
          title: title,
          value: val
        }
      ]
    },
    quantity: 1
  });

  // Test 3: variantId + customTextFields at lineItem root
  console.log('\nTesting Test 3 (variantId + customTextFields at lineItem root)...');
  await runTest('variantId + customTextFields at lineItem root', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        variantId: "00000000-0000-0000-0000-000000000000"
      }
    },
    customTextFields: [
      {
        title: title,
        value: val
      }
    ],
    quantity: 1
  });
}

main().catch(console.error);

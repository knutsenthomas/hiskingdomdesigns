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
      console.log(`[SUCCESS] ${label} - added item successfully!`);
      console.log('Result LineItem:', JSON.stringify(res.lineItems[0], null, 2));
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

  // Let's test customTextFields at lineItem root with different options structures
  
  // Test 1: options: { options: { ... } } (Our standard working format)
  await runTest('1. customTextFields at root + options.options', {
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
  });

  // Test 2: options: { choices: { ... } }
  await runTest('2. customTextFields at root + options.choices', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        choices: {
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
  });

  // Test 3: options: { "Choose Your Option": ... } (flat)
  await runTest('3. customTextFields at root + options flat', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        "Choose Your Option": "Mystery Norsk/English Sticker"
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

  // Test 4: options: { variantId: "00000000-0000-0000-0000-000000000000" }
  await runTest('4. customTextFields at root + options.variantId', {
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

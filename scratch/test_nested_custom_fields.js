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

  // 1. Structure 1: customTextFields nested inside catalogReference.options (with nested options.options)
  console.log('Testing Structure 1...');
  await runTest('customTextFields nested in options.options', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        options: {
          "Choose Your Option": "Mystery Norsk/English Sticker"
        },
        customTextFields: [
          {
            title: "Bestille en spesiell sticker? Fortell oss hvilken!",
            value: "Vilkårlig motiv"
          }
        ]
      }
    },
    quantity: 1
  });

  // 2. Structure 2: customTextFields nested inside catalogReference.options (with flat options)
  console.log('\nTesting Structure 2...');
  await runTest('customTextFields nested in options flat', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        "Choose Your Option": "Mystery Norsk/English Sticker",
        customTextFields: [
          {
            title: "Bestille en spesiell sticker? Fortell oss hvilken!",
            value: "Vilkårlig motiv"
          }
        ]
      }
    },
    quantity: 1
  });

  // 3. Structure 3: customTextFields nested inside catalogReference.options (with choices)
  console.log('\nTesting Structure 3...');
  await runTest('customTextFields nested in options.choices', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        choices: {
          "Choose Your Option": "Mystery Norsk/English Sticker"
        },
        customTextFields: [
          {
            title: "Bestille en spesiell sticker? Fortell oss hvilken!",
            value: "Vilkårlig motiv"
          }
        ]
      }
    },
    quantity: 1
  });

  // 4. Structure 4: customTextFields in choices
  console.log('\nTesting Structure 4...');
  await runTest('customTextFields inside choices', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        choices: {
          "Choose Your Option": "Mystery Norsk/English Sticker",
          customTextFields: [
            {
              title: "Bestille en spesiell sticker? Fortell oss hvilken!",
              value: "Vilkårlig motiv"
            }
          ]
        }
      }
    },
    quantity: 1
  });
}

main().catch(console.error);

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
      console.log('Returned line items:', JSON.stringify(res.lineItems, null, 2));
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

  console.log('Testing custom text field with value at the same level as freeTextSettings...');
  
  await runTest('freeTextSettings.key = title, value at same level', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
        options: {
          "Choose Your Option": "Mystery Norsk/English Sticker"
        }
      },
      customTextFields: [
        {
          freeTextSettings: {
            key: title
          },
          value: val
        }
      ]
    },
    quantity: 1
  });

  await runTest('title = title, value at same level', {
    catalogReference: {
      appId,
      catalogItemId: itemId,
      options: {
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
}

main().catch(console.error);

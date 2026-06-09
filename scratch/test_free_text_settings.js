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

  // Test combinations for customTextFields nested inside catalogReference
  const structures = [
    {
      label: "freeTextSettings with key and value",
      customTextFields: [
        {
          freeTextSettings: {
            key: title,
            value: val
          }
        }
      ]
    },
    {
      label: "freeTextSettings with key and text",
      customTextFields: [
        {
          freeTextSettings: {
            key: title,
            text: val
          }
        }
      ]
    },
    {
      label: "customTextFields as flat key-value object array (using key instead of title)",
      customTextFields: [
        {
          key: title,
          value: val
        }
      ]
    },
    {
      label: "customTextFields as flat title-value object array (using title instead of key)",
      customTextFields: [
        {
          title: title,
          value: val
        }
      ]
    },
    {
      label: "customTextFields with just title and freeTextSettings.value",
      customTextFields: [
        {
          title: title,
          freeTextSettings: {
            value: val
          }
        }
      ]
    },
    {
      label: "customTextFields with just key and freeTextSettings.value",
      customTextFields: [
        {
          key: title,
          freeTextSettings: {
            value: val
          }
        }
      ]
    }
  ];

  for (const struct of structures) {
    console.log(`\nTesting: ${struct.label} (INSIDE)...`);
    const lineItemInside = {
      catalogReference: {
        appId,
        catalogItemId: itemId,
        options: {
          options: {
            "Choose Your Option": "Mystery Norsk/English Sticker"
          }
        },
        customTextFields: struct.customTextFields
      },
      quantity: 1
    };
    const success = await runTest(`INSIDE: ${struct.label}`, lineItemInside);
    if (success) return;
  }

  for (const struct of structures) {
    console.log(`\nTesting: ${struct.label} (OUTSIDE)...`);
    const lineItemOutside = {
      catalogReference: {
        appId,
        catalogItemId: itemId,
        options: {
          options: {
            "Choose Your Option": "Mystery Norsk/English Sticker"
          }
        }
      },
      customTextFields: struct.customTextFields,
      quantity: 1
    };
    const success = await runTest(`OUTSIDE: ${struct.label}`, lineItemOutside);
    if (success) return;
  }

  console.log('\nAll tests completed.');
}

main().catch(console.error);

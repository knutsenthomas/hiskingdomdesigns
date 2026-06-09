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

  const structures = [
    {
      label: "desc lines outside with modifierDescriptionLine: true",
      lineItem: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: {
              "Choose Your Option": "Mystery Norsk/English Sticker"
            }
          }
        },
        descriptionLines: [
          {
            name: { original: title },
            plainText: { original: val },
            lineType: "PLAIN_TEXT",
            plainTextValue: { original: val },
            modifierDescriptionLine: true
          }
        ],
        quantity: 1
      }
    },
    {
      label: "desc lines outside with modifierDescriptionLine: false",
      lineItem: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: {
              "Choose Your Option": "Mystery Norsk/English Sticker"
            }
          }
        },
        descriptionLines: [
          {
            name: { original: title },
            plainText: { original: val },
            lineType: "PLAIN_TEXT",
            plainTextValue: { original: val },
            modifierDescriptionLine: false
          }
        ],
        quantity: 1
      }
    },
    {
      label: "desc lines inside catalogReference with modifierDescriptionLine: true",
      lineItem: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: {
              "Choose Your Option": "Mystery Norsk/English Sticker"
            }
          },
          descriptionLines: [
            {
              name: { original: title },
              plainText: { original: val },
              lineType: "PLAIN_TEXT",
              plainTextValue: { original: val },
              modifierDescriptionLine: true
            }
          ]
        },
        quantity: 1
      }
    },
    {
      label: "desc lines at root with simple shape (translated too)",
      lineItem: {
        catalogReference: {
          appId,
          catalogItemId: itemId,
          options: {
            options: {
              "Choose Your Option": "Mystery Norsk/English Sticker"
            }
          }
        },
        descriptionLines: [
          {
            name: { original: title, translated: title },
            plainText: { original: val, translated: val },
            lineType: "PLAIN_TEXT",
            plainTextValue: { original: val, translated: val },
            modifierDescriptionLine: true
          }
        ],
        quantity: 1
      }
    }
  ];

  for (const s of structures) {
    console.log(`Running: ${s.label}...`);
    const success = await runTest(s.label, s.lineItem);
    if (success) {
      console.log('SUCCESS FOUND!');
      return;
    }
  }
  console.log('All descriptionLines tests finished.');
}

main().catch(console.error);

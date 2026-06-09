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

  // Structure 1: options containing choices and customTextFields at lineItem root
  console.log('Testing Structure 1 (options: { choices, customTextFields } at lineItem root)...');
  await runTest('root options.choices + root options.customTextFields', {
    catalogReference: {
      appId,
      catalogItemId: itemId
    },
    quantity: 1,
    options: {
      choices: {
        "Choose Your Option": "Mystery Norsk/English Sticker"
      },
      customTextFields: [
        {
          title: title,
          value: val
        }
      ]
    }
  });

  // Structure 2: options containing options and customTextFields at lineItem root
  console.log('\nTesting Structure 2 (options: { options, customTextFields } at lineItem root)...');
  await runTest('root options.options + root options.customTextFields', {
    catalogReference: {
      appId,
      catalogItemId: itemId
    },
    quantity: 1,
    options: {
      options: {
        "Choose Your Option": "Mystery Norsk/English Sticker"
      },
      customTextFields: [
        {
          title: title,
          value: val
        }
      ]
    }
  });

  // Structure 3: options flat containing options and customTextFields at lineItem root
  console.log('\nTesting Structure 3 (options: { "OptionName": "Value", customTextFields } flat at lineItem root)...');
  await runTest('root options flat + root options.customTextFields', {
    catalogReference: {
      appId,
      catalogItemId: itemId
    },
    quantity: 1,
    options: {
      "Choose Your Option": "Mystery Norsk/English Sticker",
      customTextFields: [
        {
          title: title,
          value: val
        }
      ]
    }
  });
}

main().catch(console.error);

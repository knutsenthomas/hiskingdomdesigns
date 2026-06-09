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

  // Option styles
  const optFlat = { "Choose Your Option": "Mystery Norsk/English Sticker" };
  const optNestedOptions = { options: { "Choose Your Option": "Mystery Norsk/English Sticker" } };
  const optNestedChoices = { choices: { "Choose Your Option": "Mystery Norsk/English Sticker" } };
  const optNone = null;

  // Custom text field styles
  const ctTitleValue = [
    {
      title: "Bestille en spesiell sticker? Fortell oss hvilken!",
      value: "Vilkårlig motiv"
    }
  ];

  const ctTitleFreeTextValue = [
    {
      title: "Bestille en spesiell sticker? Fortell oss hvilken!",
      freeTextSettings: {
        value: "Vilkårlig motiv"
      }
    }
  ];

  const ctTitleFreeTextText = [
    {
      title: "Bestille en spesiell sticker? Fortell oss hvilken!",
      freeTextSettings: {
        text: "Vilkårlig motiv"
      }
    }
  ];

  const ctKeyValue = [
    {
      key: "Bestille en spesiell sticker? Fortell oss hvilken!",
      value: "Vilkårlig motiv"
    }
  ];

  const ctTitleText = [
    {
      title: "Bestille en spesiell sticker? Fortell oss hvilken!",
      text: "Vilkårlig motiv"
    }
  ];

  const ctNone = null;

  const optionStyles = [
    { label: 'flatOptions', val: optFlat },
    { label: 'nestedOptions', val: optNestedOptions },
    { label: 'nestedChoices', val: optNestedChoices },
    { label: 'noOptions', val: optNone }
  ];

  const ctStyles = [
    { label: 'ctTitleValue', val: ctTitleValue },
    { label: 'ctTitleFreeTextValue', val: ctTitleFreeTextValue },
    { label: 'ctTitleFreeTextText', val: ctTitleFreeTextText },
    { label: 'ctKeyValue', val: ctKeyValue },
    { label: 'ctTitleText', val: ctTitleText },
    { label: 'noCT', val: ctNone }
  ];

  console.log('Running permutations with customTextFields INSIDE catalogReference...');
  for (const opt of optionStyles) {
    for (const ct of ctStyles) {
      const lineItem = {
        catalogReference: {
          appId,
          catalogItemId: itemId,
        },
        quantity: 1
      };
      if (opt.val) lineItem.catalogReference.options = opt.val;
      if (ct.val) lineItem.catalogReference.customTextFields = ct.val;

      const success = await runTest(`INSIDE: ${opt.label} + ${ct.label}`, lineItem);
      if (success) return; // Stop if we found a working one
    }
  }

  console.log('\nRunning permutations with customTextFields OUTSIDE catalogReference (at lineItem root)...');
  for (const opt of optionStyles) {
    for (const ct of ctStyles) {
      const lineItem = {
        catalogReference: {
          appId,
          catalogItemId: itemId,
        },
        quantity: 1
      };
      if (opt.val) lineItem.catalogReference.options = opt.val;
      if (ct.val) lineItem.customTextFields = ct.val;

      const success = await runTest(`OUTSIDE: ${opt.label} + ${ct.label}`, lineItem);
      if (success) return; // Stop if we found a working one
    }
  }

  console.log('\nAll permutations finished.');
}

main().catch(console.error);

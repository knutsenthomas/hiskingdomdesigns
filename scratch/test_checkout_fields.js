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

async function main() {
  const itemId = 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef';
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: itemId,
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
          quantity: 2,
        }
      ],
      channelType: 'WEB'
    });
    
    console.log('--- Checkout Fields ---');
    console.log('lineItems:', res.lineItems);
    console.log('calculationErrors:', res.calculationErrors);
    console.log('priceSummary:', res.priceSummary);
    console.log('billingInfo:', res.billingInfo);
    console.log('shippingInfo:', res.shippingInfo);
  } catch (err) {
    console.error('Error:', err);
  }
}

main().catch(console.error);

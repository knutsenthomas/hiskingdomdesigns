import { createClient, OAuthStrategy } from '@wix/sdk';
import { plans } from '@wix/pricing-plans';

const wixClient = createClient({
  modules: {
    plans,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  console.log('Querying public pricing plans from Wix...');
  try {
    const response = await wixClient.plans.queryPublicPlans().find();
    console.log('Query response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Failed to query public pricing plans:', err);
  }

  console.log('Listing public pricing plans from Wix...');
  try {
    const response = await wixClient.plans.listPublicPlans();
    console.log('List response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Failed to list public pricing plans:', err);
  }
}

main().catch(console.error);

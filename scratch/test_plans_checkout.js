import { createClient, OAuthStrategy } from '@wix/sdk';
import { redirects } from '@wix/redirects';

const wixClient = createClient({
  modules: {
    redirects,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  const planId = '3cd35a70-02f1-496f-9019-e68826379b43';
  console.log('Testing createRedirectSession for planId:', planId);
  try {
    const redirectSession = await wixClient.redirects.createRedirectSession({
      paidPlansCheckout: {
        planId: planId,
      },
      callbacks: {
        postFlowUrl: 'http://localhost:3000',
        thankYouPageUrl: 'http://localhost:3000/profile'
      }
    });
    console.log('Success:', redirectSession);
  } catch (err) {
    console.error('Failed:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
    else console.log('Full error:', err);
  }
}

main();

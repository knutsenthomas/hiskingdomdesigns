import { createClient, OAuthStrategy } from '@wix/sdk';
import { contacts } from '@wix/site-crm';

const wixClient = createClient({
  modules: {
    contacts,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  console.log('Testing appendOrCreateContact on Wix Client...');
  try {
    const res = await wixClient.contacts.appendOrCreateContact({
      emails: [{ email: 'thomas@tk-design.no' }]
    });
    console.log('Success:', res);
  } catch (err) {
    console.error('Failed to append or create contact:', err);
    console.error('Error Details:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
  }
}

main().catch(console.error);

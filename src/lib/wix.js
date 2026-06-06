import { createClient, OAuthStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';

export const wixClient = createClient({
  modules: {
    products,
    collections,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

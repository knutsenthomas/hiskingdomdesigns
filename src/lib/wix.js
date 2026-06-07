import { createClient, OAuthStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';
import { currentCart, checkout } from '@wix/ecom';
import { redirects } from '@wix/redirects';

export const wixClient = createClient({
  modules: {
    products,
    collections,
    currentCart,
    checkout,
    redirects,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

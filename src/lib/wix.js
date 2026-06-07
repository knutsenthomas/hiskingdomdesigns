import { createClient, OAuthStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';
import { currentCart, checkout, orders } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { members } from '@wix/members';
import { plans } from '@wix/pricing-plans';

export const wixClient = createClient({
  modules: {
    products,
    collections,
    currentCart,
    checkout,
    redirects,
    members,
    plans,
    orders,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

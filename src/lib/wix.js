import { createClient, OAuthStrategy, EMPTY_TOKENS } from '@wix/sdk';
import { products, collections } from '@wix/stores';
import { currentCart, checkout, orders, backInStockNotifications } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { members } from '@wix/members';
import { plans } from '@wix/pricing-plans';
import { reviews } from '@wix/reviews';
import { contacts } from '@wix/site-crm';
import { headlessSite } from '@wix/headless-site';

// Custom localStorage token storage to persist client OAuth session tokens across page reloads
const customTokenStorage = {
  getTokens: () => {
    try {
      const stored = localStorage.getItem('wix_oauth_tokens');
      return stored ? JSON.parse(stored) : EMPTY_TOKENS;
    } catch (e) {
      console.error('Failed to read Wix tokens from localStorage:', e);
      return EMPTY_TOKENS;
    }
  },
  setTokens: (tokens) => {
    try {
      localStorage.setItem('wix_oauth_tokens', JSON.stringify(tokens));
    } catch (e) {
      console.error('Failed to write Wix tokens to localStorage:', e);
    }
  }
};

export const wixClient = createClient({
  host: headlessSite.host(),
  modules: {
    products,
    collections,
    currentCart,
    checkout,
    redirects,
    members,
    plans,
    orders,
    backInStockNotifications,
    reviews,
    contacts,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
    tokenStorage: customTokenStorage
  }),
});


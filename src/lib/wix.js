import { createClient, OAuthStrategy, EMPTY_TOKENS } from '@wix/sdk';
import { products, collections } from '@wix/stores';
import { currentCart, checkout, orders, backInStockNotifications } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { members } from '@wix/members';
import { plans, orders as pricingPlansOrders } from '@wix/pricing-plans';
import { reviews } from '@wix/reviews';
import { contacts } from '@wix/site-crm';
import { accounts as loyaltyAccounts, transactions as loyaltyTransactions, rewards as loyaltyRewards, coupons as loyaltyCoupons } from '@wix/loyalty';
import { giftVouchers } from '@wix/gift-vouchers';
import { conversations as inboxConversations, messages as inboxMessages } from '@wix/inbox';
import { headlessSite } from '@wix/headless-site';

// Custom localStorage token storage to persist client OAuth session tokens across page reloads
const customTokenStorage = {
  getTokens: () => {
    try {
      const stored = localStorage.getItem('wix_oauth_tokens');
      if (!stored || stored === 'null' || stored === 'undefined') {
        return EMPTY_TOKENS;
      }
      const parsed = JSON.parse(stored);
      return (parsed && typeof parsed === 'object') ? parsed : EMPTY_TOKENS;
    } catch (e) {
      console.error('Failed to read Wix tokens from localStorage:', e);
      return EMPTY_TOKENS;
    }
  },
  setTokens: (tokens) => {
    try {
      if (!tokens) {
        localStorage.removeItem('wix_oauth_tokens');
      } else {
        localStorage.setItem('wix_oauth_tokens', JSON.stringify(tokens));
      }
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
    pricingPlansOrders,
    orders,
    backInStockNotifications,
    reviews,
    contacts,
    loyaltyAccounts,
    loyaltyTransactions,
    loyaltyRewards,
    loyaltyCoupons,
    giftVouchers,
    inboxConversations,
    inboxMessages,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
    tokenStorage: customTokenStorage
  }),
});

export const staticWixClient = createClient({
  host: headlessSite.host(),
  modules: {
    products,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06'
  }),
});




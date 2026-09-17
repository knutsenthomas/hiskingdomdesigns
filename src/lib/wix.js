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

// Cookie helpers to ensure cross-storage resilience (Safari ITP / private browsing)
const getCookieToken = () => {
  try {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|;\s*)wix_oauth_tokens=([^;]+)/);
    if (match && match[1]) {
      const decoded = decodeURIComponent(match[1]);
      const parsed = JSON.parse(decoded);
      return (parsed && typeof parsed === 'object') ? parsed : null;
    }
  } catch (e) {}
  return null;
};

const setCookieToken = (tokens) => {
  try {
    if (typeof document === 'undefined') return;
    if (!tokens) {
      document.cookie = 'wix_oauth_tokens=; path=/; max-age=0; SameSite=Lax';
    } else {
      const val = encodeURIComponent(JSON.stringify(tokens));
      document.cookie = `wix_oauth_tokens=${val}; path=/; max-age=31536000; SameSite=Lax`;
    }
  } catch (e) {}
};

// Custom dual localStorage + Cookie token storage to persist client OAuth session tokens across page reloads
const customTokenStorage = {
  getTokens: () => {
    try {
      const stored = localStorage.getItem('wix_oauth_tokens');
      if (stored && stored !== 'null' && stored !== 'undefined') {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') return parsed;
      }
      const cookieToken = getCookieToken();
      if (cookieToken) return cookieToken;
      return EMPTY_TOKENS;
    } catch (e) {
      const cookieToken = getCookieToken();
      if (cookieToken) return cookieToken;
      return EMPTY_TOKENS;
    }
  },
  setTokens: (tokens) => {
    try {
      if (!tokens) {
        localStorage.removeItem('wix_oauth_tokens');
        setCookieToken(null);
      } else {
        localStorage.setItem('wix_oauth_tokens', JSON.stringify(tokens));
        setCookieToken(tokens);
      }
    } catch (e) {
      setCookieToken(tokens);
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

// Fetch original catalog names without the host's default English language header.
// Translated option labels are display text, not valid eCommerce identifiers.
export const staticWixClient = createClient({
  modules: {
    products,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06'
  }),
});

/**
 * Resets stored OAuth tokens and resets Wix client auth to empty/anonymous session.
 */
export const resetWixTokens = async () => {
  try {
    localStorage.removeItem('wix_oauth_tokens');
    setCookieToken(null);
    await wixClient.auth.setTokens(EMPTY_TOKENS);
  } catch (e) {
    console.warn('Failed to reset Wix tokens:', e);
  }
};

/**
 * Checks if an error is an authentication/authorization error (401, 403, invalid token).
 */
export const isWixAuthError = (err) => {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const status = err.status || err.code || err.details?.applicationError?.code;
  const violations = err.details?.validationError?.fieldViolations || [];
  const hasExpiredRule = violations.some(v => v.ruleName === 'EXPIRED_SESSION_CANT_BE_USED');
  return (
    status === 401 ||
    status === 403 ||
    status === 'UNAUTHENTICATED' ||
    status === 'PERMISSION_DENIED' ||
    status === 'INVALID_TOKEN' ||
    hasExpiredRule ||
    msg.includes('401') ||
    msg.includes('403') ||
    msg.includes('unauthorized') ||
    msg.includes('forbidden') ||
    msg.includes('invalid token') ||
    msg.includes('invalid_grant') ||
    msg.includes('jwt') ||
    msg.includes('token expired') ||
    msg.includes('session expired')
  );
};

/**
 * Checks if an error is a revision conflict or cart state mismatch error (409 Conflict).
 */
export const isWixConflictError = (err) => {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const status = err.status || err.code || err.details?.applicationError?.code;
  return (
    status === 409 ||
    status === 'ABORTED' ||
    status === 'REVISION_CONFLICT' ||
    msg.includes('409') ||
    msg.includes('conflict') ||
    msg.includes('revision') ||
    msg.includes('mismatch') ||
    msg.includes('already modified')
  );
};




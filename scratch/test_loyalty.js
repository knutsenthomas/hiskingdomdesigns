import { createClient, OAuthStrategy } from '@wix/sdk';
import { accounts, transactions } from '@wix/loyalty';
import { giftVouchers } from '@wix/gift-vouchers';

console.log('Loyalty Accounts:', Object.keys(accounts));
console.log('Loyalty Transactions:', Object.keys(transactions));
console.log('Gift Vouchers:', Object.keys(giftVouchers));

const wixClient = createClient({
  modules: {
    loyaltyAccounts: accounts,
    loyaltyTransactions: transactions,
    giftVouchers
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

console.log('Wix Client Initialized with Loyalty & Gift Vouchers.');
console.log('loyaltyAccounts methods:', Object.keys(wixClient.loyaltyAccounts || {}));
console.log('loyaltyTransactions methods:', Object.keys(wixClient.loyaltyTransactions || {}));
console.log('giftVouchers methods:', Object.keys(wixClient.giftVouchers || {}));

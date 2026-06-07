import { createClient, OAuthStrategy } from '@wix/sdk';
import { reviews } from '@wix/reviews';

// Mock localStorage
global.localStorage = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null
};

const wixClient = createClient({
  modules: {
    reviews
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06'
  })
});

async function testQueryBuilder() {
  try {
    console.log('Running queryReviews().descending("createdDate").limit(5).find()...');
    const res = await wixClient.reviews.queryReviews()
      .descending('createdDate')
      .limit(5)
      .find();
      
    console.log('Result properties:', Object.keys(res || {}));
    console.log('Result items count:', res.items ? res.items.length : 0);
    if (res.items && res.items.length > 0) {
      console.log('First review object:', JSON.stringify(res.items[0], null, 2));
    }
  } catch (e) {
    console.error('Query failed:', e);
  }
}

testQueryBuilder();

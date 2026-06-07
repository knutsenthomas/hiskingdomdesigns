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

async function getRawReviewsResponse() {
  try {
    const res = await wixClient.reviews.queryReviews({
      query: {
        sort: [{ fieldName: '_createdDate', order: 'DESC' }],
        paging: { limit: 5 }
      }
    });
    console.log('Wix Reviews API Raw Keys:', Object.keys(res || {}));
    console.log('Full Raw Response:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('Call failed:', e);
  }
}

getRawReviewsResponse();

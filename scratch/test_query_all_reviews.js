import { wixClient } from '../src/lib/wix.js';

async function testReviews() {
  // Scenario 1: Filter on stores namespace only
  try {
    const res1 = await wixClient.reviews.queryReviews({
      query: {
        filter: {
          namespace: 'stores'
        },
        sort: [{ fieldName: '_createdDate', order: 'DESC' }],
        paging: { limit: 10 }
      }
    });
    console.log('Scenario 1 (stores namespace only) success. Count:', res1.items ? res1.items.length : 0);
    if (res1.items && res1.items.length > 0) {
      console.log('First review entityId:', res1.items[0].entityId);
    }
  } catch (e) {
    console.log('Scenario 1 failed:', e.message);
  }

  // Scenario 2: No filter at all
  try {
    const res2 = await wixClient.reviews.queryReviews({
      query: {
        sort: [{ fieldName: '_createdDate', order: 'DESC' }],
        paging: { limit: 10 }
      }
    });
    console.log('Scenario 2 (no filter) success. Count:', res2.items ? res2.items.length : 0);
  } catch (e) {
    console.log('Scenario 2 failed:', e.message);
  }

  // Scenario 3: Empty query object
  try {
    const res3 = await wixClient.reviews.queryReviews();
    console.log('Scenario 3 (no args) success. Count:', res3.items ? res3.items.length : 0);
  } catch (e) {
    console.log('Scenario 3 failed:', e.message);
  }
}

testReviews();

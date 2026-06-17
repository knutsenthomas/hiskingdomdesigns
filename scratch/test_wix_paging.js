import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { orders } from '@wix/ecom';
import { members } from '@wix/members';
import { headlessSite } from '@wix/headless-site';

const wixClient = createClient({
  host: headlessSite.host(),
  modules: { orders, members },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  })
});

async function main() {
  console.log("Checking for refunded orders...");
  try {
    const res = await wixClient.orders.searchOrders({
      filter: {},
      cursorPaging: { limit: 100 }
    });
    
    let refundedOrders = [];
    res.orders.forEach(o => {
      const pStatus = o.paymentStatus || '';
      const status = o.status || '';
      if (pStatus.includes('REFUND') || status.includes('REFUND') || o.priceSummary?.refundedAmount || o.refunds) {
        refundedOrders.push(o);
      }
    });

    console.log("Found refunded orders count:", refundedOrders.length);
    refundedOrders.forEach(o => {
      console.log(`Order #${o.number}: status=${o.status}, paymentStatus=${o.paymentStatus}`);
      console.log("Price Summary:", JSON.stringify(o.priceSummary, null, 2));
      console.log("Refunds:", JSON.stringify(o.refunds || null));
    });

    // Also let's log the price summary structure of a regular order just to see
    if (res.orders.length > 0) {
      console.log("\nSample Order #", res.orders[0].number);
      console.log("Price Summary:", JSON.stringify(res.orders[0].priceSummary, null, 2));
    }
  } catch (err) {
    console.error("Error checking refunded orders:", err);
  }
}

main();

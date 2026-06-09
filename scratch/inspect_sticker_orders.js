import fetch from 'node-fetch';

const SITE_ID = '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7';
const API_KEY = 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';

async function main() {
  console.log('Querying past orders from Wix via REST API...');
  const url = 'https://www.wixapis.com/ecom/v1/orders/search';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': API_KEY,
      'wix-site-id': SITE_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: {
        limit: 100
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to search orders: ${JSON.stringify(data)}`);
  }

  const items = data.orders || [];
  console.log(`Total orders found: ${items.length}`);
  
  let foundSticker = false;
  for (const order of items) {
    const lineItems = order.lineItems || [];
    for (const item of lineItems) {
      if (item.catalogReference && item.catalogReference.catalogItemId === 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef') {
        console.log(`\nFound order with sticker! Order ID: ${order.id}, Number: ${order.number}`);
        console.log(JSON.stringify(item, null, 2));
        foundSticker = true;
      }
    }
  }
  
  if (!foundSticker) {
    console.log('No past orders with the sticker product ID were found.');
  }
}

main().catch(console.error);

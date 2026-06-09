import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { currentCart } from '@wix/ecom';

// Note: To inspect carts by ID, we use the currentCart REST API or check what Wix currentCart returns.
// Wait, is there a currentCart.getCart in SDK? 
// Let's write a script that queries the cart from the Wix server or inspects it.
// Let's query using fetch on the REST API endpoint: https://www.wixapis.com/ecom/v1/carts/{cartId}

import fetch from 'node-fetch';

async function main() {
  const cartId = 'ca727402-4791-4549-90e5-9cf3226e9c23';
  const apiKey = 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg';
  
  console.log('Inspecting cart:', cartId);
  const url = `https://www.wixapis.com/ecom/v1/carts/${cartId}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    console.log('Cart details response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to inspect cart:', err.message);
  }
}

main().catch(console.error);

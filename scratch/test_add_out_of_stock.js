import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { products } from '@wix/stores';
import { currentCart } from '@wix/ecom';

const wixClient = createClient({
  modules: {
    products,
    currentCart,
  },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  }),
});

async function main() {
  // Let's find an out of stock product
  const res = await wixClient.products.queryProducts().limit(100).find();
  const outOfStockProd = res.items.find(p => !p.stock.inStock);
  
  if (!outOfStockProd) {
    console.log('No out of stock products found to test.');
    return;
  }
  
  console.log(`Found out of stock product: ${outOfStockProd.name} (${outOfStockProd._id})`);
  
  // Try to add it to cart
  const headlessClient = createClient({
    modules: {
      currentCart,
    },
    auth: OAuthStrategy({
      clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
    }),
  });
  
  console.log('Trying to add out of stock product to currentCart...');
  try {
    const addRes = await headlessClient.currentCart.addToCurrentCart({
      lineItems: [
        {
          catalogReference: {
            appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
            catalogItemId: outOfStockProd._id,
          },
          quantity: 1,
        }
      ]
    });
    console.log('Succeeded! Cart lineItems count:', addRes.cart?.lineItems?.length || 0);
    console.log('Cart lineItems:', JSON.stringify(addRes.cart?.lineItems || [], null, 2));
  } catch (err) {
    console.error('Failed as expected with error:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
  }
}

import { OAuthStrategy } from '@wix/sdk';
main().catch(console.error);

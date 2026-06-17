import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { products } from '@wix/stores';

const wixClient = createClient({
  modules: {
    products
  },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  }),
});

async function main() {
  try {
    let allItems = [];
    let query = wixClient.products.queryProducts().limit(100);
    let hasNext = true;
    let pageRes = await query.find();
    
    while (hasNext) {
      allItems.push(...pageRes.items);
      if (pageRes.hasNext()) {
        pageRes = await pageRes.next();
      } else {
        hasNext = false;
      }
    }

    console.log(`Checking descriptions for ${allItems.length} products...\n`);

    allItems.forEach(p => {
      const desc = p.description || '';
      const name = p.name || '';
      const cleanDesc = desc.replace(/<[^>]*>/g, '').replace(/&nbsp;|\u00A0/g, ' ').trim();
      
      if (
        name.toLowerCase().includes('mustard') ||
        cleanDesc.toLowerCase().includes('mustard') ||
        name.toLowerCase().includes('faith') ||
        cleanDesc.toLowerCase().includes('sweatshirt') ||
        cleanDesc.toLowerCase().includes('tote bags') ||
        name.toLowerCase().includes('monthly') ||
        cleanDesc.toLowerCase().includes('monthly')
      ) {
        console.log(`Product: "${p.name}" (ID: ${p._id})`);
        console.log(`  Description: "${cleanDesc}"`);
        console.log('');
      }
    });
  } catch (err) {
    console.error(err);
  }
}

main();

import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';

const wixClient = createClient({
  modules: {
    products,
    collections,
  },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  }),
});

async function main() {
  console.log('Fetching live products and collections from Wix...');
  try {
    const collectionsList = await wixClient.collections.queryCollections().limit(100).find();
    const collectionsMap = {};
    collectionsList.items.forEach(c => {
      collectionsMap[c._id] = c.name;
    });

    const res = await wixClient.products.queryProducts().limit(100).find();
    console.log(`Successfully fetched ${res.items.length} products.\n`);

    const childProducts = [];
    const allProducts = [];

    res.items.forEach(item => {
      const resolvedCollections = item.collectionIds?.map(id => collectionsMap[id]).filter(Boolean) || [];
      const prodName = item.name;
      const desc = item.description?.replace(/<[^>]*>/g, '') || '';
      
      const prodInfo = {
        id: item._id,
        name: prodName,
        collections: resolvedCollections,
        description: desc.substring(0, 80)
      };

      allProducts.push(prodInfo);

      // Check if it looks like a kid's product
      const nameLower = prodName.toLowerCase();
      const descLower = desc.toLowerCase();
      const isKid = 
        nameLower.includes('barn') || 
        nameLower.includes('barne') || 
        nameLower.includes('baby') || 
        nameLower.includes('kids') || 
        nameLower.includes('disciple') || 
        nameLower.includes('gutt') || 
        nameLower.includes('jente') || 
        resolvedCollections.some(c => {
          const cl = c.toLowerCase();
          return cl.includes('barn') || cl.includes('kids') || cl.includes('ungdom');
        });

      if (isKid) {
        childProducts.push(prodInfo);
      }
    });

    console.log('--- ALL PRODUCTS ---');
    allProducts.forEach(p => console.log(`- [${p.id}] ${p.name} (Collections: ${p.collections.join(', ')})`));

    console.log('\n--- IDENTIFIED KIDS PRODUCTS ---');
    if (childProducts.length > 0) {
      childProducts.forEach(p => console.log(`- ${p.name} (Collections: ${p.collections.join(', ')})`));
    } else {
      console.log('No products identified as kids products with the current filter.');
    }

  } catch (err) {
    console.error('Failed to fetch:', err);
  }
}

main();

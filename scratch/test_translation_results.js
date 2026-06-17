import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { products } from '@wix/stores';
import { getTranslatedProduct } from '../src/lib/productTranslations.js';

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
    const res = await wixClient.products.queryProducts().limit(100).find();
    console.log(`Loaded ${res.items.length} products.\n`);

    res.items.forEach(p => {
      const translatedNo = getTranslatedProduct(p, 'no');
      const translatedEn = getTranslatedProduct(p, 'en');
      const translatedEs = getTranslatedProduct(p, 'es');
      console.log(`Original: "${p.name}"`);
      console.log(`   -> NO: "${translatedNo.name}"`);
      console.log(`   -> EN: "${translatedEn.name}"`);
      console.log(`   -> ES: "${translatedEs.name}"`);
      if (p.productOptions && p.productOptions.length > 0) {
        console.log(`   Options: ${p.productOptions.map(o => `${o.name} (${o.choices?.map(c => c.value).join(', ')})`).join(' | ')}`);
      }
      console.log('');
    });
  } catch (err) {
    console.error(err);
  }
}

main();

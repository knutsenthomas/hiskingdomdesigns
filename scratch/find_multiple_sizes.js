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
    const res = await wixClient.products.queryProducts().limit(100).find();
    let count = 0;

    res.items.forEach(p => {
      const options = p.productOptions || [];
      const sizeOpt = options.find(o => {
        const name = o.name?.trim().toLowerCase();
        return name && (name.includes('size') || name.includes('størrelse') || name.includes('størrelser') || name.includes('format') || name === 'str' || name === 'str.');
      });

      if (sizeOpt && sizeOpt.choices?.length > 1) {
        const hasLongChoice = sizeOpt.choices.some(c => c.value?.length > 15);
        if (hasLongChoice) {
          count++;
          console.log(`Product: "${p.name}" (ID: ${p.id})`);
          console.log(`  Size option: "${sizeOpt.name}"`);
          sizeOpt.choices.forEach(c => {
            console.log(`    Choice: "${c.value}" (length: ${c.value?.length})`);
          });
          console.log('');
        }
      }
    });

    console.log(`Found ${count} products with multiple size choices where at least one is > 15 characters.`);
  } catch (err) {
    console.error(err);
  }
}

main();

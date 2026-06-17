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
    
    const targetNames = [
      "1 Bokmerke med Bibelvers på engelsk",
      "1 random Small Bibleverse cards (English)",
      "Små evangeliseringskort (English) ",
      "Jesus underviser - trykk på lerret med svart ramme",
      "Tro kan flytte fjell - Lang Tsjorte - str. S - lilla og grønn",
      "Norsk flagg (11 x 8cm)",
      "Israel flagg",
      "Fredsdue med 🇮🇱",
      "Israel flagg (4 x 3cm) ",
      "Israels flagg i en hjerteform",
      "Pennal til Bibelskrivesaker "
    ];

    res.items.forEach(p => {
      if (targetNames.some(name => p.name.includes(name.trim()))) {
        // Map the subcategories and category from Wix structure to pass to translator
        const productInput = {
          id: p._id,
          name: p.name,
          description: p.description,
          category: 'Tilbehør', // default mapped category in AppContext
          subcategories: p.collectionIds || [] // will resolve to collections in real app, let's simulate
        };

        // Let's query collections for this product in a real scenario
        console.log(`Original: "${p.name}"`);
        ['no', 'en', 'es'].forEach(lang => {
          const trans = getTranslatedProduct(p, lang);
          console.log(`  -> ${lang.toUpperCase()}: "${trans.name}"`);
        });
        console.log('');
      }
    });
  } catch (err) {
    console.error(err);
  }
}

main();

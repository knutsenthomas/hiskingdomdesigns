import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';

const wixClient = createClient({
  modules: {
    products,
    collections
  },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  }),
});

async function main() {
  try {
    const collectionsList = await wixClient.collections.queryCollections().limit(100).find();
    const collectionsMap = {};
    collectionsList.items.forEach(c => {
      collectionsMap[c._id] = c.name;
    });

    const res = await wixClient.products.queryProducts().limit(100).find();
    
    const targetNames = [
      "1 Bokmerke med Bibelvers på engelsk",
      "1 random Small Bibleverse cards (English)",
      "Små evangeliseringskort (English) ",
      "Jesus underviser - trykk på lerret med svart ramme",
      "Tro kan flytte fjell - Lang Tsjorte - str. S - lilla og grønn",
      "Norsk flagg (11 x 8cm)",
      "Israel flagg",
      "Fredsdue med 🇮🇱 ",
      "Israel flagg (4 x 3cm) ",
      "Israels flagg i en hjerteform",
      "Pennal til Bibelskrivesaker "
    ];

    res.items.forEach(p => {
      if (targetNames.some(name => p.name.includes(name.trim()))) {
        const resolvedCollections = p.collectionIds?.map(id => collectionsMap[id]).filter(Boolean) || [];
        console.log(`Product Name: "${p.name}"`);
        console.log(`  ID: ${p._id}`);
        console.log(`  Collections: [${resolvedCollections.join(', ')}]`);
        console.log(`  Description: "${p.description?.replace(/<[^>]*>/g, '').substring(0, 150)}..."`);
        console.log(`  Options: ${p.productOptions?.map(o => `${o.name} (${o.choices?.map(c => c.value).join(', ')})`).join(' | ')}`);
        console.log('');
      }
    });
  } catch (err) {
    console.error(err);
  }
}

main();

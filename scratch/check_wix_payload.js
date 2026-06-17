import { wixClient } from '../src/lib/wix.js';

async function checkWixPayload() {
  try {
    console.log('Querying Wix products...');
    const start = Date.now();
    const response = await wixClient.products.queryProducts().descending('createdDate').limit(100).find();
    const elapsed = Date.now() - start;
    
    const items = response.items || [];
    console.log(`Fetched ${items.length} products in ${elapsed}ms`);
    
    const jsonStr = JSON.stringify(response);
    const sizeKb = (jsonStr.length / 1024).toFixed(2);
    console.log(`Response size: ${sizeKb} KB`);
  } catch (err) {
    console.error('Error fetching Wix products:', err);
  }
}

checkWixPayload();

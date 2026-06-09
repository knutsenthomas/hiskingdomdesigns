import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';

const wixClient = createClient({
  modules: {
    products,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function runSequential() {
  const start = Date.now();
  console.log('Starting sequential fetch...');
  let response = await wixClient.products.queryProducts().limit(100).find();
  let items = [...response.items];
  let pages = 1;
  while (response.hasNext()) {
    response = await response.next();
    items = [...items, ...response.items];
    pages++;
  }
  console.log(`Sequential completed in ${Date.now() - start}ms. Pages: ${pages}, Items: ${items.length}`);
  return items.length;
}

async function runConcurrent() {
  const start = Date.now();
  console.log('Starting concurrent fetch...');
  const firstPage = await wixClient.products.queryProducts().limit(100).find();
  let items = [...firstPage.items];
  const totalCount = firstPage.totalCount || 0;
  console.log(`First page loaded. Total items reported: ${totalCount}`);
  
  if (totalCount > 100) {
    const totalPages = Math.ceil(totalCount / 100);
    const promises = [];
    for (let i = 1; i < totalPages; i++) {
      promises.push(wixClient.products.queryProducts().limit(100).skip(i * 100).find());
    }
    const results = await Promise.all(promises);
    results.forEach(res => {
      items = [...items, ...res.items];
    });
  }
  console.log(`Concurrent completed in ${Date.now() - start}ms. Items: ${items.length}`);
  return items.length;
}

async function main() {
  const count1 = await runConcurrent();
  const count2 = await runSequential();
  if (count1 !== count2) {
    console.warn('WARNING: Item count mismatch between sequential and concurrent fetch!');
  }
}

main().catch(console.error);

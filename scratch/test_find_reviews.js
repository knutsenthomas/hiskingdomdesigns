import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';
import { reviews } from '@wix/reviews';

// Mock localStorage for Node environment to prevent wixClient initialisation crashes
global.localStorage = {
  getItem: () => null,
  setItem: () => null,
  removeItem: () => null
};

const wixClient = createClient({
  modules: {
    products,
    reviews
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06'
  })
});

async function scanProductsForReviews() {
  try {
    console.log('Fetching products to scan...');
    const productsRes = await wixClient.products.queryProducts().limit(100).find();
    const productsList = productsRes.items || [];
    console.log(`Found ${productsList.length} products to scan.`);

    let foundReviews = 0;

    for (const product of productsList) {
      const res = await wixClient.reviews.queryReviews({
        query: {
          filter: {
            entityId: product._id,
            namespace: 'stores'
          }
        }
      });

      if (res.items && res.items.length > 0) {
        console.log(`FOUND REVIEWS FOR PRODUCT: ${product.name} (${product._id})`);
        console.log('Reviews:', JSON.stringify(res.items, null, 2));
        foundReviews += res.items.length;
      }
    }

    if (foundReviews === 0) {
      console.log('Scanned 100 products and found 0 reviews.');
    } else {
      console.log(`Scan complete. Found ${foundReviews} total reviews across products.`);
    }

  } catch (e) {
    console.error('Scan failed:', e);
  }
}

scanProductsForReviews();

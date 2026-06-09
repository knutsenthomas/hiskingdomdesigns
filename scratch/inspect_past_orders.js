import { createClient, OAuthStrategy } from '@wix/sdk';
import { orders } from '@wix/ecom';

const wixClient = createClient({
  modules: {
    orders,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  console.log('Querying past orders from Wix...');
  try {
    const res = await wixClient.orders.searchOrders().find();
    console.log(`Total orders found: ${res.items.length}`);
    
    let foundStickerOrder = false;
    for (const order of res.items) {
      const lineItems = order.lineItems || [];
      const hasSticker = lineItems.some(item => 
        item.catalogReference && item.catalogReference.catalogItemId === 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef'
      );
      
      if (hasSticker) {
        console.log(`\nFound order with sticker! Order ID: ${order._id}, Number: ${order.number}`);
        const stickers = lineItems.filter(item => 
          item.catalogReference && item.catalogReference.catalogItemId === 'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef'
        );
        stickers.forEach((sticker, idx) => {
          console.log(`Sticker #${idx + 1}:`, JSON.stringify(sticker, null, 2));
        });
        foundStickerOrder = true;
      }
    }
    
    if (!foundStickerOrder) {
      console.log('No past orders with the sticker product were found in the last 100 orders.');
      // Let's print the line items of the first order just to see the structure of any product
      if (res.items.length > 0) {
        console.log('\nFirst order lineItems example:');
        console.log(JSON.stringify(res.items[0].lineItems, null, 2));
      }
    }
  } catch (err) {
    console.error('Failed to query orders:', err.message);
  }
}

main().catch(console.error);

import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';
import { checkout } from '@wix/ecom';

const wixClient = createClient({
  modules: {
    products,
    checkout,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  const plakatId = '64bc2f66-b418-7794-9661-4d16c575d764';
  const tshirtId = '9e6a4b75-d8da-753e-ea15-93e76bf63e27'; // Praise the Lord Classic Tee

  // We fetch the full T-shirt details from Wix to see its options
  const tshirtProduct = (await wixClient.products.getProduct(tshirtId)).product;
  console.log('Product options in Wix:');
  tshirtProduct.productOptions.forEach(opt => {
    console.log(`- Option: "${opt.name}"`);
    opt.choices.forEach(c => {
      console.log(`  * Choice: value="${c.value}", description="${c.description}"`);
    });
  });

  // Let's simulate what selectedOptions looks like in the cart
  // and run our mapCartItemsToWixLineItems logic on it.
  const cartItems = [
    {
      id: plakatId,
      name: 'Fader Vår Plakat',
      selectedSize: 'One Size',
      selectedColor: 'Terracotta',
      quantity: 1
    },
    {
      id: tshirtId,
      name: 'Praise the Lord',
      selectedSize: 'XS',
      selectedColor: 'Lilla',
      selectedOptions: {
        "Farge": "#a211e1",
        "Størrelse": "XS"
      },
      quantity: 1
    }
  ];

  // We run a test mapping
  console.log('\nMapping simulated items...');
  const lineItems = await Promise.all(cartItems.map(async (item) => {
    const catalogReference = {
      appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
      catalogItemId: item.id
    };

    let productOptions = item.productOptions;
    let manageVariants = item.manageVariants;
    let variants = item.variants;

    if (!variants || !productOptions) {
      // Resolve from Wix
      const full = (await wixClient.products.getProduct(item.id)).product;
      productOptions = full.productOptions;
      manageVariants = full.manageVariants;
      variants = full.variants;
    }

    if (productOptions && productOptions.length > 0) {
      let selectedOptions = item.selectedOptions ? { ...item.selectedOptions } : {};
      
      // Safety net first choice fallback
      productOptions.forEach(opt => {
        if (!selectedOptions[opt.name] && opt.choices && opt.choices.length > 0) {
          selectedOptions[opt.name] = opt.choices[0].value;
        }
      });

      if (manageVariants && variants && variants.length > 0) {
        // Variant mapping
        const match = variants.find(v => {
          return Object.entries(v.choices).every(([optName, optVal]) => {
            return selectedOptions[optName] === optVal;
          });
        });
        if (match) {
          catalogReference.options = { variantId: match._id };
        } else {
          catalogReference.options = { variantId: variants[0]._id };
        }
      } else {
        // Options mapping
        const apiOptions = { ...selectedOptions };
        productOptions.forEach(opt => {
          const currentValue = apiOptions[opt.name];
          if (currentValue) {
            const choice = opt.choices?.find(c => c.value === currentValue);
            if (choice && choice.description && choice.value !== choice.description) {
              apiOptions[opt.name] = choice.description;
            }
          }
        });
        catalogReference.options = { options: apiOptions };
      }
    }

    return {
      catalogReference,
      quantity: item.quantity
    };
  }));

  console.log('Mapped line items:');
  console.log(JSON.stringify(lineItems, null, 2));

  console.log('\nCreating checkout...');
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems,
      channelType: 'WEB'
    });
    console.log(`Success! Checkout ID: ${res._id}`);
    console.log(`Line items count in checkout: ${res.lineItems.length}`);
    res.lineItems.forEach((item, idx) => {
      console.log(`  [${idx}] ${item.productName?.translated || item.productName?.original} - Qty: ${item.quantity}`);
    });
  } catch (err) {
    console.error('Checkout failed:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
  }
}

main().catch(console.error);

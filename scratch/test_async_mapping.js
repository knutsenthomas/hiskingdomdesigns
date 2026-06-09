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

// Cache to avoid duplicate fetch calls for same product ID
const productCache = {};

async function resolveProductDetails(productId) {
  if (productCache[productId]) {
    return productCache[productId];
  }
  try {
    const res = await wixClient.products.getProduct(productId);
    if (res && res.product) {
      productCache[productId] = res.product;
      return res.product;
    }
  } catch (err) {
    console.error(`Failed to fetch product ${productId}:`, err.message);
  }
  return null;
}

async function mapCartItemsToWixLineItems(items) {
  const mappedItems = await Promise.all(items.map(async (item) => {
    const catalogReference = {
      appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
      catalogItemId: item.id
    };

    // Robustly ensure productOptions, manageVariants, and variants are present
    let productOptions = item.productOptions;
    let manageVariants = item.manageVariants;
    let variants = item.variants;

    if (!variants || variants.length === 0 || !productOptions) {
      console.log(`[Resolve] Cart item "${item.name}" has missing variants/options. Fetching...`);
      const fullProduct = await resolveProductDetails(item.id);
      if (fullProduct) {
        productOptions = fullProduct.productOptions;
        manageVariants = fullProduct.manageVariants;
        variants = fullProduct.variants;
      }
    }

    // Handle options if they exist
    if (productOptions && productOptions.length > 0) {
      let selectedOptions = item.selectedOptions ? { ...item.selectedOptions } : {};

      // Fallback if selectedOptions is empty
      if (Object.keys(selectedOptions).length === 0) {
        const sizeOpt = productOptions.find(o => {
          const name = (o.name || '').trim().toLowerCase();
          return name.includes('size') || name.includes('størrelse') || name.includes('format') || name === 'str';
        });
        const colorOpt = productOptions.find(o => {
          const name = (o.name || '').trim().toLowerCase();
          return name === 'color' || name === 'farge';
        });

        const sizeChoice = sizeOpt?.choices?.find(c => c.value === item.selectedSize || c.description === item.selectedSize);
        const colorChoice = colorOpt?.choices?.find(c => {
          const lower = c.value?.toLowerCase() || '';
          let mappedName = 'Sort';
          if (lower.includes('sort') || lower.includes('black')) mappedName = 'Sort';
          else if (lower.includes('hvit') || lower.includes('white')) mappedName = 'Hvit';
          else if (lower.includes('grå') || lower.includes('grey') || lower.includes('gray')) mappedName = 'Grå';
          return mappedName === item.selectedColor;
        });

        if (sizeOpt && sizeChoice) selectedOptions[sizeOpt.name] = sizeChoice.value;
        if (colorOpt && colorChoice) selectedOptions[colorOpt.name] = colorChoice.value;
      }

      // Safety net: first choice fallback
      productOptions.forEach(opt => {
        if (!selectedOptions[opt.name] && opt.choices && opt.choices.length > 0) {
          selectedOptions[opt.name] = opt.choices[0].value;
        }
      });

      if (manageVariants && variants && variants.length > 0) {
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

  return mappedItems;
}

async function main() {
  // Simulate a cart item with missing variants/options
  const cartItems = [
    {
      id: '64bc2f66-b418-7794-9661-4d16c575d764', // Fader Vår Plakat
      name: 'Fader Vår Plakat',
      selectedSize: 'One Size',
      selectedColor: 'Terracotta',
      quantity: 1
    },
    {
      id: '094e286f-767f-4aa2-b03b-4050ea1f12d3', // God is good T-shirt (managed variants)
      name: 'God is good Tskjorte',
      selectedSize: 'M',
      selectedColor: 'Sort', // mapped to Black
      quantity: 1
    }
  ];

  console.log('Mapping simulated cart items...');
  const lineItems = await mapCartItemsToWixLineItems(cartItems);
  console.log('Mapped line items for checkout:');
  console.log(JSON.stringify(lineItems, null, 2));

  console.log('\nCreating checkout with mapped items...');
  try {
    const res = await wixClient.checkout.createCheckout({
      lineItems,
      channelType: 'WEB'
    });
    console.log(`Success! Checkout ID: ${res._id}`);
    console.log(`Line items count in response: ${res.lineItems.length}`);
    res.lineItems.forEach((item, idx) => {
      console.log(`  [${idx}] ${item.productName?.translated || item.productName?.original} - Qty: ${item.quantity}`);
    });
  } catch (err) {
    console.error('Checkout failed:', err.message);
  }
}

main().catch(console.error);

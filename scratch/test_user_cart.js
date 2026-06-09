import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';
import { checkout } from '@wix/ecom';
import { resolveColor } from '../src/lib/colors.js';

const wixClient = createClient({
  modules: {
    products,
    checkout,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

const normalizeSelectedOptions = (selectedOptions, productOptions) => {
  const normalized = { ...selectedOptions };
  if (!productOptions) return normalized;

  productOptions.forEach(opt => {
    const nameLower = opt.name?.trim().toLowerCase();
    const isColor = nameLower === 'color' || nameLower === 'farge';
    const isSize = nameLower.includes('size') || nameLower.includes('størrelse') || nameLower.includes('størrelser') || nameLower.includes('format') || nameLower === 'str' || nameLower === 'str.';

    const currentValue = normalized[opt.name];
    if (currentValue) {
      if (isColor) {
        const selectedResolved = resolveColor(currentValue);
        const match = opt.choices?.find(c => {
          const choiceResolved = resolveColor(c.value);
          return choiceResolved.name === selectedResolved.name;
        });
        if (match) {
          normalized[opt.name] = match.value;
        }
      } else if (isSize) {
        const match = opt.choices?.find(c => 
          c.value?.toLowerCase() === currentValue.toLowerCase() ||
          c.description?.toLowerCase() === currentValue.toLowerCase()
        );
        if (match) {
          normalized[opt.name] = match.value;
        }
      }
    }
  });

  return normalized;
};

async function mapCartItemsToWixLineItems(items) {
  return Promise.all(items.map(async (item) => {
    const catalogReference = {
      appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
      catalogItemId: item.id
    };

    const fullProduct = (await wixClient.products.getProduct(item.id)).product;
    const productOptions = fullProduct.productOptions;
    const manageVariants = fullProduct.manageVariants;
    const variants = fullProduct.variants;

    if (productOptions && productOptions.length > 0) {
      let selectedOptions = item.selectedOptions ? { ...item.selectedOptions } : {};

      if (Object.keys(selectedOptions).length === 0) {
        const sizeOpt = productOptions.find(o => {
          const name = (o.name || '').trim().toLowerCase();
          return name.includes('size') || name.includes('størrelse') || name.includes('størrelser') || name.includes('format') || name === 'str' || name === 'str.';
        });
        const colorOpt = productOptions.find(o => {
          const name = (o.name || '').trim().toLowerCase();
          return name === 'color' || name === 'farge';
        });

        const sizeChoice = sizeOpt?.choices?.find(c => c.value === item.selectedSize || c.description === item.selectedSize);
        const colorChoice = colorOpt?.choices?.find(c => {
          const lower = c.value?.toLowerCase() || '';
          let mappedName = 'Sort';
          if (lower.includes('sort') || lower.includes('black') || lower.includes('charcoal') || lower.includes('coal') || lower.includes('rgb(0,0,0)') || lower.includes('rgb(64,64,64)')) mappedName = 'Sort';
          else if (lower.includes('hvit') || lower.includes('white') || lower.includes('rgb(252,252,252)') || lower.includes('rgb(255,255,255)')) mappedName = 'Hvit';
          else if (lower.includes('grå') || lower.includes('grey') || lower.includes('gray') || lower.includes('ash') || lower.includes('silver') || lower.includes('cement') || lower.includes('#a8a8a8') || lower.includes('grey melange') || lower.includes('sport grey')) mappedName = 'Grå';
          else if (lower.includes('blå') || lower.includes('blue') || lower.includes('navy') || lower.includes('royal') || lower.includes('sky') || lower.includes('sapphire') || lower.includes('teal')) mappedName = 'Blå';
          else if (lower.includes('rød') || lower.includes('red') || lower.includes('maroon') || lower.includes('garnet') || lower.includes('cardinal') || lower.includes('cherry')) mappedName = 'Rød';
          else if (lower.includes('grønn') || lower.includes('green') || lower.includes('kelly') || lower.includes('mint') || lower.includes('pistachio') || lower.includes('forest')) mappedName = 'Grønn';
          else if (lower.includes('gul') || lower.includes('yellow') || lower.includes('gold') || lower.includes('daisy') || lower.includes('haze')) mappedName = 'Gul';
          else if (lower.includes('rosa') || lower.includes('pink') || lower.includes('fuchsia') || lower.includes('azalea') || lower.includes('berry') || lower.includes('heliconia') || lower.includes('magenta')) mappedName = 'Rosa';
          else if (lower.includes('beige') || lower.includes('sand') || lower.includes('natural') || lower.includes('cream') || lower.includes('creamy')) mappedName = 'Beige';
          else if (lower.includes('terrakotta') || lower.includes('terracotta') || lower.includes('brun') || lower.includes('brown') || lower.includes('chocolate') || lower.includes('clay')) mappedName = 'Terracotta';
          else if (lower.includes('orange') || lower.includes('tangerine') || lower.includes('coral')) mappedName = 'Orange';
          else if (lower.includes('lilla') || lower.includes('purple') || lower.includes('violet') || lower.includes('orchid') || lower.includes('plum')) mappedName = 'Lilla';
          return mappedName === item.selectedColor;
        });

        if (sizeOpt && sizeChoice) selectedOptions[sizeOpt.name] = sizeChoice.value;
        if (colorOpt && colorChoice) selectedOptions[colorOpt.name] = colorChoice.value;
      }

      selectedOptions = normalizeSelectedOptions(selectedOptions, productOptions);

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
}

async function main() {
  const plakatId = '64bc2f66-b418-7794-9661-4d16c575d764';
  const tshirtId = '9e6a4b75-d8da-753e-ea15-93e76bf63e27'; // Praise the Lord Tee

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
      name: 'Praise the Lord Tee',
      selectedSize: 'S', // let's try size S or M or XS
      selectedColor: 'Lilla',
      selectedOptions: {
        "Farge": "#7b6bbf", // lilla color hex
        "Størrelse": "S"
      },
      quantity: 1
    }
  ];

  console.log('Mapping user cart items...');
  const lineItems = await mapCartItemsToWixLineItems(cartItems);
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
      console.log(`      Options: ${JSON.stringify(item.catalogReference.options)}`);
    });
  } catch (err) {
    console.error('Checkout failed:', err.message);
    if (err.details) console.log('Details:', JSON.stringify(err.details, null, 2));
  }
}

main().catch(console.error);

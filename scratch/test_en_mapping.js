import { createClient, OAuthStrategy } from '@wix/sdk';
import { products } from '@wix/stores';
import { resolveColor } from '../src/lib/colors.js';

const wixClient = createClient({
  modules: {
    products,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

const normalizeSelectedOptions = (selectedOptions, productOptions) => {
  const normalized = {};
  if (!productOptions) return selectedOptions;

  productOptions.forEach(opt => {
    const defaultName = opt.name;
    const nameLower = defaultName.trim().toLowerCase();
    const isColor = nameLower === 'color' || nameLower === 'farge';
    const isSize = nameLower.includes('size') || nameLower.includes('størrelse') || nameLower.includes('størrelser') || nameLower.includes('format') || nameLower === 'str' || nameLower === 'str.';

    const matchingKey = Object.keys(selectedOptions).find(k => {
      const kLower = k.trim().toLowerCase();
      if (kLower === nameLower) return true;
      if (isColor && (kLower === 'color' || kLower === 'farge')) return true;
      if (isSize && (kLower.includes('size') || kLower.includes('størrelse') || kLower.includes('størrelser') || kLower.includes('format') || kLower === 'str' || kLower === 'str.')) return true;
      return false;
    });

    if (matchingKey) {
      const currentValue = selectedOptions[matchingKey];
      if (isColor) {
        const selectedResolved = resolveColor(currentValue);
        const match = opt.choices?.find(c => {
          const choiceResolved = resolveColor(c.value);
          return choiceResolved.name === selectedResolved.name;
        });
        if (match) {
          normalized[defaultName] = match.value;
        } else {
          normalized[defaultName] = currentValue;
        }
      } else if (isSize) {
        const match = opt.choices?.find(c => 
          c.value?.toLowerCase() === currentValue.toLowerCase() ||
          c.description?.toLowerCase() === currentValue.toLowerCase()
        );
        if (match) {
          normalized[defaultName] = match.value;
        } else {
          normalized[defaultName] = currentValue;
        }
      } else {
        normalized[defaultName] = currentValue;
      }
    } else {
      if (opt.choices && opt.choices.length > 0) {
        normalized[defaultName] = opt.choices[0].value;
      }
    }
  });

  return normalized;
};

async function main() {
  const tshirtId = '9e6a4b75-d8da-753e-ea15-93e76bf63e27'; // Praise the Lord Classic Tee

  console.log('Fetching default product details from Wix...');
  const res = await wixClient.products.getProduct(tshirtId);
  const productOptions = res.product.productOptions;

  // Simulate localized English cart options
  const englishCartOptions = {
    "Color": "Purple", // or the hex of purple
    "Size": "XS"
  };

  console.log('Original English Cart Options:', englishCartOptions);
  const normalized = normalizeSelectedOptions(englishCartOptions, productOptions);
  console.log('Normalized Options for Wix Checkout:', normalized);
}

main().catch(console.error);

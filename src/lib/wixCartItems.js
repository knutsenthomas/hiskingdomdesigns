import { resolveColor } from './colors.js';

const normalizeSelectedOptions = (selectedOptions, productOptions) => {
  const normalized = {};
  if (!productOptions) return selectedOptions;

  productOptions.forEach(opt => {
    const defaultName = opt.name;
    const nameLower = defaultName.trim().toLowerCase();
    const isColor = nameLower === 'color' || nameLower === 'farge';
    const isSize = nameLower.includes('size') || nameLower.includes('størrelse') || nameLower.includes('størrelser') || nameLower.includes('format') || nameLower === 'str' || nameLower === 'str.';

    // Look for a matching key in selectedOptions (case-insensitive, localized)
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
        // Resolve the user's selected color to a standard name
        const selectedResolved = resolveColor(currentValue);
        // Find a choice in the option that resolves to the same standard name
        const match = opt.choices?.find(c => {
          const choiceResolved = resolveColor(c.value, c.description || c.name);
          return choiceResolved.name === selectedResolved.name;
        });
        if (match) {
          normalized[defaultName] = match.value;
        } else {
          normalized[defaultName] = currentValue; // fallback
        }
      } else if (isSize) {
        // For sizes, compare value or description case-insensitively
        const match = opt.choices?.find(c =>
          c.value?.toLowerCase() === currentValue.toLowerCase() ||
          c.description?.toLowerCase() === currentValue.toLowerCase()
        );
        if (match) {
          normalized[defaultName] = match.value;
        } else {
          normalized[defaultName] = currentValue; // fallback
        }
      } else {
        normalized[defaultName] = currentValue;
      }
    } else {
      // If an option is missing from the user's input, default to its first choice
      if (opt.choices && opt.choices.length > 0) {
        normalized[defaultName] = opt.choices[0].value;
      }
    }
  });

  return normalized;
};

export const mapCartItemsToWixLineItems = async (items, resolveProductDetails) => {
  return Promise.all(items.map(async (item) => {
    const catalogReference = {
      appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
      catalogItemId: item.id
    };

    // Local cart items may contain translated names (Color vs Farge).
    // Only original catalog metadata is safe for eCommerce references.
    const fullProduct = await resolveProductDetails(item.id);
    if (!fullProduct) {
      throw new Error('Kunne ikke hente produktvalg fra Wix. Prøv igjen.');
    }
    const { productOptions, manageVariants, variants } = fullProduct;

    // Handle options
    if (productOptions && productOptions.length > 0) {
      let selectedOptions = item.selectedOptions ? { ...item.selectedOptions } : {};

      // Fallback: If selectedOptions is empty, build it from selectedSize & selectedColor
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
          const resolved = resolveColor(c.value, c.description || c.name);
          return resolved.name === item.selectedColor;
        });

        if (sizeOpt && sizeChoice) {
          selectedOptions[sizeOpt.name] = sizeChoice.value;
        }
        if (colorOpt && colorChoice) {
          selectedOptions[colorOpt.name] = colorChoice.value;
        }
      }

      // Normalize selectedOptions to align local values with original database values
      selectedOptions = normalizeSelectedOptions(selectedOptions, productOptions);

      // Safety net: Ensure EVERY required product option has a value selected.
      // If an option is missing from selectedOptions, fallback to its first choice!
      productOptions.forEach(opt => {
        if (!selectedOptions[opt.name] && opt.choices && opt.choices.length > 0) {
          selectedOptions[opt.name] = opt.choices[0].value;
        }
      });

      // Set variantId or options: ALWAYS ensure exact variantId when variants exist
      let matchedVariant = null;

      // 1. Direct match by item.variantId if already stored
      if (item.variantId && variants && variants.length > 0) {
        matchedVariant = variants.find(v => (v._id === item.variantId || v.id === item.variantId));
      }

      // 2. Match by exact choices in selectedOptions
      if (!matchedVariant && variants && variants.length > 0) {
        matchedVariant = variants.find(v => {
          if (!v || !v.choices) return false;
          return Object.entries(v.choices).every(([optName, optVal]) => {
            return selectedOptions[optName] === optVal;
          });
        });
      }

      // 3. Match with resolveColor and normalized options
      if (!matchedVariant && variants && variants.length > 0) {
        matchedVariant = variants.find(v => {
          if (!v || !v.choices) return false;
          return Object.entries(v.choices).every(([optName, optVal]) => {
            const lowerName = optName.toLowerCase();
            if (lowerName === 'color' || lowerName === 'farge') {
              const vColor = resolveColor(optVal);
              const sColor = resolveColor(selectedOptions[optName] || item.selectedColor);
              return vColor.name === sColor.name;
            }
            if (lowerName.includes('size') || lowerName.includes('størrelse') || lowerName.includes('str')) {
              return String(optVal).trim().toLowerCase() === String(selectedOptions[optName] || item.selectedSize).trim().toLowerCase();
            }
            return selectedOptions[optName] === optVal;
          });
        });
      }

      const isPlaceholderVariantId = (id) => !id || id === '00000000-0000-0000-0000-000000000000' || id === '00000000-000000-000000-000000000000';

      const validMatchedVariantId = matchedVariant && !isPlaceholderVariantId(matchedVariant._id || matchedVariant.id)
        ? (matchedVariant._id || matchedVariant.id)
        : null;

      const targetVariantId = manageVariants === false ? null : validMatchedVariantId;

      if (manageVariants === true && !targetVariantId) {
        throw new Error('Den valgte produktvarianten finnes ikke. Velg størrelse og farge på nytt.');
      }

      if (targetVariantId) {
        catalogReference.options = {
          variantId: targetVariantId
        };
      } else {
        // Unmanaged variants (manageVariants === false eller kun placeholder-variant):
        // Send options med reelle valg (f.eks. Størrelse: 'M', Color: 'blå melange')
        const apiOptions = { ...selectedOptions };
        if (productOptions) {
          productOptions.forEach(opt => {
            const currentValue = apiOptions[opt.name];
            if (currentValue) {
              const choice = opt.choices?.find(c =>
                c.value === currentValue ||
                c.description === currentValue ||
                (c.description && currentValue && c.description.toLowerCase() === String(currentValue).toLowerCase())
              );
              if (choice && choice.description && choice.value !== choice.description) {
                // For farge-alternativer forventer Wix tekstnavnet ("blå melange"), ikke hex-koden ("#1364ac")
                apiOptions[opt.name] = choice.description;
              }
            }
          });
        }
        catalogReference.options = {
          options: apiOptions
        };
      }
    }

    // Handle custom text fields (FREE_TEXT choices)
    const customTextFieldsMap = {};

    // 1. Populate from item.customTextFields (user choices)
    if (item.customTextFields && item.customTextFields.length > 0) {
      item.customTextFields.forEach(field => {
        if (field.title) {
          customTextFieldsMap[field.title] = field.value || 'Tilfeldig';
        }
      });
    }

    // 2. Fallback to product definitions from Wix Catalog or stored on the cart item
    const catalogCustomFields = fullProduct.customTextFields || item.customTextFieldDefinitions || [];
    if (catalogCustomFields && catalogCustomFields.length > 0) {
      catalogCustomFields.forEach(field => {
        if (field.title && !customTextFieldsMap[field.title]) {
          customTextFieldsMap[field.title] = 'Tilfeldig';
        }
      });
    }

    // 3. Robust fallback: specific customized sticker IDs that require a custom text field
    const customStickerIds = ['bcf7626f-9509-7151-8a1e-d7ce4c3c7cef', '8ad0fd79-4c27-4d18-61e9-3d0f441be21a'];
    if (customStickerIds.includes(item.id)) {
      const mandatoryTitle = "Bestille en spesiell sticker? Fortell oss hvilken!";
      if (!customTextFieldsMap[mandatoryTitle]) {
        customTextFieldsMap[mandatoryTitle] = 'Tilfeldig';
      }
    }

    if (Object.keys(customTextFieldsMap).length > 0) {
      catalogReference.options = catalogReference.options || {};
      catalogReference.options.customTextFields = customTextFieldsMap;
    }

    return {
      catalogReference,
      quantity: item.quantity
    };
  }));
};


import React, { createContext, useState, useEffect, useContext } from 'react';
import { resolveColor } from '@/lib/colors';

const getWixClient = async () => {
  const { wixClient, resetWixTokens, isWixAuthError, isWixConflictError } = await import('@/lib/wix');
  return { wixClient, resetWixTokens, isWixAuthError, isWixConflictError };
};

/**
 * Resilient wrapper for Wix Cart / eCommerce API calls.
 * Automatically recovers from 401/403 (expired/invalid tokens) and 409 (revision conflicts).
 */
const withCartRecovery = async (operation, maxRetries = 2) => {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await operation();
    } catch (err) {
      attempt++;
      const { resetWixTokens, isWixAuthError, isWixConflictError } = await getWixClient();
      
      if (isWixAuthError(err)) {
        console.warn(`CartContext [withCartRecovery]: Auth error (401/403) on attempt ${attempt}. Resetting tokens and retrying...`, err);
        await resetWixTokens();
        window.dispatchEvent(new Event('wix-auth-change'));
        if (attempt <= maxRetries) {
          await new Promise(r => setTimeout(r, 200));
          continue;
        }
      } else if (isWixConflictError(err)) {
        console.warn(`CartContext [withCartRecovery]: Revision conflict (409) on attempt ${attempt}. Retrying with fresh server state...`, err);
        if (attempt <= maxRetries) {
          await new Promise(r => setTimeout(r, 300));
          continue;
        }
      }
      
      if (attempt > maxRetries) {
        throw err;
      }
    }
  }
};

// Context API Sikkerhetsnett: Initialiser med tom brakett for å unngå "White screen of death"
export const CartContext = createContext({});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cache to avoid duplicate fetch calls for same product ID when mapping cart items
const productCache = {};

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

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('hkd-cart-items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart items from localStorage', e);
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('hkd-applied-coupon');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem('hkd-applied-coupon', JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem('hkd-applied-coupon');
      }
    } catch (e) {
      console.error('Failed to save applied coupon to localStorage', e);
    }
  }, [appliedCoupon]);

  const [appliedGiftCard, setAppliedGiftCard] = useState(() => {
    try {
      const saved = localStorage.getItem('hkd-applied-giftcard');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [giftCardError, setGiftCardError] = useState('');
  const [isApplyingGiftCard, setIsApplyingGiftCard] = useState(false);

  useEffect(() => {
    try {
      if (appliedGiftCard) {
        localStorage.setItem('hkd-applied-giftcard', JSON.stringify(appliedGiftCard));
      } else {
        localStorage.removeItem('hkd-applied-giftcard');
      }
    } catch (e) {
      console.error('Failed to save applied giftcard to localStorage', e);
    }
  }, [appliedGiftCard]);

  useEffect(() => {
    try {
      localStorage.setItem('hkd-cart-items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart items to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, selectedSize = 'M', selectedColor = 'Hvit', qty = 1, selectedOptions = {}, customTextFields = [], variantId = null, sku = null) => {
    setIsCartDrawerOpen(true); // Open the drawer immediately on add
    setCartItems(prev => {
      const resolvedVariantId = variantId || product.variantId || product.selectedVariantId || null;
      const resolvedSku = sku || product.sku || null;

      const existingIndex = prev.findIndex(item => 
        item.id === product.id && 
        (resolvedVariantId && item.variantId ? item.variantId === resolvedVariantId : true) &&
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor &&
        JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions) &&
        JSON.stringify(item.customTextFields || []) === JSON.stringify(customTextFields)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        if (resolvedVariantId && !updated[existingIndex].variantId) {
          updated[existingIndex].variantId = resolvedVariantId;
        }
        if (resolvedSku && !updated[existingIndex].sku) {
          updated[existingIndex].sku = resolvedSku;
        }
        return updated;
      } else {
        return [...prev, {
          ...product,
          variantId: resolvedVariantId,
          sku: resolvedSku,
          selectedSize,
          selectedColor,
          selectedOptions,
          customTextFields,
          customTextFieldDefinitions: product.customTextFields || [],
          quantity: qty
        }];
      }
    });
  };

  const removeFromCart = (productId, selectedSize, selectedColor, selectedOptions = {}, customTextFields = []) => {
    setCartItems(prev => prev.filter(item => 
      !(
        item.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor &&
        JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions) &&
        JSON.stringify(item.customTextFields || []) === JSON.stringify(customTextFields)
      )
    ));
  };

  const updateQuantity = (productId, selectedSize, selectedColor, quantity, selectedOptions = {}, customTextFields = []) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor, selectedOptions, customTextFields);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (
        item.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor &&
        JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions) &&
        JSON.stringify(item.customTextFields || []) === JSON.stringify(customTextFields)
      ) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const incrementQuantity = (productId, selectedSize, selectedColor, selectedOptions = {}, customTextFields = []) => {
    setCartItems(prev => prev.map(item => {
      if (
        item.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor &&
        JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions) &&
        JSON.stringify(item.customTextFields || []) === JSON.stringify(customTextFields)
      ) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };

  const decrementQuantity = (productId, selectedSize, selectedColor, selectedOptions = {}, customTextFields = []) => {
    setCartItems(prev => prev.map(item => {
      if (
        item.id === productId && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor &&
        JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions) &&
        JSON.stringify(item.customTextFields || []) === JSON.stringify(customTextFields)
      ) {
        if (item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponError('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };



  const forceSyncCartWithWix = async (items = cartItems) => {
    return await withCartRecovery(async () => {
      console.log('Force synchronizing local cart with Wix currentCart...');
      const { wixClient } = await getWixClient();
      const localMapped = await mapCartItemsToWixLineItems(items);
      
      let wixCartRes;
      try {
        wixCartRes = await wixClient.currentCart.getCurrentCart();
      } catch (getErr) {
        if (getErr.code === 'OWNED_CART_NOT_FOUND' || getErr.message?.includes('Cart not found')) {
          if (localMapped.length > 0) {
            console.log('No Wix cart found. Adding all items directly to new Wix cart.');
            const cart = await wixClient.currentCart.addToCurrentCart({
              lineItems: localMapped
            });
            console.log('Wix cart created and items added.');
            return cart;
          }
          return null;
        }
        throw getErr;
      }

      const wixLineItems = wixCartRes.lineItems || [];
      
      // 1. Find items in Wix cart that are NOT in local cart and remove them
      const itemsToRemove = [];
      wixLineItems.forEach(wixItem => {
        const localMatch = localMapped.find(loc => {
          const appIdMatch = wixItem.catalogReference?.appId === loc.catalogReference.appId;
          const itemIdMatch = wixItem.catalogReference?.catalogItemId === loc.catalogReference.catalogItemId;
          const variantIdMatch = wixItem.catalogReference?.options?.variantId === loc.catalogReference.options?.variantId;
          
          const wixOptions = wixItem.catalogReference?.options?.options || {};
          const locOptions = loc.catalogReference.options?.options || {};
          const optionsMatch = JSON.stringify(wixOptions) === JSON.stringify(locOptions);
          
          const wixCustomFields = wixItem.catalogReference?.options?.customTextFields || {};
          const locCustomFields = loc.catalogReference.options?.customTextFields || {};
          const customFieldsMatch = JSON.stringify(wixCustomFields) === JSON.stringify(locCustomFields);
          
          return appIdMatch && itemIdMatch && variantIdMatch && optionsMatch && customFieldsMatch;
        });
        
        if (!localMatch) {
          itemsToRemove.push(wixItem._id);
        }
      });
      
      if (itemsToRemove.length > 0) {
        console.log('Removing items from Wix cart:', itemsToRemove);
        await wixClient.currentCart.removeLineItemsFromCurrentCart(itemsToRemove);
      }
      
      // Re-fetch cart if we removed items to get updated IDs and revisions
      let updatedWixCart = wixCartRes;
      if (itemsToRemove.length > 0) {
        updatedWixCart = await wixClient.currentCart.getCurrentCart();
      }
      const updatedWixLineItems = updatedWixCart.lineItems || [];
      
      // 2. Add or update remaining items
      const itemsToUpdate = [];
      const itemsToAdd = [];

      for (const loc of localMapped) {
        const wixMatch = updatedWixLineItems.find(wixItem => {
          const appIdMatch = wixItem.catalogReference?.appId === loc.catalogReference.appId;
          const itemIdMatch = wixItem.catalogReference?.catalogItemId === loc.catalogReference.catalogItemId;
          const variantIdMatch = wixItem.catalogReference?.options?.variantId === loc.catalogReference.options?.variantId;
          
          const wixOptions = wixItem.catalogReference?.options?.options || {};
          const locOptions = loc.catalogReference.options?.options || {};
          const optionsMatch = JSON.stringify(wixOptions) === JSON.stringify(locOptions);
          
          const wixCustomFields = wixItem.catalogReference?.options?.customTextFields || {};
          const locCustomFields = loc.catalogReference.options?.customTextFields || {};
          const customFieldsMatch = JSON.stringify(wixCustomFields) === JSON.stringify(locCustomFields);
          
          return appIdMatch && itemIdMatch && variantIdMatch && optionsMatch && customFieldsMatch;
        });
        
        if (wixMatch) {
          if (wixMatch.quantity !== loc.quantity) {
            itemsToUpdate.push({
              _id: wixMatch._id,
              quantity: loc.quantity
            });
          }
        } else {
          itemsToAdd.push(loc);
        }
      }

      let finalCart = updatedWixCart;

      // Batch quantity updates in a single API call
      if (itemsToUpdate.length > 0) {
        console.log('Batch updating quantities in Wix cart:', itemsToUpdate);
        const res = await wixClient.currentCart.updateCurrentCartLineItemQuantity(itemsToUpdate);
        finalCart = res.cart || res;
      }

      // Batch item additions in a single API call
      if (itemsToAdd.length > 0) {
        console.log('Batch adding items to Wix cart:', itemsToAdd);
        const res = await wixClient.currentCart.addToCurrentCart({
          lineItems: itemsToAdd
        });
        finalCart = res.cart || res;
      }

      console.log('Force Wix cart synchronization complete.');
      return finalCart;
    });
  };

  const serializedCartItems = JSON.stringify(cartItems.map(item => ({ id: item.id, qty: item.quantity })));

  // Sync local cart to Wix currentCart
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      try {
        if (!active) return;
        await forceSyncCartWithWix(cartItems);
        if (active && cartItems.length > 0) {
          const addr = shippingAddress || { country: 'NO' };
          await estimateShippingAndTotals(addr.postalCode, addr.city, addr.country);
        }
      } catch (err) {
        console.warn('Wix Cart background sync warning:', err);
      }
    }, 1500); // 1.5s debounce to avoid rapid API requests
    
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [serializedCartItems, appliedCoupon, appliedGiftCard]);
  const resolveProductDetails = async (productId) => {
    if (productCache[productId]) {
      return productCache[productId];
    }
    try {
      const { wixClient } = await getWixClient();
      const res = await wixClient.products.getProduct(productId);
      if (res && res.product) {
        productCache[productId] = res.product;
        return res.product;
      }
    } catch (err) {
      console.warn(`Failed to resolve product details for ${productId}:`, err);
    }
    return null;
  };

  /**
   * Synchronizes server cart line items from Wix eCommerce to local React state.
   * Maps variantIds, options, and customTextFields into the app's rich cart item model.
   */
  const syncServerCartToLocal = async (serverCart) => {
    if (!serverCart || !Array.isArray(serverCart.lineItems) || serverCart.lineItems.length === 0) {
      return;
    }
    try {
      console.log('CartContext: Mapping server cart items to local state...', serverCart.lineItems.length);
      const mappedItems = await Promise.all(serverCart.lineItems.map(async (lineItem) => {
        const catalogItemId = lineItem.catalogReference?.catalogItemId;
        if (!catalogItemId) return null;
        
        const variantId = lineItem.catalogReference?.options?.variantId;
        const customTextFieldsMap = lineItem.catalogReference?.options?.customTextFields || {};
        const optionsMap = lineItem.catalogReference?.options?.options || {};
        
        const fullProduct = await resolveProductDetails(catalogItemId);
        if (!fullProduct) return null;
        
        let selectedSize = 'M';
        let selectedColor = 'Hvit';
        let sku = lineItem.physicalProperties?.sku || fullProduct.sku || fullProduct._id;
        
        if (variantId && fullProduct.variants) {
          const vMatch = fullProduct.variants.find(v => (v._id === variantId || v.id === variantId));
          if (vMatch) {
            sku = vMatch.variant?.sku || vMatch.sku || sku;
            if (vMatch.choices) {
              Object.entries(vMatch.choices).forEach(([k, v]) => {
                const kLower = k.toLowerCase();
                if (kLower === 'color' || kLower === 'farge') {
                  selectedColor = resolveColor(v).name;
                } else if (kLower.includes('size') || kLower.includes('størrelse') || kLower === 'str') {
                  selectedSize = v;
                }
              });
            }
          }
        }
        
        const customTextFields = Object.entries(customTextFieldsMap).map(([title, value]) => ({
          title,
          value
        }));
        
        return {
          id: fullProduct._id || catalogItemId,
          name: fullProduct.name || lineItem.productName?.original || 'Produkt',
          price: fullProduct.price?.discountedPrice || fullProduct.price?.price || parseFloat(lineItem.price?.amount || '0'),
          image: lineItem.image?.url || fullProduct.media?.mainMedia?.image?.url || 'https://via.placeholder.com/400',
          images: fullProduct.media?.items?.filter(mi => mi.mediaType === 'image').map(mi => mi.image?.url).filter(Boolean) || [],
          media: fullProduct.media,
          mediaItems: fullProduct.media?.items || [],
          productOptions: fullProduct.productOptions,
          manageVariants: fullProduct.manageVariants,
          variants: fullProduct.variants,
          variantId,
          sku,
          selectedSize,
          selectedColor,
          selectedOptions: optionsMap,
          customTextFields,
          customTextFieldDefinitions: fullProduct.customTextFields || [],
          quantity: lineItem.quantity || 1
        };
      }));
      
      const validItems = mappedItems.filter(Boolean);
      if (validItems.length > 0) {
        setCartItems(validItems);
      }
    } catch (err) {
      console.warn('Failed to sync server cart to local state:', err);
    }
  };

  // Listen for login/logout and session token changes to immediately sync server cart
  useEffect(() => {
    let isHandlingAuth = false;
    const handleAuthChange = async () => {
      if (isHandlingAuth) return;
      isHandlingAuth = true;
      console.log('CartContext: wix-auth-change / storage change detected. Synchronizing with fresh server cart...');
      try {
        const { wixClient } = await getWixClient();
        let serverCart = null;
        try {
          serverCart = await withCartRecovery(() => wixClient.currentCart.getCurrentCart());
        } catch (getErr) {
          if (getErr.code === 'OWNED_CART_NOT_FOUND' || getErr.message?.includes('Cart not found')) {
            console.log('CartContext: No server cart exists for this session yet.');
          } else {
            console.warn('CartContext: Could not get current cart on auth change:', getErr);
          }
        }
        
        if (serverCart && Array.isArray(serverCart.lineItems) && serverCart.lineItems.length > 0) {
          console.log(`CartContext: Found ${serverCart.lineItems.length} items in server cart after login/auth change. Syncing to local...`);
          await syncServerCartToLocal(serverCart);
        } else if (cartItems.length > 0) {
          console.log('CartContext: Transferring guest cart items to active logged in session...');
          await forceSyncCartWithWix(cartItems);
        }
      } catch (err) {
        console.warn('CartContext: Error during handleAuthChange cart sync:', err);
      } finally {
        isHandlingAuth = false;
      }
    };

    window.addEventListener('wix-auth-change', handleAuthChange);
    const handleStorage = (e) => {
      if (e.key === 'wix_oauth_tokens') {
        handleAuthChange();
      }
      if (e.key === 'hkd-cart' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setCartItems(parsed);
          }
        } catch (err) {}
      }
      if (e.key === 'hkd-applied-coupon') {
        try {
          setAppliedCoupon(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (err) {}
      }
      if (e.key === 'hkd-applied-giftcard') {
        try {
          setAppliedGiftCard(e.newValue ? JSON.parse(e.newValue) : null);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('wix-auth-change', handleAuthChange);
      window.removeEventListener('storage', handleStorage);
    };
  }, [cartItems]);

  const mapCartItemsToWixLineItems = async (items) => {
    return Promise.all(items.map(async (item) => {
      const catalogReference = {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: item.id
      };

      // Use cached product options and variants if available, otherwise fetch dynamically
      let productOptions = item.productOptions;
      let manageVariants = item.manageVariants;
      let variants = item.variants;

      if (!productOptions || !variants || variants.length === 0) {
        const fullProduct = await resolveProductDetails(item.id);
        if (fullProduct) {
          productOptions = fullProduct.productOptions;
          manageVariants = fullProduct.manageVariants;
          variants = fullProduct.variants;
        }
      }

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

        if (matchedVariant) {
          catalogReference.options = {
            variantId: matchedVariant._id || matchedVariant.id
          };
        } else if (variants && variants.length > 0) {
          // Never add base product without variantId when variants exist (critical for Gelato/T-shirt.no sync)
          catalogReference.options = {
            variantId: variants[0]._id || variants[0].id
          };
        } else {
          // Fallback only if product truly has no variants defined in Wix Stores
          const apiOptions = { ...selectedOptions };
          if (productOptions) {
            productOptions.forEach(opt => {
              const currentValue = apiOptions[opt.name];
              if (currentValue) {
                const choice = opt.choices?.find(c => c.value === currentValue);
                if (choice && choice.description && choice.value !== choice.description) {
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

      // 2. Fallback to product definitions if stored on the cart item
      if (item.customTextFieldDefinitions && item.customTextFieldDefinitions.length > 0) {
        item.customTextFieldDefinitions.forEach(field => {
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

  const applyCouponCode = async (code) => {
    if (!code || code.trim() === '') return false;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      return await withCartRecovery(async () => {
        const { wixClient } = await getWixClient();
        const lineItems = await mapCartItemsToWixLineItems(cartItems);
        
        // Create a temporary checkout to validate coupon
        const testCheckout = await wixClient.checkout.createCheckout({
          lineItems,
          channelType: 'WEB'
        });

        const updatedCheckout = await wixClient.checkout.updateCheckout(testCheckout._id, {
          appliedDiscounts: [{
            coupon: {
              code: code.trim()
            }
          }]
        });

        if (updatedCheckout.appliedDiscounts && updatedCheckout.appliedDiscounts.length > 0) {
          const discountVal = parseFloat(updatedCheckout.priceSummary.discount.amount || '0');
          if (discountVal > 0) {
            setAppliedCoupon({
              code: code.trim(),
              discount: discountVal
            });
            setIsApplyingCoupon(false);
            setCouponError('');
            return true;
          }
        }
        
        setCouponError('Ugyldig rabattkode');
        setIsApplyingCoupon(false);
        return false;
      });
    } catch (err) {
      console.error('Error validating coupon:', err);
      setCouponError('Ugyldig rabattkode eller tilkoblingsfeil');
      setIsApplyingCoupon(false);
      return false;
    }
  };

  const applyGiftCardCode = async (code) => {
    if (!code || code.trim() === '') return false;
    setIsApplyingGiftCard(true);
    setGiftCardError('');
    try {
      return await withCartRecovery(async () => {
        const { wixClient } = await getWixClient();
        const lineItems = await mapCartItemsToWixLineItems(cartItems);
        
        // Create a temporary checkout to validate gift card
        const testCheckout = await wixClient.checkout.createCheckout({
          lineItems,
          channelType: 'WEB'
        });

        const updatedCheckout = await wixClient.checkout.updateCheckout(testCheckout._id, {}, {
          giftCardCode: code.trim()
        });

        if (updatedCheckout.giftCard) {
          const giftCardVal = parseFloat(updatedCheckout.giftCard.amount?.amount || '0');
          setAppliedGiftCard({
            code: code.trim(),
            amount: giftCardVal,
            obfuscatedCode: updatedCheckout.giftCard.obfuscatedCode
          });
          setIsApplyingGiftCard(false);
          setGiftCardError('');
          return true;
        }
        
        setGiftCardError('Ugyldig gavekortkode');
        setIsApplyingGiftCard(false);
        return false;
      });
    } catch (err) {
      console.error('Error validating gift card:', err);
      setGiftCardError('Ugyldig gavekortkode eller tilkoblingsfeil');
      setIsApplyingGiftCard(false);
      return false;
    }
  };

  const removeGiftCard = () => {
    setAppliedGiftCard(null);
    setGiftCardError('');
  };

  /**
   * Generates a guaranteed fresh checkout session for the active logged-in or guest session.
   * Forces fresh server cart synchronization and revision alignment right before creating the redirect.
   *
   * @param {Object} options - Redirect callbacks
   * @param {string} options.returnUrl - Post-checkout return URL
   * @param {string} options.thankYouUrl - Post-purchase thank you URL
   * @returns {Promise<string>} Fresh Wix Checkout Redirect URL
   */
  const startCheckoutRedirect = async ({
    returnUrl = window.location.origin + '/cart',
    thankYouUrl = window.location.origin + '/profile'
  } = {}) => {
    if (cartItems.length === 0) {
      throw new Error('Handlekurven er tom.');
    }

    return await withCartRecovery(async () => {
      console.log('CartContext: Generating fresh checkout session...');
      const { wixClient } = await getWixClient();
      
      // 1. Force sync local cart with Wix currentCart to ensure identical state and fresh revision
      const syncedCart = await forceSyncCartWithWix(cartItems);

      // 2. Create fresh checkout directly from the active currentCart
      let checkoutResult = null;
      if (syncedCart && Array.isArray(syncedCart.lineItems) && syncedCart.lineItems.length > 0) {
        checkoutResult = await wixClient.currentCart.createCheckoutFromCurrentCart({
          channelType: 'WEB'
        });
      } else {
        const lineItems = await mapCartItemsToWixLineItems(cartItems);
        if (!lineItems || lineItems.length === 0) {
          throw new Error('Ingen gyldige varer å utsjekke.');
        }
        checkoutResult = await wixClient.checkout.createCheckout({
          lineItems,
          channelType: 'WEB'
        });
      }

      let checkoutId = checkoutResult?.checkoutId || checkoutResult?._id || checkoutResult?.checkout?._id;
      if (!checkoutId) {
        throw new Error('Kunne ikke opprette gyldig kasse-økt.');
      }

      // 3. Attach buyer email if available (enables Wix Abandoned Cart recovery automations)
      let buyerEmail = null;
      try {
        if (wixClient.auth.loggedIn()) {
          const currentMember = await wixClient.members.getCurrentMember();
          buyerEmail = currentMember?.member?.loginEmail || currentMember?.member?.contactDetails?.emails?.[0] || null;
        }
      } catch (e) {
        // Guest user
      }
      if (!buyerEmail) {
        try {
          buyerEmail = localStorage.getItem('hkd-checkout-email') || localStorage.getItem('hkm-user-email') || null;
        } catch (e) {}
      }

      if (buyerEmail) {
        try {
          checkoutResult = await wixClient.checkout.updateCheckout(checkoutId, {
            billingInfo: {
              contactDetails: {
                email: buyerEmail
              }
            }
          });
          checkoutId = checkoutResult._id || checkoutId;
        } catch (buyerErr) {
          console.warn('Could not attach buyer email to checkout:', buyerErr);
        }
      }

      // 4. Apply active coupon code if set
      if (appliedCoupon) {
        try {
          checkoutResult = await wixClient.checkout.updateCheckout(checkoutId, {
            appliedDiscounts: [{
              coupon: {
                code: appliedCoupon.code
              }
            }]
          });
          checkoutId = checkoutResult._id || checkoutId;
        } catch (couponErr) {
          console.warn('Could not apply coupon to checkout redirect:', couponErr);
        }
      }

      // 4. Apply active gift card if set
      if (appliedGiftCard) {
        try {
          checkoutResult = await wixClient.checkout.updateCheckout(checkoutId, {}, {
            giftCardCode: appliedGiftCard.code
          });
          checkoutId = checkoutResult._id || checkoutId;
        } catch (giftCardErr) {
          console.warn('Could not apply gift card to checkout redirect:', giftCardErr);
        }
      }

      // 5. Create fresh redirect session
      const redirectSession = await wixClient.redirects.createRedirectSession({
        ecomCheckout: {
          checkoutId: checkoutId
        },
        callbacks: {
          postFlowUrl: returnUrl,
          thankYouPageUrl: thankYouUrl
        }
      });

      const redirectUrl = redirectSession.fullUrl || redirectSession.redirectSession?.fullUrl;
      if (!redirectUrl) {
        throw new Error('Mottok ingen omdirigerings-URL fra Wix.');
      }

      console.log('CartContext: Fresh checkout redirect URL created successfully.');
      return redirectUrl;
    });
  };

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('orderId') || params.has('checkoutId')) {
        console.log('Detected return from successful checkout. Clearing cart.');
        setCartItems([]);
        setAppliedCoupon(null);
        setCouponError('');
        setAppliedGiftCard(null);
        setGiftCardError('');
        localStorage.removeItem('hkd-applied-coupon');
        localStorage.removeItem('hkd-applied-giftcard');
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (e) {
      console.warn('Failed to parse checkout return parameters', e);
    }
  }, []);

  // Live shipping and tax estimation states
  const [estimatedShipping, setEstimatedShipping] = useState(null);
  const [estimatedTax, setEstimatedTax] = useState(null);
  const [estimatedRates, setEstimatedRates] = useState([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [estimatedTotal, setEstimatedTotal] = useState(null);
  const [isEstimated, setIsEstimated] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [shippingAddress, setShippingAddress] = useState(null);

  const selectShippingRate = (code) => {
    const match = estimatedRates.find(r => r.code === code);
    if (match) {
      setSelectedShippingRate(match);
    }
  };

  const estimateShippingAndTotals = async (postalCode, city, countryCode = 'NO') => {
    setIsEstimating(true);
    setEstimateError('');
    try {
      return await withCartRecovery(async () => {
        const { wixClient } = await getWixClient();
        const shippingAddressParam = {
          country: countryCode
        };
        if (postalCode) shippingAddressParam.postalCode = postalCode.trim();
        if (city) shippingAddressParam.city = city.trim();

        const response = await wixClient.currentCart.estimateCurrentCartTotals({
          shippingAddress: shippingAddressParam
        });

        if (response && response.priceSummary) {
          const shipCost = parseFloat(response.priceSummary.shipping?.amount || '0');
          const taxCost = parseFloat(response.priceSummary.tax?.amount || '0');
          const totalCost = parseFloat(response.priceSummary.total?.amount || '0');

          setEstimatedShipping(shipCost);
          setEstimatedTax(taxCost);
          setEstimatedTotal(totalCost);
          setIsEstimated(true);
          if (postalCode && city) {
            setShippingAddress({ postalCode, city, country: countryCode });
          }

          // Extract and populate actual shipping options from Wix
          const rates = [];
          if (response.shippingInfo?.carrierServiceOptions) {
            response.shippingInfo.carrierServiceOptions.forEach(carrier => {
              if (carrier.shippingOptions) {
                carrier.shippingOptions.forEach(opt => {
                  let deliveryTime = opt.logistics?.deliveryTime || '';
                  if (deliveryTime === '2-3 uker') {
                    deliveryTime = 'ca. 2 uker';
                  }
                  rates.push({
                    code: opt.code,
                    title: opt.title,
                    deliveryTime: deliveryTime,
                    cost: parseFloat(opt.cost?.price?.amount || '0')
                  });
                });
              }
            });
          }
          setEstimatedRates(rates);

          const activeCode = response.shippingInfo?.selectedCarrierServiceOption?.code;
          const activeRate = rates.find(r => r.code === activeCode) || rates[0] || null;
          setSelectedShippingRate(activeRate);

          setIsEstimating(false);
          setEstimateError('');
          return true;
        }
        throw new Error('Mottok ingen prisoppsummering fra Wix.');
      });
    } catch (err) {
      console.error('Error estimating cart totals:', err);
      setEstimateError('Kunne ikke beregne frakt. Vennligst sjekk postnummeret og prøv igjen.');
      setIsEstimating(false);
      setIsEstimated(false);
      return false;
    }
  };

  const clearEstimation = () => {
    setIsEstimated(false);
    setEstimatedShipping(null);
    setEstimatedTax(null);
    setEstimatedTotal(null);
    setShippingAddress(null);
    setEstimatedRates([]);
    setSelectedShippingRate(null);
    setEstimateError('');
  };

  // Clear estimation when cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && isEstimated) {
      clearEstimation();
    }
  }, [cartItems.length]);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calculate discount and apply it to subtotal
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const giftCardAmount = appliedGiftCard ? appliedGiftCard.amount : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  // MVA (25%) included in price: if item is 125kr, MVA is 25kr (which is subtotal * 0.2)
  // If estimated, use Wix calculated shipping
  const shipping = isEstimated && selectedShippingRate !== null 
    ? selectedShippingRate.cost 
    : (() => {
        if (subtotal === 0) return 0;
        
        // Calculate total weight of the cart
        const totalWeight = cartItems.reduce((acc, item) => acc + ((item.weight || 0) * item.quantity), 0);
        
        if (totalWeight <= 0.07) {
          return 39;
        } else if (totalWeight <= 0.35) {
          return 69;
        } else if (totalWeight <= 1.75) {
          return 99;
        } else if (totalWeight <= 4.0) {
          return 149;
        } else {
          return 199;
        }
      })();

  const mva = Math.max(0, subtotalAfterDiscount - giftCardAmount) * 0.20;
  const total = Math.max(0, subtotalAfterDiscount - giftCardAmount) + shipping;

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      incrementQuantity,
      decrementQuantity,
      clearCart,
      subtotal,
      shipping,
      mva,
      total,
      cartCount,
      appliedCoupon,
      couponError,
      isApplyingCoupon,
      applyCouponCode,
      removeCoupon,
      appliedGiftCard,
      giftCardError,
      isApplyingGiftCard,
      applyGiftCardCode,
      removeGiftCard,
      mapCartItemsToWixLineItems,
      forceSyncCartWithWix,
      syncServerCartToLocal,
      startCheckoutRedirect,
      estimatedShipping,
      estimatedTax,
      estimatedTotal,
      estimatedRates,
      selectedShippingRate,
      selectShippingRate,
      isEstimated,
      isEstimating,
      estimateError,
      shippingAddress,
      estimateShippingAndTotals,
      clearEstimation,
      isCartDrawerOpen,
      setIsCartDrawerOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

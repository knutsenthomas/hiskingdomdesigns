import React, { createContext, useState, useEffect, useContext } from 'react';
import { resolveColor } from '@/lib/colors';
import { mapCartItemsToWixLineItems as mapWixCartItems } from '@/lib/wixCartItems';
import { createVerifiedCheckout, verifyCheckout, enrichCheckout } from '@/lib/wixCheckout';

const getWixClient = async () => {
  const { wixClient, staticWixClient, resetWixTokens, isWixAuthError, isWixConflictError } = await import('@/lib/wix');
  return { wixClient, staticWixClient, resetWixTokens, isWixAuthError, isWixConflictError };
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

// Active in-flight cart operations promise to serialize checkout and prevent race conditions
let activeCartOperationPromise = Promise.resolve();

export const CartProvider = ({ children }) => {
  // Helper to safely load cart from storage with fallback
  const loadSavedCartItems = () => {
    try {
      const saved = localStorage.getItem('hkd-cart-items') || localStorage.getItem('hkd-cart') || sessionStorage.getItem('hkd-cart-items');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load cart items from localStorage', e);
    }
    return [];
  };

  const [cartItems, setCartItems] = useState(loadSavedCartItems);

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
      localStorage.setItem('hkd-cart', JSON.stringify(cartItems)); // legacy alias
      sessionStorage.setItem('hkd-cart-items', JSON.stringify(cartItems)); // resilient session fallback
      window.dispatchEvent(new CustomEvent('hkd-cart-updated', { detail: { count: cartItems.length } }));
    } catch (e) {
      console.error('Failed to save cart items to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, selectedSize = 'M', selectedColor = 'Hvit', qty = 1, selectedOptions = {}, customTextFields = [], variantId = null, sku = null) => {
    setIsCartDrawerOpen(true); // Open the drawer immediately on add
    const resolvedVariantId = variantId || product.variantId || product.selectedVariantId || null;
    const resolvedSku = sku || product.sku || null;

    const newItem = {
      ...product,
      id: product.id || product._id,
      variantId: resolvedVariantId,
      sku: resolvedSku,
      selectedSize,
      selectedColor,
      selectedOptions,
      customTextFields,
      customTextFieldDefinitions: product.customTextFields || [],
      quantity: qty
    };

    setCartItems(prev => {
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
        return [...prev, newItem];
      }
    });

    // Serialized immediate asynchronous sync to Wix currentCart
    activeCartOperationPromise = (async () => {
      try {
        console.log(`[WixCart] [ADD] time: ${new Date().toISOString()} productId: ${product.id} variantId: ${resolvedVariantId || 'none'} qty: ${qty}`);
        const { wixClient } = await getWixClient();
        const mapped = await mapCartItemsToWixLineItems([newItem]);
        if (mapped && mapped.length > 0) {
          const res = await withCartRecovery(() => wixClient.currentCart.addToCurrentCart({ lineItems: mapped }));
          console.log(`[WixCart] [ADD_SUCCESS] time: ${new Date().toISOString()} lineItems: ${res?.lineItems?.length || res?.cart?.lineItems?.length || 'ok'}`);
        }
      } catch (err) {
        console.warn(`[WixCart] [ADD_NOTICE] time: ${new Date().toISOString()} (will reconcile on checkout):`, err.message || err);
      }
    })();
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
        const rawCart = await wixClient.currentCart.getCurrentCart();
        wixCartRes = rawCart?.cart || rawCart;
      } catch (getErr) {
        if (getErr.code === 'OWNED_CART_NOT_FOUND' || getErr.message?.includes('Cart not found')) {
          if (localMapped.length > 0) {
            console.log('No Wix cart found. Adding all items directly to new Wix cart.');
            const cart = await wixClient.currentCart.addToCurrentCart({
              lineItems: localMapped
            });
            console.log('Wix cart created and items added.');
            return cart?.cart || cart;
          }
          return null;
        }
        throw getErr;
      }

      const wixLineItems = wixCartRes?.lineItems || [];

      const isCartItemMatch = (wixItem, loc) => {
        if (!wixItem || !loc) return false;
        const appIdMatch = wixItem.catalogReference?.appId === loc.catalogReference?.appId;
        const itemIdMatch = wixItem.catalogReference?.catalogItemId === loc.catalogReference?.catalogItemId;
        if (!appIdMatch || !itemIdMatch) return false;

        const wixVariantId = wixItem.catalogReference?.options?.variantId;
        const locVariantId = loc.catalogReference?.options?.variantId;
        if (wixVariantId && locVariantId) {
          if (wixVariantId !== locVariantId) return false;
        } else if (!wixVariantId && !locVariantId) {
          const wixOpt = wixItem.catalogReference?.options?.options || {};
          const locOpt = loc.catalogReference?.options?.options || {};
          if (Object.keys(wixOpt).length > 0 || Object.keys(locOpt).length > 0) {
            if (JSON.stringify(wixOpt) !== JSON.stringify(locOpt)) return false;
          }
        }

        const wixCustomFields = wixItem.catalogReference?.options?.customTextFields || {};
        const locCustomFields = loc.catalogReference?.options?.customTextFields || {};
        if (JSON.stringify(wixCustomFields) !== JSON.stringify(locCustomFields)) return false;

        return true;
      };

      // 1. Find items in Wix cart that are NOT in local cart and remove them
      const itemsToRemove = [];
      if (localMapped.length > 0) {
        wixLineItems.forEach(wixItem => {
          const localMatch = localMapped.find(loc => isCartItemMatch(wixItem, loc));
          if (!localMatch) {
            itemsToRemove.push(wixItem._id);
          }
        });
      } else if (items.length === 0 && wixLineItems.length > 0) {
        // User explicitly emptied cart
        wixLineItems.forEach(wixItem => itemsToRemove.push(wixItem._id));
      }
      
      if (itemsToRemove.length > 0) {
        console.log('Removing items from Wix cart:', itemsToRemove);
        await wixClient.currentCart.removeLineItemsFromCurrentCart(itemsToRemove);
      }
      
      // Re-fetch cart if we removed items to get updated IDs and revisions
      let updatedWixCart = wixCartRes;
      if (itemsToRemove.length > 0) {
        const rawUpdated = await wixClient.currentCart.getCurrentCart();
        updatedWixCart = rawUpdated?.cart || rawUpdated;
      }
      const updatedWixLineItems = updatedWixCart?.lineItems || [];
      
      // 2. Add or update remaining items
      const itemsToUpdate = [];
      const itemsToAdd = [];

      for (const loc of localMapped) {
        const wixMatch = updatedWixLineItems.find(wixItem => isCartItemMatch(wixItem, loc));
        
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
        finalCart = res?.cart || res;
      }

      // Batch item additions in a single API call
      if (itemsToAdd.length > 0) {
        console.log('Batch adding items to Wix cart:', itemsToAdd);
        const res = await wixClient.currentCart.addToCurrentCart({
          lineItems: itemsToAdd
        });
        finalCart = res?.cart || res;
      }

      console.log('Force Wix cart synchronization complete.');
      return finalCart?.cart || finalCart;
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
      const { staticWixClient } = await getWixClient();
      const res = await staticWixClient.products.getProduct(productId);
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
        
        let fullProduct = null;
        try {
          fullProduct = await resolveProductDetails(catalogItemId);
        } catch (err) {
          console.warn(`Could not fetch full details for ${catalogItemId}, using lineItem fallback:`, err);
        }
        
        let selectedSize = 'M';
        let selectedColor = 'Hvit';
        let sku = lineItem.physicalProperties?.sku || fullProduct?.sku || fullProduct?._id || catalogItemId;
        
        if (variantId && fullProduct?.variants) {
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
        } else if (optionsMap) {
          Object.entries(optionsMap).forEach(([k, v]) => {
            const kLower = k.toLowerCase();
            if (kLower === 'color' || kLower === 'farge') {
              selectedColor = resolveColor(v).name;
            } else if (kLower.includes('size') || kLower.includes('størrelse') || kLower === 'str') {
              selectedSize = v;
            }
          });
        }
        
        const customTextFields = Object.entries(customTextFieldsMap).map(([title, value]) => ({
          title,
          value
        }));
        
        return {
          id: fullProduct?._id || catalogItemId,
          name: fullProduct?.name || lineItem.productName?.original || lineItem.productName?.translated || 'Produkt',
          price: fullProduct?.price?.discountedPrice || fullProduct?.price?.price || parseFloat(lineItem.price?.amount || '0'),
          image: lineItem.image?.url || fullProduct?.media?.mainMedia?.image?.url || 'https://via.placeholder.com/400',
          images: fullProduct?.media?.items?.filter(mi => mi.mediaType === 'image').map(mi => mi.image?.url).filter(Boolean) || (lineItem.image?.url ? [lineItem.image.url] : []),
          media: fullProduct?.media,
          mediaItems: fullProduct?.media?.items || [],
          productOptions: fullProduct?.productOptions,
          manageVariants: fullProduct?.manageVariants,
          variants: fullProduct?.variants,
          variantId,
          sku,
          selectedSize,
          selectedColor,
          selectedOptions: optionsMap,
          customTextFields,
          customTextFieldDefinitions: fullProduct?.customTextFields || [],
          quantity: lineItem.quantity || 1
        };
      }));
      
      const validItems = mappedItems.filter(Boolean);
      if (validItems.length > 0) {
        setCartItems(prev => {
          // Merge server items with local items to ensure nothing is lost
          const merged = [...prev];
          validItems.forEach(serverItem => {
            const idx = merged.findIndex(m => 
              m.id === serverItem.id &&
              (serverItem.variantId && m.variantId ? m.variantId === serverItem.variantId : true) &&
              m.selectedSize === serverItem.selectedSize &&
              m.selectedColor === serverItem.selectedColor &&
              JSON.stringify(m.selectedOptions || {}) === JSON.stringify(serverItem.selectedOptions || {}) &&
              JSON.stringify(m.customTextFields || []) === JSON.stringify(serverItem.customTextFields || [])
            );
            if (idx === -1) {
              merged.push(serverItem);
            } else {
              merged[idx].quantity = Math.max(merged[idx].quantity, serverItem.quantity);
            }
          });
          return merged;
        });
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
        
        const activeLocal = loadSavedCartItems();
        if (serverCart && Array.isArray(serverCart.lineItems) && serverCart.lineItems.length > 0) {
          console.log(`CartContext: Found ${serverCart.lineItems.length} items in server cart after login/auth change. Syncing to local...`);
          await syncServerCartToLocal(serverCart);
        } else if (activeLocal.length > 0) {
          console.log('CartContext: Transferring guest cart items to active logged in session...');
          await forceSyncCartWithWix(activeLocal);
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
      if (e.key === 'hkd-cart-items' || e.key === 'hkd-cart') {
        if (!e.newValue || e.newValue === '[]' || e.newValue === 'null' || e.newValue === '""') {
          setCartItems([]);
        } else {
          try {
            const parsed = JSON.parse(e.newValue);
            if (Array.isArray(parsed)) {
              setCartItems(parsed);
            } else {
              setCartItems([]);
            }
          } catch (err) {
            setCartItems([]);
          }
        }
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
  }, []);

  const mapCartItemsToWixLineItems = (items) => mapWixCartItems(items, resolveProductDetails);

  const applyCouponCode = async (code) => {
    if (!code || code.trim() === '') return false;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      return await withCartRecovery(async () => {
        const { wixClient } = await getWixClient();
        const lineItems = await mapCartItemsToWixLineItems(cartItems);
        
        // Create a temporary checkout to validate coupon
        const testCheckout = await createVerifiedCheckout(wixClient, lineItems);

        const updatedCheckout = await wixClient.checkout.updateCheckout(testCheckout._id, {}, {
          couponCode: code.trim()
        });

        if (updatedCheckout.appliedDiscounts && updatedCheckout.appliedDiscounts.length > 0) {
          const discountVal = parseFloat(updatedCheckout.priceSummary?.discount?.amount || '0');
          setAppliedCoupon({
            code: code.trim(),
            discount: discountVal,
            name: updatedCheckout.appliedDiscounts[0]?.coupon?.name || code.trim()
          });
          setIsApplyingCoupon(false);
          setCouponError('');
          return true;
        }
        
        setCouponError('Ugyldig rabattkode');
        setIsApplyingCoupon(false);
        return false;
      });
    } catch (err) {
      console.error('Error validating coupon:', err);
      const appCode = err?.details?.applicationError?.code || '';
      let errorMsg = 'Ugyldig rabattkode eller tilkoblingsfeil';
      if (appCode === 'ERROR_COUPON_DOES_NOT_EXIST') {
        errorMsg = 'Rabattkoden finnes ikke';
      } else if (appCode === 'ERROR_COUPON_EXPIRED') {
        errorMsg = 'Rabattkoden er utløpt';
      } else if (appCode === 'ERROR_COUPON_MINIMUM_SUBTOTAL_NOT_REACHED') {
        errorMsg = 'Kjøpesummen er for lav for denne rabattkoden';
      } else if (err?.message && !err.message.includes('UNKNOWN')) {
        errorMsg = err.message;
      }
      setCouponError(errorMsg);
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
        const testCheckout = await createVerifiedCheckout(wixClient, lineItems);

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
   * Creates a checkout from the visible cart for the active member or guest.
   * Verifies catalog references and quantities before creating the redirect.
   *
   * @param {Object} options - Redirect callbacks
   * @param {string} options.returnUrl - Post-checkout return URL
   * @param {string} options.thankYouUrl - Post-purchase thank you URL
   * @returns {Promise<string>} Fresh Wix Checkout Redirect URL
   */
  const startCheckoutRedirect = async ({
    returnUrl = window.location.origin + '/cart',
    thankYouUrl = window.location.origin + '/profile',
    customBuyerEmail = null,
    customShippingAddress = null,
    customSelectedShippingRate = null
  } = {}) => {
    // 1. SERIALISERING: Vent på at eventuelle pågående add/update-operasjoner mot Wix er ferdige
    if (activeCartOperationPromise) {
      console.log(`[WixCart] [CHECKOUT_WAIT] time: ${new Date().toISOString()} Venter på at pågående handlekurvoperasjon skal fullføres...`);
      await activeCartOperationPromise;
    }

    // Safety check: if React state is temporarily empty, try to restore from storage fallback first
    let itemsToCheckout = cartItems;
    if (!itemsToCheckout || itemsToCheckout.length === 0) {
      const saved = loadSavedCartItems();
      if (saved && saved.length > 0) {
        itemsToCheckout = saved;
        setCartItems(saved);
      }
    }

    if (!itemsToCheckout || itemsToCheckout.length === 0) {
      throw new Error('Handlekurven er tom.');
    }

    return await withCartRecovery(async () => {
      const { wixClient } = await getWixClient();
      console.log(`[WixCart] [CHECKOUT_START] time: ${new Date().toISOString()} localItemsCount: ${itemsToCheckout.length}`);

      // The visible cart is authoritative. A nonempty currentCart can still
      // contain old quantities or removed items while background sync runs.
      const lineItems = await mapCartItemsToWixLineItems(itemsToCheckout);
      const checkoutResult = await createVerifiedCheckout(wixClient, lineItems);
      let checkoutId = checkoutResult._id;

      // 4. Attach buyer email if available (enables Wix Abandoned Cart recovery automations)
      let buyerEmail = null;
      try {
        if (wixClient.auth.loggedIn()) {
          const currentMember = await wixClient.members.getCurrentMember();
          buyerEmail = currentMember?.member?.loginEmail || currentMember?.member?.contactDetails?.emails?.[0] || null;
        }
      } catch (e) {}
      if (!buyerEmail) {
        try {
          buyerEmail = localStorage.getItem('hkd-checkout-email') || localStorage.getItem('hkm-user-email') || null;
        } catch (e) {}
      }

      const effectiveBuyerEmail = customBuyerEmail || buyerEmail;
      const effectiveShippingAddress = customShippingAddress || shippingAddress;
      const effectiveShippingRate = customSelectedShippingRate || selectedShippingRate;

      checkoutId = await enrichCheckout(wixClient, checkoutId, {
        buyerEmail: effectiveBuyerEmail,
        shippingAddress: effectiveShippingAddress,
        selectedShippingRate: effectiveShippingRate,
        couponCode: appliedCoupon?.code,
        giftCardCode: appliedGiftCard?.code
      });

      await verifyCheckout(wixClient, checkoutId, lineItems);

      // 7. Create fresh redirect session with automatic fallback on expired checkout session
      let redirectSession = null;
      try {
        redirectSession = await wixClient.redirects.createRedirectSession({
          ecomCheckout: {
            checkoutId: checkoutId
          },
          callbacks: {
            postFlowUrl: returnUrl,
            thankYouPageUrl: thankYouUrl
          }
        });
      } catch (redirectErr) {
        const msg = (redirectErr?.message || String(redirectErr)).toLowerCase();
        const violations = redirectErr?.details?.validationError?.fieldViolations || [];
        const isSessionExpiredErr = 
          msg.includes('session expired') ||
          msg.includes('expirationtime') ||
          violations.some(v => v.ruleName === 'EXPIRED_SESSION_CANT_BE_USED' || v.field === 'expirationTime' || (v.description && v.description.toLowerCase().includes('expired')));

        if (isSessionExpiredErr) {
          console.warn(`[WixCart] [EXPIRED_SESSION_FALLBACK] Wix avviste checkoutId ${checkoutId} fordi kassen er utløpt. Genererer en ny, gyldig kasse umiddelbart...`, redirectErr);
          const freshCheckout = await createVerifiedCheckout(wixClient, lineItems);
          let freshId = freshCheckout._id || freshCheckout.checkoutId || freshCheckout.checkout?._id;
          if (freshId) {
            freshId = await enrichCheckout(wixClient, freshId, {
              buyerEmail,
              shippingAddress,
              selectedShippingRate,
              couponCode: appliedCoupon?.code,
              giftCardCode: appliedGiftCard?.code
            });
            await verifyCheckout(wixClient, freshId, lineItems);
            redirectSession = await wixClient.redirects.createRedirectSession({
              ecomCheckout: {
                checkoutId: freshId
              },
              callbacks: {
                postFlowUrl: returnUrl,
                thankYouPageUrl: thankYouUrl
              }
            });
            checkoutId = freshId;
          } else {
            throw redirectErr;
          }
        } else {
          throw redirectErr;
        }
      }

      const redirectUrl = redirectSession?.fullUrl || redirectSession?.redirectSession?.fullUrl;
      if (!redirectUrl) {
        throw new Error('Mottok ingen omdirigerings-URL fra Wix.');
      }

      console.log(`[WixCart] [REDIRECT_SUCCESS] time: ${new Date().toISOString()} checkoutId: ${checkoutId}`);
      try {
        sessionStorage.setItem('hkd_pending_checkout_id', checkoutId);
      } catch (e) {}
      return redirectUrl;
    });
  };

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const hasOrderId = params.has('orderId') && params.get('orderId')?.trim();
      const hasCheckoutId = params.has('checkoutId') && params.get('checkoutId')?.trim();

      if (hasOrderId) {
        const orderId = params.get('orderId').trim();
        const pendingCheckoutId = sessionStorage.getItem('hkd_pending_checkout_id');

        const verifyAndClearOrder = async () => {
          let shouldClear = false;

          // Sjekk 1: Aktiv checkout-økt i denne nettleseren
          if (pendingCheckoutId) {
            try {
              const { wixClient } = await getWixClient();
              const order = await wixClient.orders.getOrder(orderId);
              if (order?._id) {
                const isFailedOrCanceled = order.status === 'CANCELED' || (order.paymentStatus === 'NOT_PAID' && order.status !== 'APPROVED');
                if (!isFailedOrCanceled) {
                  shouldClear = true;
                } else {
                  console.warn(`[WixCart] Ordre ${orderId} er ikke betalt eller avbrutt (status: ${order.status}, payment: ${order.paymentStatus}). Handlekurv bevares.`);
                }
              } else {
                shouldClear = true;
              }
            } catch (err) {
              // Gjestebruker har kanskje ikke lesetilgang til full ordre - pending checkout bekrefter fullført flyt
              shouldClear = true;
            }
          } else {
            // Sjekk 2: Verifiser mot Wix Orders API hvis pendingCheckoutId mangler (f.eks. ved direkte URL-navigasjon)
            try {
              const { wixClient } = await getWixClient();
              const order = await wixClient.orders.getOrder(orderId);
              if (order?._id) {
                const isPaidOrApproved = order.paymentStatus === 'PAID' || order.status === 'APPROVED';
                if (isPaidOrApproved) {
                  shouldClear = true;
                } else {
                  console.warn(`[WixCart] Ordre ${orderId} mangler bekreftet betaling. Handlekurv bevares.`);
                }
              }
            } catch (orderErr) {
              console.warn('[WixCart] Kunne ikke verifisere orderId mot Wix:', orderErr?.message || orderErr);
            }
          }

          if (shouldClear) {
            console.log(`[WixCart] [ORDER_COMPLETED] time: ${new Date().toISOString()} orderId: ${orderId} - Tømmer handlekurv etter bekreftet kjøp.`);
            sessionStorage.removeItem('hkd_pending_checkout_id');
            setCartItems([]);
            setAppliedCoupon(null);
            setCouponError('');
            setAppliedGiftCard(null);
            setGiftCardError('');
            localStorage.removeItem('hkd-applied-coupon');
            localStorage.removeItem('hkd-applied-giftcard');
            localStorage.removeItem('hkd-cart-items');
            localStorage.removeItem('hkd-cart');
            sessionStorage.removeItem('hkd-cart-items');
          } else {
            console.warn(`[WixCart] [UNVERIFIED_ORDER_RETURN] Ingen aktiv checkout eller gyldig ordre for ${orderId}. Handlekurven bevares.`);
          }

          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        };

        verifyAndClearOrder();
      } else if (hasCheckoutId) {
        console.log(`[WixCart] [CHECKOUT_RETURN] time: ${new Date().toISOString()} checkoutId: ${params.get('checkoutId')} - Bevarer kundenes varer.`);
        sessionStorage.removeItem('hkd_pending_checkout_id');
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
      setShippingAddress,
      estimateShippingAndTotals,
      clearEstimation,
      isCartDrawerOpen,
      setIsCartDrawerOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

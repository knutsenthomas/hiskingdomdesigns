import React, { createContext, useState, useEffect, useContext } from 'react';
import { wixClient } from '@/lib/wix';

// Context API Sikkerhetsnett: Initialiser med tom brakett for å unngå "White screen of death"
export const CartContext = createContext({});

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
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

  useEffect(() => {
    try {
      localStorage.setItem('hkd-cart-items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart items to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, selectedSize = 'M', selectedColor = 'Hvit', qty = 1, selectedOptions = {}, customTextFields = []) => {
    setIsCartDrawerOpen(true); // Open the drawer immediately on add
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor &&
        JSON.stringify(item.selectedOptions || {}) === JSON.stringify(selectedOptions) &&
        JSON.stringify(item.customTextFields || []) === JSON.stringify(customTextFields)
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [...prev, {
          ...product,
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

  const forceSyncCartWithWix = async (items = cartItems) => {
    try {
      console.log('Force synchronizing local cart with Wix currentCart...');
      const localMapped = mapCartItemsToWixLineItems(items);
      
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
            console.log(`Updating quantity for Wix line item ${wixMatch._id} to ${loc.quantity}`);
            await wixClient.currentCart.updateCurrentCartLineItemQuantity([
              {
                _id: wixMatch._id,
                quantity: loc.quantity
              }
            ]);
          }
        } else {
          console.log('Adding item to Wix cart:', loc);
          await wixClient.currentCart.addToCurrentCart({
            lineItems: [loc]
          });
        }
      }
      console.log('Force Wix cart synchronization complete.');
      return await wixClient.currentCart.getCurrentCart();
    } catch (err) {
      console.error('Error during forceSyncCartWithWix:', err);
      throw err;
    }
  };

  const serializedCartItems = JSON.stringify(cartItems.map(item => ({ id: item.id, qty: item.quantity })));

  // Sync local cart to Wix currentCart for Abandoned Cart recovery and estimate shipping rates
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
  }, [serializedCartItems]);

  const mapCartItemsToWixLineItems = (items) => {
    return items.map(item => {
      const catalogReference = {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: item.id
      };

      // Handle options
      if (item.productOptions && item.productOptions.length > 0) {
        let selectedOptions = item.selectedOptions ? { ...item.selectedOptions } : {};

        // Fallback: If selectedOptions is empty, build it from selectedSize & selectedColor
        if (Object.keys(selectedOptions).length === 0) {
          const sizeOpt = item.productOptions.find(o => {
            const name = o.name?.trim().toLowerCase();
            return name.includes('size') || name.includes('størrelse') || name.includes('størrelser') || name.includes('format') || name === 'str' || name === 'str.';
          });
          const colorOpt = item.productOptions.find(o => {
            const name = o.name?.trim().toLowerCase();
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
            else if (lower.startsWith('#') || lower.startsWith('rgb')) {
              if (lower.includes('255,255,255') || lower === '#ffffff') mappedName = 'Hvit';
              else if (lower.includes('0,0,0') || lower === '#000000' || lower === '#151a21') mappedName = 'Sort';
              else mappedName = 'Grå';
            }
            return mappedName === item.selectedColor;
          });

          if (sizeOpt && sizeChoice) {
            selectedOptions[sizeOpt.name] = sizeChoice.value;
          }
          if (colorOpt && colorChoice) {
            selectedOptions[colorOpt.name] = colorChoice.value;
          }
        }

        // Safety net: Ensure EVERY required product option has a value selected.
        // If an option is missing from selectedOptions, fallback to its first choice!
        item.productOptions.forEach(opt => {
          if (!selectedOptions[opt.name] && opt.choices && opt.choices.length > 0) {
            selectedOptions[opt.name] = opt.choices[0].value;
          }
        });

        // Set variantId or options based on manageVariants
        if (item.manageVariants && item.variants && item.variants.length > 0) {
          const match = item.variants.find(v => {
            return Object.entries(v.choices).every(([optName, optVal]) => {
              return selectedOptions[optName] === optVal;
            });
          });

          if (match) {
            catalogReference.options = {
              variantId: match._id
            };
          } else {
            // If managed variants fails to match, fall back to first variant as a safe default
            catalogReference.options = {
              variantId: item.variants[0]._id
            };
          }
        } else {
          catalogReference.options = {
            options: selectedOptions
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
    });
  };

  const applyCouponCode = async (code) => {
    if (!code || code.trim() === '') return false;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const lineItems = mapCartItemsToWixLineItems(cartItems);
      
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
    } catch (err) {
      console.error('Error validating coupon:', err);
      setCouponError('Ugyldig rabattkode eller tilkoblingsfeil');
      setIsApplyingCoupon(false);
      return false;
    }
  };

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

  const applyGiftCardCode = async (code) => {
    if (!code || code.trim() === '') return false;
    setIsApplyingGiftCard(true);
    setGiftCardError('');
    try {
      const lineItems = mapCartItemsToWixLineItems(cartItems);
      
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

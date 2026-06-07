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

  useEffect(() => {
    try {
      localStorage.setItem('hkd-cart-items', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart items to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, selectedSize = 'M', selectedColor = 'Hvit', qty = 1) => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(item => 
        item.id === product.id && 
        item.selectedSize === selectedSize && 
        item.selectedColor === selectedColor
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
          quantity: qty
        }];
      }
    });
  };

  const removeFromCart = (productId, selectedSize, selectedColor) => {
    setCartItems(prev => prev.filter(item => 
      !(item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor)
    ));
  };

  const updateQuantity = (productId, selectedSize, selectedColor, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }
    setCartItems(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const incrementQuantity = (productId, selectedSize, selectedColor) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };

  const decrementQuantity = (productId, selectedSize, selectedColor) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
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

  const mapCartItemsToWixLineItems = (items) => {
    return items.map(item => {
      const catalogReference = {
        appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
        catalogItemId: item.id
      };

      if (item.productOptions && item.productOptions.length > 0) {
        if (item.manageVariants && item.variants && item.variants.length > 0) {
          const selectedOptions = {};
          
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

          const match = item.variants.find(v => {
            return Object.entries(v.choices).every(([optName, optVal]) => {
              return selectedOptions[optName] === optVal;
            });
          });

          if (match) {
            catalogReference.options = {
              variantId: match._id
            };
          }
        } else {
          const selectedOptions = {};
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

          catalogReference.options = {
            options: selectedOptions
          };
        }
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

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('orderId') || params.has('checkoutId')) {
        console.log('Detected return from successful checkout. Clearing cart.');
        setCartItems([]);
        setAppliedCoupon(null);
        setCouponError('');
        localStorage.removeItem('hkd-applied-coupon');
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (e) {
      console.warn('Failed to parse checkout return parameters', e);
    }
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal === 0 ? 0 : (subtotal >= 800 ? 0 : 49);
  
  // Calculate discount and apply it to subtotal
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  // MVA (25%) included in price: if item is 125kr, MVA is 25kr (which is subtotal * 0.2)
  const mva = subtotalAfterDiscount * 0.20;
  const total = subtotalAfterDiscount + shipping;
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
      mapCartItemsToWixLineItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

import React, { createContext, useState, useEffect, useContext } from 'react';

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
  };

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has('orderId') || params.has('checkoutId')) {
        console.log('Detected return from successful checkout. Clearing cart.');
        setCartItems([]);
        const newUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (e) {
      console.warn('Failed to parse checkout return parameters', e);
    }
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal === 0 ? 0 : (subtotal >= 800 ? 0 : 49);
  // MVA (25%) included in price: if item is 125kr, MVA is 25kr (which is subtotal * 0.2)
  const mva = subtotal * 0.20;
  const total = subtotal + shipping;
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
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

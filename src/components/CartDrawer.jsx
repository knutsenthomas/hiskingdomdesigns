import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getOptimizedWixImageUrl } from '@/lib/media';
import { wixClient } from '@/lib/wix';

export default function CartDrawer() {
  const { 
    cartItems, 
    isCartDrawerOpen, 
    setIsCartDrawerOpen, 
    incrementQuantity, 
    decrementQuantity, 
    removeFromCart, 
    subtotal,
    appliedCoupon,
    appliedGiftCard,
    mapCartItemsToWixLineItems,
    forceSyncCartWithWix
  } = useCart();

  const navigate = useNavigate();
  const drawerRef = useRef(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isCartDrawerOpen) {
        setIsCartDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartDrawerOpen, setIsCartDrawerOpen]);

  // Disable body scroll when drawer is open
  useEffect(() => {
    if (isCartDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen]);

  // Click outside to close helper
  const handleBackdropClick = (e) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target)) {
      setIsCartDrawerOpen(false);
    }
  };

  // Direct Wix Checkout logic from drawer
  const handleDirectCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsRedirecting(true);
    setCheckoutError('');

    try {
      // 1. Force synchronize the cart state with Wix to avoid out-of-sync or debounce delays
      await forceSyncCartWithWix(cartItems);

      // 2. Create the checkout from the visitor's active cart session
      let checkoutResult = await wixClient.currentCart.createCheckoutFromCurrentCart({
        channelType: 'WEB'
      });

      let checkoutId = checkoutResult._id;

      // Apply coupon code if active in context
      if (appliedCoupon) {
        try {
          checkoutResult = await wixClient.checkout.updateCheckout(checkoutId, {
            appliedDiscounts: [{
              coupon: {
                code: appliedCoupon.code
              }
            }]
          });
          checkoutId = checkoutResult._id;
        } catch (cErr) {
          console.warn('Could not apply coupon in CartDrawer checkout:', cErr);
        }
      }

      // Apply gift card code if active in context
      if (appliedGiftCard) {
        try {
          checkoutResult = await wixClient.checkout.updateCheckout(checkoutId, {}, {
            giftCardCode: appliedGiftCard.code
          });
          checkoutId = checkoutResult._id;
        } catch (gErr) {
          console.warn('Could not apply gift card in CartDrawer checkout:', gErr);
        }
      }

      const redirectSession = await wixClient.redirects.createRedirectSession({
        ecomCheckout: {
          checkoutId: checkoutId
        },
        callbacks: {
          postFlowUrl: window.location.origin + '/cart',
          thankYouPageUrl: window.location.origin + '/profile'
        }
      });

      const redirectUrl = redirectSession.fullUrl || redirectSession.redirectSession?.fullUrl;
      if (redirectUrl) {
        setIsCartDrawerOpen(false);
        window.location.href = redirectUrl;
      } else {
        throw new Error('Mottok ingen omdirigerings-URL fra Wix.');
      }
    } catch (err) {
      console.error('CartDrawer Checkout error:', err);
      setCheckoutError('Kunne ikke opprette betaling. Vennligst gå til handlekurven.');
      setIsRedirecting(false);
    }
  };

  // Progress to free shipping (1500 kr)
  const FREE_SHIPPING_THRESHOLD = 1500;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div 
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[100] flex justify-end bg-onyx/40 backdrop-blur-sm pointer-events-auto"
        >
          {/* Drawer Panel */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-full max-w-[440px] h-full bg-white shadow-2xl flex flex-col relative"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between bg-parchment/30">
              <div className="flex items-center gap-2.5">
                <ShoppingBag size={20} className="text-terracotta" />
                <h2 className="font-headline-md text-headline-md text-onyx font-bold">Handlekurv</h2>
                <span className="bg-terracotta/10 text-terracotta text-xs font-bold px-2 py-0.5 rounded-full">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              </div>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-secondary hover:text-onyx transition-all active:scale-95"
                title="Lukk handlekurv"
              >
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress Indicator (Byråstandard Upsell UX) */}
            {cartItems.length > 0 && (
              <div className="px-6 py-4 bg-terracotta/5 border-b border-terracotta/10 text-xs text-onyx">
                {amountToFreeShipping > 0 ? (
                  <p className="mb-2 font-medium">
                    Du er bare <strong className="text-terracotta font-bold">{amountToFreeShipping} kr</strong> unna <strong className="text-primary-dark">gratis frakt</strong>!
                  </p>
                ) : (
                  <p className="mb-2 font-medium text-emerald-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                    Gratulerer! Du har oppnådd **gratis frakt**.
                  </p>
                )}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-terracotta to-[#bd4f2a] transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
              {checkoutError && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-3 rounded-lg font-medium text-center">
                  {checkoutError}
                </div>
              )}

              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4 select-none">
                  <div className="w-16 h-16 rounded-full bg-parchment flex items-center justify-center text-secondary/60">
                    <ShoppingBag size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-onyx text-base">Kurven er tom</h3>
                    <p className="text-xs text-secondary/70 mt-1 max-w-[240px] mx-auto">
                      Du har ikke lagt til noen produkter i handlekurven din ennå.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      navigate('/products');
                    }}
                    className="bg-terracotta text-white font-label-md text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-opacity-95 active:scale-95 transition-all shadow-md"
                  >
                    Utforsk butikken
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div 
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex gap-4 p-3 border border-outline-variant/30 rounded-xl bg-white hover:border-outline-variant transition-all"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-parchment rounded-lg overflow-hidden shrink-0 border border-slate-100">
                      <img
                        src={getOptimizedWixImageUrl(item.image, 160, 160)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    {/* Item info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-bold text-sm text-onyx line-clamp-1 hover:text-terracotta transition-colors">
                            <Link 
                              to={`/product/${item.id}`}
                              onClick={() => setIsCartDrawerOpen(false)}
                            >
                              {item.name}
                            </Link>
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor, item.selectedOptions, item.customTextFields)}
                            className="text-secondary/50 hover:text-red-500 transition-colors p-0.5 hover:bg-slate-50 rounded"
                            title="Fjern vare"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        
                        <div className="text-[10px] text-secondary mt-0.5 uppercase tracking-wide">
                          {((item.sizes && item.sizes.length > 0 && !item.sizes.includes('One Size')) || item.selectedSize !== 'One Size') && (
                            <span>Størrelse: <span className="font-bold text-onyx">{item.selectedSize}</span> • </span>
                          )}
                          {((item.colors && item.colors.length > 0 && !item.colorNames.includes('Terracotta')) || item.selectedColor !== 'Terracotta') && (
                            <span>Farge: <span className="font-bold text-onyx">{item.selectedColor}</span> • </span>
                          )}
                          {item.selectedOptions && Object.entries(item.selectedOptions).map(([optName, optVal]) => {
                            const nameLower = optName.toLowerCase();
                            const isSize = nameLower.includes('size') || nameLower.includes('størrelse') || nameLower.includes('størrelser') || nameLower.includes('format') || nameLower === 'str' || nameLower === 'str.';
                            const isColor = nameLower === 'color' || nameLower === 'farge';
                            if (isSize || isColor) return null;
                            return (
                              <span key={optName}>
                                {optName}: <span className="font-bold text-onyx">{optVal}</span> • </span>
                            );
                          })}
                        </div>
                        {item.customTextFields && item.customTextFields.length > 0 && (
                          <div className="mt-1.5 bg-slate-50 p-2 rounded-lg border border-slate-100/70 text-[10px] text-secondary lowercase first-letter:uppercase normal-case">
                            {item.customTextFields.map(field => (
                              <div key={field.title}>
                                <strong className="text-onyx font-semibold">{field.title}:</strong> {field.value === 'Tilfeldig' ? 'Vilkårlig motiv (vi velger for deg)' : field.value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-end justify-between mt-2">
                        {/* Qty Selector */}
                        <div className="flex items-center border border-outline rounded-lg bg-slate-50 scale-90 -ml-2 select-none">
                          <button
                            onClick={() => decrementQuantity(item.id, item.selectedSize, item.selectedColor, item.selectedOptions, item.customTextFields)}
                            className="p-1.5 hover:text-terracotta transition-colors"
                            title="Reduser antall"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-onyx">{item.quantity}</span>
                          <button
                            onClick={() => incrementQuantity(item.id, item.selectedSize, item.selectedColor, item.selectedOptions, item.customTextFields)}
                            className="p-1.5 hover:text-terracotta transition-colors"
                            title="Øk antall"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="font-semibold text-sm text-terracotta">{item.price * item.quantity} kr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-outline-variant/30 p-6 bg-parchment/10 space-y-4 shrink-0">
                <div className="flex items-center justify-between text-onyx">
                  <span className="text-sm font-semibold">Subtotal</span>
                  <span className="font-headline-md text-headline-md text-terracotta font-extrabold">{subtotal} kr</span>
                </div>
                <p className="text-[11px] text-secondary">
                  Frakt og eventuelle rabattkoder beregnes i neste steg. Vi støtter sikker utsjekk med Vipps og kort.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Se handlekurv */}
                  <button
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      navigate('/cart');
                    }}
                    className="border border-outline hover:border-terracotta hover:text-terracotta text-onyx font-label-md text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                  >
                    Se handlekurv
                  </button>

                  {/* Kassen / Gå til betaling */}
                  <button
                    onClick={handleDirectCheckout}
                    disabled={isRedirecting}
                    className="bg-[#1B4965] hover:bg-opacity-95 text-white font-label-md text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
                  >
                    {isRedirecting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sender...
                      </>
                    ) : (
                      <>
                        Til kassen
                        <Lock size={12} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

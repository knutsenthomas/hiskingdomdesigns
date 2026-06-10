import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingCart, Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { getOptimizedWixImageUrl } from '@/lib/media';
import { wixClient } from '@/lib/wix';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CartDrawer() {
  const { t, translateProduct, formatPrice, getActiveCurrency } = useLanguage();
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
    forceSyncCartWithWix,
    prefetchedCheckoutUrl
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

  // Reset redirect state if user navigates back to page with CartDrawer
  useEffect(() => {
    const handlePageShow = () => {
      setIsRedirecting(false);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

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

    if (prefetchedCheckoutUrl) {
      console.log('Redirecting instantly using prefetched checkout URL.');
      window.location.href = prefetchedCheckoutUrl;
      return;
    }

    try {
      // 1. Force sync the local cart with Wix to guarantee they are identical (defensive)
      try {
        await forceSyncCartWithWix(cartItems);
      } catch (syncErr) {
        console.warn('Wix Cart sync failed before checkout creation:', syncErr);
      }

      // 2. Create the checkout directly from the Wix currentCart
      let checkoutResult = await wixClient.currentCart.createCheckoutFromCurrentCart({
        channelType: 'WEB'
      });

      let checkoutId = checkoutResult.checkoutId || checkoutResult._id || checkoutResult.checkout?._id;

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
      try {
        console.error('Wix Checkout Error Details:', JSON.stringify(err.details || err));
      } catch (jsonErr) {
        console.error('Wix Checkout Error Details (raw):', err.details || err);
      }
      setCheckoutError('Kunne ikke opprette betaling. Vennligst gå til handlekurven.');
      setIsRedirecting(false);
    }
  };


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
                <ShoppingCart size={20} className="text-terracotta" />
                <h2 className="font-headline-md text-headline-md text-onyx font-bold">{t('nav.cart')}</h2>
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
                    <ShoppingCart size={32} />
                  </div>
                  <div>
                    <h3 className="font-bold text-onyx text-base">{t('cart.empty')}</h3>
                    <p className="text-xs text-secondary/70 mt-1 max-w-[240px] mx-auto">
                      {t('cart.emptyDrawerDesc')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      navigate('/products');
                    }}
                    className="bg-terracotta text-white font-label-md text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-opacity-95 active:scale-95 transition-all shadow-md"
                  >
                    {t('cart.exploreProducts')}
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const translatedItem = translateProduct(item);
                  return (
                    <div 
                      key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                      className="flex gap-4 p-3 border border-outline-variant/30 rounded-xl bg-white hover:border-outline-variant transition-all"
                    >
                      {/* Item Image */}
                      <div className="w-20 h-20 bg-parchment rounded-lg overflow-hidden shrink-0 border border-slate-100">
                        <img
                          src={getOptimizedWixImageUrl(item.image, 160, 160)}
                          alt={translatedItem.name}
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
                                {translatedItem.name}
                              </Link>
                            </h4>
                            <button
                              onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor, item.selectedOptions, item.customTextFields)}
                              className="text-secondary/50 hover:text-red-500 transition-colors p-0.5 hover:bg-slate-50 rounded"
                              title={t('cart.remove')}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          
                          <div className="text-[10px] text-secondary mt-0.5 uppercase tracking-wide">
                            {((item.sizes && item.sizes.length > 0 && !item.sizes.includes('One Size')) || item.selectedSize !== 'One Size') && (
                              <span>{t('product.size')}: <span className="font-bold text-onyx">{item.selectedSize}</span> • </span>
                            )}
                            {((item.colors && item.colors.length > 0 && !item.colorNames.includes('Terracotta')) || item.selectedColor !== 'Terracotta') && (
                              <span>{t('product.color')}: <span className="font-bold text-onyx">{item.selectedColor}</span> • </span>
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
                                  <strong className="text-onyx font-semibold">{field.title}:</strong> {field.value === 'Tilfeldig' ? t('product.leaveMotif') : field.value}
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
                              title={t('cart.decrement')}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-semibold text-onyx">{item.quantity}</span>
                            <button
                              onClick={() => incrementQuantity(item.id, item.selectedSize, item.selectedColor, item.selectedOptions, item.customTextFields)}
                              className="p-1.5 hover:text-terracotta transition-colors"
                              title={t('cart.increment')}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                        {/* Price */}
                        <div className="text-right shrink-0">
                          <span className="font-semibold text-sm text-terracotta">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {/* Footer / Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-outline-variant/30 p-6 bg-parchment/10 space-y-4 shrink-0">
                <div className="flex items-center justify-between text-onyx">
                  <span className="text-sm font-semibold">{t('cart.subtotal')}</span>
                  <span className="font-headline-md text-headline-md text-onyx font-extrabold">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-[11px] text-secondary">
                  {t('cart.drawerShippingNotice')}
                </p>

                {getActiveCurrency() !== 'NOK' && (
                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/40">
                    {t('cart.checkoutDisclaimer')}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {/* Se handlekurv */}
                  <button
                    onClick={() => {
                      setIsCartDrawerOpen(false);
                      navigate('/cart');
                    }}
                    className="border border-outline hover:border-terracotta hover:text-terracotta text-onyx font-label-md text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                  >
                    {t('cart.viewCart')}
                  </button>

                  {/* Kassen / Gå til betaling */}
                  <button
                    onClick={handleDirectCheckout}
                    disabled={isRedirecting}
                    className="bg-terracotta hover:bg-opacity-95 text-white font-label-md text-xs font-bold uppercase tracking-wider py-3.5 px-4 rounded-xl active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
                  >
                    {isRedirecting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t('cart.sending')}
                      </>
                    ) : (
                      <>
                        {t('cart.checkout')}
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

      {/* Loading Overlay */}
      {isRedirecting && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center space-y-6 max-w-sm px-6 text-center">
            {/* Animated premium spinner */}
            <div className="relative w-16 h-16">
              <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-2 select-none">
              <h3 className="font-headline-md text-lg text-onyx font-bold">{t('cart.securePayment')}</h3>
              <p className="text-xs text-secondary leading-relaxed">
                {t('cart.pleaseWaitCheckout')}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, ArrowRight, Truck, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { wixClient } from '@/lib/wix';
import useMeta from '@/hooks/useMeta';

export default function Cart() {
  useMeta(
    "Handlekurv",
    "Gå til kassen og betal trygt og enkelt. Se over produktene dine i handlekurven hos His Kingdom Designs."
  );

  const {
    cartItems,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    subtotal,
    shipping,
    mva,
    total,
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
    isEstimated,
    isEstimating,
    estimateError,
    shippingAddress,
    estimateShippingAndTotals,
    clearEstimation
  } = useCart();
  const navigate = useNavigate();
  const [checkoutStep, setCheckoutStep] = useState(null); // 'billing' | 'success'
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasReferral, setHasReferral] = useState(false);

  useEffect(() => {
    try {
      const ref = localStorage.getItem('hkm_referral_id');
      if (ref) {
        setHasReferral(true);
      }
    } catch (e) {}
  }, []);

  // Auto-prefill and calculate shipping from logged-in member's saved address on mount
  useEffect(() => {
    async function loadMemberAddress() {
      if (wixClient.auth.loggedIn()) {
        try {
          const res = await wixClient.members.getCurrentMember({ fieldsets: ['FULL'] });
          const member = res?.member;
          if (member) {
            const contact = member.contactDetails || member.contact;
            const addrObj = contact?.addresses?.[0];
            if (addrObj) {
              const address = addrObj.address || addrObj;
              const postalCode = address.postalCode || address.zipCode;
              const city = address.city;
              const country = address.country || 'NO';
              if (postalCode && city) {
                console.log('Auto-prefilling shipping address from member profile:', address);
                estimateShippingAndTotals(
                  postalCode,
                  city,
                  country
                );
              }
            }
          }
        } catch (err) {
          console.warn('Could not auto-fill shipping estimate from profile:', err);
        }
      }
    }
    loadMemberAddress();
  }, []);

  const handleCheckout = async () => {
    setIsRedirecting(true);
    setErrorMessage('');

    try {
      const lineItems = mapCartItemsToWixLineItems(cartItems);

      let checkoutResult = await wixClient.checkout.createCheckout({
        lineItems,
        channelType: 'WEB'
      });

      let checkoutId = checkoutResult._id;

      // Apply coupon code if active
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
        } catch (couponErr) {
          console.warn('Could not apply coupon to checkout redirect:', couponErr);
        }
      }

      // Apply gift card code if active
      if (appliedGiftCard) {
        try {
          checkoutResult = await wixClient.checkout.updateCheckout(checkoutId, {}, {
            giftCardCode: appliedGiftCard.code
          });
          checkoutId = checkoutResult._id;
        } catch (giftCardErr) {
          console.warn('Could not apply gift card to checkout redirect:', giftCardErr);
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

      if (redirectSession && redirectSession.fullUrl) {
        window.location.href = redirectSession.fullUrl;
      } else {
        throw new Error('Kunne ikke hente betalings-lenke.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage('Det oppstod en feil ved opprettelse av betaling. Vennligst prøv igjen.');
      setIsRedirecting(false);
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();

    // Get customer email from form
    const emailInput = e.currentTarget.querySelector('input[type="email"]');
    const customerEmail = emailInput ? emailInput.value : '';

    // Generate simulated order number
    const orderNumber = 'HKD-' + Math.floor(100000 + Math.random() * 900000);

    // Track conversion in GoAffPro
    if (window.Goaffpro) {
      try {
        window.Goaffpro('track-conversion', {
          number: orderNumber,
          total_price: parseFloat(total),
          subtotal_price: parseFloat(subtotal),
          email: customerEmail
        });
      } catch (err) {
        console.warn('Failed to track conversion in GoAffPro:', err);
      }
    }

    setCheckoutStep('success');
    setTimeout(() => {
      clearCart();
    }, 100);
  };

  if (checkoutStep === 'success') {
    return (
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="max-w-xl mx-auto py-32 px-4 text-center"
      >
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-outline-variant/40 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
            <span className="material-symbols-outlined text-4xl select-none" style={{ fontVariationSettings: "'wght' 600" }}>
              check_circle
            </span>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-onyx mb-2">Takk for din bestilling!</h2>
          <p className="text-secondary font-body-md mb-8 leading-relaxed">
            Vi har mottatt din bestilling og sender en bekreftelse på e-post om kort tid. Dine produkter pakkes og sendes innen 24 timer fra vårt lager.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-terracotta text-white py-4 rounded-xl font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md"
          >
            Fortsett å handle
          </button>
        </div>
      </motion.main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="max-w-xl mx-auto py-40 px-4 text-center"
      >
        <span className="material-symbols-outlined text-5xl text-terracotta/40 mb-4">shopping_cart</span>
        <h2 className="font-headline-lg text-headline-lg text-onyx mb-2">Handlekurven din er tom</h2>
        <p className="text-secondary font-body-md mb-8">
          Du har ikke lagt til noen produkter i handlekurven ennå. Utforsk kolleksjonene våre for å finne noe du liker!
        </p>
        <Link 
          to="/products"
          className="inline-flex items-center gap-2 bg-terracotta text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 active:scale-95 transition-all shadow-md"
        >
          <ArrowLeft size={16} />
          <span>Utforsk produktene våre</span>
        </Link>
      </motion.main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      <h1 className="font-headline-lg text-headline-lg mb-10 text-onyx">
        {checkoutStep === 'billing' ? 'Kasse & Betaling' : 'Din Handlekurv'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {checkoutStep === 'billing' ? (
            /* Checkout Billing Form */
            <form onSubmit={handleCheckoutSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant/30 space-y-6">
              <h3 className="font-headline-md text-headline-md text-onyx border-b border-slate-100 pb-4">
                Leveringsinformasjon
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx uppercase mb-2">Fornavn *</label>
                  <input type="text" required className="w-full bg-slate-50 border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx uppercase mb-2">Etternavn *</label>
                  <input type="text" required className="w-full bg-slate-50 border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-onyx uppercase mb-2">Adresse *</label>
                <input type="text" required className="w-full bg-slate-50 border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-onyx uppercase mb-2">Postnummer *</label>
                  <input type="text" required className="w-full bg-slate-50 border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-onyx uppercase mb-2">Poststed *</label>
                  <input type="text" required className="w-full bg-slate-50 border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-onyx uppercase mb-2">E-postadresse *</label>
                  <input type="email" required className="w-full bg-slate-50 border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-onyx uppercase mb-2">Telefonnummer *</label>
                  <input type="tel" required className="w-full bg-slate-50 border border-outline-variant rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta" />
                </div>
              </div>

              <h3 className="font-headline-md text-headline-md text-onyx border-b border-slate-100 pb-4 pt-4">
                Velg betalingsmetode
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-4 border border-outline-variant/60 rounded-xl p-4 cursor-pointer hover:border-terracotta transition-colors bg-slate-50">
                  <input type="radio" name="payment" defaultChecked className="text-terracotta focus:ring-terracotta" />
                  <div>
                    <span className="font-bold text-sm block">Vipps</span>
                    <span className="text-xs text-secondary">Rask betaling med Vipps på mobil</span>
                  </div>
                </label>

                <label className="flex items-center gap-4 border border-outline-variant/60 rounded-xl p-4 cursor-pointer hover:border-terracotta transition-colors bg-slate-50">
                  <input type="radio" name="payment" className="text-terracotta focus:ring-terracotta" />
                  <div>
                    <span className="font-bold text-sm block">Betalingskort</span>
                    <span className="text-xs text-secondary">Visa, Mastercard og American Express</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setCheckoutStep(null)}
                  className="flex items-center gap-2 border border-outline hover:border-terracotta hover:text-terracotta px-6 py-4 rounded-xl font-semibold transition-all"
                >
                  <ArrowLeft size={16} />
                  <span>Tilbake til handlekurv</span>
                </button>
                <button 
                  type="submit" 
                  className="flex-grow bg-terracotta text-white py-4 rounded-xl font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md text-center"
                >
                  Fullfør bestilling ({total} kr)
                </button>
              </div>
            </form>
          ) : (
            /* Cart Product List */
            <>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} 
                    className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col md:flex-row gap-6 items-center"
                  >
                    <div className="w-full md:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-parchment flex items-center justify-center p-2 border border-outline-variant/20">
                      <img 
                        alt={item.name} 
                        className="w-full h-full object-contain rounded" 
                        src={item.image} 
                      />
                    </div>
                    
                    <div className="flex-grow text-center md:text-left">
                      <h3 className="font-headline-md text-headline-md text-onyx text-[18px]">
                        <Link to={`/product/${item.id}`} className="hover:text-terracotta transition-colors">
                          {item.name}
                        </Link>
                      </h3>
                      <p className="text-secondary text-sm mt-1">
                        Størrelse: <span className="font-semibold text-onyx">{item.selectedSize}</span>
                        {item.selectedColor && (
                          <> | Farge: <span className="font-semibold text-onyx">{item.selectedColor}</span></>
                        )}
                      </p>
                      
                      <button 
                        onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                        className="text-terracotta text-label-md font-label-md mt-2 inline-flex items-center gap-1 hover:underline"
                      >
                        <Trash2 size={14} /> 
                        <span>Fjern</span>
                      </button>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 bg-parchment p-1.5 rounded-full border border-outline-variant/60">
                      <button 
                        onClick={() => decrementQuantity(item.id, item.selectedSize, item.selectedColor)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold min-w-[20px] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => incrementQuantity(item.id, item.selectedSize, item.selectedColor)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-full transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Pricing */}
                    <div className="text-right min-w-[100px] flex-shrink-0">
                      <span className="font-headline-md text-headline-md text-terracotta text-lg font-bold">
                        {item.price * item.quantity} kr
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Back to Shopping Button */}
              <div className="pt-6 border-t border-outline-variant/40">
                <Link 
                  to="/products"
                  className="inline-flex items-center gap-2 text-terracotta font-label-md hover:underline group font-bold"
                >
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                  <span>Fortsett å handle</span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Summary Column */}
        <aside className="lg:col-span-4 sticky top-28">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-outline-variant/20">
            <h2 className="font-headline-md text-headline-md mb-6 border-b border-parchment pb-4 text-onyx">
              Oppsummering
            </h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between font-body-md text-secondary">
                <span>Subtotal</span>
                <span className="font-bold text-onyx">{subtotal} kr</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between font-body-md text-emerald-600">
                  <span className="flex items-center gap-1">
                    Rabatt ({appliedCoupon.code})
                    <button 
                      onClick={removeCoupon} 
                      className="text-[10px] text-red-500 hover:underline hover:text-red-700 font-normal cursor-pointer"
                      title="Fjern rabattkode"
                    >
                      (Fjern)
                    </button>
                  </span>
                  <span className="font-bold">-{appliedCoupon.discount} kr</span>
                </div>
              )}
              {appliedGiftCard && (
                <div className="flex justify-between font-body-md text-emerald-600">
                  <span className="flex items-center gap-1">
                    Gavekort ({appliedGiftCard.obfuscatedCode || appliedGiftCard.code})
                    <button 
                      onClick={removeGiftCard} 
                      className="text-[10px] text-red-500 hover:underline hover:text-red-700 font-normal cursor-pointer"
                      title="Fjern gavekort"
                    >
                      (Fjern)
                    </button>
                  </span>
                  <span className="font-bold">-{appliedGiftCard.amount} kr</span>
                </div>
              )}
              <div className="flex justify-between font-body-md text-secondary">
                <span>Frakt</span>
                <span className="font-bold text-onyx">
                  {shipping === 0 ? 'Gratis' : `${shipping} kr`}
                </span>
              </div>
              <div className="flex justify-between font-body-md text-secondary">
                <span>MVA (25%)</span>
                <span className="font-bold text-onyx">{mva.toFixed(2)} kr</span>
              </div>
              
              <div className="h-px bg-parchment w-full my-4" />
              
              <div className="flex justify-between font-headline-md text-headline-md text-onyx text-xl">
                <span>Total</span>
                <span className="text-terracotta font-extrabold">{total} kr</span>
              </div>
            </div>

            {/* Coupon Code Form */}
            {checkoutStep !== 'billing' && (
              <div className="mb-6 pt-4 border-t border-slate-100">
                {hasReferral && !appliedCoupon && (
                  <div className="mb-4 p-4 rounded-xl border border-[#1B4965]/20 bg-[#1B4965]/5 text-left space-y-2">
                    <div className="flex items-center gap-2 text-[#1B4965] font-bold text-xs">
                      <span className="material-symbols-outlined text-sm">redeem</span>
                      <span>Venn-rabatt tilgjengelig!</span>
                    </div>
                    <p className="text-[11px] text-secondary leading-relaxed">
                      Du ble invitert av en venn og får 10% rabatt på din første bestilling.
                    </p>
                    <button
                      type="button"
                      onClick={async () => {
                        await applyCouponCode('VERV10');
                      }}
                      className="bg-[#1B4965] text-white hover:opacity-95 active:scale-95 transition-all text-[10px] font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg shadow-sm w-full cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Aktiver 10% rabatt</span>
                    </button>
                  </div>
                )}
                <span className="block text-xs font-semibold text-onyx uppercase mb-2">Rabattkode</span>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const code = e.currentTarget.couponInput.value;
                    const success = await applyCouponCode(code);
                    if (success) {
                      e.currentTarget.reset();
                    }
                  }} 
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    name="couponInput"
                    placeholder="Skriv rabattkode..." 
                    disabled={isApplyingCoupon}
                    className="flex-grow bg-slate-50 border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta disabled:opacity-50 text-onyx" 
                  />
                  <button 
                    type="submit"
                    disabled={isApplyingCoupon}
                    className="bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isApplyingCoupon ? 'Sjekker...' : 'Bruk'}
                  </button>
                </form>
                {couponError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] font-bold">done</span>
                    Kupong aktivert! Du sparer {appliedCoupon.discount} kr.
                  </p>
                )}
              </div>
            )}

            {/* Gift Card Form */}
            {checkoutStep !== 'billing' && (
              <div className="mb-6 pt-4 border-t border-slate-100">
                <span className="block text-xs font-semibold text-onyx uppercase mb-2">Gavekort</span>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const code = e.currentTarget.giftCardInput.value;
                    const success = await applyGiftCardCode(code);
                    if (success) {
                      e.currentTarget.reset();
                    }
                  }} 
                  className="flex gap-2"
                >
                  <input 
                    type="text" 
                    name="giftCardInput"
                    placeholder="Skriv gavekortkode..." 
                    disabled={isApplyingGiftCard}
                    className="flex-grow bg-slate-50 border border-outline-variant rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta disabled:opacity-50 text-onyx" 
                  />
                  <button 
                    type="submit"
                    disabled={isApplyingGiftCard}
                    className="bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {isApplyingGiftCard ? 'Sjekker...' : 'Bruk'}
                  </button>
                </form>
                {giftCardError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">{giftCardError}</p>
                )}
                {appliedGiftCard && (
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px] font-bold">done</span>
                    Gavekort aktivert! Verdi: {appliedGiftCard.amount} kr.
                  </p>
                )}
              </div>
            )}

            {/* Shipping & Tax Estimator */}
            {checkoutStep !== 'billing' && (
              <div className="mb-6 pt-4 border-t border-slate-100">
                <span className="block text-xs font-semibold text-onyx uppercase mb-2">Beregn frakt & avgifter</span>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const postalCode = e.currentTarget.postalInput.value;
                    const city = e.currentTarget.cityInput.value;
                    const country = e.currentTarget.countrySelect.value;
                    await estimateShippingAndTotals(postalCode, city, country);
                  }} 
                  className="block space-y-2.5"
                >
                  <div className="block">
                    <label className="block text-[10px] text-secondary font-medium mb-1">Land</label>
                    <select 
                      name="countrySelect"
                      className="block w-full bg-slate-50 border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                    >
                      <option value="NO">Norge</option>
                      <option value="SE">Sverige</option>
                      <option value="DK">Danmark</option>
                    </select>
                  </div>
                  
                  <div className="block">
                    <label className="block text-[10px] text-secondary font-medium mb-1">Postnummer</label>
                    <input 
                      type="text" 
                      name="postalInput"
                      required
                      placeholder="F.eks. 4515" 
                      defaultValue={shippingAddress?.postalCode || ''}
                      className="block w-full bg-slate-50 border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta" 
                    />
                  </div>

                  <div className="block">
                    <label className="block text-[10px] text-secondary font-medium mb-1">Poststed</label>
                    <input 
                      type="text" 
                      name="cityInput"
                      required
                      placeholder="F.eks. Mandal" 
                      defaultValue={shippingAddress?.city || ''}
                      className="block w-full bg-slate-50 border border-outline-variant rounded-lg px-2.5 py-1.5 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta" 
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isEstimating}
                    className="block w-full bg-slate-800 text-white font-bold py-2 rounded-lg text-xs hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {isEstimating ? 'Beregner...' : 'Beregn frakt'}
                  </button>
                </form>
                {estimateError && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1.5">{estimateError}</p>
                )}
                {isEstimated && (
                  <div className="mt-2.5 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between text-xs">
                    <div className="text-emerald-800 font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">done</span>
                      <span>Frakt beregnet for {shippingAddress.postalCode} {shippingAddress.city}!</span>
                    </div>
                    <button 
                      onClick={clearEstimation}
                      className="text-[10px] text-secondary hover:text-red-500 hover:underline"
                    >
                      Nullstill
                    </button>
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 text-center font-medium border border-red-200">
                {errorMessage}
              </div>
            )}

            {checkoutStep !== 'billing' && (
              <button 
                onClick={handleCheckout}
                disabled={isRedirecting}
                className={`w-full bg-terracotta text-white py-4 rounded-xl font-label-md text-label-md hover:opacity-95 active:scale-95 transition-all mb-6 font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 ${
                  isRedirecting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isRedirecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Oppretter kasse...</span>
                  </>
                ) : (
                  <>
                    <span>Gå til kassen</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            )}

            <div className="space-y-4">
              <p className="text-center text-label-sm font-label-sm text-secondary tracking-widest uppercase">
                Sikre betalingsmetoder
              </p>
              <div className="flex justify-center gap-3 opacity-50 grayscale hover:opacity-75 transition-opacity">
                <span className="bg-orange-500 rounded px-2 py-1 text-[9px] text-white font-bold select-none">VIPPS</span>
                <span className="bg-blue-800 rounded px-2 py-1 text-[9px] text-white font-bold select-none">VISA</span>
                <span className="bg-red-600 rounded px-2 py-1 text-[9px] text-white font-bold select-none">MC</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-6 flex flex-col gap-4 px-4">
            <div className="flex items-center gap-3 text-secondary">
              <Truck size={18} className="text-terracotta shrink-0" />
              <span className="text-label-sm font-label-sm">Gratis frakt over 1500 kr</span>
            </div>
            <div className="flex items-center gap-3 text-secondary">
              <ShieldCheck size={18} className="text-terracotta shrink-0" />
              <span className="text-label-sm font-label-sm">30 dagers åpent kjøp og retur</span>
            </div>
          </div>
        </aside>
      </div>
    </motion.main>
  );
}

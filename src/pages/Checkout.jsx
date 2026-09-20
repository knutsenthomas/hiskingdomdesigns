import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Truck, 
  Tag, 
  Gift, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  PackageCheck
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { wixClient } from '@/lib/wix';
import useMeta from '@/hooks/useMeta';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOptimizedWixImageUrl } from '@/lib/media';
import { reportCheckoutIncident } from '@/lib/incidentAlerts';

export default function Checkout() {
  const { t, translateProduct, formatPrice, getActiveCurrency, localizedPath } = useLanguage();
  const navigate = useNavigate();

  useMeta(
    t('cart.checkoutAndPayment') || 'Kasse & Betaling',
    'Fullfør din bestilling trygt og enkelt. Sikker betaling og rask levering fra His Kingdom Designs.'
  );

  const {
    cartItems,
    subtotal,
    shipping,
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
    startCheckoutRedirect,
    isEstimated,
    isEstimating,
    estimateError,
    shippingAddress,
    setShippingAddress,
    estimateShippingAndTotals,
    estimatedRates,
    selectedShippingRate,
    selectShippingRate
  } = useCart();

  // Contact and shipping form state
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    addressLine: '',
    postalCode: '',
    city: '',
    country: 'NO',
    orderNotes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [giftCardInput, setGiftCardInput] = useState('');
  const [isMemberLoaded, setIsMemberLoaded] = useState(false);

  // Debounce ref for postal code auto-estimation
  const debounceRef = useRef(null);

  // Reset redirect state on back navigation
  useEffect(() => {
    const handlePageShow = () => {
      setIsSubmitting(false);
      window.hkd_is_checking_out = false;
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  // Pre-fill user details from active member or local storage
  useEffect(() => {
    async function loadInitialData() {
      let email = '';
      let phone = '';
      let firstName = '';
      let lastName = '';
      let addressLine = '';
      let postalCode = '';
      let city = '';

      if (wixClient.auth.loggedIn()) {
        try {
          const res = await wixClient.members.getCurrentMember({ fieldsets: ['FULL'] });
          const member = res?.member;
          if (member) {
            const contact = member.contactDetails || member.contact;
            email = member.loginEmail || contact?.emails?.[0] || '';
            phone = contact?.phones?.[0] || '';
            firstName = contact?.firstName || '';
            lastName = contact?.lastName || '';

            const addrObj = contact?.addresses?.[0];
            if (addrObj) {
              const addr = addrObj.address || addrObj;
              addressLine = addr.addressLine || addr.streetAddress || addr.address || '';
              postalCode = addr.postalCode || addr.zipCode || '';
              city = addr.city || '';
            }
          }
        } catch (err) {
          console.warn('Could not auto-fill checkout from Wix member:', err);
        }
      }

      // Fallbacks from storage
      if (!email) {
        try {
          email = localStorage.getItem('hkd-checkout-email') || localStorage.getItem('hkm-user-email') || '';
        } catch (e) {}
      }

      if (!addressLine && shippingAddress) {
        postalCode = shippingAddress.postalCode || postalCode;
        city = shippingAddress.city || city;
        addressLine = shippingAddress.addressLine || '';
      }

      setFormData(prev => ({
        ...prev,
        email: email || prev.email,
        phone: phone || prev.phone,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        addressLine: addressLine || prev.addressLine,
        postalCode: postalCode || prev.postalCode,
        city: city || prev.city,
      }));

      setIsMemberLoaded(true);

      // Auto-trigger shipping estimate if postal code is present
      if (postalCode && postalCode.length >= 4) {
        estimateShippingAndTotals(postalCode, city, 'NO');
      }
    }

    loadInitialData();
  }, []);

  // Handle form field change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Auto calculate shipping when postal code is entered (4 digits for Norway)
    if (name === 'postalCode') {
      const cleanPostal = value.trim();
      if (cleanPostal.length === 4) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          estimateShippingAndTotals(cleanPostal, formData.city, formData.country || 'NO');
        }, 400);
      }
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Vennligst oppgi en gyldig e-postadresse';
    }
    if (!formData.phone || formData.phone.trim().length < 8) {
      errors.phone = 'Vennligst oppgi et gyldig telefonnummer';
    }
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      errors.firstName = 'Fornavn er påkrevd';
    }
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      errors.lastName = 'Etternavn er påkrevd';
    }
    if (!formData.addressLine || formData.addressLine.trim().length < 3) {
      errors.addressLine = 'Gateadresse er påkrevd';
    }
    if (!formData.postalCode || formData.postalCode.trim().length < 4) {
      errors.postalCode = 'Postnummer må være minst 4 siffer';
    }
    if (!formData.city || formData.city.trim().length < 2) {
      errors.city = 'Poststed er påkrevd';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Final checkout submission: sync to Wix and proceed to secure payment
  const handleSubmitOrder = async (e) => {
    if (e) e.preventDefault();
    if (cartItems.length === 0) return;

    if (!validateForm()) {
      setCheckoutError('Vennligst fyll ut alle påkrevde felter før du går til betaling.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    setCheckoutError('');
    window.hkd_is_checking_out = true;

    try {
      // Save email for recovery
      try {
        localStorage.setItem('hkd-checkout-email', formData.email.trim());
      } catch (e) {}

      // Update shipping address state in context
      const fullShippingAddress = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        addressLine: formData.addressLine.trim(),
        postalCode: formData.postalCode.trim(),
        city: formData.city.trim(),
        country: formData.country || 'NO'
      };

      if (setShippingAddress) {
        setShippingAddress(fullShippingAddress);
      }

      // Start Wix checkout session with pre-filled buyer details
      const redirectUrl = await startCheckoutRedirect({
        returnUrl: window.location.origin + localizedPath('/checkout'),
        thankYouUrl: window.location.origin + localizedPath('/profile'),
        customBuyerEmail: formData.email.trim(),
        customShippingAddress: fullShippingAddress,
        customSelectedShippingRate: selectedShippingRate
      });

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        throw new Error('Mottok ingen betalingslenke fra betalingssystemet.');
      }
    } catch (err) {
      console.error('Checkout error on /checkout page:', err);
      reportCheckoutIncident({
        source: 'CheckoutPage',
        error: err,
        cartItems: cartItems
      });
      const userMessage = (err?.message && !err.message.includes('[object Object]') && !err.message.includes('SDKError'))
        ? err.message
        : 'Det oppstod en feil ved opprettelse av betaling. Vennligst prøv igjen.';
      setCheckoutError(userMessage);
      window.hkd_is_checking_out = false;
      setIsSubmitting(false);
    }
  };

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="bg-white/80 backdrop-blur border border-outline-variant/30 rounded-3xl p-12 shadow-sm space-y-6">
          <div className="w-16 h-16 mx-auto bg-parchment rounded-full flex items-center justify-center text-secondary">
            <PackageCheck size={32} />
          </div>
          <h1 className="font-headline-md text-2xl font-bold text-onyx">
            {t('cart.empty') || 'Handlekurven din er tom'}
          </h1>
          <p className="text-secondary text-sm max-w-md mx-auto">
            {t('cart.emptyDesc') || 'Du har ingen varer i handlekurven. Utforsk kolleksjonene våre for å finne noe du liker!'}
          </p>
          <div className="pt-4">
            <Link
              to={localizedPath('/products')}
              className="inline-flex items-center gap-2 bg-terracotta text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs hover:brightness-105 active:scale-95 transition-all shadow-md"
            >
              <ArrowLeft size={16} />
              <span>{t('cart.continueShopping') || 'Se produkter'}</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <motion.main 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12"
      >
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-secondary font-medium">
          <Link 
            to={localizedPath('/cart')} 
            className="hover:text-onyx flex items-center gap-1 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{t('cart.backToCart') || 'Handlekurv'}</span>
          </Link>
          <ChevronRight size={14} className="opacity-40" />
          <span className="text-onyx font-bold">{t('cart.checkoutAndPayment') || 'Kasse & Betaling'}</span>
        </div>

        {/* Page Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-outline-variant/30 pb-6">
          <div>
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-onyx tracking-tight">
              {t('cart.checkoutAndPayment') || 'Kasse & Betaling'}
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-1">
              {t('cart.shippingNotice') || 'Fyll ut leveringsadresse for rask og trygg levering fra Norge.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-terracotta bg-terracotta/10 px-4 py-2 rounded-xl border border-terracotta/20 self-start md:self-auto">
            <Lock size={14} />
            <span>256-bit SSL Kryptert og Sikker Utsjekk</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {checkoutError && (
          <div className="mb-6 p-4 bg-red-50/90 border border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl flex items-start gap-3 shadow-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold block mb-0.5">Feil under bestilling:</span>
              <span>{checkoutError}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Customer & Shipping Details (7 Cols) */}
          <section className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Contact Info */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-outline-variant/40 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
                <span className="w-7 h-7 rounded-full bg-terracotta/10 text-terracotta font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="font-headline-sm text-base sm:text-lg font-bold text-onyx">
                  Kontaktinformasjon
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1 sm:col-span-1">
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider">
                    {t('cart.email') || 'E-postadresse *'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="navn@epost.no"
                    required
                    className={`w-full bg-slate-50 border px-4 py-3 rounded-xl text-xs text-onyx placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all ${
                      formErrors.email ? 'border-red-500 bg-red-50/20' : 'border-outline-variant/50 focus:border-terracotta'
                    }`}
                  />
                  {formErrors.email && (
                    <span className="text-[11px] text-red-600 font-medium block">{formErrors.email}</span>
                  )}
                </div>

                <div className="space-y-1 sm:col-span-1">
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider">
                    {t('cart.phone') || 'Mobilnummer *'}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+47 900 00 000"
                    required
                    className={`w-full bg-slate-50 border px-4 py-3 rounded-xl text-xs text-onyx placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all ${
                      formErrors.phone ? 'border-red-500 bg-red-50/20' : 'border-outline-variant/50 focus:border-terracotta'
                    }`}
                  />
                  {formErrors.phone && (
                    <span className="text-[11px] text-red-600 font-medium block">{formErrors.phone}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-outline-variant/40 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
                <span className="w-7 h-7 rounded-full bg-terracotta/10 text-terracotta font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h2 className="font-headline-sm text-base sm:text-lg font-bold text-onyx">
                  {t('cart.deliveryInfo') || 'Leveringsadresse'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider">
                    {t('cart.firstName') || 'Fornavn *'}
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Ola"
                    required
                    className={`w-full bg-slate-50 border px-4 py-3 rounded-xl text-xs text-onyx placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all ${
                      formErrors.firstName ? 'border-red-500 bg-red-50/20' : 'border-outline-variant/50 focus:border-terracotta'
                    }`}
                  />
                  {formErrors.firstName && (
                    <span className="text-[11px] text-red-600 font-medium block">{formErrors.firstName}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider">
                    {t('cart.lastName') || 'Etternavn *'}
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Nordmann"
                    required
                    className={`w-full bg-slate-50 border px-4 py-3 rounded-xl text-xs text-onyx placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all ${
                      formErrors.lastName ? 'border-red-500 bg-red-50/20' : 'border-outline-variant/50 focus:border-terracotta'
                    }`}
                  />
                  {formErrors.lastName && (
                    <span className="text-[11px] text-red-600 font-medium block">{formErrors.lastName}</span>
                  )}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider">
                    {t('cart.address') || 'Gateadresse *'}
                  </label>
                  <input
                    type="text"
                    name="addressLine"
                    value={formData.addressLine}
                    onChange={handleInputChange}
                    placeholder="Storgata 1"
                    required
                    className={`w-full bg-slate-50 border px-4 py-3 rounded-xl text-xs text-onyx placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all ${
                      formErrors.addressLine ? 'border-red-500 bg-red-50/20' : 'border-outline-variant/50 focus:border-terracotta'
                    }`}
                  />
                  {formErrors.addressLine && (
                    <span className="text-[11px] text-red-600 font-medium block">{formErrors.addressLine}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider">
                    {t('cart.postalCode') || 'Postnummer *'}
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="0150"
                    maxLength={4}
                    required
                    className={`w-full bg-slate-50 border px-4 py-3 rounded-xl text-xs text-onyx placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all ${
                      formErrors.postalCode ? 'border-red-500 bg-red-50/20' : 'border-outline-variant/50 focus:border-terracotta'
                    }`}
                  />
                  {formErrors.postalCode && (
                    <span className="text-[11px] text-red-600 font-medium block">{formErrors.postalCode}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider">
                    {t('cart.city') || 'Poststed *'}
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Oslo"
                    required
                    className={`w-full bg-slate-50 border px-4 py-3 rounded-xl text-xs text-onyx placeholder:text-secondary/50 focus:outline-none focus:ring-2 focus:ring-terracotta/40 transition-all ${
                      formErrors.city ? 'border-red-500 bg-red-50/20' : 'border-outline-variant/50 focus:border-terracotta'
                    }`}
                  />
                  {formErrors.city && (
                    <span className="text-[11px] text-red-600 font-medium block">{formErrors.city}</span>
                  )}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-bold text-onyx uppercase tracking-wider">
                    Land
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-outline-variant/50 px-4 py-3 rounded-xl text-xs text-onyx focus:outline-none focus:ring-2 focus:ring-terracotta/40"
                  >
                    <option value="NO">Norge</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Shipping Method */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-outline-variant/40 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant/20 pb-4">
                <span className="w-7 h-7 rounded-full bg-terracotta/10 text-terracotta font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <h2 className="font-headline-sm text-base sm:text-lg font-bold text-onyx">
                  {t('cart.shippingOptions') || 'Fraktmetode'}
                </h2>
              </div>

              {isEstimating ? (
                <div className="py-6 flex items-center justify-center gap-3 text-secondary text-xs">
                  <div className="w-4 h-4 border-2 border-terracotta border-t-transparent rounded-full animate-spin"></div>
                  <span>Beregner tilgjengelige fraktmetoder...</span>
                </div>
              ) : estimatedRates && estimatedRates.length > 0 ? (
                <div className="space-y-2.5 pt-2">
                  {estimatedRates.map((rate) => {
                    const isSelected = selectedShippingRate?.code === rate.code;
                    return (
                      <div
                        key={rate.code}
                        onClick={() => selectShippingRate(rate.code)}
                        className={`p-4 border rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'border-[#1B4965] bg-[#1B4965]/5 font-semibold text-onyx ring-1 ring-[#1B4965]'
                            : 'border-outline-variant/40 hover:border-[#1B4965]/30 bg-slate-50 text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#1B4965] bg-[#1B4965]' : 'border-slate-300'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                          </div>
                          <div>
                            <span className="font-bold block text-onyx text-sm">{rate.title}</span>
                            {rate.deliveryTime && (
                              <span className="text-[11px] text-secondary/80">
                                {t('cart.estimatedDelivery', { time: rate.deliveryTime }) || `Forventet levering: ${rate.deliveryTime}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-terracotta text-sm">
                          {rate.cost === 0 ? (t('cart.free') || 'Gratis') : formatPrice(rate.cost)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-secondary leading-relaxed border border-slate-200/50">
                  <p>
                    {formData.postalCode?.length === 4 
                      ? 'Standard frakt (Posten / Helthjem) beregnes automatisk.' 
                      : 'Skriv inn postnummeret ovenfor for å se nøyaktige fraktalternativer.'}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* RIGHT COLUMN: Order Summary & Pay Button (5 Cols) */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-outline-variant/40 p-6 sm:p-8 shadow-sm space-y-6 sticky top-24">
              <h2 className="font-headline-sm text-lg font-bold text-onyx border-b border-outline-variant/20 pb-4">
                {t('cart.summary') || 'Ordresammendrag'}
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {cartItems.map((item) => {
                  const translated = translateProduct(item);
                  return (
                    <div key={item.id} className="flex items-center gap-3.5 py-2 border-b border-slate-100 last:border-0">
                      <div className="relative w-14 h-14 bg-parchment rounded-xl overflow-hidden shrink-0 border border-slate-200/50">
                        {item.image ? (
                          <img
                            src={getOptimizedWixImageUrl(item.image, 120, 120)}
                            alt={translated.name}
                            width={56}
                            height={56}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-secondary/40 text-[10px]">
                            Ingen bilde
                          </div>
                        )}
                        <span className="absolute -top-1.5 -right-1.5 bg-terracotta text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs text-onyx truncate">
                          {translated.name}
                        </h3>
                        <div className="text-[10px] text-secondary flex flex-wrap gap-x-2">
                          {item.selectedSize && <span>Str: {item.selectedSize}</span>}
                          {item.selectedColor && <span>Farge: {item.selectedColor}</span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-xs text-onyx">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Code Section */}
              <div className="pt-2 border-t border-outline-variant/20 space-y-3">
                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <Tag size={14} />
                      <span>{appliedCoupon.code} (-{formatPrice(appliedCoupon.discount)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[11px] text-red-600 hover:underline font-semibold"
                    >
                      Fjern
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={t('cart.couponPlaceholder') || 'Rabattkode'}
                      className="flex-1 bg-slate-50 border border-outline-variant/50 px-3.5 py-2.5 rounded-xl text-xs text-onyx uppercase focus:outline-none focus:border-terracotta"
                    />
                    <button
                      type="button"
                      disabled={!couponInput.trim() || isApplyingCoupon}
                      onClick={() => {
                        applyCouponCode(couponInput);
                        setCouponInput('');
                      }}
                      className="bg-onyx hover:bg-onyx/90 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : (t('cart.apply') || 'Bruk')}
                    </button>
                  </div>
                )}
                {couponError && (
                  <span className="text-[11px] text-red-600 block">{couponError}</span>
                )}
              </div>

              {/* Gift Card Section */}
              <div className="space-y-3">
                {appliedGiftCard ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <Gift size={14} />
                      <span>Gavekort (-{formatPrice(appliedGiftCard.amount)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeGiftCard}
                      className="text-[11px] text-red-600 hover:underline font-semibold"
                    >
                      Fjern
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={giftCardInput}
                      onChange={(e) => setGiftCardInput(e.target.value)}
                      placeholder={t('cart.giftCardPlaceholder') || 'Gavekortkode'}
                      className="flex-1 bg-slate-50 border border-outline-variant/50 px-3.5 py-2.5 rounded-xl text-xs text-onyx uppercase focus:outline-none focus:border-terracotta"
                    />
                    <button
                      type="button"
                      disabled={!giftCardInput.trim() || isApplyingGiftCard}
                      onClick={() => {
                        applyGiftCardCode(giftCardInput);
                        setGiftCardInput('');
                      }}
                      className="bg-onyx hover:bg-onyx/90 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    >
                      {isApplyingGiftCard ? '...' : (t('cart.applyGiftCard') || 'Bruk')}
                    </button>
                  </div>
                )}
                {giftCardError && (
                  <span className="text-[11px] text-red-600 block">{giftCardError}</span>
                )}
              </div>

              {/* Price Calculation Lines */}
              <div className="space-y-2.5 pt-4 border-t border-outline-variant/20 text-xs">
                <div className="flex justify-between text-secondary">
                  <span>{t('cart.subtotal') || 'Subtotal'}</span>
                  <span className="font-semibold text-onyx">{formatPrice(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>{t('cart.discount') || 'Rabatt'}</span>
                    <span>-{formatPrice(appliedCoupon.discount)}</span>
                  </div>
                )}

                {appliedGiftCard && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>{t('cart.giftCard') || 'Gavekort'}</span>
                    <span>-{formatPrice(appliedGiftCard.amount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-secondary">
                  <span>{t('cart.shipping') || 'Frakt'}</span>
                  <span className="font-semibold text-onyx">
                    {shipping === 0 ? (t('cart.free') || 'Gratis') : formatPrice(shipping)}
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-secondary/80 pt-1">
                  <span>{t('cart.mva') || 'Herav 25% MVA'}</span>
                  <span>{formatPrice(total * 0.2)}</span>
                </div>

                <div className="flex justify-between items-baseline pt-4 border-t border-outline-variant/30 text-base font-bold text-onyx">
                  <span>{t('cart.total') || 'Totalt å betale'}</span>
                  <span className="text-xl text-terracotta">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Complete & Proceed to Payment Button */}
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className={`w-full bg-terracotta text-white py-4 rounded-xl font-bold uppercase tracking-wider text-xs sm:text-sm hover:opacity-95 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2.5 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Forbereder sikker betaling...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} />
                    <span>Fullfør og gå til betaling ({formatPrice(total)})</span>
                  </>
                )}
              </button>

              {/* Supported Payment Logos */}
              <div className="space-y-3 pt-2 text-center">
                <p className="text-[10px] text-secondary tracking-widest uppercase font-semibold">
                  Sikker betaling støttet via Wix Payments
                </p>
                <div className="flex justify-center items-center gap-2.5 pt-1 select-none">
                  <img
                    src="/vipps.svg"
                    alt="Vipps"
                    width={48}
                    height={32}
                    className="h-7 w-auto rounded border border-slate-200/70 shadow-xs hover:scale-105 transition-transform"
                  />
                  <img
                    src="/visa.svg"
                    alt="Visa"
                    width={48}
                    height={32}
                    className="h-7 w-auto rounded border border-slate-200/70 shadow-xs hover:scale-105 transition-transform"
                  />
                  <img
                    src="/mastercard.svg"
                    alt="Mastercard"
                    width={48}
                    height={32}
                    className="h-7 w-auto rounded border border-slate-200/70 shadow-xs hover:scale-105 transition-transform"
                  />
                  <img
                    src="/klarna.svg"
                    alt="Klarna"
                    width={48}
                    height={32}
                    className="h-7 w-auto rounded border border-slate-200/70 shadow-xs hover:scale-105 transition-transform"
                  />
                </div>
              </div>

              {/* Trust assurances */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 text-[11px] text-secondary">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={16} className="text-terracotta shrink-0" />
                  <span>14 dagers åpent kjøp og enkel retur</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Truck size={16} className="text-terracotta shrink-0" />
                  <span>Rask levering direkte til postkasse eller hentested</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </motion.main>

      {/* Loading Overlay while navigating to secure Wix cashier */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md"
          >
            <div className="flex flex-col items-center space-y-6 max-w-sm px-6 text-center">
              <div className="relative w-16 h-16">
                <div className="w-16 h-16 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2 select-none">
                <h3 className="font-headline-md text-lg text-onyx font-bold">
                  Åpner sikker betaling
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Vennligst vent et øyeblikk mens vi klargjør bestillingen din med Vipps og kortbetaling...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

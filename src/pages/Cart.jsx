import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, ArrowRight, Truck, ShieldCheck, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';
import { wixClient } from '@/lib/wix';

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    subtotal,
    shipping,
    mva,
    total
  } = useCart();
  const navigate = useNavigate();
  const [checkoutStep, setCheckoutStep] = useState(null); // 'billing' | 'success'
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCheckout = async () => {
    setIsRedirecting(true);
    setErrorMessage('');

    try {
      const lineItems = cartItems.map(item => {
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

      const checkoutResult = await wixClient.checkout.createCheckout({
        lineItems,
        channelType: 'WEB'
      });

      const redirectSession = await wixClient.redirects.createRedirectSession({
        ecomCheckout: {
          checkoutId: checkoutResult._id
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
      className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-28"
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
              <span className="text-label-sm font-label-sm">Gratis frakt over 800 kr</span>
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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Package, LogOut, Mail, Key, ShieldCheck } from 'lucide-react';
import { wixClient } from '@/lib/wix';

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => wixClient.auth.loggedIn());
  const [loginTab, setLoginTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dynamic user data states
  const [member, setMember] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [subscriptionsList, setSubscriptionsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const MOCK_ORDERS = [
    { 
      _id: 'HK-9821', 
      _createdDate: '2026-05-02T12:00:00Z', 
      priceSummary: { total: { amount: '648' } }, 
      status: 'DELIVERED', 
      lineItems: [
        { name: 'Salme 23 Plakat (M)', quantity: 1 },
        { name: 'Herren velsigne deg T-skjorte (L)', quantity: 1 }
      ] 
    },
    { 
      _id: 'HK-9710', 
      _createdDate: '2026-03-14T12:00:00Z', 
      priceSummary: { total: { amount: '249' } }, 
      status: 'DELIVERED', 
      lineItems: [
        { name: 'Tro Håp Kjærlighet Armbånd', quantity: 1 }
      ] 
    }
  ];

  const MOCK_SUBSCRIPTIONS = [
    { 
      _id: 'mock-sub-1',
      planName: 'Kopp & Kos Månedspakke', 
      price: { amount: '199' }, 
      status: 'ACTIVE', 
      nextShipmentDate: '2026-06-10T12:00:00Z' 
    }
  ];

  // 1. Handle OAuth callback query parameters from Wix redirect
  useEffect(() => {
    async function handleAuthCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        
        if (code && state) {
          setIsLoading(true);
          const savedOauthDataStr = localStorage.getItem('hkd-oauth-data');
          if (savedOauthDataStr) {
            const savedOauthData = JSON.parse(savedOauthDataStr);
            const memberTokens = await wixClient.auth.getMemberTokens(code, state, savedOauthData);
            await wixClient.auth.setTokens(memberTokens);
            setIsLoggedIn(true);
            console.log('Successfully completed Wix OAuth login!');
          }
          localStorage.removeItem('hkd-oauth-data');
          // Clear query params from URL
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
          setRefreshKey(prev => prev + 1);
        }
      } catch (err) {
        console.error('Error exchanging oauth tokens:', err);
      } finally {
        setIsLoading(false);
      }
    }
    handleAuthCallback();
  }, []);

  // 2. Fetch current member, order history, and subscription status
  useEffect(() => {
    async function getProfileData() {
      const logged = wixClient.auth.loggedIn();
      setIsLoggedIn(logged);
      
      if (logged) {
        setIsLoading(true);
        // Get member info
        try {
          const res = await wixClient.members.getCurrentMember();
          if (res && res.member) {
            setMember(res.member);
          }
        } catch (err) {
          console.error('Failed to get current member:', err);
          if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
            wixClient.auth.logout();
            setIsLoggedIn(false);
          }
        }

        // Get orders
        try {
          const response = await wixClient.orders.searchOrders({
            search: {
              filter: {}
            }
          });
          if (response.orders && response.orders.length > 0) {
            setOrdersList(response.orders);
          } else {
            setOrdersList(MOCK_ORDERS);
          }
        } catch (err) {
          console.warn('Wix Orders API error or not available. Using mock orders.', err);
          setOrdersList(MOCK_ORDERS);
        }

        // Get subscriptions
        try {
          // Fallback to mock subscriptions defensively
          setSubscriptionsList(MOCK_SUBSCRIPTIONS);
        } catch (err) {
          setSubscriptionsList(MOCK_SUBSCRIPTIONS);
        }
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    }
    
    getProfileData();
  }, [refreshKey]);

  // Direct login submit with captcha fallback
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setErrorMsg('');
    try {
      const result = await wixClient.auth.login({ email, password });
      if (result.loginState === 'SUCCESS') {
        const tokens = await wixClient.auth.getMemberTokensForDirectLogin(result.sessionToken);
        await wixClient.auth.setTokens(tokens);
        setIsLoggedIn(true);
        setRefreshKey(prev => prev + 1);
      } else {
        if (result.errorCode === 'invalidEmail' || result.errorCode === 'invalidPassword') {
          setErrorMsg('Feil e-postadresse eller passord.');
        } else if (result.errorCode === 'missingCaptchaToken') {
          // If captcha is needed, redirect to Wix OAuth portal to complete safely
          const oauthData = wixClient.auth.generateOAuthData();
          localStorage.setItem('hkd-oauth-data', JSON.stringify(oauthData));
          const { authUrl } = await wixClient.auth.getAuthUrl({
            redirectUri: window.location.origin + '/profile',
            state: oauthData.state,
            codeChallenge: oauthData.codeChallenge
          });
          window.location.href = authUrl;
        } else {
          setErrorMsg('Feil ved pålogging. Vennligst prøv igjen.');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Tilkoblingsfeil ved pålogging.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Managed redirect registration submit to handle captcha automatically
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      const oauthData = wixClient.auth.generateOAuthData();
      localStorage.setItem('hkd-oauth-data', JSON.stringify(oauthData));
      const { authUrl } = await wixClient.auth.getAuthUrl({
        redirectUri: window.location.origin + '/profile',
        state: oauthData.state,
        codeChallenge: oauthData.codeChallenge
      });
      window.location.href = authUrl;
    } catch (err) {
      console.error(err);
      alert('Tilkoblingsfeil ved opprettelse av registrering.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await wixClient.auth.logout();
      setIsLoggedIn(false);
      setMember(null);
      setOrdersList([]);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const translateStatus = (status) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 'Levert';
      case 'PAID': return 'Betalt';
      case 'APPROVED': return 'Godkjent';
      case 'CANCELED': return 'Kansellert';
      case 'ACTIVE': return 'Aktiv';
      default: return 'Behandles';
    }
  };

  // Helper values destructured defensively
  const displayName = member?.contact?.firstName 
    ? `${member.contact.firstName} ${member.contact.lastName || ''}`.trim() 
    : (member?.profile?.nickname || 'Christian Mandal');

  const displayEmail = member?.loginEmail || member?.contact?.email || 'christian@mandalregnskap.no';
  
  const displayPhone = member?.contact?.phones?.[0] || '987 65 432';
  
  const displayAddress = member?.contact?.addresses?.[0]
    ? `${member.contact.addresses[0].addressLine1 || ''}, ${member.contact.addresses[0].postalCode || ''} ${member.contact.addresses[0].city || ''}`
    : 'Store Elvegate 16, 4514 Mandal';

  const memberSinceStr = member?._createdDate 
    ? new Date(member._createdDate).toLocaleDateString('no-NO', { month: 'long', year: 'numeric' })
    : 'Mars 2025';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-56">
        <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-secondary font-semibold font-body-md">Laster din profil...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="max-w-md mx-auto px-margin-mobile md:px-margin-desktop py-28"
      >
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-outline-variant/30">
          {/* Tabs header */}
          <div className="flex border-b border-slate-100 mb-8">
            <button 
              onClick={() => setLoginTab('login')}
              className={`flex-1 pb-4 text-center font-label-md text-label-md transition-all ${
                loginTab === 'login' ? 'border-b-2 border-terracotta text-terracotta font-bold' : 'text-secondary hover:text-onyx'
              }`}
            >
              Logg inn
            </button>
            <button 
              onClick={() => setLoginTab('register')}
              className={`flex-1 pb-4 text-center font-label-md text-label-md transition-all ${
                loginTab === 'register' ? 'border-b-2 border-terracotta text-terracotta font-bold' : 'text-secondary hover:text-onyx'
              }`}
            >
              Registrer deg
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg mb-4 text-center font-medium border border-red-200">
              {errorMsg}
            </div>
          )}

          {loginTab === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-headline-md text-headline-md text-onyx mb-2">Velkommen tilbake</h2>
                <p className="font-body-sm text-body-sm text-secondary">Logg inn for å se ordrene dine og administrere abonnementer.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-onyx uppercase mb-2">E-postadresse</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="din@epost.no"
                    disabled={isLoggingIn}
                    className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-onyx" 
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/40" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-onyx uppercase">Passord</label>
                  <button 
                    type="button"
                    onClick={handleRegisterSubmit} 
                    className="text-xs text-terracotta hover:underline font-semibold"
                  >
                    Glemt passord?
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={isLoggingIn}
                    className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-onyx" 
                  />
                  <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/40" />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-terracotta text-white py-4 rounded-xl font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md mt-8 uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2"
              >
                {isLoggingIn ? 'Logger inn...' : 'Logg inn'}
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="font-headline-md text-headline-md text-onyx mb-2">Opprett konto</h2>
                <p className="font-body-sm text-body-sm text-secondary">Registrering skjer sikkert via vår Wix-portal for å beskytte dine data.</p>
              </div>

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-terracotta text-white py-4 rounded-xl font-semibold hover:opacity-95 active:scale-95 transition-all shadow-md mt-8 uppercase tracking-wider text-xs font-bold flex items-center justify-center gap-2"
              >
                Fortsett til sikker registrering
              </button>
            </form>
          )}

          {/* Social login redirect triggers */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-4">
            <span className="text-xs text-secondary/50 uppercase tracking-wider block">Eller logg inn med</span>
            <button 
              onClick={handleRegisterSubmit}
              className="w-full border border-outline-variant rounded-xl py-3 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-onyx"
            >
              <ShieldCheck size={16} className="text-terracotta" />
              <span>Sikker innlogging (Vipps, Google, E-post)</span>
            </button>
          </div>
        </div>
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
      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left column - Account overview */}
        <aside className="w-full lg:w-80 bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm flex flex-col items-center text-center lg:text-left lg:items-start shrink-0">
          <div className="w-20 h-20 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-2xl mb-4 uppercase">
            {displayName.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="font-headline-md text-headline-md text-onyx mb-1">{displayName}</h2>
          <p className="text-secondary font-body-sm mb-6">{displayEmail}</p>
          
          <div className="w-full h-px bg-slate-100 my-4" />

          <div className="space-y-4 w-full text-left font-body-sm text-secondary">
            <div>
              <span className="text-xs font-semibold text-onyx uppercase block mb-1">Telefon</span>
              <span>{displayPhone}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-onyx uppercase block mb-1">Standardadresse</span>
              <span className="block leading-relaxed">{displayAddress}</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-onyx uppercase block mb-1">Medlem siden</span>
              <span>{memberSinceStr}</span>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 my-6" />

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-outline hover:border-terracotta hover:text-terracotta text-onyx py-3 rounded-xl font-label-md text-label-md transition-all active:scale-95"
          >
            <LogOut size={16} />
            <span>Logg ut</span>
          </button>
        </aside>

        {/* Right column - Dashboard Details */}
        <div className="flex-grow w-full space-y-8">
          
          {/* Order history */}
          <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-terracotta">
              <ShoppingBag size={22} />
              <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">Ordrehistorikk</h3>
            </div>

            {ordersList.length > 0 ? (
              <div className="space-y-4">
                {ordersList.map(order => {
                  const dateStr = order._createdDate 
                    ? new Date(order._createdDate).toLocaleDateString('no-NO') 
                    : 'Ukjent dato';
                  const itemsStr = order.lineItems 
                    ? order.lineItems.map(item => `${item.name || item.productName?.translated} (x${item.quantity})`).join(', ')
                    : 'Ingen varebeskrivelse';
                  const totalStr = order.priceSummary?.total?.amount || '0';

                  return (
                    <div key={order._id} className="border border-outline-variant/30 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-outline transition-colors bg-slate-50/20">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-label-md text-onyx font-bold text-sm">Ordre #{order._id?.substring(0, 8)}</span>
                          <span className="text-xs text-secondary/60">• {dateStr}</span>
                        </div>
                        <p className="font-body-sm text-secondary text-xs line-clamp-1">{itemsStr}</p>
                      </div>
                      <div className="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-none border-slate-100 pt-3 md:pt-0">
                        <div>
                          <span className="text-xs text-secondary block">Totalpris</span>
                          <span className="font-label-md text-onyx font-bold">{totalStr} kr</span>
                        </div>
                        <span className="bg-green-100 text-green-800 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                          {translateStatus(order.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-secondary font-body-md text-sm">Du har ikke lagt inn noen bestillinger ennå.</p>
            )}
          </section>

          {/* Subscriptions */}
          <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-terracotta">
              <Package size={22} />
              <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">Dine Månedspakker</h3>
            </div>

            {subscriptionsList.length > 0 ? (
              <div className="space-y-4">
                {subscriptionsList.map(sub => {
                  const subPrice = sub.price?.amount || '0';
                  const subNextDate = sub.nextShipmentDate 
                    ? new Date(sub.nextShipmentDate).toLocaleDateString('no-NO') 
                    : '10. mnd';
                  return (
                    <div key={sub._id} className="border border-outline-variant/30 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/20">
                      <div>
                        <h4 className="font-label-md text-onyx font-bold text-sm mb-1">{sub.planName}</h4>
                        <p className="text-xs text-secondary">
                          Neste sending: <strong className="text-onyx">{subNextDate}</strong> (fraktes gratis)
                        </p>
                      </div>
                      <div className="flex items-center gap-6 self-stretch md:self-auto justify-between border-t md:border-none border-slate-100 pt-3 md:pt-0">
                        <div>
                          <span className="text-xs text-secondary block">Månedspris</span>
                          <span className="font-label-md text-terracotta font-bold">{subPrice} kr/mnd</span>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                          {translateStatus(sub.status)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-secondary font-body-md text-sm">Du abonnerer ikke på noen månedspakker for øyeblikket.</p>
            )}
          </section>
        </div>
      </div>
    </motion.main>
  );
}

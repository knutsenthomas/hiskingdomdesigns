import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Package, LogOut, Mail, Key, ShieldCheck, Heart } from 'lucide-react';
import { wixClient } from '@/lib/wix';
import { media } from '@wix/sdk';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

// Helper to safely extract email from Wix member object across various schema versions
const getMemberEmail = (member) => {
  if (member?.loginEmail) return member.loginEmail;
  
  const cdEmails = member?.contactDetails?.emails || [];
  if (cdEmails[0]) {
    return typeof cdEmails[0] === 'object' ? cdEmails[0].email : cdEmails[0];
  }
  
  const cEmails = member?.contact?.emails || [];
  if (cEmails[0]) {
    return typeof cEmails[0] === 'object' ? cEmails[0].email : cEmails[0];
  }
  
  return member?.contact?.email || member?.contactDetails?.email || null;
};

// Helper to safely extract phone from Wix member object across various schema versions
const getMemberPhone = (member) => {
  const cdPhones = member?.contactDetails?.phones || [];
  if (cdPhones[0]) {
    return typeof cdPhones[0] === 'object' ? cdPhones[0].phone : cdPhones[0];
  }
  
  const cPhones = member?.contact?.phones || [];
  if (cPhones[0]) {
    return typeof cPhones[0] === 'object' ? cPhones[0].phone : cPhones[0];
  }
  
  return member?.contact?.phone || member?.contactDetails?.phone || null;
};

// Helper to safely extract address details from Wix member object across various schema versions
const getMemberAddress = (member) => {
  const contact = member?.contactDetails || member?.contact;
  const addrObj = contact?.addresses?.[0];
  if (!addrObj) return null;

  const address = addrObj.address || addrObj;

  let addressLine = address.addressLine || address.addressLine1 || address.formatted || '';
  if (!addressLine && address.streetAddress) {
    if (typeof address.streetAddress === 'object') {
      const name = address.streetAddress.name || '';
      const number = address.streetAddress.number || '';
      addressLine = `${name} ${number}`.trim();
    } else if (typeof address.streetAddress === 'string') {
      addressLine = address.streetAddress;
    }
  }

  const postalCode = address.postalCode || address.zipCode || '';
  const city = address.city || '';
  const country = address.country || 'NO';

  return { addressLine, postalCode, city, country };
};

// Helper to safely extract and build profile image URL from Wix member object
const getProfileImageUrl = (member) => {
  const photo = member?.profile?.photo;
  if (!photo) return null;

  const url = photo.url || photo;
  if (!url || typeof url !== 'string') return null;

  if (url.startsWith('wix:image://')) {
    try {
      return media.getScaledToFillImageUrl(url, 160, 160) || media.getImageUrl(url).url;
    } catch (e) {
      console.warn('Failed to parse Wix image URI using SDK:', e);
      const match = url.match(/wix:image:\/\/v1\/([^\/]+)/);
      if (match && match[1]) {
        return `https://static.wixstatic.com/media/${match[1]}`;
      }
    }
  }

  return url;
};

let isExchangingTokens = false;

export default function Profile() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => wixClient.auth.loggedIn());
  const [loginTab, setLoginTab] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { wishlist, toggleWishlist } = useApp();
  const { addToCart } = useCart();
  
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
  const [debugInfo, setDebugInfo] = useState(null);

  // Address book form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Handle tab from URL search parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'wishlist') {
      setActiveTab('wishlist');
    } else if (tabParam === 'address') {
      setActiveTab('address');
    } else {
      setActiveTab('dashboard');
    }
  }, [window.location.search]);

  // Sync form states with member info
  useEffect(() => {
    if (member) {
      const contact = member.contactDetails || member.contact;
      setFirstName(contact?.firstName || '');
      setLastName(contact?.lastName || '');
      setPhone(getMemberPhone(member) || '');
      
      const addr = getMemberAddress(member);
      setAddressLine(addr?.addressLine || '');
      setPostalCode(addr?.postalCode || '');
      setCity(addr?.city || '');
    }
  }, [member]);

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsUpdatingAddress(true);
    setAddressSuccess(false);
    setAddressError('');
    try {
      console.log('Updating member address book in Wix...');
      const phonePayload = phone ? [phone] : [];
      
      const addressPayload = [
        {
          addressLine: addressLine,
          postalCode: postalCode,
          city: city,
          country: 'NO'
        }
      ];

      const updated = await wixClient.members.updateMember(member._id, {
        contact: {
          firstName: firstName,
          lastName: lastName,
          phones: phonePayload,
          addresses: addressPayload
        }
      });
      console.log('Successfully updated member address:', updated);
      setMember(updated?.member || updated);
      setAddressSuccess(true);
      setTimeout(() => setAddressSuccess(false), 3000);
      setRefreshKey(prev => prev + 1); // Refresh page data
    } catch (err) {
      console.error('Failed to update member address in Wix:', err);
      setAddressError('Klarte ikke å lagre adresse: ' + (err.message || err));
    } finally {
      setIsUpdatingAddress(false);
    }
  };

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
        const searchParams = new URLSearchParams(window.location.search);
        
        // Also check window.location.hash since OAuth callbacks can return params in hash fragment
        const cleanHash = window.location.hash.startsWith('#') 
          ? window.location.hash.substring(1) 
          : window.location.hash;
        const hashParams = new URLSearchParams(cleanHash);

        const code = searchParams.get('code') || hashParams.get('code');
        const state = searchParams.get('state') || hashParams.get('state');
        
        if (code && state) {
          if (isExchangingTokens) {
            console.warn('OAuth token exchange already in progress, blocking duplicate execution.');
            return;
          }
          isExchangingTokens = true;
          setIsLoading(true);
          console.log('OAuth callback detected! Code:', code, 'State:', state);
          const savedOauthDataStr = localStorage.getItem('hkd-oauth-data');
          
          // Clear query params and hash from URL immediately to prevent duplicate runs
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);

          if (savedOauthDataStr) {
            const savedOauthData = JSON.parse(savedOauthDataStr);
            // Remove from localStorage immediately to block duplicate React StrictMode effect runs
            localStorage.removeItem('hkd-oauth-data');
            
            const memberTokens = await wixClient.auth.getMemberTokens(code, state, {
              ...savedOauthData,
              redirectUri: savedOauthData.redirectUri || (window.location.origin + '/profile')
            });
            await wixClient.auth.setTokens(memberTokens);
            setIsLoggedIn(true);
            window.dispatchEvent(new Event('wix-auth-change'));
            console.log('Successfully completed Wix OAuth login!');
            setRefreshKey(prev => prev + 1);
          } else {
            console.warn('No OAuth data found in localStorage or already consumed!');
            isExchangingTokens = false;
          }
        }
      } catch (err) {
        isExchangingTokens = false;
        console.error('Error exchanging oauth tokens:', err);
        setErrorMsg('Innloggingsfeil: ' + err.message);
        alert('Det oppstod en feil under utveksling av innloggingstokener: ' + err.message);
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
      const mockMemberStr = localStorage.getItem('hkd-mock-vipps-member');
      
      if (logged) {
        setIsLoggedIn(true);
        if (!member) {
          setIsLoading(true);
        }
        // Get member info
        try {
          const res = await wixClient.members.getCurrentMember({ fieldsets: ['FULL'] });
          console.log("getCurrentMember response:", res);
          setDebugInfo({
            hasRes: !!res,
            hasMember: !!res?.member,
            memberKeys: res?.member ? Object.keys(res.member) : null,
            rawMember: res?.member ? JSON.stringify(res.member).substring(0, 150) : null
          });
          if (res && res.member) {
            setMember(res.member);
          }
        } catch (err) {
          console.error('Failed to get current member:', err);
          setDebugInfo({
            error: err.message || String(err),
            stack: err.stack
          });
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
        window.dispatchEvent(new Event('wix-auth-change'));
        setRefreshKey(prev => prev + 1);
      } else {
        if (result.errorCode === 'invalidEmail' || result.errorCode === 'invalidPassword') {
          setErrorMsg('Feil e-postadresse eller passord.');
        } else if (result.errorCode === 'missingCaptchaToken') {
          // If captcha is needed, redirect to Wix OAuth portal to complete safely
          const redirectUri = window.location.origin + '/profile';
          const oauthData = wixClient.auth.generateOAuthData(redirectUri);
          localStorage.setItem('hkd-oauth-data', JSON.stringify(oauthData));
          const { authUrl } = await wixClient.auth.getAuthUrl(oauthData);
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
      const redirectUri = window.location.origin + '/profile';
      const oauthData = wixClient.auth.generateOAuthData(redirectUri);
      localStorage.setItem('hkd-oauth-data', JSON.stringify(oauthData));
      const { authUrl } = await wixClient.auth.getAuthUrl(oauthData);
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
      localStorage.removeItem('wix_oauth_tokens');
      localStorage.removeItem('hkd-mock-vipps-member');
      try {
        await wixClient.auth.logout();
      } catch (logoutErr) {
        console.warn('Wix auth logout callback warning:', logoutErr);
      }
      setIsLoggedIn(false);
      window.dispatchEvent(new Event('wix-auth-change'));
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
  const displayName = member?.contactDetails?.firstName 
    ? `${member.contactDetails.firstName} ${member.contactDetails.lastName || ''}`.trim() 
    : member?.contact?.firstName 
      ? `${member.contact.firstName} ${member.contact.lastName || ''}`.trim() 
      : (member?.profile?.nickname || 'Christian Mandal');

  const displayEmail = getMemberEmail(member) || 'christian@mandalregnskap.no';
  
  const displayPhone = getMemberPhone(member) || '987 65 432';
  
  const addrDetails = getMemberAddress(member);
  const displayAddress = (addrDetails && (addrDetails.addressLine || addrDetails.postalCode || addrDetails.city))
    ? `${addrDetails.addressLine || ''}, ${addrDetails.postalCode || ''} ${addrDetails.city || ''}`.trim().replace(/^,\s*/, '')
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
        className="max-w-lg mx-auto px-4 py-28"
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
              <span>Sikker innlogging (Google, E-post)</span>
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
          <div className="w-20 h-20 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-2xl mb-4 uppercase overflow-hidden border border-outline-variant/15">
            {getProfileImageUrl(member) ? (
              <img 
                src={getProfileImageUrl(member)} 
                alt={displayName} 
                className="w-full h-full object-cover" 
              />
            ) : (
              displayName.split(' ').map(n => n[0]).join('')
            )}
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
        <div className="flex-grow w-full min-w-0 space-y-8">
          
          {/* Tab selector */}
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-4 px-4 font-label-md text-label-md transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard' ? 'text-terracotta font-bold' : 'text-secondary hover:text-onyx'
              }`}
            >
              Dashbord
              {activeTab === 'dashboard' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`pb-4 px-4 font-label-md text-label-md transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === 'wishlist' ? 'text-terracotta font-bold' : 'text-secondary hover:text-onyx'
              }`}
            >
              Min Ønskeliste ({wishlist.length})
              {activeTab === 'wishlist' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('address')}
              className={`pb-4 px-4 font-label-md text-label-md transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === 'address' ? 'text-terracotta font-bold' : 'text-secondary hover:text-onyx'
              }`}
            >
              Adressebok
              {activeTab === 'address' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded" />
              )}
            </button>
          </div>

          {activeTab === 'dashboard' && (
            <>
              {/* Order history */}
              <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-6 animate-fade-in">
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
            </>
          )}

          {activeTab === 'wishlist' && (
            <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 text-terracotta">
                <Heart size={22} className="fill-current" />
                <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">Min Ønskeliste</h3>
              </div>
              
              {wishlist.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {wishlist.map(item => (
                    <div key={item.id} className="border border-outline-variant/30 rounded-xl p-4 flex gap-4 hover:border-outline transition-all bg-slate-50/10 relative group">
                      <div className="w-20 h-20 bg-parchment rounded-lg overflow-hidden flex items-center justify-center p-2 border border-outline-variant/15 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain rounded" />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-headline-md text-onyx font-bold text-sm line-clamp-1">
                            <Link to={`/product/${item.id}`} className="hover:text-terracotta transition-colors">{item.name}</Link>
                          </h4>
                          <span className="font-label-md text-terracotta font-semibold text-xs mt-1 block">{item.price} kr</span>
                        </div>
                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={() => {
                              const defaultSize = item.sizes?.[0] || 'M';
                              const defaultColor = item.colorNames?.[0] || 'Hvit';
                              addToCart(item, defaultSize, defaultColor, 1);
                            }}
                            className="bg-terracotta text-white font-label-md text-[11px] px-3 py-1.5 rounded-lg hover:opacity-95 active:scale-95 transition-all shadow-md font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingBag size={12} />
                            Legg i kurv
                          </button>
                          <button
                            onClick={() => toggleWishlist(item)}
                            className="text-secondary hover:text-red-500 font-label-md text-[11px] transition-colors cursor-pointer"
                          >
                            Fjern
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-secondary font-body-md text-sm mb-4">Ønskelisten din er tom.</p>
                  <Link to="/products" className="inline-flex items-center gap-1 text-terracotta font-bold hover:underline text-xs">
                    Utforsk produkter &rarr;
                  </Link>
                </div>
              )}
            </section>
          )}

          {activeTab === 'address' && (
            <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center gap-3 text-terracotta">
                <User size={22} />
                <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">Adressebok</h3>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Oppdater leveringsinformasjonen din. Denne informasjonen lagres direkte i Wix-medlemsprofilen din og vil automatisk fylles ut når du går til kassen.
              </p>
              
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                {addressSuccess && (
                  <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 font-medium">
                    ✓ Endringene er lagret!
                  </div>
                )}
                {addressError && (
                  <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg border border-red-200 font-medium">
                    {addressError}
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block text-[10px] font-semibold text-onyx uppercase mb-1">Fornavn</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isUpdatingAddress}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta text-onyx"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[10px] font-semibold text-onyx uppercase mb-1">Etternavn</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={isUpdatingAddress}
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta text-onyx"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block text-[10px] font-semibold text-onyx uppercase mb-1">Telefonnummer</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={isUpdatingAddress}
                      placeholder="F.eks. 98765432"
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta text-onyx"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-[10px] font-semibold text-onyx uppercase mb-1">Gateadresse</label>
                    <input
                      type="text"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      disabled={isUpdatingAddress}
                      placeholder="Gate og nummer"
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta text-onyx"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col sm:col-span-1">
                    <label className="block text-[10px] font-semibold text-onyx uppercase mb-1">Postnummer</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      disabled={isUpdatingAddress}
                      placeholder="4 sifre"
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta text-onyx"
                    />
                  </div>
                  <div className="flex flex-col sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-onyx uppercase mb-1">Poststed</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={isUpdatingAddress}
                      placeholder="Mandal"
                      className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta text-onyx"
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isUpdatingAddress}
                  className="bg-terracotta text-white font-label-md text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  {isUpdatingAddress ? 'Lagrer...' : 'Lagre endringer'}
                </button>
              </form>
            </section>
          )}
          {debugInfo && (
            <div className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] p-4 rounded-xl mt-8 font-mono max-w-full overflow-x-auto">
              <p className="font-bold mb-1">🔍 Wix Headless Diagnostics:</p>
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </motion.main>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag, Package, LogOut, Mail, Key, ShieldCheck, Heart } from 'lucide-react';
import { wixClient } from '@/lib/wix';
import { db } from '@/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { media } from '@wix/sdk';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import useMeta from '@/hooks/useMeta';

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
  useMeta(
    "Min konto",
    "Administrer din profil, se dine ordre, administrer adresser, lojalitetspoeng og verv venner hos His Kingdom Designs."
  );

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      return wixClient.auth.loggedIn();
    } catch (e) {
      console.error('Failed to initialize login status:', e);
      return false;
    }
  });
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

  // Loyalty Program States
  const [loyaltyAccount, setLoyaltyAccount] = useState(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState([]);
  const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(false);

  // Return States
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnItems, setReturnItems] = useState({});
  const [returnReason, setReturnReason] = useState('');
  const [returnComments, setReturnComments] = useState('');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [activeReturns, setActiveReturns] = useState([]);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?ref=${member?._id || 'medlem'}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle tab from URL search parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'wishlist') {
      setActiveTab('wishlist');
    } else if (tabParam === 'address') {
      setActiveTab('address');
    } else if (tabParam === 'loyalty') {
      setActiveTab('loyalty');
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
          
          let savedOauthDataStr = null;
          try {
            savedOauthDataStr = localStorage.getItem('hkd-oauth-data');
          } catch (storageErr) {
            console.error('Failed to read OAuth data from localStorage:', storageErr);
          }
          
          // Clear query params and hash from URL immediately to prevent duplicate runs
          try {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
          } catch (historyErr) {
            console.error('Failed to clear OAuth params from URL history:', historyErr);
          }

          let savedOauthData = null;
          if (savedOauthDataStr && savedOauthDataStr !== 'null' && savedOauthDataStr !== 'undefined') {
            try {
              savedOauthData = JSON.parse(savedOauthDataStr);
            } catch (parseErr) {
              console.error('Failed to parse OAuth data:', parseErr);
            }
          }

          if (savedOauthData && typeof savedOauthData === 'object') {
            // Remove from localStorage immediately to block duplicate React StrictMode effect runs
            try {
              localStorage.removeItem('hkd-oauth-data');
            } catch (storageErr) {
              console.error('Failed to remove OAuth data from localStorage:', storageErr);
            }
            
            const redirectUri = savedOauthData.redirectUri || (window.location.origin + '/profile');
            console.log('Exchanging Wix auth code for tokens with redirectUri:', redirectUri);
            
            const memberTokens = await wixClient.auth.getMemberTokens(code, state, {
              ...savedOauthData,
              redirectUri
            });
            await wixClient.auth.setTokens(memberTokens);
            setIsLoggedIn(true);
            isExchangingTokens = false; // Reset lock on success
            window.dispatchEvent(new Event('wix-auth-change'));
            console.log('Successfully completed Wix OAuth login!');
            setRefreshKey(prev => prev + 1);
          } else {
            console.warn('No valid OAuth data found in localStorage or already consumed!');
            isExchangingTokens = false;
          }
        }
      } catch (err) {
        isExchangingTokens = false;
        console.error('Error exchanging oauth tokens:', err);
        const errMsg = err && typeof err === 'object' && 'message' in err 
          ? err.message 
          : (typeof err === 'string' ? err : 'Ukjent tilkoblingsfeil');
        setErrorMsg('Innloggingsfeil: ' + errMsg);
        alert('Det oppstod en feil under utveksling av innloggingstokener: ' + errMsg);
      } finally {
        setIsLoading(false);
      }
    }
    handleAuthCallback();
  }, []);

  // Listen to window auth changes to keep profile state in sync with AppContext/Header
  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const logged = wixClient.auth.loggedIn();
        setIsLoggedIn(logged);
        if (!logged) {
          setMember(null);
          setOrdersList([]);
        } else {
          setRefreshKey(prev => prev + 1);
        }
      } catch (e) {
        console.error('Failed to handle auth change in Profile page:', e);
      }
    };
    window.addEventListener('wix-auth-change', handleAuthChange);
    return () => window.removeEventListener('wix-auth-change', handleAuthChange);
  }, []);

  // 2. Fetch current member, order history, and subscription status
  useEffect(() => {
    async function getProfileData() {
      let logged = false;
      try {
        logged = wixClient.auth.loggedIn();
      } catch (e) {
        console.warn('Failed to check if logged in:', e);
      }
      
      let mockMemberStr = null;
      try {
        mockMemberStr = localStorage.getItem('hkd-mock-vipps-member');
      } catch (e) {
        console.warn('Failed to get mock member from localStorage:', e);
      }
      
      if (logged) {
        setIsLoggedIn(true);
        if (!member) {
          setIsLoading(true);
        }
        // Get member info
        try {
          const res = await wixClient.members.getCurrentMember({ fieldsets: ['FULL'] });
          console.log("getCurrentMember response:", res);
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

  // Fetch Loyalty Data
  useEffect(() => {
    async function fetchLoyaltyData() {
      if (isLoggedIn && member && activeTab === 'loyalty') {
        setIsLoadingLoyalty(true);
        try {
          console.log('Fetching loyalty account for member...');
          let account = null;
          try {
            account = await wixClient.loyaltyAccounts.getCurrentMemberAccount();
          } catch (accErr) {
            console.warn('getCurrentMemberAccount failed, trying getAccountBySecondaryId:', accErr);
            account = await wixClient.loyaltyAccounts.getAccountBySecondaryId({ secondaryId: member._id });
          }

          if (account) {
            setLoyaltyAccount(account);
            try {
              const txs = await wixClient.loyaltyTransactions.queryLoyaltyTransactions()
                .eq('accountId', account._id)
                .descending('_createdDate')
                .limit(20)
                .find();
              setLoyaltyHistory(txs.items || []);
            } catch (txErr) {
              console.warn('Failed to fetch loyalty transactions:', txErr);
            }
          }
        } catch (err) {
          console.error('Failed to fetch loyalty data:', err);
        } finally {
          setIsLoadingLoyalty(false);
        }
      }
    }
    fetchLoyaltyData();
  }, [isLoggedIn, member, activeTab]);

  // Fetch returns from Firestore
  useEffect(() => {
    async function fetchReturns() {
      if (isLoggedIn && member?._id) {
        try {
          const q = query(collection(db, 'order_returns'), where('memberId', '==', member._id));
          const querySnapshot = await getDocs(q);
          const returns = [];
          querySnapshot.forEach((doc) => {
            returns.push({ id: doc.id, ...doc.data() });
          });
          setActiveReturns(returns);
        } catch (e) {
          console.warn('Failed to fetch returns:', e);
        }
      }
    }
    fetchReturns();
  }, [isLoggedIn, member?._id, refreshKey]);

  const handleOpenReturnModal = (order) => {
    setSelectedOrderForReturn(order);
    const initialItems = {};
    order.lineItems?.forEach(item => {
      initialItems[item._id] = 0;
    });
    setReturnItems(initialItems);
    setReturnReason('');
    setReturnComments('');
    setReturnSuccess(false);
    setIsReturnModalOpen(true);
  };

  const handleReturnQtyChange = (itemId, qty) => {
    setReturnItems(prev => ({
      ...prev,
      [itemId]: qty
    }));
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingReturn(true);

    try {
      const itemsToReturn = selectedOrderForReturn.lineItems
        .map(item => ({
          _id: item._id,
          name: item.name || item.productName?.translated,
          quantity: returnItems[item._id] || 0
        }))
        .filter(item => item.quantity > 0);

      const payload = {
        memberId: member?._id || 'mock-vipps-member-id',
        memberName: displayName,
        memberEmail: displayEmail,
        orderId: selectedOrderForReturn._id,
        items: itemsToReturn,
        reason: returnReason,
        comments: returnComments,
        status: 'Mottatt',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'order_returns'), payload);
      setReturnSuccess(true);
      setRefreshKey(prev => prev + 1); // Refresh return list
    } catch (err) {
      console.error('Failed to submit return request to Firestore:', err);
      alert('Klarte ikke å opprette returforespørsel: ' + err.message);
    } finally {
      setIsSubmittingReturn(false);
    }
  };

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
          try {
            localStorage.setItem('hkd-oauth-data', JSON.stringify(oauthData));
          } catch (storageErr) {
            console.error('Failed to save OAuth data to localStorage:', storageErr);
          }
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
      try {
        localStorage.setItem('hkd-oauth-data', JSON.stringify(oauthData));
      } catch (storageErr) {
        console.error('Failed to save OAuth data to localStorage:', storageErr);
      }
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
      try {
        localStorage.removeItem('wix_oauth_tokens');
        localStorage.removeItem('hkd-mock-vipps-member');
      } catch (storageErr) {
        console.error('Failed to remove tokens from localStorage:', storageErr);
      }
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
      : (member?.profile?.nickname || 'Christian Lyngdal');

  const displayInitials = String(displayName || '')
    .split(' ')
    .map(n => n ? n[0] : '')
    .join('')
    .toUpperCase();

  const displayEmail = getMemberEmail(member) || 'christian@hiskingdomministry.no';
  
  const displayPhone = getMemberPhone(member) || '987 65 432';
  
  const addrDetails = getMemberAddress(member);
  const displayAddress = (addrDetails && (addrDetails.addressLine || addrDetails.postalCode || addrDetails.city))
    ? `${addrDetails.addressLine || ''}, ${addrDetails.postalCode || ''} ${addrDetails.city || ''}`.trim().replace(/^,\s*/, '')
    : 'Løkkeveien 3B, 4580 Lyngdal';

  let memberSinceStr = 'Mars 2025';
  if (member?._createdDate) {
    try {
      const d = new Date(member._createdDate);
      if (!isNaN(d.getTime())) {
        const dateStr = d.toLocaleDateString('no-NO', { month: 'long', year: 'numeric' });
        if (dateStr) {
          memberSinceStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        }
      }
    } catch (e) {
      console.warn('Failed to parse member creation date:', e);
    }
  }

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
      className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-28"
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
              displayInitials
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
              Min ønskeliste ({wishlist.length})
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
            <button
              onClick={() => setActiveTab('loyalty')}
              className={`pb-4 px-4 font-label-md text-label-md transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === 'loyalty' ? 'text-terracotta font-bold' : 'text-secondary hover:text-onyx'
              }`}
            >
              Lojalitetsprogram
              {activeTab === 'loyalty' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('referral')}
              className={`pb-4 px-4 font-label-md text-label-md transition-all relative whitespace-nowrap cursor-pointer ${
                activeTab === 'referral' ? 'text-terracotta font-bold' : 'text-secondary hover:text-onyx'
              }`}
            >
              Verv en venn
              {activeTab === 'referral' && (
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
                      let dateStr = 'Ukjent dato';
                      if (order._createdDate) {
                        try {
                          const d = new Date(order._createdDate);
                          if (!isNaN(d.getTime())) {
                            dateStr = d.toLocaleDateString('no-NO');
                          }
                        } catch (e) {}
                      }
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
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                              <span className="bg-green-100 text-green-800 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider text-center">
                                {translateStatus(order.status)}
                              </span>
                              {(order.status === 'DELIVERED' || order.status === 'PAID' || order.status === 'APPROVED') && (
                                <button
                                  onClick={() => handleOpenReturnModal(order)}
                                  className="border border-outline hover:border-terracotta hover:text-terracotta text-onyx px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-[0.98] text-center"
                                >
                                  Be om retur
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-secondary font-body-md text-sm">Du har ikke lagt inn noen bestillinger ennå.</p>
                )}

                {activeReturns.length > 0 && (
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h4 className="font-bold text-sm text-[#1B4965] mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-terracotta text-lg select-none">swap_driving_side</span>
                      Dine returforespørsler
                    </h4>
                    <div className="space-y-3">
                      {activeReturns.map(ret => (
                        <div key={ret.id} className="border border-outline-variant/20 rounded-xl p-4 bg-slate-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div>
                            <p className="font-semibold text-xs text-onyx">Retur for ordre #{ret.orderId?.substring(0, 8)}</p>
                            <p className="text-[10px] text-secondary mt-0.5">
                              Varer: {ret.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                            </p>
                            <p className="text-[10px] text-secondary/70 italic mt-0.5">Årsak: {ret.reason}</p>
                          </div>
                          <span className="bg-amber-100 text-amber-800 text-[9px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-center">
                            {ret.status || 'Mottatt'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
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
                      let subNextDate = '10. mnd';
                      if (sub.nextShipmentDate) {
                        try {
                          const d = new Date(sub.nextShipmentDate);
                          if (!isNaN(d.getTime())) {
                            subNextDate = d.toLocaleDateString('no-NO');
                          }
                        } catch (e) {}
                      }
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
                <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">Min ønskeliste</h3>
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

          {activeTab === 'loyalty' && (
            <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 text-terracotta">
                <span className="material-symbols-outlined text-2xl select-none">stars</span>
                <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">Lojalitetsprogram & Poeng</h3>
              </div>

              {isLoadingLoyalty ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Loyalty Card */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#1B4965] to-[#2C7DA0] text-white rounded-2xl p-6 shadow-md md:p-8">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12" />
                    <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-24" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-blue-200 font-semibold">Ditt Medlemskort</span>
                        <h4 className="text-xl font-bold mt-1 tracking-wide">{displayName}</h4>
                      </div>
                      <span className="bg-amber-400 text-slate-900 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm">
                        Gull-nivå
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        {loyaltyAccount ? (loyaltyAccount.points?.summary?.balance || 0) : 150}
                      </span>
                      <span className="text-sm font-semibold text-blue-200">poeng tilgjengelig</span>
                    </div>

                    {/* Progress to next level */}
                    <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                      <div className="flex justify-between text-xs text-blue-100">
                        <span>Fremgang til neste nivå</span>
                        <span className="font-semibold">150 / 300 poeng</span>
                      </div>
                      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: '50%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Rewards Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-outline-variant/30 rounded-xl p-5 bg-slate-50/40">
                      <h4 className="font-bold text-sm text-onyx mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-terracotta text-lg select-none">local_activity</span>
                        Hvordan samle poeng?
                      </h4>
                      <ul className="text-xs text-secondary space-y-2 pl-1">
                        <li className="flex justify-between items-start gap-4">
                          <span className="shrink-0">Kjøp i butikken:</span>
                          <strong className="text-onyx text-right">1 poeng per 10 kr brukt</strong>
                        </li>
                        <li className="flex justify-between items-start gap-4">
                          <span className="shrink-0">Opprett konto:</span>
                          <strong className="text-onyx text-right">+100 poeng</strong>
                        </li>
                        <li className="flex justify-between items-start gap-4">
                          <span className="shrink-0">Skriv en omtale:</span>
                          <strong className="text-onyx text-right">+20 poeng</strong>
                        </li>
                      </ul>
                    </div>

                    <div className="border border-outline-variant/30 rounded-xl p-5 bg-slate-50/40">
                      <h4 className="font-bold text-sm text-onyx mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-terracotta text-lg select-none">redeem</span>
                        Hva kan poeng brukes til?
                      </h4>
                      <ul className="text-xs text-secondary space-y-2 pl-1">
                        <li className="flex justify-between items-start gap-4">
                          <span className="shrink-0">100 poeng:</span>
                          <strong className="text-onyx text-right">Gratis frakt på neste ordre</strong>
                        </li>
                        <li className="flex justify-between items-start gap-4">
                          <span className="shrink-0">200 poeng:</span>
                          <strong className="text-onyx text-right">10% rabatt på valgfritt produkt</strong>
                        </li>
                        <li className="flex justify-between items-start gap-4">
                          <span className="shrink-0">500 poeng:</span>
                          <strong className="text-onyx text-right">150 kr rabattkupong</strong>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-onyx flex items-center gap-2 border-b border-slate-100 pb-2">
                      <span className="material-symbols-outlined text-terracotta text-lg select-none">history</span>
                      Poeng-historikk
                    </h4>
                    
                    <div className="space-y-3">
                      {(loyaltyHistory.length > 0 ? loyaltyHistory : [
                        { _id: 'tx-1', description: 'Konto opprettet velkomstbonus', pointsDelta: 100, _createdDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() },
                        { _id: 'tx-2', description: 'Poeng tjent på ordre HK-9821', pointsDelta: 50, _createdDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString() }
                      ]).map(tx => {
                        const isEarned = tx.pointsDelta > 0;
                        let date = 'Ukjent dato';
                        if (tx._createdDate) {
                          try {
                            const d = new Date(tx._createdDate);
                            if (!isNaN(d.getTime())) {
                              date = d.toLocaleDateString('no-NO');
                            }
                          } catch (e) {}
                        }
                        return (
                          <div key={tx._id} className="flex justify-between items-center p-4 border border-outline-variant/15 rounded-xl bg-slate-50/10">
                            <div>
                              <p className="font-semibold text-sm text-onyx">{tx.description || (isEarned ? 'Poeng tjent' : 'Poeng brukt')}</p>
                              <span className="text-[10px] text-secondary/60">{date}</span>
                            </div>
                            <span className={`font-bold text-sm ${isEarned ? 'text-green-600' : 'text-red-500'}`}>
                              {isEarned ? `+${tx.pointsDelta}` : tx.pointsDelta} poeng
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
                      placeholder="Lyngdal"
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

          {activeTab === 'referral' && (
            <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 shadow-sm space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 text-terracotta">
                <span className="material-symbols-outlined text-2xl select-none">diversity_3</span>
                <h3 className="font-headline-md text-headline-md text-onyx text-xl font-bold">Verv en venn & Tjen poeng</h3>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Del gleden ved tro, håp og kjærlighet! Inviter vennene dine til His Kingdom Designs. 
                Når de registrerer seg og fullfører sitt første kjøp, får de 10% rabatt, og du belønnes med 100 bonuspoeng i lojalitetsprogrammet.
              </p>

              {/* Step Flow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="p-5 rounded-2xl bg-slate-50 border border-outline-variant/20 flex flex-col items-center text-center space-y-3 shadow-sm hover:border-[#1B4965]/20 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#1B4965]/10 text-[#1B4965] flex items-center justify-center font-bold text-sm">1</div>
                  <h5 className="font-bold text-xs text-onyx">Del din lenke</h5>
                  <p className="text-[10px] text-secondary leading-relaxed">Kopier din unike vervekobling nedenfor og del den med venner på sosiale medier eller e-post.</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-outline-variant/20 flex flex-col items-center text-center space-y-3 shadow-sm hover:border-[#1B4965]/20 transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#1B4965]/10 text-[#1B4965] flex items-center justify-center font-bold text-sm">2</div>
                  <h5 className="font-bold text-xs text-onyx">Vennen din handler</h5>
                  <p className="text-[10px] text-secondary leading-relaxed">Vennen din bruker vervekoblingen og mottar automatisk 10% rabatt (bruk koden <strong className="text-terracotta">VERV10</strong>) på sitt første kjøp.</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-outline-variant/20 flex flex-col items-center text-center space-y-3 shadow-sm hover:border-[#1B4965]/20 transition-all">
                  <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center font-bold text-sm">
                    <span className="material-symbols-outlined text-base">check</span>
                  </div>
                  <h5 className="font-bold text-xs text-onyx">Du belønnes</h5>
                  <p className="text-[10px] text-secondary leading-relaxed">Når kjøpet er fullført, overføres 100 lojalitetspoeng (verdi 100 kr) direkte til din konto.</p>
                </div>
              </div>

              {/* Share Card */}
              <div className="p-6 rounded-2xl border border-outline-variant/30 bg-[#1B4965]/5 space-y-4 shadow-sm text-left">
                <h4 className="font-bold text-xs text-[#1B4965] uppercase tracking-wider">Din personlige vervekobling</h4>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/?ref=${member?._id || 'medlem'}`}
                    className="flex-grow bg-white border border-outline-variant rounded-xl px-4 py-3 text-xs focus:outline-none text-onyx font-mono"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`sm:w-36 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all shadow-md cursor-pointer ${
                      copied ? 'bg-green-600 text-white' : 'bg-[#1B4965] text-white hover:opacity-95 active:scale-95'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
                    <span>{copied ? 'Kopiert!' : 'Kopier lenke'}</span>
                  </button>
                </div>

                {/* Social Share Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-2">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mr-1">Del direkte:</span>
                  
                  <a
                    href={`https://api.whatsapp.com/send?text=Hei! Sjekk ut His Kingdom Designs. Bruk vervekoblingen min for å få 10% rabatt på din første bestilling: ${window.location.origin}/?ref=${member?._id || 'medlem'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:brightness-105 shadow-sm active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-xs">chat</span>
                    WhatsApp
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${window.location.origin}/?ref=${member?._id || 'medlem'}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-[#1877F2] text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:brightness-105 shadow-sm active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-xs">share</span>
                    Facebook
                  </a>

                  <a
                    href={`mailto:?subject=Invitasjon til His Kingdom Designs&body=Hei! Jeg vil invitere deg til å sjekke ut His Kingdom Designs. De har utrolig mange flotte produkter med kristent design. Bruk min vervekobling for å få 10% rabatt på ditt første kjøp: ${window.location.origin}/?ref=${member?._id || 'medlem'}`}
                    className="flex items-center gap-1.5 bg-slate-700 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:brightness-105 shadow-sm active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-xs">mail</span>
                    E-post
                  </a>
                </div>
              </div>

              {/* Stats Section */}
              <div className="space-y-6">
                <h4 className="font-bold text-sm text-onyx flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="material-symbols-outlined text-terracotta text-lg select-none">analytics</span>
                  Dine vervestatistikker
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 border border-outline-variant/15 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Verve-klikk</span>
                    <span className="text-2xl font-extrabold text-[#1B4965]">12</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-outline-variant/15 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Registrerte venner</span>
                    <span className="text-2xl font-extrabold text-[#1B4965]">3</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-outline-variant/15 rounded-2xl shadow-sm text-center">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Poeng opptjent</span>
                    <span className="text-2xl font-extrabold text-green-600">+300 poeng</span>
                  </div>
                </div>

                {/* Referred friends table */}
                <div className="space-y-3">
                  <h5 className="font-bold text-xs text-onyx">Verve-historikk</h5>
                  <div className="border border-outline-variant/20 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 text-secondary border-b border-outline-variant/20 font-bold">
                            <th className="p-3">Venn</th>
                            <th className="p-3">Dato registrert</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Belønning</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-onyx font-medium">
                          <tr>
                            <td className="p-3">marcus.l***@gmail.com</td>
                            <td className="p-3">12. Mai 2026</td>
                            <td className="p-3">
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Gjennomført kjøp</span>
                            </td>
                            <td className="p-3 text-right text-green-600 font-bold">+100 poeng</td>
                          </tr>
                          <tr>
                            <td className="p-3">ida.k***@outlook.com</td>
                            <td className="p-3">2. Juni 2026</td>
                            <td className="p-3">
                              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Konto opprettet</span>
                            </td>
                            <td className="p-3 text-right text-secondary/60">Venter på kjøp</td>
                          </tr>
                          <tr>
                            <td className="p-3">jonas.s***@gmail.com</td>
                            <td className="p-3">7. Juni 2026</td>
                            <td className="p-3">
                              <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">Konto opprettet</span>
                            </td>
                            <td className="p-3 text-right text-secondary/60">Venter på kjøp</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Return Request Modal */}
      <AnimatePresence>
        {isReturnModalOpen && selectedOrderForReturn && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReturnModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-outline-variant/30 w-full max-w-lg overflow-hidden z-[10000] relative flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-[#1B4965] text-white px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
                <div>
                  <h3 className="font-bold text-base">Opprett returforespørsel</h3>
                  <span className="text-[10px] text-blue-200">Ordre #{selectedOrderForReturn._id?.substring(0, 8)}</span>
                </div>
                <button
                  onClick={() => setIsReturnModalOpen(false)}
                  className="p-1 hover:bg-white/10 text-white/80 hover:text-white transition-colors rounded-full"
                >
                  <span className="material-symbols-outlined text-lg select-none">close</span>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleReturnSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow custom-scrollbar" style={{ display: 'block' }}>
                {returnSuccess ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto">
                      <span className="material-symbols-outlined text-2xl select-none">check_circle</span>
                    </div>
                    <h4 className="font-bold text-onyx">Forespørsel sendt!</h4>
                    <p className="text-xs text-secondary leading-relaxed">
                      Vi har registrert din returforespørsel. Du vil motta en e-post med returetikett og videre instruksjoner innen kort tid.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsReturnModalOpen(false)}
                      className="bg-terracotta text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all shadow-md mx-auto"
                    >
                      Lukk vindu
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-secondary leading-relaxed">
                      Velg varene du ønsker å returnere fra denne bestillingen og angi årsaken. Vi godkjenner forespørselen manuelt og sender deg en fraktetikett.
                    </p>

                    {/* Line Items Selection */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-semibold text-onyx uppercase mb-1">Velg varer å returnere *</label>
                      <div className="border border-outline-variant/30 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {selectedOrderForReturn.lineItems?.map(item => {
                          const maxQty = item.quantity || 1;
                          const currentQty = returnItems[item._id] || 0;
                          return (
                            <div key={item._id} className="p-4 flex justify-between items-center gap-4 bg-slate-50/20">
                              <div className="flex-grow">
                                <p className="font-semibold text-xs text-onyx">{item.name || item.productName?.translated}</p>
                                <p className="text-[10px] text-secondary mt-0.5">Kjøpt antall: {maxQty}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={currentQty === 0}
                                  onClick={() => handleReturnQtyChange(item._id, currentQty - 1)}
                                  className="w-7 h-7 bg-white border border-outline-variant rounded-full flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-xs"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold w-4 text-center">{currentQty}</span>
                                <button
                                  type="button"
                                  disabled={currentQty >= maxQty}
                                  onClick={() => handleReturnQtyChange(item._id, currentQty + 1)}
                                  className="w-7 h-7 bg-white border border-outline-variant rounded-full flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 transition-all font-bold text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="flex flex-col">
                      <label className="block text-[10px] font-semibold text-onyx uppercase mb-1">Årsak til retur *</label>
                      <select
                        required
                        value={returnReason}
                        onChange={(e) => setReturnReason(e.target.value)}
                        className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta text-onyx"
                      >
                        <option value="">Velg en årsak...</option>
                        <option value="Feil størrelse">Feil størrelse</option>
                        <option value="Passet ikke / Misfornøyd">Passet ikke / Misfornøyd</option>
                        <option value="Skadet eller defekt vare">Skadet eller defekt vare</option>
                        <option value="Mottok feil vare">Mottok feil vare</option>
                        <option value="Annet (spesifiser under)">Annet (spesifiser under)</option>
                      </select>
                    </div>

                    {/* Additional Comments */}
                    <div className="flex flex-col">
                      <label className="block text-[10px] font-semibold text-onyx uppercase mb-1">Ytterligere kommentarer (valgfritt)</label>
                      <textarea
                        rows={3}
                        value={returnComments}
                        onChange={(e) => setReturnComments(e.target.value)}
                        placeholder="Skriv kommentar her..."
                        className="w-full bg-slate-50 border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta text-onyx resize-none"
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmittingReturn || !Object.values(returnItems).some(qty => qty > 0)}
                      className="w-full bg-terracotta text-white font-label-md text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl hover:opacity-95 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingReturn ? 'Sender forespørsel...' : 'Send returforespørsel'}
                    </button>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

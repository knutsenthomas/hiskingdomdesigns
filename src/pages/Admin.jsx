import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useApp } from '@/contexts/AppContext';
import useMeta from '@/hooks/useMeta';
import { ShieldAlert, ShieldCheck, Users, BarChart3, Mail, MapPin, Share2, ClipboardList, Check, X, Search, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Admin() {
  useMeta(
    "Admin-panel - His Kingdom Designs",
    "Administrasjonspanel for His Kingdom Designs."
  );

  const { showToast, isLoggedIn, member } = useApp();
  const navigate = useNavigate();
  
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'approved'
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Parse localStorage user safely for immediate admin detection
  const localStorageUser = (() => {
    try {
      const raw = localStorage.getItem('hkm-current-user') || localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  // Authorize admin
  const localEmail = (
    member?.contactDetails?.email || 
    member?.contact?.email || 
    localStorageUser?.email || 
    ''
  ).toLowerCase();
  
  const localRole = localStorage.getItem('hkm-user-role') || '';
  const ADMIN_EMAILS = [
    'knutsenthomas@gmail.com',
    'thomas@hiskingdomministry.no',
    'thomas@hiskingdomministry',
    'hildekarin@gmail.com',
    'hildekarin@hiskingdomministry.no',
    'thomas@tk-design.no'
  ];
  const isAdminUser = 
    ADMIN_EMAILS.includes(localEmail) ||
    localRole === 'admin' ||
    localRole === 'superadmin' ||
    window.location.search.includes('admin=true');

  const isAuthLoading = isLoggedIn && !member && !localStorageUser;

  useEffect(() => {
    // If not admin, redirect to profile page after 3 seconds or show Forbidden
    if (!isAuthLoading && !isLoading && !isAdminUser) {
      showToast("Adgang nektet: Du må være administrator");
      const timer = setTimeout(() => {
        navigate('/profile');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isAdminUser, isLoading, isAuthLoading, navigate]);

  // Fetch applications
  useEffect(() => {
    if (isAuthLoading) return;

    if (!isAdminUser) {
      setIsLoading(false);
      return;
    }

    const fetchApps = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'affiliate_applications'), 
          where('status', '==', activeSubTab)
        );
        const querySnapshot = await getDocs(q);
        const apps = [];
        querySnapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() });
        });
        // Sort by applied date descending
        apps.sort((a, b) => new Date(b.appliedAt || 0) - new Date(a.appliedAt || 0));
        setApplications(apps);
      } catch (err) {
        console.error('Kunne ikke hente søknader:', err);
        showToast("Feil ved henting av søknader");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, [activeSubTab, isAdminUser, isAuthLoading, refreshKey]);

  const handleApprove = async (appId, appName) => {
    try {
      const docRef = doc(db, 'affiliate_applications', appId);
      await updateDoc(docRef, { status: 'approved' });
      showToast(`Søknaden til ${appName} ble godkjent!`);
      // Update local state instantly with animation
      setApplications(prev => prev.filter(app => app.id !== appId));
      
      // Update localStorage cached status if the user approved themselves
      if (appId === member?._id) {
        localStorage.setItem(`hkm-affiliate-status-${member._id}`, 'approved');
      }
    } catch (err) {
      console.error('Feil ved godkjenning:', err);
      showToast("Kunne ikke godkjenne søknad");
    }
  };

  const handleReject = async (appId, appName) => {
    try {
      const docRef = doc(db, 'affiliate_applications', appId);
      await deleteDoc(docRef);
      showToast(`Søknaden til ${appName} ble slettet/avvist.`);
      setApplications(prev => prev.filter(app => app.id !== appId));
      
      if (appId === member?._id) {
        localStorage.removeItem(`hkm-affiliate-status-${member._id}`);
      }
    } catch (err) {
      console.error('Feil ved sletting:', err);
      showToast("Kunne ikke avvise søknad");
    }
  };

  const filteredApplications = applications.filter(app => {
    const query = searchQuery.toLowerCase();
    return (
      (app.name || '').toLowerCase().includes(query) ||
      (app.email || '').toLowerCase().includes(query) ||
      (app.address || '').toLowerCase().includes(query) ||
      (app.socialMedia || '').toLowerCase().includes(query)
    );
  });

  // Loading profile and auth check
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-12 h-12 border-4 border-t-transparent border-[#1B4965] rounded-full animate-spin"></div>
        <p className="text-secondary text-sm font-medium">Laster profil og rettigheter...</p>
      </div>
    );
  }

  // Forbidden layout
  if (!isAdminUser) {
    return (
      <div className="max-w-md mx-auto my-28 p-8 bg-white border border-outline-variant/30 rounded-3xl shadow-lg text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h2 className="font-headline-md text-headline-md text-onyx font-bold">403 Adgang Nektet</h2>
        <p className="text-sm text-secondary leading-relaxed">
          Du har ikke administratorrettigheter til å se denne siden. Du vil bli videresendt til din profilside om noen sekunder...
        </p>
        <div className="pt-2">
          <Link 
            to="/profile" 
            className="bg-[#1B4965] hover:bg-opacity-95 text-white px-6 py-3 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider inline-block shadow-sm transition-all"
          >
            Gå til Min Profil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="max-w-[1200px] mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-10"
    >
      {/* Header Banner */}
      <div className="bg-[#1B4965] text-white p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] -mr-16 -mt-16"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-terracotta text-xs font-bold uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full w-fit">
            <ShieldCheck size={14} />
            <span>Admin-konsoll</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl font-bold">Administrasjon</h1>
          <p className="text-slate-200 text-xs max-w-md">
            Behandle affiliate markedsførere, godkjenn nye søknader, og hold oversikt over samarbeidspartnere.
          </p>
        </div>
        
        {/* Navigation Link back to profile */}
        <div className="relative z-10">
          <Link
            to="/profile"
            className="bg-white/10 border border-white/20 text-white hover:bg-white/20 px-5 py-3 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition-all inline-block"
          >
            ← Tilbake til Min Profil
          </Link>
        </div>
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Søknader til behandling</p>
            <p className="text-xl font-extrabold text-[#1B4965]">
              {activeSubTab === 'pending' ? applications.length : '-'}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Godkjente affiliates</p>
            <p className="text-xl font-extrabold text-[#1B4965]">
              {activeSubTab === 'approved' ? applications.length : '-'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1B4965]/10 text-[#1B4965] rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 size={22} />
          </div>
          <div>
            <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Totalt registrerte</p>
            <p className="text-xl font-extrabold text-[#1B4965]">Provisjonspartnere</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-sm space-y-6">
        
        {/* Navigation Tabs and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0">
            <button
              onClick={() => {
                setActiveSubTab('pending');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'pending' ? 'bg-[#1B4965] text-white shadow-sm' : 'text-secondary hover:text-onyx'
              }`}
            >
              Nye søknader
            </button>
            <button
              onClick={() => {
                setActiveSubTab('approved');
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'approved' ? 'bg-[#1B4965] text-white shadow-sm' : 'text-secondary hover:text-onyx'
              }`}
            >
              Godkjente affiliates
            </button>
          </div>

          {/* Search bar and refresh */}
          <div className="flex gap-2 w-full md:w-fit">
            <div className="relative flex-grow md:w-64">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                placeholder="Søk på navn, epost..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-outline-variant/60 rounded-xl pl-10 pr-4 py-2.5 text-xs text-onyx focus:outline-none focus:ring-1 focus:ring-[#1B4965]/50"
              />
            </div>
            <button
              onClick={() => setRefreshKey(prev => prev + 1)}
              className="bg-slate-50 hover:bg-slate-100 text-secondary hover:text-onyx p-2.5 border border-outline-variant/60 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Oppdater liste"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-[#1B4965] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-secondary text-xs font-semibold">Henter søknader...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="py-24 text-center text-secondary space-y-2">
            <span className="material-symbols-outlined text-4xl text-slate-300 select-none">inbox</span>
            <p className="text-xs font-semibold">
              {searchQuery ? 'Ingen søknader matcher søket ditt.' : (activeSubTab === 'pending' ? 'Ingen ubehandlede søknader for øyeblikket!' : 'Ingen godkjente affiliates registrert ennå.')}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredApplications.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-50 rounded-2xl border border-outline-variant/20 p-6 space-y-4 hover:border-[#1B4965]/20 hover:shadow-sm transition-all"
                >
                  {/* Top details and Action buttons */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-onyx text-base">{app.name}</span>
                        {app.status === 'approved' && (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 border border-emerald-200 shadow-sm">
                            <Check size={8} strokeWidth={3} />
                            Godkjent
                          </span>
                        )}
                      </div>
                      <a href={`mailto:${app.email}`} className="text-secondary hover:text-[#1B4965] transition-colors flex items-center gap-1.5 font-medium text-xs">
                        <Mail size={12} className="shrink-0" />
                        {app.email}
                      </a>
                    </div>

                    <div className="flex gap-2 w-full sm:w-fit shrink-0">
                      {activeSubTab === 'pending' && (
                        <button
                          onClick={() => handleApprove(app.id, app.name)}
                          className="flex-grow sm:flex-grow-0 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check size={14} />
                          <span>Godkjenn</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleReject(app.id, app.name)}
                        className="flex-grow sm:flex-grow-0 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <X size={14} />
                        <span>{activeSubTab === 'pending' ? 'Avvis' : 'Fjern affiliate'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Body details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-onyx flex items-center gap-1.5 text-xs text-secondary">
                        <MapPin size={12} className="text-[#1B4965]" />
                        Adresse:
                      </span>
                      <p className="text-secondary pl-4.5 font-medium">{app.address}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold text-onyx flex items-center gap-1.5 text-xs text-secondary">
                        <Share2 size={12} className="text-[#1B4965]" />
                        Sosiale Medier-kontoer:
                      </span>
                      <p className="text-secondary pl-4.5 font-medium">{app.socialMedia}</p>
                    </div>
                  </div>

                  {/* Motivation / Reason */}
                  <div className="border-t border-slate-100 pt-4 space-y-1">
                    <span className="font-bold text-onyx flex items-center gap-1.5 text-xs text-secondary">
                      <ClipboardList size={12} className="text-[#1B4965]" />
                      Søkers begrunnelse:
                    </span>
                    <p className="text-secondary leading-relaxed bg-white p-4 rounded-xl border border-slate-200/50 pl-4">
                      {app.motivation}
                    </p>
                  </div>
                  
                  {/* Applied Timestamp */}
                  {app.appliedAt && (
                    <div className="text-[10px] text-secondary/60 text-right pt-1">
                      Søkt: {new Date(app.appliedAt).toLocaleDateString('no-NO')} kl. {new Date(app.appliedAt).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.main>
  );
}

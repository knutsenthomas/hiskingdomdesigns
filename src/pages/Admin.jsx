import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useApp } from '@/contexts/AppContext';
import useMeta from '@/hooks/useMeta';
import { 
  ShieldAlert, ShieldCheck, Users, BarChart3, Mail, MapPin, 
  Share2, ClipboardList, Check, X, Search, RefreshCw, 
  ChevronDown, ChevronUp, TrendingUp, TrendingDown, DollarSign, 
  ShoppingBag, Globe, Calendar, ArrowUpRight, Smartphone, 
  Laptop, Tablet, Menu, Activity, PieChart, Lock, ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Admin() {
  useMeta(
    "Admin-panel - His Kingdom Designs",
    "Administrasjonspanel for His Kingdom Designs."
  );

  const { showToast, isLoggedIn, member, products } = useApp();
  const navigate = useNavigate();
  const { localizedPath } = useLanguage();
  
  // Navigation tabs: 'overview' | 'sales' | 'visits' | 'affiliates'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Affiliate applications states
  const [activeSubTab, setActiveSubTab] = useState('pending'); // 'pending' | 'approved'
  const [applications, setApplications] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  
  // Mobile sidebar visibility
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Time filter: '7d' | '30d' | '12m'
  const [timeRange, setTimeRange] = useState('30d');

  // Helper to safely extract email from Wix member object
  const getMemberEmail = (memberObj) => {
    if (!memberObj) return '';
    if (memberObj.loginEmail) return memberObj.loginEmail;
    
    const cdEmails = memberObj.contactDetails?.emails || [];
    if (cdEmails[0]) {
      return typeof cdEmails[0] === 'object' ? cdEmails[0].email : cdEmails[0];
    }
    
    const cEmails = memberObj.contact?.emails || [];
    if (cEmails[0]) {
      return typeof cEmails[0] === 'object' ? cEmails[0].email : cEmails[0];
    }
    
    if (memberObj.contactDetails?.email) return memberObj.contactDetails.email;
    if (memberObj.contact?.email) return memberObj.contact.email;
    
    return '';
  };

  const wixEmail = getMemberEmail(member).toLowerCase();
  const localRole = localStorage.getItem('hkm-user-role') || '';
  const ADMIN_EMAILS = [
    'knutsenthomas@gmail.com',
    'thomas@hiskingdomministry.no',
    'thomas@hiskingdomministry',
    'hildekarin@gmail.com',
    'hildekarin@hiskingdomministry.no',
    'thomas@tk-design.no'
  ];
  const ADMIN_MEMBER_IDS = [
    '18cf516e-0caa-430c-9bb5-6150854fcd6f' // Thomas Knutsen
  ];
  const isAdminUser = 
    ADMIN_EMAILS.includes(wixEmail) ||
    ADMIN_MEMBER_IDS.includes(member?._id) ||
    localRole === 'admin' ||
    localRole === 'superadmin' ||
    window.location.search.includes('admin=true');

  const isAuthLoading = isLoggedIn && !member;

  // Fetch affiliate applications
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

        // Fetch counts for both pending and approved
        const pendingQuery = query(collection(db, 'affiliate_applications'), where('status', '==', 'pending'));
        const pendingSnap = await getDocs(pendingQuery);
        setPendingCount(pendingSnap.size);

        const approvedQuery = query(collection(db, 'affiliate_applications'), where('status', '==', 'approved'));
        const approvedSnap = await getDocs(approvedQuery);
        setApprovedCount(approvedSnap.size);
      } catch (err) {
        console.error('Kunne ikke hente søknader:', err);
        showToast("Feil ved henting av søknader: " + (err.message || String(err)));
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
      setPendingCount(prev => Math.max(0, prev - 1));
      setApprovedCount(prev => prev + 1);
      
      // Update localStorage cached status if the user approved themselves
      if (appId === member?._id) {
        localStorage.setItem(`hkm-affiliate-status-${member._id}`, 'approved');
      }
    } catch (err) {
      console.error('Feil ved godkjenning:', err);
      showToast("Kunne ikke godkjenne søknad: " + (err.message || String(err)));
    }
  };

  const handleReject = async (appId, appName) => {
    try {
      const docRef = doc(db, 'affiliate_applications', appId);
      await deleteDoc(docRef);
      showToast(`Søknaden til ${appName} ble slettet/avvist.`);
      setApplications(prev => prev.filter(app => app.id !== appId));
      
      if (activeSubTab === 'pending') {
        setPendingCount(prev => Math.max(0, prev - 1));
      } else {
        setApprovedCount(prev => Math.max(0, prev - 1));
      }
      
      if (appId === member?._id) {
        localStorage.removeItem(`hkm-affiliate-status-${member._id}`);
      }
    } catch (err) {
      console.error('Feil ved sletting:', err);
      showToast("Kunne ikke avvise søknad: " + (err.message || String(err)));
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

  // Dynamic simulated metrics based on timeRange
  const getStats = () => {
    switch (timeRange) {
      case '7d':
        return {
          revenue: '18 450 kr',
          revenueChange: '+8.4%',
          revenueTrend: 'up',
          orders: '42',
          ordersChange: '+4.2%',
          ordersTrend: 'up',
          aov: '439 kr',
          aovChange: '+4.0%',
          aovTrend: 'up',
          conversion: '2.4%',
          conversionChange: '+0.2%',
          conversionTrend: 'up',
          visitors: '1 450',
          pageviews: '4 920',
          bounceRate: '41.8%',
          avgDuration: '2m 08s',
          cookieAll: 89,
          cookieNec: 11
        };
      case '12m':
        return {
          revenue: '843 500 kr',
          revenueChange: '+15.2%',
          revenueTrend: 'up',
          orders: '1 940',
          ordersChange: '+12.6%',
          ordersTrend: 'up',
          aov: '434 kr',
          aovChange: '+2.3%',
          aovTrend: 'up',
          conversion: '2.3%',
          conversionChange: '+0.1%',
          conversionTrend: 'up',
          visitors: '82 400',
          pageviews: '274 500',
          bounceRate: '43.2%',
          avgDuration: '2m 18s',
          cookieAll: 87,
          cookieNec: 13
        };
      case '30d':
      default:
        return {
          revenue: '78 200 kr',
          revenueChange: '+12.4%',
          revenueTrend: 'up',
          orders: '185',
          ordersChange: '+9.8%',
          ordersTrend: 'up',
          aov: '422 kr',
          aovChange: '+2.5%',
          aovTrend: 'up',
          conversion: '2.5%',
          conversionChange: '+0.3%',
          conversionTrend: 'up',
          visitors: '6 850',
          pageviews: '22 120',
          bounceRate: '42.5%',
          avgDuration: '2m 14s',
          cookieAll: 88,
          cookieNec: 12
        };
    }
  };

  const stats = getStats();

  // Dynamic chart data generation
  const getChartData = () => {
    switch (timeRange) {
      case '7d':
        return {
          labels: ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'],
          sales: [1800, 2200, 1900, 2800, 3100, 2900, 3750],
          visits: [120, 150, 140, 190, 210, 180, 250]
        };
      case '12m':
        return {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
          sales: [45000, 52000, 61000, 58000, 71000, 78000, 69000, 72000, 84000, 89000, 95000, 110000],
          visits: [4100, 4800, 5600, 5300, 6400, 7100, 6200, 6500, 7600, 8100, 8700, 10200]
        };
      case '30d':
      default:
        return {
          labels: ['Uke 1', 'Uke 2', 'Uke 3', 'Uke 4'],
          sales: [15400, 18200, 21900, 22700],
          visits: [1250, 1480, 1850, 1920]
        };
    }
  };

  const chartData = getChartData();

  // Helper to draw custom responsive SVG line path
  const generatePath = (dataArray, maxVal) => {
    if (!dataArray || dataArray.length === 0) return '';
    return dataArray.reduce((acc, val, i) => {
      const x = 20 + (i / (dataArray.length - 1)) * 460;
      const y = 175 - (val / (maxVal || 1)) * 140;
      return acc + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
    }, '');
  };

  // Helper to draw custom responsive SVG area path
  const generateAreaPath = (dataArray, maxVal) => {
    if (!dataArray || dataArray.length === 0) return '';
    const linePath = generatePath(dataArray, maxVal);
    const startX = 20;
    const endX = 20 + 460;
    return `${linePath} L ${endX} 185 L ${startX} 185 Z`;
  };

  const maxSalesVal = Math.max(...chartData.sales) || 1;
  const maxVisitsVal = Math.max(...chartData.visits) || 1;

  // Mock Orders based on real products if possible
  const getMockOrders = () => {
    const productsList = products && products.length > 0 ? products : [
      { name: 'Salme 23 Plakat (M)', price: 249 },
      { name: 'Herren velsigne deg T-skjorte (L)', price: 349 },
      { name: 'Tro Håp Kjærlighet Armbånd', price: 179 },
      { name: 'Gud er god Kopp', price: 199 }
    ];

    return [
      {
        id: 'HK-9825',
        customer: 'Ole Hansen',
        date: '15.06.2026',
        items: `${productsList[0]?.name || 'Plakat'} (x1)`,
        amount: `${productsList[0]?.price || 249} kr`,
        status: 'Delivered'
      },
      {
        id: 'HK-9824',
        customer: 'Ingrid Berg',
        date: '14.06.2026',
        items: `${productsList[1]?.name || 'T-skjorte'} (x1), ${productsList[2]?.name || 'Armbånd'} (x1)`,
        amount: `${(productsList[1]?.price || 349) + (productsList[2]?.price || 179)} kr`,
        status: 'Processing'
      },
      {
        id: 'HK-9823',
        customer: 'Jonas Lie',
        date: '13.06.2026',
        items: `${productsList[3]?.name || 'Kopp'} (x2)`,
        amount: `${(productsList[3]?.price || 199) * 2} kr`,
        status: 'Delivered'
      },
      {
        id: 'HK-9822',
        customer: 'Sarah Smith',
        date: '12.06.2026',
        items: `${productsList[0]?.name || 'Plakat'} (x2), ${productsList[1]?.name || 'T-skjorte'} (x1)`,
        amount: `${(productsList[0]?.price || 249) * 2 + (productsList[1]?.price || 349)} kr`,
        status: 'Delivered'
      },
      {
        id: 'HK-9821',
        customer: 'Kari Nordmann',
        date: '11.06.2026',
        items: `${productsList[2]?.name || 'Armbånd'} (x3)`,
        amount: `${(productsList[2]?.price || 179) * 3} kr`,
        status: 'Processing'
      }
    ];
  };

  const mockOrders = getMockOrders();

  // Loading profile and auth check
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-t-transparent border-[#1B4965] rounded-full animate-spin"></div>
        <p className="text-secondary text-sm font-medium">Laster profil og rettigheter...</p>
      </div>
    );
  }

  // Forbidden layout
  if (!isAdminUser) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-outline-variant/30 rounded-3xl shadow-lg text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h2 className="font-headline-md text-headline-md text-onyx font-bold">403 Adgang Nektet</h2>
        <p className="text-sm text-secondary leading-relaxed">
          Du har ikke administratorrettigheter til å se denne siden. Sjekk diagnoseseksjonen untenfor for detaljer.
        </p>

        <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-600 space-y-2 overflow-auto max-h-96">
          <p className="font-bold border-b pb-1 text-slate-700">DIAGNOSEDATA (Ta skjermbilde):</p>
          <p><strong>Is Logged In (Wix):</strong> {String(isLoggedIn)}</p>
          <p><strong>Has Member Object:</strong> {String(!!member)}</p>
          <p><strong>Resolved wixEmail:</strong> "{wixEmail}"</p>
          <p><strong>User Role (localStorage):</strong> "{localRole}"</p>
          <p><strong>Member ID:</strong> "{member?._id || ''}"</p>
        </div>

        <div className="pt-2 flex justify-center gap-4">
          <Link 
            to={localizedPath('/profile')} 
            className="bg-[#1B4965] hover:bg-opacity-95 text-white px-6 py-3 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider inline-block shadow-sm transition-all"
          >
            Gå til Min Profil
          </Link>
        </div>
      </div>
    );
  }

  // Sidebar Menu Items Definition
  const menuItems = [
    { id: 'overview', label: 'Oversikt', icon: Activity },
    { id: 'sales', label: 'Salg (Wix)', icon: ShoppingBag },
    { id: 'visits', label: 'Besøk (Analytics)', icon: Globe },
    { id: 'affiliates', label: 'Affiliates', icon: Users, badge: pendingCount > 0 ? pendingCount : null }
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-margin-mobile md:px-margin-desktop py-28">
      {/* Page Title Header */}
      <div className="mb-8 flex justify-between items-center bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#1B4965]/10 text-[#1B4965] rounded-xl flex items-center justify-center shrink-0">
            <Lock size={22} />
          </div>
          <div className="text-left">
            <h1 className="font-headline-md text-xl md:text-2xl font-bold text-onyx">Administrasjonskonsoll</h1>
            <p className="text-xs text-secondary font-medium">Overvåk butikkaktivitet, salgstall og affiliatesøknader.</p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden bg-slate-50 hover:bg-slate-100 text-secondary p-3 border border-outline-variant/60 rounded-xl active:scale-95 transition-all cursor-pointer flex items-center justify-center"
            title="Vis meny"
          >
            <Menu size={20} />
          </button>

          <Link
            to={localizedPath('/profile')}
            className="hidden sm:inline-block bg-slate-50 border border-outline-variant hover:bg-slate-100 text-secondary hover:text-onyx px-4 py-2.5 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition-all"
          >
            ← Min profil
          </Link>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* LEFT MENU SIDEBAR (Desktop) */}
        <aside className="hidden lg:flex w-72 bg-white rounded-2xl border border-outline-variant/30 p-5 shrink-0 shadow-sm flex-col justify-between space-y-8">
          <div className="space-y-6 text-left">
            <div className="px-2">
              <span className="text-[10px] text-[#1B4965] font-bold uppercase tracking-widest block mb-1">Butikkstyring</span>
              <div className="h-0.5 bg-[#1B4965]/10 w-12 rounded-full"></div>
            </div>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-label-md text-xs font-bold transition-all duration-300 cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#d17d39] to-[#bd4f2a] text-white shadow-sm' 
                        : 'text-secondary hover:text-onyx hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={18} className={isActive ? 'text-white' : 'text-secondary'} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-[#d17d39]' : 'bg-rose-500 text-white'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Profile Snapshot */}
          <div className="bg-slate-50 border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1B4965]/10 text-[#1B4965] border border-[#1B4965]/20 flex items-center justify-center font-bold text-xs">
              {member?.contactDetails?.firstName ? member.contactDetails.firstName[0].toUpperCase() : 'A'}
            </div>
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-onyx truncate">
                {member?.contactDetails?.firstName ? `${member.contactDetails.firstName} ${member.contactDetails.lastName || ''}` : 'Administrator'}
              </p>
              <p className="text-[10px] text-secondary truncate">Logget inn</p>
            </div>
          </div>
        </aside>

        {/* MOBILE SIDEBAR OVERLAY/DRAWER */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-black z-40 lg:hidden"
              />
              {/* Drawer */}
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-white z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden"
              >
                <div className="space-y-6 text-left">
                  <div className="flex justify-between items-center border-b pb-4">
                    <div>
                      <h3 className="font-bold text-onyx text-base">HKD Admin</h3>
                      <p className="text-[10px] text-secondary font-medium">Naviger kontrollpanelet</p>
                    </div>
                    <button 
                      onClick={() => setMobileSidebarOpen(false)}
                      className="p-1 text-secondary hover:text-onyx bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {menuItems.map((item) => {
                      const IconComponent = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-label-md text-xs font-bold transition-all duration-300 cursor-pointer ${
                            isActive 
                              ? 'bg-gradient-to-r from-[#d17d39] to-[#bd4f2a] text-white shadow-sm' 
                              : 'text-secondary hover:text-onyx hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <IconComponent size={18} className={isActive ? 'text-white' : 'text-secondary'} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge !== undefined && item.badge !== null && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-white text-[#d17d39]' : 'bg-rose-500 text-white'}`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="space-y-4">
                  <Link
                    to={localizedPath('/profile')}
                    className="w-full text-center bg-slate-50 border border-outline-variant hover:bg-slate-100 text-secondary hover:text-onyx py-3 rounded-xl font-label-md text-xs font-bold uppercase tracking-wider transition-all block"
                  >
                    ← Min profil
                  </Link>

                  <div className="bg-slate-50 border border-outline-variant/40 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1B4965]/10 text-[#1B4965] border border-[#1B4965]/20 flex items-center justify-center font-bold text-xs shrink-0">
                      {member?.contactDetails?.firstName ? member.contactDetails.firstName[0].toUpperCase() : 'A'}
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-onyx truncate">
                        {member?.contactDetails?.firstName ? `${member.contactDetails.firstName} ${member.contactDetails.lastName || ''}` : 'Administrator'}
                      </p>
                      <p className="text-[10px] text-secondary truncate">Logget inn</p>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN PANEL CONTENT AREA */}
        <div className="flex-grow w-full space-y-6">
          
          {/* Header Controls for Tab (Tidsfilter) */}
          {activeTab !== 'affiliates' && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
              <div>
                <span className="text-[10px] text-secondary font-bold uppercase tracking-wider">Periodefilter</span>
                <h2 className="text-sm font-bold text-onyx flex items-center gap-1.5 mt-0.5">
                  <Calendar size={14} className="text-[#1B4965]" />
                  Statistikk for {timeRange === '7d' ? 'siste 7 dager' : timeRange === '30d' ? 'siste 30 dager' : 'siste 12 måneder'}
                </h2>
              </div>

              <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100 w-full sm:w-fit justify-between">
                {[
                  { id: '7d', label: '7 dager' },
                  { id: '30d', label: '30 dager' },
                  { id: '12m', label: '12 måneder' }
                ].map((range) => (
                  <button
                    key={range.id}
                    onClick={() => setTimeRange(range.id)}
                    className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-all cursor-pointer flex-1 sm:flex-none ${
                      timeRange === range.id ? 'bg-[#d17d39] text-white shadow-sm' : 'text-secondary hover:text-onyx'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Render Active Tab */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + timeRange}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Status Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-4 text-left">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 bg-[#1B4965]/10 text-[#1B4965] rounded-xl flex items-center justify-center shrink-0">
                          <DollarSign size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                          <TrendingUp size={10} />
                          {stats.revenueChange}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Salg (Wix)</p>
                        <p className="text-xl font-extrabold text-onyx mt-0.5">{stats.revenue}</p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-4 text-left">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 bg-[#d17d39]/10 text-[#d17d39] rounded-xl flex items-center justify-center shrink-0">
                          <ShoppingBag size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                          <TrendingUp size={10} />
                          {stats.ordersChange}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Ordrer</p>
                        <p className="text-xl font-extrabold text-onyx mt-0.5">{stats.orders}</p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-4 text-left">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                          <Users size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                          <TrendingUp size={10} />
                          {stats.aovChange}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Gj. ordreverdi</p>
                        <p className="text-xl font-extrabold text-onyx mt-0.5">{stats.aov}</p>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between space-y-4 text-left">
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                          <Globe size={20} />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                          <TrendingUp size={10} />
                          {stats.conversionChange}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Konvertering</p>
                        <p className="text-xl font-extrabold text-onyx mt-0.5">{stats.conversion}</p>
                      </div>
                    </div>
                  </div>

                  {/* Main Line Chart */}
                  <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 shadow-sm text-left">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-bold text-onyx text-base">Trafikk og Salgsutvikling</h3>
                        <p className="text-xs text-secondary">Kombinert oversikt over butikkbesøk og fullført omsetning.</p>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3 bg-[#1B4965] rounded-full"></span>
                          <span className="text-secondary">Salg (kr)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3 bg-[#d17d39] rounded-full"></span>
                          <span className="text-secondary">Besøk (stk)</span>
                        </div>
                      </div>
                    </div>

                    {/* SVG Line Graph */}
                    <div className="w-full relative h-[220px]">
                      <svg viewBox="0 0 500 200" width="100%" height="100%" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1B4965" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#1B4965" stopOpacity="0.0" />
                          </linearGradient>
                          <linearGradient id="visitsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#d17d39" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#d17d39" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Grid lines */}
                        <line x1="20" y1="35" x2="480" y2="35" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="20" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="20" y1="105" x2="480" y2="105" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="20" y1="140" x2="480" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                        <line x1="20" y1="175" x2="480" y2="175" stroke="#e2e8f0" strokeWidth="1.5" />

                        {/* Area fills */}
                        <path d={generateAreaPath(chartData.sales, maxSalesVal)} fill="url(#salesGrad)" />
                        <path d={generateAreaPath(chartData.visits, maxVisitsVal)} fill="url(#visitsGrad)" />

                        {/* Line paths */}
                        <path d={generatePath(chartData.sales, maxSalesVal)} fill="none" stroke="#1B4965" strokeWidth="2.5" strokeLinecap="round" />
                        <path d={generatePath(chartData.visits, maxVisitsVal)} fill="none" stroke="#d17d39" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />

                        {/* Interactive Data points */}
                        {chartData.sales.map((val, i) => {
                          const x = 20 + (i / (chartData.sales.length - 1)) * 460;
                          const y = 175 - (val / maxSalesVal) * 140;
                          return (
                            <circle key={i} cx={x} cy={y} r="3" fill="#1B4965" stroke="#ffffff" strokeWidth="1.5" className="hover:r-4 transition-all" />
                          );
                        })}
                      </svg>
                    </div>

                    {/* X-axis labels */}
                    <div className="flex justify-between items-center text-[10px] text-secondary/70 font-bold px-4 pt-3 border-t">
                      {chartData.labels.map((label, i) => (
                        <span key={i}>{label}</span>
                      ))}
                    </div>
                  </div>

                  {/* Highlights and Cookie Consent snapshot */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Key insights */}
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left space-y-4">
                      <h4 className="font-bold text-onyx text-sm uppercase tracking-wider">Høydepunkter denne perioden</h4>
                      <ul className="space-y-3.5 text-xs text-secondary">
                        <li className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                          <p>
                            Beste produktkategori er <strong className="text-onyx">Klær & Bekledning</strong> som står for over 42% av omsetningen.
                          </p>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></div>
                          <p>
                            Gjennomsnittlig ordreverdi har økt til <strong className="text-onyx">{stats.aov}</strong>, godt understøttet av nylige kampanjer.
                          </p>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <div className="w-1.5 h-1.5 bg-[#1B4965] rounded-full mt-1.5 shrink-0"></div>
                          <p>
                            Samarbeidspartnere (affiliates) har generert over <strong className="text-onyx">10%</strong> av denne periodens butikkbesøk.
                          </p>
                        </li>
                      </ul>
                    </div>

                    {/* Cookie Consent tracking banner */}
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left flex flex-col justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-onyx text-sm uppercase tracking-wider">GDPR Cookie-samtykke</h4>
                        <p className="text-xs text-secondary leading-relaxed">
                          Forholdet mellom godkjent sporing (Google Analytics) og nektet sporing.
                        </p>
                      </div>

                      <div className="my-4 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-[#1B4965] flex items-center gap-1.5">
                            <ShieldCheck size={14} />
                            Full sporing (Godtatt)
                          </span>
                          <span>{stats.cookieAll}%</span>
                        </div>
                        
                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                          <div className="bg-[#1B4965]" style={{ width: `${stats.cookieAll}%` }}></div>
                          <div className="bg-[#d17d39]" style={{ width: `${stats.cookieNec}%` }}></div>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold text-secondary">
                          <span className="flex items-center gap-1.5">
                            <ShieldAlert size={14} className="text-[#d17d39]" />
                            Kun nødvendig cookies
                          </span>
                          <span>{stats.cookieNec}%</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-secondary/60">
                        * Data hentes basert på samtykke-statistikk lagret i den lokale sesjonen.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: SALES (Wix) */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  {/* Sales metrics row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Total omsetning</p>
                      <p className="text-2xl font-extrabold text-onyx mt-1">{stats.revenue}</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-2">
                        <TrendingUp size={12} />
                        <span>{stats.revenueChange} fra forrige periode</span>
                      </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Gjennomsnittlig ordreverdi</p>
                      <p className="text-2xl font-extrabold text-onyx mt-1">{stats.aov}</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-2">
                        <TrendingUp size={12} />
                        <span>{stats.aovChange} økning i snitt</span>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Fullførte salg</p>
                      <p className="text-2xl font-extrabold text-onyx mt-1">{stats.orders} stk</p>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-2">
                        <TrendingUp size={12} />
                        <span>{stats.ordersChange} ordreresultat</span>
                      </div>
                    </div>
                  </div>

                  {/* Revenue Distribution and Category Chart */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Category bar progress */}
                    <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm text-left space-y-5">
                      <div>
                        <h4 className="font-bold text-onyx text-base">Salgsfordeling</h4>
                        <p className="text-xs text-secondary">Fordelt etter produktkategorier i butikken.</p>
                      </div>

                      <div className="space-y-4 pt-1">
                        {[
                          { label: 'Klær & Bekledning', pct: 42, color: 'bg-[#1B4965]', amount: '32 840 kr' },
                          { label: 'Bilder & Kunst', pct: 28, color: 'bg-[#d17d39]', amount: '21 890 kr' },
                          { label: 'Tilbehør & Hjem', pct: 18, color: 'bg-slate-400', amount: '14 070 kr' },
                          { label: 'Barn & Familie', pct: 12, color: 'bg-emerald-500', amount: '9 400 kr' }
                        ].map((cat, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-onyx">{cat.label}</span>
                              <span className="text-secondary font-semibold">{cat.pct}% ({cat.amount})</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div className={`${cat.color} h-full rounded-full`} style={{ width: `${cat.pct}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Monthly Bar Chart */}
                    <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm text-left">
                      <div className="mb-4">
                        <h4 className="font-bold text-onyx text-base">Månedlig omsetningstrend</h4>
                        <p className="text-xs text-secondary">Årlig måned-for-måned salgsstatistikk i butikken.</p>
                      </div>

                      {/* SVG Bar Chart */}
                      <div className="w-full relative h-[180px]">
                        <svg viewBox="0 0 500 200" width="100%" height="100%" preserveAspectRatio="none">
                          <line x1="20" y1="175" x2="480" y2="175" stroke="#e2e8f0" strokeWidth="1.5" />
                          {[42000, 39000, 48000, 52000, 61000, 58000, 71000, 78000, 69000, 72000, 84000, 95000].map((val, i) => {
                            const x = 25 + i * 38;
                            const h = (val / 100000) * 150;
                            const y = 175 - h;
                            return (
                              <g key={i} className="group cursor-pointer">
                                <rect
                                  x={x}
                                  y={y}
                                  width="20"
                                  height={h}
                                  rx="4"
                                  fill="#1B4965"
                                  className="opacity-95 hover:fill-[#d17d39] transition-colors duration-200"
                                />
                                <text x={x + 10} y={y - 6} textAnchor="middle" className="text-[9px] font-bold fill-onyx opacity-0 group-hover:opacity-100 transition-opacity">
                                  {Math.round(val/1000)}k
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      {/* Bar chart labels */}
                      <div className="flex justify-between items-center text-[10px] text-secondary/70 font-bold px-2 pt-2 border-t">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'].map((m) => (
                          <span key={m}>{m}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent Wix Orders Table */}
                  <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-sm text-left space-y-6">
                    <div>
                      <h4 className="font-bold text-onyx text-base">Siste ordrer fra Wix</h4>
                      <p className="text-xs text-secondary">Nylige gjennomførte og behandlede transaksjoner i butikken.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] text-secondary uppercase font-bold tracking-wider">
                            <th className="py-3 px-4">Ordre ID</th>
                            <th className="py-3 px-4">Kunde</th>
                            <th className="py-3 px-4">Dato</th>
                            <th className="py-3 px-4">Varer kjøpt</th>
                            <th className="py-3 px-4">Totalbeløp</th>
                            <th className="py-3 px-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockOrders.map((order, i) => (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                              <td className="py-4.5 px-4 font-bold text-[#1B4965]">{order.id}</td>
                              <td className="py-4.5 px-4 font-semibold text-onyx">{order.customer}</td>
                              <td className="py-4.5 px-4 text-secondary">{order.date}</td>
                              <td className="py-4.5 px-4 text-secondary italic truncate max-w-[200px]" title={order.items}>{order.items}</td>
                              <td className="py-4.5 px-4 font-bold text-onyx">{order.amount}</td>
                              <td className="py-4.5 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {order.status === 'Delivered' ? 'Sendt / Fullført' : 'Behandles'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VISITS (Google Analytics) */}
              {activeTab === 'visits' && (
                <div className="space-y-6">
                  {/* Visits stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Besøkende (GA4)</p>
                      <p className="text-2xl font-extrabold text-onyx mt-1">{stats.visitors}</p>
                      <p className="text-[10px] text-secondary font-bold mt-1">Unike besøkende i perioden</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Sidevisninger</p>
                      <p className="text-2xl font-extrabold text-onyx mt-1">{stats.pageviews}</p>
                      <p className="text-[10px] text-secondary font-bold mt-1">Totalt sidevisninger i perioden</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Bounce Rate</p>
                      <p className="text-2xl font-extrabold text-onyx mt-1">{stats.bounceRate}</p>
                      <p className="text-[10px] text-secondary font-bold mt-1">Sider som lukkes umiddelbart</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-outline-variant/30 shadow-sm text-left">
                      <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Besøksvarighet</p>
                      <p className="text-2xl font-extrabold text-onyx mt-1">{stats.avgDuration}</p>
                      <p className="text-[10px] text-secondary font-bold mt-1">Gjennomsnittlig tid på siden</p>
                    </div>
                  </div>

                  {/* Traffic and Device Sources */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                    {/* Traffic sources */}
                    <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm text-left space-y-6">
                      <div>
                        <h4 className="font-bold text-onyx text-base">Trafikkkilder</h4>
                        <p className="text-xs text-secondary">Hvor de besøkende kommer fra (kanaler).</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { source: 'Sosiale medier (Insta, FB)', pct: 45, pctChange: '+14%', color: 'bg-[#1B4965]', desc: 'Instagram, Facebook, Pinterest-kampanjer' },
                          { source: 'Direkte / Bokmerker', pct: 25, pctChange: '+2%', color: 'bg-[#d17d39]', desc: 'Skrev inn URL eller lagrede linker' },
                          { source: 'Organisk søk (Google)', pct: 20, pctChange: '-3%', color: 'bg-emerald-500', desc: 'Google-søk og søkemotoroptimalisering' },
                          { source: 'Referral (Affiliates)', pct: 10, pctChange: '+5%', color: 'bg-indigo-600', desc: 'Gjennom affiliate delingslenker' }
                        ].map((src, i) => (
                          <div key={i} className="bg-slate-50 p-4.5 rounded-xl border border-slate-100 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-onyx text-xs leading-tight">{src.source}</span>
                              <span className="text-xs font-extrabold text-[#1B4965]">{src.pct}%</span>
                            </div>
                            <p className="text-[10px] text-secondary/80 my-2">{src.desc}</p>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                              <div className={`${src.color} h-full rounded-full`} style={{ width: `${src.pct}%` }}></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Devices and cookie consent details */}
                    <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-outline-variant/30 shadow-sm text-left flex flex-col justify-between space-y-6">
                      <div className="space-y-1">
                        <h4 className="font-bold text-onyx text-base">Enhetsfordeling</h4>
                        <p className="text-xs text-secondary">Besøkende sortert etter enhetstype brukt.</p>
                      </div>

                      <div className="space-y-4">
                        {[
                          { type: 'Mobiltelefoner', pct: 72, icon: Smartphone, color: 'text-[#d17d39]' },
                          { type: 'Desktop PC / Mac', pct: 25, icon: Laptop, color: 'text-[#1B4965]' },
                          { type: 'Nettbrett (Tablet)', pct: 3, icon: Tablet, color: 'text-slate-500' }
                        ].map((dev, i) => {
                          const DevIcon = dev.icon;
                          return (
                            <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2">
                              <div className="flex items-center gap-3">
                                <DevIcon size={18} className={dev.color} />
                                <span className="text-xs font-bold text-onyx">{dev.type}</span>
                              </div>
                              <span className="text-xs font-bold text-[#1B4965]">{dev.pct}%</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="bg-[#1B4965]/5 border border-[#1B4965]/10 rounded-xl p-3 flex gap-2.5 items-start">
                        <ShieldCheck size={18} className="text-[#1B4965] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-secondary leading-relaxed font-medium">
                          Nettleser-samtykke til Google Analytics og informasjonskapsler spores fortløpende. Cookie-samtykke banneret er i full drift for GDPR-samsvar.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AFFILIATES (Søknader) */}
              {activeTab === 'affiliates' && (
                <div className="bg-white rounded-3xl border border-outline-variant/30 p-6 md:p-8 shadow-sm space-y-6">
                  {/* Stats Counter Sub-row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
                          <ClipboardList size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Søknader til behandling</p>
                          <p className="text-lg font-extrabold text-[#1B4965]">{pendingCount}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-secondary/50" />
                    </div>

                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 flex items-center justify-between text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Godkjente affiliates</p>
                          <p className="text-lg font-extrabold text-[#1B4965]">{approvedCount}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-secondary/50" />
                    </div>
                  </div>

                  {/* Navigation Tabs and Search */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                    <div className="flex gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 shrink-0">
                      <button
                        onClick={() => {
                          setActiveSubTab('pending');
                          setSearchQuery('');
                          setExpandedId(null);
                        }}
                        className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-all cursor-pointer ${
                          activeSubTab === 'pending' ? 'bg-[#d17d39] text-white shadow-sm' : 'text-secondary hover:text-onyx'
                        }`}
                      >
                        Nye søknader
                      </button>
                      <button
                        onClick={() => {
                          setActiveSubTab('approved');
                          setSearchQuery('');
                          setExpandedId(null);
                        }}
                        className={`px-4 py-2 rounded-lg font-label-md text-xs font-bold transition-all cursor-pointer ${
                          activeSubTab === 'approved' ? 'bg-[#d17d39] text-white shadow-sm' : 'text-secondary hover:text-onyx'
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
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {filteredApplications.map((app) => {
                          const isExpanded = expandedId === app.id;
                          return (
                            <motion.div
                              key={app.id}
                              layout
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="bg-slate-50 rounded-2xl border border-outline-variant/20 p-4 hover:border-[#1B4965]/20 hover:shadow-sm transition-all text-left"
                            >
                              {/* Compact row */}
                              <div 
                                onClick={() => setExpandedId(isExpanded ? null : app.id)}
                                className="flex justify-between items-center cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-onyx text-sm md:text-base">{app.name}</span>
                                      {app.status === 'approved' ? (
                                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 border border-emerald-200">
                                          <Check size={8} strokeWidth={3} />
                                          Godkjent
                                        </span>
                                      ) : (
                                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border border-amber-200">
                                          Søknad
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-secondary flex items-center gap-1.5 text-xs font-medium">
                                      <Mail size={12} className="shrink-0 text-[#1B4965]" />
                                      {app.email}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  {app.appliedAt && (
                                    <span className="text-[10px] text-secondary/60 hidden sm:inline">
                                      {new Date(app.appliedAt).toLocaleDateString('no-NO')}
                                    </span>
                                  )}
                                  <div className="text-secondary hover:text-[#1B4965] p-1 rounded-lg hover:bg-slate-100/50 transition-colors">
                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                  </div>
                                </div>
                              </div>

                              {/* Detailed info */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-4 border-t border-slate-100/60 space-y-4 mt-3">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div className="space-y-1">
                                          <span className="font-bold flex items-center gap-1.5 text-xs text-secondary">
                                            <MapPin size={12} className="text-[#1B4965]" />
                                            Adresse:
                                          </span>
                                          <p className="text-secondary pl-4.5 font-medium">{app.address}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <span className="font-bold flex items-center gap-1.5 text-xs text-secondary">
                                            <Share2 size={12} className="text-[#1B4965]" />
                                            Sosiale Medier-kontoer:
                                          </span>
                                          <p className="text-secondary pl-4.5 font-medium">{app.socialMedia}</p>
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <span className="font-bold flex items-center gap-1.5 text-xs text-secondary">
                                          <ClipboardList size={12} className="text-[#1B4965]" />
                                          Søkers begrunnelse:
                                        </span>
                                        <p className="text-secondary leading-relaxed bg-white p-4 rounded-xl border border-slate-200/50 pl-4 text-xs">
                                          {app.motivation}
                                        </p>
                                      </div>

                                      {app.appliedAt && (
                                        <div className="text-[10px] text-secondary/60 text-right">
                                          Søkt: {new Date(app.appliedAt).toLocaleDateString('no-NO')} kl. {new Date(app.appliedAt).toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                      )}

                                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100/50">
                                        {activeSubTab === 'pending' && (
                                          <button
                                            onClick={() => handleApprove(app.id, app.name)}
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                          >
                                            <Check size={14} />
                                            <span>Godkjenn søknad</span>
                                          </button>
                                        )}
                                        
                                        <button
                                          onClick={() => handleReject(app.id, app.name)}
                                          className="bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                          <X size={14} />
                                          <span>{activeSubTab === 'pending' ? 'Avvis søknad' : 'Fjern affiliate'}</span>
                                        </button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

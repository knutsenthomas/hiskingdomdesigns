import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart, ChevronRight, ChevronLeft, Shirt, Palette, Coffee, Baby, Globe, ShoppingBag, Percent, ArrowRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOptimizedWixImageUrl } from '@/lib/media';
import { motion, AnimatePresence } from 'framer-motion';
import { wixClient } from '@/lib/wix';
import { media } from '@wix/sdk';
import CartDrawer from '@/components/CartDrawer';

// Helper to safely extract and build profile image URL from Wix member object

// Helper to safely extract and build profile image URL from Wix member object
const getProfileImageUrl = (member) => {
  const photo = member?.profile?.photo;
  if (!photo) return null;

  const url = photo.url || photo;
  if (!url || typeof url !== 'string') return null;

  if (url.startsWith('wix:image://')) {
    try {
      return media.getScaledToFillImageUrl(url, 60, 60) || media.getImageUrl(url).url;
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

export default function Header() {
  const { mobileMenuOpen, setMobileMenuOpen, searchOpen, setSearchOpen, searchQuery, setSearchQuery, wishlist, categoryTaxonomy, getSlugByCategoryName, products } = useApp();
  const { cartCount, setIsCartDrawerOpen, isCartDrawerOpen } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [megamenuOpen, setMegamenuOpen] = useState(false);
  const [showRecoveryToast, setShowRecoveryToast] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const query = searchQuery.toLowerCase().trim();
    return (products || []).filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.subcategories && p.subcategories.some(s => s.toLowerCase().includes(query))) ||
      (p.description && p.description.toLowerCase().includes(query))
    ).slice(0, 5);
  }, [searchQuery, products]);
  const [mobileActiveCategory, setMobileActiveCategory] = useState(null);
  const location = useLocation();

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileActiveCategory(null);
  };

  const getCategoryIcon = (group) => {
    switch (group) {
      case 'Klær & Bekledning':
        return <Shirt className="text-terracotta shrink-0" size={18} />;
      case 'Bilder & Kunst':
        return <Palette className="text-terracotta shrink-0" size={18} />;
      case 'Tilbehør & Hjem':
        return <Coffee className="text-terracotta shrink-0" size={18} />;
      case 'Barn & Familie':
        return <Baby className="text-terracotta shrink-0" size={18} />;
      case 'Temaer & Språk':
        return <Globe className="text-terracotta shrink-0" size={18} />;
      default:
        return <ShoppingBag className="text-terracotta shrink-0" size={18} />;
    }
  };

  const getGroupCategorySlug = (group) => {
    switch (group) {
      case 'Klær & Bekledning':
        return 'Klær';
      case 'Bilder & Kunst':
        return 'Bilder og plakater';
      case 'Tilbehør & Hjem':
        return 'Tilbehør';
      case 'Barn & Familie':
        return 'BARN & UNGDOM';
      default:
        return null;
    }
  };
  const [isLoggedIn, setIsLoggedIn] = useState(() => wixClient.auth.loggedIn());
  const [member, setMember] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const logged = wixClient.auth.loggedIn();
      setIsLoggedIn(logged);
      if (logged) {
        try {
          const res = await wixClient.members.getCurrentMember({ fieldsets: ['FULL'] });
          if (res?.member) {
            setMember(res.member);
          } else {
            setMember(null);
          }
        } catch (e) {
          console.warn('Failed to fetch member details in Header:', e);
          setMember(null);
        }
      } else {
        setMember(null);
      }
    };
    
    checkLoginStatus();
    
    window.addEventListener('wix-auth-change', checkLoginStatus);
    window.addEventListener('storage', checkLoginStatus);
    return () => {
      window.removeEventListener('wix-auth-change', checkLoginStatus);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawers/menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setMegamenuOpen(false);
    setMobileActiveCategory(null);
  }, [location.pathname, setMobileMenuOpen, setSearchOpen]);

  // Handle abandoned cart recovery toast
  useEffect(() => {
    const hasShown = sessionStorage.getItem('hkd-recovery-toast-shown');
    if (!hasShown && cartCount > 0) {
      if (location.pathname !== '/cart') {
        const timer = setTimeout(() => {
          setShowRecoveryToast(true);
          sessionStorage.setItem('hkd-recovery-toast-shown', 'true');
        }, 3000); // Elegant 3-second delay on entry
        return () => clearTimeout(timer);
      } else {
        // User is already on the cart page, so don't show it now or later in this session
        sessionStorage.setItem('hkd-recovery-toast-shown', 'true');
      }
    }
  }, [cartCount, location.pathname]);

  const toggleMobileGroup = (group) => {
    setMobileExpandedGroup(prev => prev === group ? null : group);
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 backdrop-blur-lg ${
          isScrolled 
            ? 'h-16 bg-parchment/90 border-b border-onyx/5 shadow-[0_2px_20px_-10px_rgba(0,0,0,0.08)]' 
            : 'h-20 bg-parchment/95 border-b border-outline-variant/10'
        }`}
      >
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto h-full">
          {/* Venstre side: Logo */}
          <div className="flex items-center shrink-0">
            <Link 
              to="/" 
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="flex items-center gap-1.5 sm:gap-2 font-bold text-onyx hover:text-terracotta transition-all duration-300 logo group"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                <img src="/logo-hkm.png" alt="His Kingdom Designs Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-[12px] min-[360px]:text-[13px] min-[400px]:text-[14px] sm:text-[15px] md:text-base xl:text-lg 2xl:text-xl font-bold tracking-tight whitespace-nowrap">
                His Kingdom Designs
              </span>
            </Link>
          </div>
          
          {/* Senter: Sentrert navigasjon med widescreen-skalering */}
          <nav className="hidden lg:flex items-center justify-center gap-8 xl:gap-10 2xl:gap-12 h-full mx-auto">
            {/* Alle produkter Link */}
            <Link
              to="/products"
              className={`font-label-md text-label-md xl:text-[15px] 2xl:text-base py-6 transition-all relative group flex items-center ${
                location.pathname === '/products' ? 'text-terracotta font-bold' : 'text-onyx/80 hover:text-terracotta'
              }`}
            >
              <span className="relative py-1">
                {t('nav.products')}
                <span className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-terracotta transition-transform duration-300 origin-left ${
                  location.pathname === '/products' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </span>
            </Link>

            {/* Collapsible Megamenu Link */}
            <div 
              className="h-full flex items-center"
              onMouseEnter={() => setMegamenuOpen(true)}
              onMouseLeave={() => setMegamenuOpen(false)}
            >
              <button
                className={`font-label-md text-label-md xl:text-[15px] 2xl:text-base py-6 transition-all flex items-center gap-1 cursor-pointer focus:outline-none relative group ${
                  megamenuOpen || location.pathname.startsWith('/category/') ? 'text-terracotta font-bold' : 'text-onyx/80 hover:text-terracotta'
                }`}
              >
                <span className="relative py-1">
                  {t('nav.categories')}
                  <span className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-terracotta transition-transform duration-300 origin-left ${
                    megamenuOpen || location.pathname.startsWith('/category/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${megamenuOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Salg Link */}
            <Link
              to="/category/Salg"
              className={`font-label-md text-label-md xl:text-[15px] 2xl:text-base py-6 transition-all relative group flex items-center ${
                location.pathname === '/category/Salg' 
                  ? 'text-terracotta font-bold' 
                  : 'text-terracotta/90 hover:text-terracotta font-semibold'
              }`}
            >
              <span className="relative py-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-terracotta rounded-full animate-pulse" />
                {t('nav.sale')}
                <span className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-terracotta transition-transform duration-300 origin-left ${
                  location.pathname === '/category/Salg' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </span>
            </Link>
          </nav>

          {/* Høyre side: Ikoner med luftigere avstand */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 2xl:gap-4 shrink-0">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2.5 text-onyx/75 hover:text-terracotta hover:bg-terracotta/5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-1 cursor-pointer text-xs font-bold uppercase tracking-wider select-none"
                title="Endre språk / Change language"
              >
                <Globe size={18} />
                <span className="hidden min-[450px]:inline text-[10px]">{language}</span>
              </button>
              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-45" onClick={() => setLangDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-outline-variant/40 rounded-xl shadow-lg z-50 py-1.5 overflow-hidden animate-fade-in">
                    <button
                      onClick={() => {
                        setLanguage('no');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer ${
                        language === 'no' ? 'text-terracotta bg-slate-50' : 'text-onyx/70'
                      }`}
                    >
                      <span>🇳🇴</span> Norsk
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('en');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer ${
                        language === 'en' ? 'text-terracotta bg-slate-50' : 'text-onyx/70'
                      }`}
                    >
                      <span>🇬🇧</span> English
                    </button>
                    <button
                      onClick={() => {
                        setLanguage('es');
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer ${
                        language === 'es' ? 'text-terracotta bg-slate-50' : 'text-onyx/70'
                      }`}
                    >
                      <span>🇪🇸</span> Español
                    </button>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2.5 text-onyx/75 hover:text-terracotta hover:bg-terracotta/5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label="Søk"
            >
              <Search size={20} />
            </button>
            
            <Link 
              to="/profile"
              className="hidden sm:inline-flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 relative p-2.5 hover:bg-terracotta/5 rounded-full"
              aria-label="Profil"
            >
              {isLoggedIn ? (
                getProfileImageUrl(member) ? (
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-terracotta/40 shadow-sm flex-shrink-0">
                    <img 
                      src={getProfileImageUrl(member)} 
                      alt="Profil" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center text-[10px] font-bold border border-terracotta/30 flex-shrink-0">
                    {member?.contactDetails?.firstName ? member.contactDetails.firstName[0].toUpperCase() : 'U'}
                  </div>
                )
              ) : (
                <div className="text-onyx/75 hover:text-terracotta flex items-center justify-center">
                  <User size={20} />
                </div>
              )}
              {isLoggedIn && (
                <span className="absolute bottom-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white ring-1 ring-emerald-500/20" />
              )}
            </Link>

            <Link 
              to="/profile?tab=wishlist"
              className="hidden sm:inline-flex p-2.5 text-onyx/75 hover:text-terracotta hover:bg-terracotta/5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 relative flex items-center justify-center"
              aria-label="Ønskeliste"
            >
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-terracotta text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold border border-parchment">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button 
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-2.5 text-onyx/75 hover:text-terracotta hover:bg-terracotta/5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 relative flex items-center justify-center cursor-pointer"
              aria-label="Handlekurv"
            >
              <ShoppingCart size={20} />
              <AnimatePresence mode="popLayout">
                {cartCount > 0 && !isCartDrawerOpen && location.pathname !== '/cart' && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="absolute top-1 right-1 bg-terracotta text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold border border-parchment"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-onyx hover:text-terracotta hover:scale-105 active:scale-95 transition-all lg:hidden"
              aria-label="Meny"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Megamenu Panel */}
        <AnimatePresence>
          {megamenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="absolute left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-onyx/5 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.06)] z-40 py-8 px-6 xl:px-margin-desktop"
              style={{ top: isScrolled ? '64px' : '80px' }}
              onMouseEnter={() => setMegamenuOpen(true)}
              onMouseLeave={() => setMegamenuOpen(false)}
            >
              <div className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto grid grid-cols-4 xl:grid-cols-7 gap-y-10 gap-x-6 xl:gap-8 2xl:gap-10">
                {/* Column 1: Klær & Bekledning */}
                <div>
                  <h4 className="font-label-md text-label-md text-terracotta mb-4 uppercase tracking-wider font-bold">Klær & Bekledning</h4>
                  <ul className="space-y-2 2xl:space-y-3">
                    {categoryTaxonomy['Klær & Bekledning']?.map(sub => (
                      <li key={sub}>
                        <Link 
                          to={`/category/${getSlugByCategoryName(sub)}`} 
                          className="text-sm text-onyx/70 hover:text-terracotta hover:translate-x-1 transition-all duration-300 inline-block"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
 
                {/* Column 2: Bilder & Kunst */}
                <div>
                  <h4 className="font-label-md text-label-md text-terracotta mb-4 uppercase tracking-wider font-bold">Bilder & Kunst</h4>
                  <ul className="space-y-2 2xl:space-y-3">
                    {categoryTaxonomy['Bilder & Kunst']?.map(sub => (
                      <li key={sub}>
                        <Link 
                          to={`/category/${getSlugByCategoryName(sub)}`} 
                          className="text-sm text-onyx/70 hover:text-terracotta hover:translate-x-1 transition-all duration-300 inline-block"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
 
                {/* Column 3: Tilbehør & Hjem */}
                <div>
                  <h4 className="font-label-md text-label-md text-terracotta mb-4 uppercase tracking-wider font-bold">Tilbehør & Hjem</h4>
                  <ul className="space-y-2 2xl:space-y-3">
                    {categoryTaxonomy['Tilbehør & Hjem']?.map(sub => (
                      <li key={sub}>
                        <Link 
                          to={`/category/${getSlugByCategoryName(sub)}`} 
                          className="text-sm text-onyx/70 hover:text-terracotta hover:translate-x-1 transition-all duration-300 inline-block"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
 
                {/* Column 4: Barn & Familie */}
                <div>
                  <h4 className="font-label-md text-label-md text-terracotta mb-4 uppercase tracking-wider font-bold">Barn & Familie</h4>
                  <ul className="space-y-2 2xl:space-y-3">
                    {categoryTaxonomy['Barn & Familie']?.map(sub => (
                      <li key={sub}>
                        <Link 
                          to={`/category/${getSlugByCategoryName(sub)}`} 
                          className="text-sm text-onyx/70 hover:text-terracotta hover:translate-x-1 transition-all duration-300 inline-block"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
 
                {/* Column 5 & 6: Temaer & Språk */}
                <div className="col-span-4 lg:col-span-3 xl:col-span-2">
                  <h4 className="font-label-md text-label-md text-terracotta mb-4 uppercase tracking-wider font-bold">Temaer & Språk</h4>
                  <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-x-6 gap-y-2 2xl:gap-y-3 w-full">
                    {categoryTaxonomy['Temaer & Språk']?.map(sub => {
                      const lower = sub.toLowerCase();
                      const isVarna = (lower.includes('varna') || lower.includes('varne')) && 
                                      (lower.includes('bibelskole') || lower.includes('bible school') || lower.includes('evangeliesenter') || lower.includes('evangliesenter'));
                      if (isVarna) {
                        return (
                          <li key={sub} className="flex flex-col gap-0.5 mt-0.5">
                            <span className="text-[10px] font-bold text-onyx/45 uppercase tracking-wider">
                              Varna - Evangeliesenteret
                            </span>
                            <Link 
                              to={`/category/${getSlugByCategoryName(sub)}`} 
                              className="text-sm text-onyx/75 hover:text-terracotta hover:translate-x-1 transition-all duration-300 inline-block pl-2 border-l border-terracotta/25"
                            >
                              Bible School
                            </Link>
                          </li>
                        );
                      }
                      return (
                        <li key={sub}>
                          <Link 
                            to={`/category/${getSlugByCategoryName(sub)}`} 
                            className="text-sm text-onyx/70 hover:text-terracotta hover:translate-x-1 transition-all duration-300 inline-block whitespace-nowrap"
                          >
                            {sub}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
 
                {/* Column 7: Featured Promo Box */}
                <div className="col-span-1 bg-gradient-to-br from-terracotta/5 to-parchment/30 border border-outline-variant/50 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div>
                    <span className="bg-terracotta text-white font-label-sm text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full inline-block mb-3">
                      Fremhevet
                    </span>
                    <h5 className="text-body-lg font-bold text-onyx mb-1.5 font-headline-md">Velsignelse Gavepakke</h5>
                    <p className="text-[11px] text-secondary leading-relaxed mb-3">
                      Få våre bestselgende klistermerker og en t-skjorte i en vakker gaveeske.
                    </p>
                    
                    {/* Visual Product Image Placeholder */}
                    <div className="my-3 h-28 rounded-xl overflow-hidden relative group/promo">
                      <img 
                        src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop" 
                        alt="Gavepakke" 
                        className="w-full h-full object-cover group-hover/promo:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-onyx/20 to-transparent" />
                    </div>
                  </div>
                  
                  <Link 
                    to="/products"
                    onClick={() => setMegamenuOpen(false)}
                    className="bg-gradient-to-r from-terracotta to-terracotta/90 text-white font-label-md text-label-md py-2.5 rounded-lg text-center font-semibold hover:brightness-105 active:scale-[0.98] transition-all block shadow-sm shadow-terracotta/20"
                  >
                    Utforsk Butikken
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-onyx/50 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant p-6 relative animate-fade-in">
            <button 
              onClick={() => setSearchOpen(false)}
              className="absolute top-4 right-4 text-onyx/60 hover:text-onyx"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-md text-headline-md text-onyx mb-4">Søk i butikken</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Hva leter du etter? (f.eks. T-skjorte, plakat...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-outline-variant rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta transition-all text-onyx"
                autoFocus
              />
              <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-onyx/40" />
            </div>
            {searchQuery && searchQuery.trim().length >= 2 && (
              <div className="mt-4 border-t border-outline-variant/40 pt-4 max-h-[360px] overflow-y-auto custom-scrollbar space-y-3">
                {searchResults.length > 0 ? (
                  <>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-wider mb-2">Produkter</p>
                    <div className="space-y-2">
                      {searchResults.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 active:scale-[0.99] transition-all group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-parchment flex-shrink-0 border border-outline-variant/30">
                            <img
                              src={getOptimizedWixImageUrl(product.image, 60, 60)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-onyx group-hover:text-terracotta transition-colors truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-secondary truncate">
                              {product.category} {product.gender && `• ${product.gender}`}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="font-bold text-sm text-terracotta">
                              {product.price} kr
                            </span>
                            {product.originalPrice && (
                              <p className="text-[10px] text-onyx/40 line-through">
                                {product.originalPrice} kr
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-center text-secondary font-medium text-sm">
                    Ingen produkter funnet for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
            {searchQuery && (
              <div className="mt-4 border-t border-outline-variant/40 pt-4 flex justify-end">
                <Link 
                  to={`/products?search=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setSearchOpen(false)}
                  className="inline-flex items-center gap-2 text-terracotta font-semibold hover:underline text-sm"
                >
                  Vis alle resultater for "{searchQuery}" &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-onyx/45 backdrop-blur-md" 
              onClick={closeMobileMenu}
            />
            
            {/* Menu Drawer */}
            <motion.nav 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
              className="fixed top-0 right-0 bottom-0 w-full bg-parchment shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-5 border-b border-outline-variant/30 bg-white">
                {mobileActiveCategory ? (
                  <button 
                    onClick={() => setMobileActiveCategory(null)}
                    className="flex items-center gap-2 text-onyx/80 hover:text-terracotta font-semibold text-sm cursor-pointer select-none"
                  >
                    <ChevronLeft size={16} />
                    <span>{t('nav.back')}</span>
                  </button>
                ) : (
                  <span className="font-headline-md text-[#1B4965] font-extrabold text-base">{t('nav.menu')}</span>
                )}
                <button 
                  onClick={closeMobileMenu}
                  className="text-onyx/70 hover:text-terracotta p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  aria-label="Lukk meny"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sliding Content Container */}
              <div className="flex-grow overflow-y-auto px-6 py-5 no-scrollbar">
                <AnimatePresence mode="wait">
                  {mobileActiveCategory === null ? (
                    <motion.div
                      key="main-pane"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Search Input inside Menu */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={t('nav.search_placeholder')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              closeMobileMenu();
                              navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
                            }
                          }}
                          className="w-full bg-white border border-outline-variant/60 rounded-xl pl-4 pr-10 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-terracotta text-onyx"
                        />
                        <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-onyx/40" />
                      </div>

                      {/* Menu List */}
                      <div className="flex flex-col gap-2">
                        {/* Alle Produkter */}
                        <Link 
                          to="/products"
                          onClick={closeMobileMenu}
                          className="flex items-center justify-between p-3.5 bg-white border border-outline-variant/40 hover:border-terracotta/20 rounded-xl transition-all shadow-xs group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#1B4965]/10 flex items-center justify-center text-[#1B4965]">
                              <ShoppingBag size={16} />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-extrabold text-onyx group-hover:text-terracotta transition-colors">{t('nav.products')}</p>
                              <p className="text-[10px] text-secondary font-medium">{t('nav.collection_desc')}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-onyx/40 group-hover:translate-x-0.5 transition-transform" />
                        </Link>

                        {/* Categories List */}
                        {Object.entries(categoryTaxonomy).map(([group, cats]) => (
                          <button
                            key={group}
                            onClick={() => setMobileActiveCategory(group)}
                            className="flex items-center justify-between p-3.5 bg-white border border-outline-variant/40 hover:border-terracotta/20 rounded-xl transition-all shadow-xs group cursor-pointer text-left w-full"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-terracotta/10 flex items-center justify-center">
                                {getCategoryIcon(group)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-onyx group-hover:text-terracotta transition-colors">{group}</p>
                                <p className="text-[10px] text-secondary font-medium">{cats?.length || 0} {t('nav.subcategories')}</p>
                              </div>
                            </div>
                            <ChevronRight size={16} className="text-onyx/40 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}

                        {/* Salgskampanje */}
                        <Link 
                          to="/category/Salg"
                          onClick={closeMobileMenu}
                          className="flex items-center justify-between p-3.5 bg-rose-50/50 border border-rose-100 hover:border-rose-200 rounded-xl transition-all shadow-xs group cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                              <Percent size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-extrabold text-rose-800">{t('nav.sale')}</p>
                              <p className="text-[10px] text-rose-600/70 font-semibold uppercase tracking-wider">{t('nav.sale_desc')}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-rose-500/50 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>

                      {/* Promo Box */}
                      <div className="bg-gradient-to-br from-terracotta/10 to-[#1B4965]/5 border border-outline-variant/30 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                        <div className="mb-3">
                          <span className="bg-terracotta text-white font-label-sm text-[8px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block mb-2">
                            {t('profile.loyalty')}
                          </span>
                          <h5 className="text-xs font-extrabold text-onyx mb-1 leading-normal">{t('nav.promo_title')}</h5>
                          <p className="text-[10px] text-secondary leading-normal">
                            {t('nav.promo_desc')}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            closeMobileMenu();
                            navigate('/#manedspakker');
                          }}
                          className="bg-terracotta hover:bg-[#bd4f2a] text-white font-label-md text-[10px] font-bold py-2 rounded-lg text-center active:scale-[0.98] transition-all cursor-pointer"
                        >
                          {t('nav.promo_btn')}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sub-pane"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-terracotta uppercase tracking-wider">{t('nav.categories')}</span>
                        <h4 className="font-headline-md text-onyx font-extrabold text-base leading-tight mt-0.5">{mobileActiveCategory}</h4>
                      </div>

                      <div className="flex flex-col gap-2">
                        {/* Se alle link */}
                        {getGroupCategorySlug(mobileActiveCategory) && (
                          <Link
                            to={`/category/${getSlugByCategoryName(getGroupCategorySlug(mobileActiveCategory)) || getGroupCategorySlug(mobileActiveCategory)}`}
                            onClick={closeMobileMenu}
                            className="flex items-center justify-between p-3.5 bg-slate-50 border border-outline-variant/40 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer font-semibold text-xs text-onyx"
                          >
                            <span>{t('nav.view_all_cat')}</span>
                            <ArrowRight size={14} className="text-onyx/50" />
                          </Link>
                        )}

                        {/* List of subcategories */}
                        {categoryTaxonomy[mobileActiveCategory]?.map(sub => {
                          const lower = sub.toLowerCase();
                          const isVarna = (lower.includes('varna') || lower.includes('varne')) && 
                                          (lower.includes('bibelskole') || lower.includes('bible school') || lower.includes('evangeliesenter') || lower.includes('evangliesenter'));
                          
                          if (isVarna) {
                            return (
                              <div key={sub} className="flex flex-col gap-1 p-3.5 bg-white border border-outline-variant/40 rounded-xl">
                                <span className="text-[8px] font-bold text-onyx/45 uppercase tracking-widest leading-none">
                                  Varna - Evangeliesenteret
                                </span>
                                <Link
                                  to={`/category/${getSlugByCategoryName(sub)}`}
                                  onClick={closeMobileMenu}
                                  className="text-xs font-bold text-onyx hover:text-terracotta transition-colors flex items-center justify-between"
                                >
                                  <span>Bible School</span>
                                  <ChevronRight size={14} className="text-onyx/30" />
                                </Link>
                              </div>
                            );
                          }

                          return (
                            <Link
                              key={sub}
                              to={`/category/${getSlugByCategoryName(sub)}`}
                              onClick={closeMobileMenu}
                              className="flex items-center justify-between p-3.5 bg-white hover:bg-slate-50/50 border border-outline-variant/40 rounded-xl transition-all cursor-pointer group"
                            >
                              <span className="text-xs font-bold text-onyx/80 group-hover:text-terracotta transition-colors">{sub}</span>
                              <ChevronRight size={14} className="text-onyx/30 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer (Profile, Wishlist & Language) */}
              <div className="mt-auto border-t border-outline-variant/30 bg-white p-5 space-y-4">
                <Link 
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                      getProfileImageUrl(member) ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-terracotta/40 shadow-xs">
                          <img 
                            src={getProfileImageUrl(member)} 
                            alt="Profil" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center text-xs font-extrabold border border-terracotta/30 shadow-xs">
                          {member?.contactDetails?.firstName ? member.contactDetails.firstName[0].toUpperCase() : 'U'}
                        </div>
                      )
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-secondary">
                        <User size={18} />
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-xs font-extrabold text-onyx group-hover:text-terracotta transition-colors leading-tight">
                        {isLoggedIn ? (member?.contactDetails?.firstName || t('nav.profile')) : t('nav.profile')}
                      </p>
                      <p className="text-[10px] text-secondary font-medium mt-0.5">
                        {isLoggedIn ? 'Innlogget medlem' : t('nav.login_register')}
                      </p>
                    </div>
                  </div>
                  
                  {isLoggedIn ? (
                    <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                      Aktiv
                    </span>
                  ) : (
                    <ChevronRight size={16} className="text-onyx/40" />
                  )}
                </Link>

                <Link 
                  to="/profile?tab=wishlist"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between p-3.5 bg-slate-50 border border-outline-variant/40 hover:border-terracotta/20 rounded-xl transition-all shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart size={16} className="text-terracotta shrink-0" />
                    <span className="text-xs font-bold text-onyx/80">{t('profile.wishlist')}</span>
                  </div>
                  <span className="bg-terracotta text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {wishlist.length}
                  </span>
                </Link>

                {/* Mobile Language Selector */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Språk / Language</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLanguage('no')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border select-none cursor-pointer ${
                        language === 'no'
                          ? 'border-terracotta bg-terracotta/5 text-terracotta font-bold'
                          : 'border-outline-variant/60 bg-white text-onyx/70 hover:bg-slate-50'
                      }`}
                    >
                      <span>🇳🇴</span> NO
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border select-none cursor-pointer ${
                        language === 'en'
                          ? 'border-terracotta bg-terracotta/5 text-terracotta font-bold'
                          : 'border-outline-variant/60 bg-white text-onyx/70 hover:bg-slate-50'
                      }`}
                    >
                      <span>🇬🇧</span> EN
                    </button>
                    <button
                      onClick={() => setLanguage('es')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border select-none cursor-pointer ${
                        language === 'es'
                          ? 'border-terracotta bg-terracotta/5 text-terracotta font-bold'
                          : 'border-outline-variant/60 bg-white text-onyx/70 hover:bg-slate-50'
                      }`}
                    >
                      <span>🇪🇸</span> ES
                    </button>
                  </div>
                </div>
              </div>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>
      <CartDrawer />

      {/* Abandoned Cart Recovery Toast */}
      <AnimatePresence>
        {showRecoveryToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-6 md:right-auto md:w-96 bg-white/95 backdrop-blur-md border border-outline-variant/40 shadow-2xl rounded-2xl p-4 z-[98] flex flex-col gap-3 pointer-events-auto"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center text-terracotta shrink-0">
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <h4 className="font-headline-md text-sm font-bold text-[#1B4965]">Gjenværende varer</h4>
                  <p className="text-[10px] text-secondary font-semibold uppercase tracking-widest">Handlekurv</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRecoveryToast(false)}
                className="text-secondary hover:text-onyx p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                aria-label="Lukk"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              Du har varer liggende igjen i handlekurven din fra forrige besøk. Ønsker du å fullføre kjøpet?
            </p>

            <div className="flex gap-2.5 mt-1">
              <button
                onClick={() => setShowRecoveryToast(false)}
                className="flex-1 bg-slate-50 border border-outline-variant/60 hover:bg-slate-100 text-onyx py-2 rounded-xl font-label-md text-xs font-semibold active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                Fortsett å handle
              </button>
              <button
                onClick={() => {
                  setShowRecoveryToast(false);
                  setIsCartDrawerOpen(true);
                }}
                className="flex-1 bg-terracotta hover:bg-terracotta/90 text-white py-2 rounded-xl font-label-md text-xs font-bold shadow-md shadow-terracotta/20 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer text-center"
              >
                Fullfør kjøpet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

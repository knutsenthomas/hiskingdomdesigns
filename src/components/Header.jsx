import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Heart } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
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
  const { cartCount, setIsCartDrawerOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [megamenuOpen, setMegamenuOpen] = useState(false);

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
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState(null);
  const location = useLocation();
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
  }, [location.pathname, setMobileMenuOpen, setSearchOpen]);

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
                Alle Produkter
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
                  Kategorier
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
                Salg
                <span className={`absolute -bottom-1 left-0 right-0 h-[2px] bg-terracotta transition-transform duration-300 origin-left ${
                  location.pathname === '/category/Salg' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </span>
            </Link>
          </nav>

          {/* Høyre side: Ikoner med luftigere avstand */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 2xl:gap-4 shrink-0">
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
              className="p-2.5 text-onyx/75 hover:text-terracotta hover:bg-terracotta/5 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 relative flex items-center justify-center"
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
                {cartCount > 0 && (
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
              className="absolute left-0 right-0 w-full bg-white/95 backdrop-blur-md border-b border-onyx/5 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.06)] z-40 py-8 px-margin-mobile md:px-margin-desktop"
              style={{ top: isScrolled ? '64px' : '80px' }}
              onMouseEnter={() => setMegamenuOpen(true)}
              onMouseLeave={() => setMegamenuOpen(false)}
            >
              <div className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto grid grid-cols-7 gap-6 xl:gap-8 2xl:gap-10">
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
                <div className="col-span-2">
                  <h4 className="font-label-md text-label-md text-terracotta mb-4 uppercase tracking-wider font-bold">Temaer & Språk</h4>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2 2xl:gap-y-3 w-full">
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
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-onyx/40 backdrop-blur-xs" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Drawer */}
          <nav className="fixed top-0 right-0 bottom-0 w-64 max-w-[80vw] bg-parchment shadow-2xl p-6 flex flex-col z-10 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-onyx">Meny</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-onyx hover:text-terracotta"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Link 
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="text-body-lg font-bold py-2 border-b border-outline-variant/30 text-onyx"
              >
                Alle Produkter
              </Link>
              
              {Object.entries(categoryTaxonomy).map(([group, cats]) => {
                const isExpanded = mobileExpandedGroup === group;
                return (
                  <div key={group} className="border-b border-outline-variant/30 py-2">
                    <button
                      onClick={() => toggleMobileGroup(group)}
                      className="w-full flex items-center justify-between font-body-lg font-semibold text-onyx text-left py-1"
                    >
                      <span>{group}</span>
                      <ChevronDown 
                        size={18} 
                        className={`text-onyx/50 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {isExpanded && (
                      <ul className="mt-2 pl-4 space-y-2.5">
                        {cats?.map(sub => {
                          const lower = sub.toLowerCase();
                          const isVarna = (lower.includes('varna') || lower.includes('varne')) && 
                                          (lower.includes('bibelskole') || lower.includes('bible school') || lower.includes('evangeliesenter') || lower.includes('evangliesenter'));
                          if (isVarna) {
                            return (
                              <li key={sub} className="flex flex-col gap-0.5 pl-2 py-0.5">
                                <span className="text-[10px] font-bold text-onyx/45 uppercase tracking-wider">
                                  Varna - Evangeliesenteret
                                </span>
                                <Link
                                  to={`/category/${getSlugByCategoryName(sub)}`}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="text-body-md text-secondary hover:text-terracotta transition-colors block pl-2 border-l border-terracotta/25 py-0.5"
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
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="text-body-md text-secondary hover:text-terracotta transition-colors block py-0.5"
                              >
                                {sub}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}

              <Link 
                to="/category/Salg"
                onClick={() => setMobileMenuOpen(false)}
                className="text-body-lg font-bold py-2 text-sale-red"
              >
                Salgskampanje
              </Link>

              <Link 
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-body-lg font-bold py-2 border-t border-outline-variant/30 text-onyx flex items-center justify-between mt-4 pt-4"
              >
                <div className="flex items-center gap-2">
                  {isLoggedIn ? (
                    getProfileImageUrl(member) ? (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-terracotta/40">
                        <img 
                          src={getProfileImageUrl(member)} 
                          alt="Profil" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center text-[10px] font-bold border border-terracotta/30">
                        {member?.contactDetails?.firstName ? member.contactDetails.firstName[0].toUpperCase() : 'U'}
                      </div>
                    )
                  ) : (
                    <User size={20} className="text-terracotta" />
                  )}
                  <span>Min Profil</span>
                </div>
                {isLoggedIn && (
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Innlogget
                  </span>
                )}
              </Link>

              <Link 
                to="/profile?tab=wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="text-body-lg font-bold py-2 border-b border-outline-variant/30 text-onyx flex items-center gap-2"
              >
                <Heart size={20} className="text-terracotta" />
                <span>Min Ønskeliste ({wishlist.length})</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
      <CartDrawer />
    </>
  );
}

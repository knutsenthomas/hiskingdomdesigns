import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

// natural category groupings
const CATEGORY_TAXONOMY = {
  'Klær & Bekledning': ['Klær', 'Dameklær', 'Genser', 'Joggebukser', 'T-shirts', 'Hatter /caps', 'Sport / Performance /Outdoor', 'RUSS'],
  'Bilder & Kunst': ['Bilder og plakater', 'Maleri', 'Fotografi', 'Typografi', 'Abstrakt', 'Minimalistisk', 'Fargerik', 'Svart-hvit', 'Retro', 'Romantisk', 'Whimsical'],
  'Tilbehør & Hjem': ['Tilbehør', 'armbånd og smykker', 'Handlenett / Totebag', 'Kopper og flasker', 'Mobildeksel', 'Klistermerker', 'Barnerom'],
  'Barn & Familie': ['BABY', 'BARN & UNGDOM', 'Mirakel familie'],
  'Temaer, Kampanjer & Språk': ['Jesus', 'Israel', 'Spiritual Battle', 'Humor', 'Undervisning', 'Varna - Evangeliesenteret Bibelskole', 'Høytider', 'CHRISTMAS', 'PÅSKE', 'Abonnement', 'Digitale filer', 'Kreative bøker', 'NORSKE produkter', 'ENGLISH products', 'ESPAÑOL']
};

export default function Header() {
  const { mobileMenuOpen, setMobileMenuOpen, searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useApp();
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [megamenuOpen, setMegamenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState(null);
  const location = useLocation();

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
        className={`fixed top-0 left-0 right-0 z-50 bg-parchment border-b border-outline-variant transition-all duration-300 ${
          isScrolled ? 'h-16 shadow-md' : 'h-20'
        }`}
      >
        <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto h-full">
          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className="flex items-center gap-3 font-bold text-onyx hover:text-terracotta transition-all duration-300 logo group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden shrink-0 bg-white shadow-sm border border-outline-variant/30 group-hover:scale-105 transition-transform duration-300">
                <img src="/logo-hkm.png" alt="His Kingdom Designs Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-headline-md font-headline-md font-extrabold tracking-tight">
                His Kingdom Designs
              </span>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-6 h-full">
              {/* Alle produkter Link */}
              <Link
                to="/products"
                className={`font-label-md text-label-md py-2 transition-colors relative ${
                  location.pathname === '/products' ? 'text-terracotta font-bold' : 'text-onyx hover:text-terracotta'
                }`}
              >
                Alle Produkter
                {location.pathname === '/products' && (
                  <span className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-terracotta rounded" />
                )}
              </Link>

              {/* Collapsible Megamenu Link */}
              <div 
                className="h-full flex items-center"
                onMouseEnter={() => setMegamenuOpen(true)}
                onMouseLeave={() => setMegamenuOpen(false)}
              >
                <button
                  className={`font-label-md text-label-md py-6 transition-colors flex items-center gap-1 cursor-pointer focus:outline-none relative ${
                    megamenuOpen || location.pathname.startsWith('/category/') ? 'text-terracotta font-bold' : 'text-onyx hover:text-terracotta'
                  }`}
                >
                  Kategorier <ChevronDown size={14} className={`transition-transform duration-200 ${megamenuOpen ? 'rotate-180' : ''}`} />
                  {location.pathname.startsWith('/category/') && (
                    <span className="absolute bottom-[10px] left-0 right-0 h-0.5 bg-terracotta rounded" />
                  )}
                </button>
              </div>

              {/* Salg Link */}
              <Link
                to="/category/Salg"
                className={`font-label-md text-label-md py-2 transition-colors relative ${
                  location.pathname === '/category/Salg' ? 'text-sale-red font-bold animate-pulse' : 'text-sale-red/90 hover:text-sale-red font-semibold'
                }`}
              >
                Salg
                {location.pathname === '/category/Salg' && (
                  <span className="absolute bottom-[-4px] left-0 right-0 h-0.5 bg-sale-red rounded" />
                )}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setSearchOpen(true)}
              className="p-2 text-onyx hover:text-terracotta hover:scale-105 active:scale-95 transition-all"
              aria-label="Søk"
            >
              <Search size={20} />
            </button>
            
            <button 
              className="p-2 text-onyx hover:text-terracotta hover:scale-105 active:scale-95 transition-all"
              aria-label="Profil"
            >
              <User size={20} />
            </button>

            <Link 
              to="/cart"
              className="p-2 text-onyx hover:text-terracotta hover:scale-105 active:scale-95 transition-all relative"
              aria-label="Handlekurv"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-terracotta text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

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
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute left-0 right-0 w-full bg-white border-b border-outline-variant shadow-2xl z-40 py-8 px-margin-mobile md:px-margin-desktop"
              style={{ top: isScrolled ? '64px' : '80px' }}
              onMouseEnter={() => setMegamenuOpen(true)}
              onMouseLeave={() => setMegamenuOpen(false)}
            >
              <div className="max-w-max-width mx-auto grid grid-cols-5 gap-8">
                {/* Column 1: Klær & Bekledning */}
                <div>
                  <h4 className="font-label-md text-label-md text-terracotta mb-4 uppercase tracking-wider font-bold">Klær & Bekledning</h4>
                  <ul className="space-y-2.5">
                    {CATEGORY_TAXONOMY['Klær & Bekledning'].map(sub => (
                      <li key={sub}>
                        <Link 
                          to={`/category/${sub}`} 
                          className="text-body-md font-body-md text-onyx/80 hover:text-terracotta hover:translate-x-1 transition-all inline-block"
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
                  <ul className="space-y-2.5">
                    {CATEGORY_TAXONOMY['Bilder & Kunst'].map(sub => (
                      <li key={sub}>
                        <Link 
                          to={`/category/${sub}`} 
                          className="text-body-md font-body-md text-onyx/80 hover:text-terracotta hover:translate-x-1 transition-all inline-block"
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
                  <ul className="space-y-2.5">
                    {CATEGORY_TAXONOMY['Tilbehør & Hjem'].map(sub => (
                      <li key={sub}>
                        <Link 
                          to={`/category/${sub}`} 
                          className="text-body-md font-body-md text-onyx/80 hover:text-terracotta hover:translate-x-1 transition-all inline-block"
                        >
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 4: Temaer, Kampanjer & Språk */}
                <div>
                  <h4 className="font-label-md text-label-md text-terracotta mb-4 uppercase tracking-wider font-bold">Temaer & Språk</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-bold text-xs text-onyx mb-2">Barn & Familie</h5>
                      <ul className="space-y-2">
                        {CATEGORY_TAXONOMY['Barn & Familie'].map(sub => (
                          <li key={sub}>
                            <Link 
                              to={`/category/${sub}`} 
                              className="text-body-md font-body-md text-onyx/80 hover:text-terracotta hover:translate-x-1 transition-all inline-block text-xs"
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-onyx mb-2">Trosbudskap & Info</h5>
                      <ul className="space-y-2">
                        <li>
                          <Link 
                            to="/category/Jesus" 
                            className="text-body-md font-body-md text-onyx/80 hover:text-terracotta hover:translate-x-1 transition-all inline-block text-xs"
                          >
                            Jesus
                          </Link>
                        </li>
                        <li>
                          <Link 
                            to="/category/NORSKE produkter" 
                            className="text-body-md font-body-md text-onyx/80 hover:text-terracotta hover:translate-x-1 transition-all inline-block text-xs"
                          >
                            Norske produkter
                          </Link>
                        </li>
                        <li>
                          <Link 
                            to="/category/ENGLISH products" 
                            className="text-body-md font-body-md text-onyx/80 hover:text-terracotta hover:translate-x-1 transition-all inline-block text-xs"
                          >
                            English products
                          </Link>
                        </li>
                        <li>
                          <Link 
                            to="/category/Abonnement" 
                            className="text-body-md font-body-md text-onyx/80 hover:text-terracotta hover:translate-x-1 transition-all inline-block text-xs"
                          >
                            Abonnementer
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Column 5: Featured Promo Box */}
                <div className="bg-gradient-to-br from-terracotta/10 to-parchment border border-outline-variant/40 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
                  <div>
                    <span className="bg-terracotta text-white font-label-sm text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block mb-3">
                      Fremhevet
                    </span>
                    <h5 className="font-headline-md text-sm font-bold text-onyx mb-2">Velsignelse Gavepakke</h5>
                    <p className="text-xs text-secondary leading-relaxed mb-4">
                      Få våre bestselgende klistermerker og en t-skjorte i en vakker gaveeske.
                    </p>
                  </div>
                  <Link 
                    to="/products"
                    onClick={() => setMegamenuOpen(false)}
                    className="bg-terracotta text-white font-label-md text-label-md py-2.5 rounded-lg text-center font-semibold hover:opacity-95 active:scale-[0.98] transition-all block"
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
            {searchQuery && (
              <div className="mt-4">
                <Link 
                  to={`/products?search=${encodeURIComponent(searchQuery)}`}
                  onClick={() => setSearchOpen(false)}
                  className="inline-flex items-center gap-2 text-terracotta font-semibold hover:underline"
                >
                  Vis resultater for "{searchQuery}" &rarr;
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
              
              {Object.entries(CATEGORY_TAXONOMY).map(([group, cats]) => {
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
                        {cats.map(sub => (
                          <li key={sub}>
                            <Link
                              to={`/category/${sub}`}
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-body-md text-secondary hover:text-terracotta transition-colors block py-0.5"
                            >
                              {sub}
                            </Link>
                          </li>
                        ))}
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
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

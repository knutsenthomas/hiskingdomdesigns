import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
  const { mobileMenuOpen, setMobileMenuOpen, searchOpen, setSearchOpen, searchQuery, setSearchQuery } = useApp();
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, setMobileMenuOpen, setSearchOpen]);

  const navLinks = [
    { label: 'Alle Produkter', path: '/products' },
    { label: 'Klær', path: '/category/Klær' },
    { label: 'Klistermerker', path: '/category/Klistermerker' },
    { label: 'Plakater', path: '/category/Plakater' },
    { label: 'Tilbehør', path: '/category/Tilbehør' },
    { label: 'Salg', path: '/category/Salg' }
  ];

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
              className="text-headline-md font-headline-md font-extrabold text-onyx tracking-tight hover:text-terracotta transition-colors"
            >
              His Kingdom Designs
            </Link>
            
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => {
                const isActive = 
                  location.pathname === link.path || 
                  (link.path.startsWith('/category/') && location.pathname.startsWith(link.path));
                
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    className={`font-label-md text-label-md py-2 transition-colors relative ${
                      isActive 
                        ? 'text-terracotta font-bold' 
                        : 'text-onyx hover:text-terracotta'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-terracotta rounded" />
                    )}
                  </Link>
                );
              })}
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
          <nav className="fixed top-0 right-0 bottom-0 w-64 max-w-[80vw] bg-parchment shadow-2xl p-6 flex flex-col z-10 transition-transform duration-300">
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-onyx">Meny</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="text-onyx hover:text-terracotta"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = 
                  location.pathname === link.path || 
                  (link.path.startsWith('/category/') && location.pathname.startsWith(link.path));
                
                return (
                  <Link
                    key={link.label}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-body-lg font-medium py-2 border-b border-outline-variant/30 ${
                      isActive ? 'text-terracotta font-bold' : 'text-onyx'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

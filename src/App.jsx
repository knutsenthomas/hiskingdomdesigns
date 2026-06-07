import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HkmChatWidget from '@/components/HkmChatWidget';
import CookieConsent from '@/components/CookieConsent';
import Home from '@/pages/Home';
import Category from '@/pages/Category';
import ProductDetails from '@/pages/ProductDetails';
import Cart from '@/pages/Cart';
import About from '@/pages/About';
import Team from '@/pages/Team';
import Shipping from '@/pages/Shipping';
import Faq from '@/pages/Faq';
import Privacy from '@/pages/Privacy';
import Betingelser from '@/pages/Betingelser';
import Profile from '@/pages/Profile';
import { AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CmsVisualToggle from '@/components/CmsVisualToggle';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import '@/App.css';

// ScrollToTop component to reset page scroll position on routing navigation
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function MainLayout() {
  const location = useLocation();
  const { toastMessage } = useApp();

  return (
    <div className="flex flex-col min-h-screen bg-parchment text-onyx selection:bg-terracotta selection:text-white relative">
      <Header />
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Category />} />
            <Route path="/category/:categoryName" element={<Category />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/betingelser" element={<Betingelser />} />
            <Route path="/profile" element={<Profile />} />
            {/* Fallback to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
      <HkmChatWidget />
      <CookieConsent />
      <CmsVisualToggle />

      {/* Global Branded Toast Manager */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-8 z-[200] bg-onyx text-white border-b-4 border-terracotta px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3.5 max-w-sm pointer-events-auto"
          >
            <div className="p-1.5 bg-terracotta/20 text-terracotta rounded-full shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-terracotta">Systemvarsel</p>
              <p className="text-xs font-semibold text-slate-100">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <MainLayout />
        </Router>
      </CartProvider>
    </AppProvider>
  );
}

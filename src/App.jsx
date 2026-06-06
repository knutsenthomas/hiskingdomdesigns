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
import { AnimatePresence } from 'framer-motion';
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

  return (
    <div className="flex flex-col min-h-screen bg-parchment text-onyx selection:bg-terracotta selection:text-white">
      <Header />
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Category />} />
            <Route path="/category/:categoryName" element={<Category />} />
            <Route path="/product/:productId" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            {/* Fallback to home */}
            <Route path="*" element={<Home />} />
          </Routes>
        </AnimatePresence>
      </div>
      <Footer />
      <HkmChatWidget />
      <CookieConsent />
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

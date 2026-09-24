import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useParams } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AppProvider } from '@/contexts/AppContext';
import { CartProvider } from '@/contexts/CartContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HkmChatWidget from '@/components/HkmChatWidget';
import CookieConsent from '@/components/CookieConsent';
import Home from '@/pages/Home'; // Static import for Home page to load instantly without fallback
import ProductDetails from '@/pages/ProductDetails'; // Static import for ProductDetails to eliminate dynamic chunk import failures and load immediately
import { AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import CmsVisualToggle from '@/components/CmsVisualToggle';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import '@/App.css';

// Helper to dynamically load component with auto-retry on dynamic import / chunk load failures
const lazyWithRetry = (componentImport) =>
  lazy(() =>
    componentImport().catch((error) => {
      const errorMessage = error?.message || error?.toString() || '';
      const isChunkLoadFailed = errorMessage.includes('Failed to fetch dynamically imported module') ||
                                errorMessage.includes('Loading chunk') ||
                                errorMessage.includes('chunk');

      if (isChunkLoadFailed) {
        const chunkReloadKey = 'chunk-failed-reload';
        const lastReload = sessionStorage.getItem(chunkReloadKey);
        const now = Date.now();

        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(chunkReloadKey, now.toString());
          window.location.reload(true);
          // Return a pending promise so Suspense stays in fallback loading state while page reloads
          return new Promise(() => {});
        }
      }
      throw error;
    })
  );

// Lazy load non-critical routes to decrease bundle size (FCP) while keeping core pages instant
const Category = lazyWithRetry(() => import('@/pages/Category'));
const Cart = lazyWithRetry(() => import('@/pages/Cart'));
const Checkout = lazyWithRetry(() => import('@/pages/Checkout'));
const About = lazyWithRetry(() => import('@/pages/About'));
const Team = lazyWithRetry(() => import('@/pages/Team'));
const Shipping = lazyWithRetry(() => import('@/pages/Shipping'));
const Faq = lazyWithRetry(() => import('@/pages/Faq'));
const Privacy = lazyWithRetry(() => import('@/pages/Privacy'));
const Betingelser = lazyWithRetry(() => import('@/pages/Betingelser'));
const Profile = lazyWithRetry(() => import('@/pages/Profile'));
const Admin = lazyWithRetry(() => import('@/pages/Admin'));
const Cancellation = lazyWithRetry(() => import('@/pages/Cancellation'));
const KristneGaver = lazyWithRetry(() => import('@/pages/KristneGaver'));
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'));

// Premium Error Boundary to capture runtime rendering crashes and present a helpful report instead of a blank screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });

    const errorMessage = error?.message || error?.toString() || '';
    const isChunkLoadFailed = errorMessage.includes('Failed to fetch dynamically imported module') ||
                              errorMessage.includes('Loading chunk') ||
                              errorMessage.includes('chunk');

    if (isChunkLoadFailed) {
      const chunkReloadKey = 'chunk-failed-reload';
      const lastReload = sessionStorage.getItem(chunkReloadKey);
      const now = Date.now();

      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(chunkReloadKey, now.toString());
        window.location.reload(true);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div data-nosnippet className="max-w-xl mx-auto my-16 p-8 bg-surface border border-outline-variant/30 rounded-2xl text-onyx shadow-xl font-sans text-center">
          <div className="w-12 h-12 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl">refresh</span>
          </div>
          <p className="text-base font-bold text-onyx mb-2">Kunne ikke laste siden</p>
          <p className="text-xs text-secondary mb-6 max-w-md mx-auto leading-relaxed">
            Det oppstod en kortvarig feil under innlasting. Prøv å laste siden på nytt eller gå til produktkatalogen.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-terracotta text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Last inn på nytt
            </button>
            <a
              href="/produkter"
              className="bg-white border border-outline text-secondary px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-50 hover:text-onyx active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              Se alle produkter
            </a>
          </div>
          {this.state.error && (
            <details className="mt-6 text-left text-[10px] text-slate-500 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200">
              <summary className="cursor-pointer font-bold text-red-500">Tekniske detaljer</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.error.toString()}</pre>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-1 whitespace-pre-wrap opacity-75">{this.state.errorInfo.componentStack}</pre>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

function ProductRedirect() {
  const { productId } = useParams();
  return <Navigate to={`/produkt/${productId || ''}`} replace />;
}

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

  useEffect(() => {
    // 1. Wix referral parameter tracking
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('hkm_referral_id', ref);
    }

    // 2. GoAffPro visit tracking on route change
    if (window.Goaffpro) {
      try {
        window.Goaffpro('track-visit');
      } catch (err) {
        console.warn('GoAffPro track-visit failed:', err);
      }
    }
  }, [location]);

  // Global handler for dynamic import/chunk loading failures across all files (including context lazy-loads)
  useEffect(() => {
    const handleChunkError = (errorMessage) => {
      const isChunkLoadFailed = errorMessage.includes('Failed to fetch dynamically imported module') ||
                                errorMessage.includes('Loading chunk') ||
                                errorMessage.includes('chunk');

      if (isChunkLoadFailed) {
        const chunkReloadKey = 'chunk-failed-reload';
        const lastReload = sessionStorage.getItem(chunkReloadKey);
        const now = Date.now();

        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(chunkReloadKey, now.toString());
          window.location.reload(true);
        }
      }
    };

    const handleError = (e) => {
      handleChunkError(e.message || '');
    };

    const handleRejection = (e) => {
      handleChunkError(e.reason?.message || e.reason?.toString() || '');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-parchment text-onyx selection:bg-terracotta selection:text-white relative">
      <Header />
      <div className="flex-grow">
        <Suspense fallback={
          <div className="h-screen bg-parchment flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
          </div>
        }>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              
              {/* Products & Categories */}
              <Route path="/products" element={<Category />} />
              <Route path="/produkter" element={<Category />} />
              <Route path="/productos" element={<Navigate to="/produkter" replace />} />
              <Route path="/category/:categoryName" element={<Category />} />
              <Route path="/kristne-gaver" element={<KristneGaver />} />
              <Route path="/gaver" element={<Navigate to="/kristne-gaver" replace />} />
              
              {/* Product Details */}
              <Route path="/product/:productId" element={<ErrorBoundary><ProductDetails /></ErrorBoundary>} />
              <Route path="/produkt/:productId" element={<ErrorBoundary><ProductDetails /></ErrorBoundary>} />
              <Route path="/producto/:productId" element={<ProductRedirect />} />
              
              {/* Cart */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/handlekurv" element={<Cart />} />
              <Route path="/carrito" element={<Navigate to="/handlekurv" replace />} />

              {/* Checkout */}
              <Route path="/checkout" element={<ErrorBoundary><Checkout /></ErrorBoundary>} />
              <Route path="/kasse" element={<ErrorBoundary><Checkout /></ErrorBoundary>} />
              <Route path="/pago" element={<Navigate to="/kasse" replace />} />
              
              {/* About */}
              <Route path="/about" element={<About />} />
              <Route path="/om-oss" element={<About />} />
              <Route path="/sobre-nosotros" element={<Navigate to="/om-oss" replace />} />
              
              {/* Team */}
              <Route path="/team" element={<Team />} />
              <Route path="/vart-team" element={<Team />} />
              <Route path="/equipo" element={<Navigate to="/vart-team" replace />} />
              
              {/* Shipping & Returns */}
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/frakt-og-retur" element={<Shipping />} />
              <Route path="/envios" element={<Navigate to="/frakt-og-retur" replace />} />
              
              {/* FAQ */}
              <Route path="/faq" element={<Faq />} />
              <Route path="/preguntas-frecuentes" element={<Navigate to="/faq" replace />} />
              
              {/* Privacy Policy */}
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/personvern" element={<Privacy />} />
              <Route path="/privacidad" element={<Navigate to="/personvern" replace />} />
              
               {/* Terms of Service */}
              <Route path="/betingelser" element={<Betingelser />} />
              <Route path="/terms" element={<Betingelser />} />
              <Route path="/condiciones" element={<Navigate to="/betingelser" replace />} />
              
              {/* Cancellation / Angre kjøp */}
              <Route path="/cancel-order" element={<ErrorBoundary><Cancellation /></ErrorBoundary>} />
              <Route path="/angre-kjop" element={<ErrorBoundary><Cancellation /></ErrorBoundary>} />
              <Route path="/cancelar-pedido" element={<Navigate to="/angre-kjop" replace />} />
              
              {/* Profile */}
              <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
              <Route path="/profil" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
              <Route path="/perfil" element={<Navigate to="/profil" replace />} />
              
              {/* Admin */}
              <Route path="/admin" element={<ErrorBoundary><Admin /></ErrorBoundary>} />
              {/* 404 Not Found Fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
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
    <ErrorBoundary>
      <LanguageProvider>
        <AppProvider>
          <CartProvider>
            <Router>
              <ScrollToTop />
              <MainLayout />
              <Analytics />
              <SpeedInsights />
            </Router>
          </CartProvider>
        </AppProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X } from 'lucide-react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('hkd-cookie-consent');
    if (!consent) {
      // Show banner after a short delay
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('hkd-cookie-consent', 'all');
    setVisible(false);
    // Initialize analytics if applicable
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
    }
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem('hkd-cookie-consent', 'necessary');
    setVisible(false);
    // Explicitly update gtag consent to denied
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[420px] bg-white border border-outline-variant/60 shadow-2xl rounded-2xl p-6 z-[9999] flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta/10 flex items-center justify-center text-terracotta shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-headline-md text-sm font-bold text-onyx">Informasjonskapsler</h4>
                <p className="text-[10px] text-secondary font-semibold uppercase tracking-widest">GDPR & Personvern</p>
              </div>
            </div>
            <button 
              onClick={handleAcceptNecessary}
              className="text-secondary hover:text-onyx p-1"
              aria-label="Lukk"
            >
              <X size={16} />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-secondary leading-relaxed">
            Vi bruker cookies for å optimalisere brukeropplevelsen, analysere trafikk, og levere tilpassede tilbud. Ved å trykke «Godta alle» samtykker du til denne bruken.
          </p>

          {/* Buttons */}
          <div className="flex gap-2.5 mt-2">
            <button
              onClick={handleAcceptNecessary}
              className="flex-1 bg-parchment border border-outline-variant hover:border-terracotta hover:text-terracotta text-onyx py-2.5 rounded-xl font-label-md text-xs font-semibold active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Avvis analytiske
            </button>
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-terracotta to-terracotta/90 text-white py-2.5 rounded-xl font-label-md text-xs font-bold shadow-sm shadow-terracotta/20 hover:brightness-105 active:scale-[0.98] transition-all whitespace-nowrap"
            >
              Godta alle
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

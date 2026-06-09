import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';
import { getTranslatedProduct } from '@/lib/productTranslations';

export const LanguageContext = createContext({});

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // 1. Initial state setup with browser locale fallback
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem('hkd-language');
      if (saved && ['no', 'en', 'es'].includes(saved)) {
        return saved;
      }
    } catch (e) {
      console.error('Failed to read language from localStorage:', e);
    }

    // Fallback based on browser language
    try {
      const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      if (browserLang.startsWith('es')) return 'es';
      if (browserLang.startsWith('no') || browserLang.startsWith('nb') || browserLang.startsWith('nn')) return 'no';
    } catch (e) {}

    return 'no'; // Default to Norwegian if nothing else matches
  });

  const setLanguage = (newLang) => {
    if (['no', 'en', 'es'].includes(newLang)) {
      setLanguageState(newLang);
      try {
        localStorage.setItem('hkd-language', newLang);
      } catch (e) {
        console.error('Failed to save language to localStorage:', e);
      }
    }
  };

  // 2. Perform background geolocation check if no manual language is saved
  useEffect(() => {
    let active = true;
    const hasSavedLang = localStorage.getItem('hkd-language');

    if (!hasSavedLang) {
      console.log('No manual language saved. Detecting location via IP...');
      fetch('https://ipapi.co/json/')
        .then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        })
        .then(data => {
          if (!active) return;
          const country = data.country_code || data.country; // e.g. "NO", "ES", "GB", "US"
          if (country) {
            console.log('Detected user country via IP:', country);
            if (country === 'ES') {
              console.log('Spanish location detected. Setting language to Spanish (es).');
              setLanguageState('es');
            } else if (country === 'NO' || country === 'SJ') {
              console.log('Norwegian location detected. Setting language to Norwegian (no).');
              setLanguageState('no');
            } else {
              console.log('International location detected (e.g. England). Setting language to English (en).');
              setLanguageState('en');
            }
          }
        })
        .catch(err => {
          console.warn('Geolocation check failed, keeping browser locale fallback:', err);
        });
    }

    return () => {
      active = false;
    };
  }, []);

  // Simple static text translation function
  const t = (key, params = {}) => {
    const dict = translations[language] || translations['no'];
    let val = dict[key] || translations['no'][key] || key;

    // Substitute parameters if provided (e.g. {amount} in free shipping message)
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      val = val.replace(`{${paramKey}}`, paramVal);
    });

    return val;
  };

  // Wrapper function to translate products
  const translateProduct = (product) => {
    return getTranslatedProduct(product, language);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t,
      translateProduct
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

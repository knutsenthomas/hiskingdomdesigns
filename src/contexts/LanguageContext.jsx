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

  const [detectedCountry, setDetectedCountry] = useState('NO');
  const [rates, setRates] = useState({
    NOK: 1,
    USD: 0.1056,
    EUR: 0.0916,
    GBP: 0.0792
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

  // 2. Perform background geolocation check
  useEffect(() => {
    let active = true;
    const hasSavedLang = localStorage.getItem('hkd-language');

    console.log('Detecting location via IP for currency/language...');
    fetch('https://ipapi.co/json/')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        if (!active) return;
        const country = data.country_code || data.country; // e.g. "NO", "ES", "GB", "US"
        if (country) {
          console.log('Detected user country:', country);
          setDetectedCountry(country);
          
          if (!hasSavedLang) {
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
        }
      })
      .catch(err => {
        console.warn('Geolocation check failed, keeping browser locale fallback:', err);
      });

    return () => {
      active = false;
    };
  }, []);

  // 3. Fetch real-time exchange rates
  useEffect(() => {
    console.log('Syncing live exchange rates from public API...');
    fetch('https://open.er-api.com/v6/latest/NOK')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch exchange rates');
        return res.json();
      })
      .then(data => {
        if (data && data.rates) {
          setRates({
            NOK: 1,
            USD: data.rates.USD || 0.1056,
            EUR: data.rates.EUR || 0.0916,
            GBP: data.rates.GBP || 0.0792
          });
          console.log('Successfully updated exchange rates relative to NOK:', data.rates.USD, data.rates.EUR, data.rates.GBP);
        }
      })
      .catch(err => {
        console.warn('Could not fetch live exchange rates, using defaults:', err);
      });
  }, []);

  // Determine active display currency
  const getActiveCurrency = () => {
    if (language === 'no') return 'NOK';
    if (language === 'es') return 'EUR';
    if (language === 'en') {
      if (detectedCountry === 'GB') return 'GBP';
      const euroZone = [
        'AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT',
        'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
        'AD', 'MC', 'SM', 'VA', 'ME', 'XK'
      ];
      if (euroZone.includes(detectedCountry)) return 'EUR';
      return 'USD';
    }
    return 'NOK';
  };

  // Convert and format NOK price to active currency
  const formatPrice = (priceInNok) => {
    const amount = parseFloat(priceInNok);
    if (isNaN(amount)) return '';

    const currency = getActiveCurrency();
    const rate = rates[currency] || 1;
    const converted = amount * rate;

    if (currency === 'NOK') {
      return `${Math.round(converted)} kr`;
    }

    const formatterMap = {
      USD: { locale: 'en-US', symbol: '$' },
      EUR: { locale: 'es-ES', symbol: '€' },
      GBP: { locale: 'en-GB', symbol: '£' }
    };

    const config = formatterMap[currency] || { locale: 'en-US', symbol: '$' };
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(converted);
    } catch (e) {
      return `${config.symbol}${converted.toFixed(2)}`;
    }
  };

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
      translateProduct,
      formatPrice,
      getActiveCurrency
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

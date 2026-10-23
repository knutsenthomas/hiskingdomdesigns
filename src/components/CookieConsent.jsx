import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { flushPurchases } from '@/lib/ecommerceAnalytics';

export default function CookieConsent() {
  const [allowed, setAllowed] = useState(() => window.SitePrivacy?.allows('analytics') === true);
  useEffect(() => {
    const sync = () => {
      setAllowed(window.SitePrivacy?.allows('analytics') === true);
      if (window.SitePrivacy?.allows('analytics')) flushPurchases();
    };
    window.addEventListener('siteprivacychange', sync);
    sync();
    return () => window.removeEventListener('siteprivacychange', sync);
  }, []);
  const beforeSend = event => window.SitePrivacy?.cleanEvent(event) ?? null;
  return allowed ? <><Analytics beforeSend={beforeSend} /><SpeedInsights beforeSend={beforeSend} /></> : null;
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const STORAGE_KEY = 'hkd_order_confirmation';

// Shown on the page Wix returns the customer to after payment (the profile page),
// so guests see that the order went through instead of only a login form.
export default function OrderConfirmation({ isGuest = false }) {
  const { t, localizedPath } = useLanguage();
  const [orderId, setOrderId] = useState(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  });

  if (!orderId) return null;

  const dismiss = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setOrderId(null);
  };

  return (
    <div role="status" className="relative mb-8 bg-white rounded-3xl p-6 md:p-8 border border-emerald-200 shadow-sm">
      <button
        onClick={dismiss}
        className="absolute top-4 right-4 p-2 rounded-full text-secondary hover:text-onyx hover:bg-slate-100 transition-all cursor-pointer"
        aria-label={t('order.close')}
      >
        <X size={18} />
      </button>
      <div className="flex items-start gap-4 pr-8">
        <CheckCircle2 size={32} className="text-emerald-600 shrink-0" />
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-onyx">{t('order.thanksTitle')}</h1>
          <p className="text-sm text-secondary leading-relaxed">{t('order.thanksBody')}</p>
          {isGuest && (
            <p className="text-sm text-secondary leading-relaxed">{t('order.guestNote')}</p>
          )}
          <Link
            to={localizedPath('/produkter')}
            onClick={dismiss}
            className="inline-block mt-2 bg-terracotta text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all shadow-md"
          >
            {t('order.continue')}
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, ShoppingBag, Gift, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import useMeta from '@/hooks/useMeta';

export default function NotFound() {
  useMeta(
    'Siden ble ikke funnet (404) | His Kingdom Designs',
    'Beklager, siden du leter etter finnes ikke eller har blitt flyttet. Utforsk våre kristne klær, kopper, plakater og gaver hos His Kingdom Designs.'
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-32 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center mx-auto mb-6">
        <span className="material-symbols-outlined text-4xl">travel_explore</span>
      </div>

      <span className="text-terracotta font-label-md text-xs uppercase tracking-widest font-bold mb-2 block">
        Feilkode 404
      </span>
      <h1 className="font-headline-xl text-3xl md:text-4xl font-extrabold text-onyx mb-4">
        Siden ble ikke funnet
      </h1>
      <p className="text-secondary text-sm md:text-base leading-relaxed mb-10 max-w-lg mx-auto">
        Beklager, adressen du prøvde å nå finnes dessverre ikke eller har blitt flyttet til en ny adresse. Bruk lenkene nedenfor for å finne det du leter etter.
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-terracotta hover:bg-[#bd4f2a] text-white px-6 py-3.5 rounded-xl font-label-md text-sm font-semibold transition-all shadow-sm active:scale-[0.98] hover:scale-[1.02]"
        >
          <Home size={16} />
          <span>Gå til forsiden</span>
        </Link>
        <Link
          to="/produkter"
          className="inline-flex items-center gap-2 bg-white text-onyx border border-outline-variant hover:border-terracotta hover:text-terracotta px-6 py-3.5 rounded-xl font-label-md text-sm font-semibold transition-all active:scale-[0.98]"
        >
          <ShoppingBag size={16} />
          <span>Utforsk alle produkter</span>
        </Link>
      </div>

      {/* Helpful Quick Links Box */}
      <div className="bg-white border border-outline-variant/40 rounded-2xl p-6 text-left shadow-xs">
        <h2 className="font-headline-sm text-base font-bold text-onyx mb-4 flex items-center gap-2">
          <span>Populære sider:</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Link
            to="/kristne-gaver"
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-onyx/90 hover:text-terracotta transition-colors"
          >
            <Gift size={16} className="text-terracotta" />
            <span>Kristne gaver med mening</span>
          </Link>
          <Link
            to="/category/kristne-klaer"
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-onyx/90 hover:text-terracotta transition-colors"
          >
            <span className="material-symbols-outlined text-base text-terracotta">checkroom</span>
            <span>Kristne klær & Streetwear</span>
          </Link>
          <Link
            to="/category/kristne-t-skjorter"
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-onyx/90 hover:text-terracotta transition-colors"
          >
            <span className="material-symbols-outlined text-base text-terracotta">apparel</span>
            <span>Kristne T-skjorter</span>
          </Link>
          <Link
            to="/category/kristne-gensere"
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-onyx/90 hover:text-terracotta transition-colors"
          >
            <span className="material-symbols-outlined text-base text-terracotta">dry_cleaning</span>
            <span>Kristne hettegensere (Hoodies)</span>
          </Link>
          <Link
            to="/category/kristne-plakater"
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-onyx/90 hover:text-terracotta transition-colors"
          >
            <span className="material-symbols-outlined text-base text-terracotta">image</span>
            <span>Kristne plakater & kunst</span>
          </Link>
          <Link
            to="/category/kristne-kopper"
            className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-slate-50 text-onyx/90 hover:text-terracotta transition-colors"
          >
            <span className="material-symbols-outlined text-base text-terracotta">local_cafe</span>
            <span>Kristne kopper & flasker</span>
          </Link>
        </div>
      </div>
    </motion.main>
  );
}

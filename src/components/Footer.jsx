import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Heart, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer className="bg-onyx text-parchment pt-20 pb-8 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-16">
        {/* Brand Column */}
        <div className="space-y-6">
          <Link 
            to="/" 
            className="flex items-center gap-3 font-bold text-terracotta hover:opacity-90 transition-all duration-300 logo group"
          >
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img src="/logo-hkm.png" alt="His Kingdom Designs Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-headline-md font-headline-md font-extrabold tracking-tight text-white group-hover:text-terracotta transition-colors">
              His Kingdom Designs
            </span>
          </Link>
          <p className="font-body-md text-body-md text-parchment/70 leading-relaxed">
            Vi skaper moderne kristne klær, plakater og tilbehør som kombinerer tro og stil for å spre Guds ord i hverdagen.
          </p>
          <div className="flex gap-4">
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-terracotta hover:text-white transition-colors text-parchment/60"
              aria-label="Instagram"
            >
              <Heart size={16} />
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-terracotta hover:text-white transition-colors text-parchment/60"
              aria-label="E-post"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Explore Column */}
        <div>
          <h4 className="font-label-md text-label-md text-white mb-6 uppercase tracking-wider">Utforsk</h4>
          <ul className="space-y-4 font-body-md text-body-md">
            <li>
              <Link to="/products" className="text-parchment/80 hover:text-terracotta transition-colors">Alle Produkter</Link>
            </li>
            <li>
              <Link to="/category/Klær" className="text-parchment/80 hover:text-terracotta transition-colors">Klær</Link>
            </li>
            <li>
              <Link to="/category/Klistermerker" className="text-parchment/80 hover:text-terracotta transition-colors">Klistermerker</Link>
            </li>
            <li>
              <Link to="/category/Plakater" className="text-parchment/80 hover:text-terracotta transition-colors">Plakater</Link>
            </li>
            <li>
              <Link to="/category/Tilbehør" className="text-parchment/80 hover:text-terracotta transition-colors">Tilbehør</Link>
            </li>
          </ul>
        </div>

        {/* Customer Info Column */}
        <div>
          <h4 className="font-label-md text-label-md text-white mb-6 uppercase tracking-wider">Kundeservice</h4>
          <ul className="space-y-4 font-body-md text-body-md">
            <li>
              <a href="#" className="text-parchment/80 hover:text-terracotta transition-colors">Møt teamet</a>
            </li>
            <li>
              <a href="#" className="text-parchment/80 hover:text-terracotta transition-colors">Hvem er vi</a>
            </li>
            <li>
              <a href="#" className="text-parchment/80 hover:text-terracotta transition-colors">Frakt og retur</a>
            </li>
            <li>
              <a href="#" className="text-parchment/80 hover:text-terracotta transition-colors">Ofte stilte spørsmål</a>
            </li>
            <li>
              <a href="#" className="text-parchment/80 hover:text-terracotta transition-colors">Personvernerklæring</a>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div>
          <h4 className="font-label-md text-label-md text-white mb-6 uppercase tracking-wider">Nyhetsbrev</h4>
          <p className="text-body-md font-body-md text-parchment/70 mb-4 leading-relaxed">
            Meld deg på vårt nyhetsbrev for eksklusive tilbud, inspirerende ord og nye kolleksjoner.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input 
              type="email"
              placeholder="Din e-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/5 border border-white/20 rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-white placeholder:text-white/30"
              required
            />
            <button 
              type="submit"
              className="bg-terracotta text-white px-4 py-2 rounded font-label-md hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-wider font-bold"
            >
              Bli med
            </button>
          </form>
          {subscribed && (
            <p className="text-green-400 text-xs mt-2 animate-pulse">Takk! Du er nå påmeldt nyhetsbrevet.</p>
          )}
          
          <div className="mt-8">
            <p className="text-center md:text-left text-label-sm font-label-sm text-parchment/40 tracking-widest uppercase mb-2">Betaling</p>
            <div className="flex gap-3 justify-center md:justify-start items-center opacity-40">
              <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white font-bold select-none">VIPPS</span>
              <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white font-bold select-none">VISA</span>
              <span className="bg-white/10 px-2 py-1 rounded text-[10px] text-white font-bold select-none">MC</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 text-center text-label-sm text-parchment/40 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
        <p>&copy; {new Date().getFullYear()} His Kingdom Designs. Alle rettigheter reservert.</p>
      </div>
    </footer>
  );
}

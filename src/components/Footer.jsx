import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Heart, Mail, ShieldCheck, Copy, ExternalLink, Check } from 'lucide-react';
import CmsText from '@/components/CmsText';
import { wixClient } from '@/lib/wix';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [emailMenuOpen, setEmailMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const emailMenuRef = useRef(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('post@hiskingdomministry.no');
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setEmailMenuOpen(false);
    }, 2000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emailMenuRef.current && !emailMenuRef.current.contains(event.target)) {
        setEmailMenuOpen(false);
      }
    };
    if (emailMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [emailMenuOpen]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      await wixClient.contacts.appendOrCreateContact({
        emails: [{ email: email }]
      });
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    } catch (err) {
      console.error('Error subscribing email to Wix CRM:', err);
      setError('Det oppstod en feil. Vennligst prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-onyx text-parchment pt-20 pb-8 mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-gutter px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto mb-16">
        {/* Brand Column */}
        <div className="space-y-6 lg:col-span-4">
          <Link 
            to="/" 
            className="flex items-center gap-3 font-bold text-terracotta hover:opacity-90 transition-all duration-300 logo group"
          >
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img src="/logo-hkm.png" alt="His Kingdom Designs Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-headline-md font-headline-md font-extrabold tracking-tight text-white group-hover:text-terracotta transition-colors whitespace-nowrap">
              His Kingdom Designs
            </span>
          </Link>
          <CmsText
            slug="footer-brand-desc"
            fallback="Vi skaper moderne kristne klær, plakater og tilbehør som kombinerer tro og stil for å spre Guds ord i hverdagen."
            as="p"
            className="font-body-md text-body-md text-parchment/70 leading-relaxed"
          />
          <div className="flex gap-4">
            <a 
              href="https://www.instagram.com/hiskingdomdesigns/" 
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-terracotta hover:text-white transition-colors text-parchment/60"
              aria-label="Instagram"
            >
              <Heart size={16} />
            </a>
            <div className="relative" ref={emailMenuRef}>
              <button 
                onClick={() => setEmailMenuOpen(!emailMenuOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  emailMenuOpen 
                    ? 'bg-terracotta text-white scale-105 shadow-md shadow-terracotta/20' 
                    : 'bg-white/5 hover:bg-terracotta hover:text-white text-parchment/60'
                }`}
                aria-label="E-post meny"
                aria-expanded={emailMenuOpen}
              >
                <Mail size={16} />
              </button>

              {emailMenuOpen && (
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 mb-2 w-48 bg-white border border-outline-variant rounded-xl shadow-xl py-2 z-50 animate-fade-in text-onyx">
                  {/* Arrow element for dropdown */}
                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-outline-variant rotate-45"></div>
                  
                  <a 
                    href="mailto:post@hiskingdomministry.no" 
                    onClick={() => setEmailMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors w-full text-left"
                  >
                    <ExternalLink size={14} className="text-secondary/70" />
                    <span>Send e-post direkte</span>
                  </a>
                  
                  <button 
                    onClick={handleCopyEmail}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors w-full text-left border-t border-slate-100"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-green-600" />
                        <span className="text-green-600 font-bold">Kopiert!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} className="text-secondary/70" />
                        <span>Kopier e-postadresse</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Explore Column */}
        <div className="lg:col-span-2">
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
        <div className="lg:col-span-3">
          <h4 className="font-label-md text-label-md text-white mb-6 uppercase tracking-wider">Kundeservice</h4>
          <ul className="space-y-4 font-body-md text-body-md">
            <li>
              <Link to="/team" className="text-parchment/80 hover:text-terracotta transition-colors">Møt teamet</Link>
            </li>
            <li>
              <Link to="/about" className="text-parchment/80 hover:text-terracotta transition-colors">Hvem er vi</Link>
            </li>
            <li>
              <Link to="/shipping" className="text-parchment/80 hover:text-terracotta transition-colors">Frakt og retur</Link>
            </li>
            <li>
              <Link to="/faq" className="text-parchment/80 hover:text-terracotta transition-colors">Ofte stilte spørsmål</Link>
            </li>
            <li>
              <Link to="/privacy" className="text-parchment/80 hover:text-terracotta transition-colors">Personvernerklæring</Link>
            </li>
            <li>
              <Link to="/betingelser" className="text-parchment/80 hover:text-terracotta transition-colors">Kjøpsbetingelser</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="lg:col-span-3">
          <h4 className="font-label-md text-label-md text-white mb-6 uppercase tracking-wider">Nyhetsbrev</h4>
          <CmsText
            slug="footer-newsletter-desc"
            fallback="Meld deg på vårt nyhetsbrev for eksklusive tilbud, inspirerende ord og nye kolleksjoner."
            as="p"
            className="text-body-md font-body-md text-parchment/70 mb-4 leading-relaxed"
          />
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input 
              type="email"
              placeholder="Din e-post"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/20 rounded px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-white placeholder:text-white/30 disabled:opacity-50"
              required
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-terracotta text-white px-4 py-2 rounded font-label-md hover:brightness-110 active:scale-95 transition-all text-sm uppercase tracking-wider font-bold shrink-0 whitespace-nowrap disabled:opacity-50"
            >
              {loading ? 'Sender...' : 'Bli med'}
            </button>
          </form>
          {subscribed && (
            <p className="text-green-400 text-xs mt-2 animate-pulse">Takk! Du er nå påmeldt nyhetsbrevet.</p>
          )}
          {error && (
            <p className="text-red-400 text-xs mt-2">{error}</p>
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

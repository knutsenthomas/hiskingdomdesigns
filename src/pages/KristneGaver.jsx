import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Gift, Sparkles, Heart, HelpCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import useMeta from '@/hooks/useMeta';

const GIFT_FILTERS = [
  { id: 'all', label: 'Alle gaver' },
  { id: 'her', label: 'Gaver til henne' },
  { id: 'him', label: 'Gaver til ham' },
  { id: 'under300', label: 'Under 300 kr' },
  { id: 'small', label: 'Små gaver & stickers' },
  { id: 'posters', label: 'Plakater & bilder' }
];

export default function KristneGaver() {
  const { products, isLoadingProducts } = useApp();
  const { t, language } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  const metaTitle = 'Kristne gaver med mening | His Kingdom Designs';
  const metaDesc = 'Finn kristne gaver med mening. Oppdag klær, kopper, plakater og produkter med bibelvers og kristne budskap hos His Kingdom Designs.';

  useMeta(metaTitle, metaDesc);

  // Filter available products
  const giftProducts = useMemo(() => {
    let list = [...products];

    if (language !== 'en') {
      list = list.filter(p => !p.isOceaniaExclusive);
    }

    if (activeFilter === 'under300') {
      return list.filter(p => (p.price || 0) <= 300);
    }

    if (activeFilter === 'her') {
      return list.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const gender = (p.gender || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return gender.includes('dame') || gender.includes('women') || cat.includes('dame') || cat.includes('smykke') || cat.includes('totebag') || name.includes('dame') || name.includes('women');
      });
    }

    if (activeFilter === 'him') {
      return list.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const gender = (p.gender || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return gender.includes('herre') || gender.includes('men') || cat.includes('herre') || cat.includes('caps') || name.includes('herre') || name.includes('men') || cat.includes('streetwear');
      });
    }

    if (activeFilter === 'small') {
      return list.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return cat.includes('kopp') || cat.includes('cup') || cat.includes('bottle') || cat.includes('klister') || cat.includes('sticker') || name.includes('kopp') || name.includes('sticker') || name.includes('klistremerke');
      });
    }

    if (activeFilter === 'posters') {
      return list.filter(p => {
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        return cat.includes('plakat') || cat.includes('bilde') || cat.includes('poster') || name.includes('plakat') || name.includes('poster') || name.includes('bilde');
      });
    }

    return list;
  }, [products, language, activeFilter]);

  const toggleFaq = (index) => {
    setOpenFaq(prev => prev === index ? null : index);
  };

  const faqItems = [
    {
      q: 'Hva er den beste kristne gaven til en konfirmant?',
      a: 'Til konfirmasjon er våre hettegensere (hoodies) med bibelvers, t-skjorter med stilrent kors eller innrammede kunstplakater med kjente bibelord som Salme 23 eller Jesaja 40:31 blant de mest verdsatte gavene. De kombinerer moderne mote med et tidløst og styrkende trosbudskap.'
    },
    {
      q: 'Hvilke gaver passer til dåp eller navnefest?',
      a: 'Våre barneplakater og kunsttrykk med velsignelser og oppmuntrende bibelvers er ideelle til barnerommet. De gir en varig påminnelse om Guds omsorg og kjærlighet fra første stund.'
    },
    {
      q: 'Hva kan jeg gi i gave til under 300 kr?',
      a: 'Vi har et bredt utvalg av rimelige, men meningsfulle gaver! Våre keramikk-kopper med bibelord og pakker med vanntette klistremerker koster under 300 kr og sprer stor glede til morgenkaffen eller på skolen og kontoret.'
    },
    {
      q: 'Hvor lang er leveringstiden, og hva med retur?',
      a: 'Normal leveringstid er ca. 2 uker i hele Norge. Vi tilbyr 14 dagers full angrerett fra pakken er levert, så mottakeren trygt kan bytte størrelse hvis det trengs.'
    }
  ];

  // Dynamic ItemList & FAQ JSON-LD Schema
  useEffect(() => {
    const scriptId = 'kristne-gaver-schema';
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          'name': 'Kristne gaver med mening',
          'description': metaDesc,
          'url': 'https://hiskingdomdesigns.no/kristne-gaver',
          'mainEntity': {
            '@type': 'ItemList',
            'numberOfItems': Math.min(giftProducts.length, 12),
            'itemListElement': giftProducts.slice(0, 12).map((p, idx) => ({
              '@type': 'ListItem',
              'position': idx + 1,
              'url': `https://hiskingdomdesigns.no/produkt/${p.id}`,
              'name': p.name
            }))
          }
        },
        {
          '@type': 'FAQPage',
          'mainEntity': faqItems.map(item => ({
            '@type': 'Question',
            'name': item.q,
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': item.a
            }
          }))
        }
      ]
    };

    script.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [giftProducts]);

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-label-sm font-label-sm text-secondary mb-6">
        <Link to="/" className="hover:text-terracotta transition-colors">{t('nav.home')}</Link>
        <ChevronRight size={14} className="text-secondary/60" />
        <span className="text-onyx font-bold">Kristne gaver</span>
      </nav>

      {/* Hero Header */}
      <header className="mb-12 max-w-3xl">
        <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
          <Gift size={14} />
          <span>Gaveguide & Inspirasjon</span>
        </div>
        <h1 className="font-headline-xl text-3xl md:text-5xl font-bold text-onyx mb-4 tracking-tight leading-tight">
          Kristne gaver med mening
        </h1>
        <p className="text-body-lg font-body-lg text-secondary leading-relaxed">
          Leter du etter en omtenksom gave til konfirmasjon, dåp, bursdag eller en oppmuntring i hverdagen? Hos His Kingdom Designs finner du et nøye utvalgt sortiment av kristne klær, kopper, klistremerker og kunstplakater med styrkende bibelvers og trosbudskap.
        </p>
      </header>

      {/* Filter Tabs */}
      <section className="mb-10" aria-label="Gavekategorier">
        <div className="flex flex-wrap gap-2.5 pb-2">
          {GIFT_FILTERS.map(filter => {
            const isActive = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-terracotta text-white border-terracotta shadow-sm scale-[1.02]'
                    : 'bg-white text-onyx border-outline-variant/60 hover:border-terracotta hover:text-terracotta hover:scale-[1.01]'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Product Grid */}
      <section aria-label="Utvalgte kristne gaver" className="mb-20">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-28 w-full">
            <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-secondary font-semibold font-body-md">{t('category.loading')}</p>
          </div>
        ) : giftProducts.length > 0 ? (
          <div>
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-outline-variant/30">
              <span className="font-label-sm text-label-sm text-secondary">
                Viser {giftProducts.length} gaveforslag
              </span>
              <Link 
                to="/produkter" 
                className="text-xs text-terracotta font-semibold hover:underline flex items-center gap-1"
              >
                <span>Se hele sortimentet</span>
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-gutter">
              {giftProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-variant/50 p-16 text-center max-w-xl mx-auto">
            <span className="material-symbols-outlined text-5xl text-terracotta/40 mb-4">redeem</span>
            <h3 className="font-headline-md text-headline-md text-onyx mb-2">Ingen gaver funnet i denne kategorien</h3>
            <p className="text-secondary font-body-md mb-6">Prøv et annet filter eller utforsk hele katalogen vår.</p>
            <button
              onClick={() => setActiveFilter('all')}
              className="bg-terracotta text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              Vis alle gaver
            </button>
          </div>
        )}
      </section>

      {/* Inspirational Feature Box */}
      <section className="bg-white border border-outline-variant/40 rounded-3xl p-8 md:p-12 mb-20 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-4 mx-auto md:mx-0">
              <Sparkles size={24} />
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-onyx mb-2">Gaver som betyr noe</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Hvert produkt er laget med hensikt å minne mottakeren om tro, håp og Guds urokkelige kjærlighet i hverdagen.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-4 mx-auto md:mx-0">
              <Heart size={24} />
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-onyx mb-2">Kvalitet og omtanke</h3>
            <p className="text-secondary text-sm leading-relaxed">
              Vi benytter miljøvennlige materialer som organisk bomull og slitesterk keramikk som holder seg vakkert år etter år.
            </p>
          </div>

          <div className="text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-4 mx-auto md:mx-0">
              <Gift size={24} />
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-onyx mb-2">Trygg handel fra Norge</h3>
            <p className="text-secondary text-sm leading-relaxed">
              14 dagers angrerett, sikker betaling med kort og Vipps, samt rask kundeservice på norsk.
            </p>
          </div>
        </div>
      </section>

      {/* SEO On-Page Guide & FAQ Section */}
      <section className="bg-gradient-to-br from-parchment/80 to-white/60 border border-outline-variant/30 rounded-3xl p-8 md:p-12 shadow-xs">
        <div className="max-w-3xl mb-10">
          <h2 className="font-headline-lg text-2xl md:text-3xl text-onyx font-bold mb-4">
            Tips for å velge den perfekte kristne gaven
          </h2>
          <div className="w-12 h-1 bg-terracotta rounded-full mb-6" />
          <p className="text-secondary font-body-md leading-relaxed mb-4">
            En kristen gave er mer enn bare en gjenstand – det er en oppmuntring til tro og fellesskap. Når du velger en gave fra His Kingdom Designs, gir du et budskap som kan gi styrke i motgang og glede i hverdagen.
          </p>
          <p className="text-secondary font-body-md leading-relaxed">
            Enten du skal i konfirmasjon, dåp, bryllup eller ønsker å overraske en venn med en «tenker på deg»-gave, har vi noe som passer anledningen.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 max-w-3xl">
          <h3 className="font-headline-md text-xl font-bold text-onyx mb-4 flex items-center gap-2">
            <HelpCircle size={20} className="text-terracotta" />
            <span>Vanlige spørsmål om kristne gaver</span>
          </h3>
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="bg-white border border-outline-variant/40 rounded-xl overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-5 flex justify-between items-center gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-bold text-sm text-onyx">{item.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-terracotta transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-5 pb-5 text-sm text-secondary leading-relaxed border-t border-slate-100"
                    >
                      <p className="pt-3">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </motion.main>
  );
}

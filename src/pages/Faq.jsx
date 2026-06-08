import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';
import CmsText from '@/components/CmsText';
import useMeta from '@/hooks/useMeta';

const FAQ_ITEMS = [
  {
    category: 'Frakt & Levering',
    categorySlug: 'faq-category-shipping',
    questions: [
      {
        q: 'Hvor lang tid tar leveringen?',
        a: 'Vi sender ordrer direkte til kunden. Normal leveringstid i Norge er ca 2 uker (Produksjonstid og frakt) avhengig av hvor i landet du bor. Du mottar en e-post med sporingsnummer så snart pakken din er sendt.',
        qSlug: 'faq-shipping-q1',
        aSlug: 'faq-shipping-a1'
      },
      {
        q: 'Hva koster frakten?',
        a: 'Vi tilbyr gratis standardfrakt på alle bestillinger over 1500 kr. For bestillinger under dette beløpet beregnes fraktprisen ut fra vekten til pakken, og starter på 39 kr.',
        qSlug: 'faq-shipping-q2',
        aSlug: 'faq-shipping-a2'
      },
      {
        q: 'Sender dere til utlandet?',
        a: 'Ja, vi sender til hele verden! Fraktpriser og leveringstider til utlandet vil beregnes i kassen basert på leveringsadressen din.',
        qSlug: 'faq-shipping-q3',
        aSlug: 'faq-shipping-a3'
      }
    ]
  },
  {
    category: 'Betaling & Sikkerhet',
    categorySlug: 'faq-category-payment',
    questions: [
      {
        q: 'Hvilke betalingsmetoder kan jeg bruke?',
        a: 'Du kan betale trygt og enkelt med Vipps på mobil, eller bruke vanlige debet- og kredittkort (Visa, Mastercard, American Express). Alle transaksjoner er fullstendig krypterte og håndteres sikkert.',
        qSlug: 'faq-payment-q1',
        aSlug: 'faq-payment-a1'
      },
      {
        q: 'Får jeg kvittering på kjøpet mitt?',
        a: 'Ja, du mottar en ordrebekreftelse på e-post umiddelbart etter at bestillingen er gjennomført. En formell kvittering/faktura sendes også sammen med produktene i forsendelsen din.',
        qSlug: 'faq-payment-q2',
        aSlug: 'faq-payment-a2'
      }
    ]
  },
  {
    category: 'Produkter & Størrelser',
    categorySlug: 'faq-category-products',
    questions: [
      {
        q: 'Hvordan er klærne i størrelsen?',
        a: 'Klærne våre følger standard skandinaviske størrelser. Vi tilbyr størrelser opp til 3XL på de fleste av våre plagg, og utvalgte plagg opp til 5XL. Våre t-skjorter og hettegensere er laget av 100% organisk bomull og har en myk, tidsriktig passform. Se vår størrelsesguide inne på produktsidene for nøyaktige mål.',
        qSlug: 'faq-products-q1',
        aSlug: 'faq-products-a1'
      },
      {
        q: 'Hvordan bør jeg vaske klærne for at motivet skal holde best mulig?',
        a: 'Vi anbefaler å vaske klærne på 30 grader med innsiden ut. Unngå tørketrommel og stryking direkte på motivet for å bevare trykket lengst mulig.',
        qSlug: 'faq-products-q2',
        aSlug: 'faq-products-a2'
      },
      {
        q: 'Tilbyr dere spesialdesignede plakater eller motiver?',
        a: 'Ja! Vi gjør regelmessig tilpasninger og tar imot forespørsler om egne bibelvers eller formater. Send oss en e-post på post@hiskingdomministry.no med dine tanker, så hjelper vi deg.',
        qSlug: 'faq-products-q3',
        aSlug: 'faq-products-a3'
      }
    ]
  },
  {
    category: 'Månedspakker & Abonnement',
    categorySlug: 'faq-category-subscription',
    questions: [
      {
        q: 'Er det bindingstid på månedspakkene?',
        a: 'Nei, det er absolutt ingen bindingstid på abonnementsløsningene våre. Du kan når som helst endre, pause eller avslutte abonnementet ditt direkte via profilsiden din eller ved å sende oss en e-post.',
        qSlug: 'faq-subscription-q1',
        aSlug: 'faq-subscription-a1'
      },
      {
        q: 'Når sendes månedspakken ut?',
        a: 'Månedspakkene pakkes og sendes ut fra Lyngdal den 10. hver måned. Betalingen trekkes automatisk på samme dato hver måned inntil du eventuelt avslutter.',
        qSlug: 'faq-subscription-q2',
        aSlug: 'faq-subscription-a2'
      }
    ]
  }
];

export default function Faq() {
  useMeta(
    "Ofte stilte spørsmål (FAQ)",
    "Finn svar på ofte stilte spørsmål om frakt, leveringstider, betaling, størrelser og retur hos His Kingdom Designs."
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (key) => {
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filter questions based on search query
  const filteredFaq = FAQ_ITEMS.map(category => {
    const questions = category.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, questions };
  }).filter(category => category.questions.length > 0);

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Header */}
      <div className="text-center mb-16">
        <CmsText
          slug="faq-badge"
          fallback="FAQ"
          as="span"
          className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold"
        />
        <CmsText
          slug="faq-title"
          fallback="Ofte stilte spørsmål"
          as="h1"
          className="font-headline-xl text-headline-xl text-onyx mb-6"
        />
        <CmsText
          slug="faq-desc"
          fallback="Finn raske svar på spørsmål om levering, betaling, størrelser og våre populære månedspakker."
          as="p"
          className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto leading-relaxed"
        />
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto mb-16">
        <input 
          type="text"
          placeholder="Søk i spørsmål og svar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-outline-variant/65 rounded-xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:ring-1 focus:ring-terracotta focus:border-terracotta text-onyx shadow-sm placeholder:text-secondary/50"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50" size={18} />
      </div>

      {/* FAQ Accordions */}
      <div className="space-y-12 mb-20">
        {filteredFaq.length > 0 ? (
          filteredFaq.map((cat, catIdx) => (
            <div key={cat.category} className="space-y-4">
              <CmsText
                slug={cat.categorySlug}
                fallback={cat.category}
                as="h2"
                className="font-headline-md text-headline-md text-onyx border-b border-outline-variant/30 pb-2 mb-6 font-bold uppercase tracking-wider text-sm block"
              />
              <div className="space-y-3">
                {cat.questions.map((item, qIdx) => {
                  const itemKey = `${catIdx}-${qIdx}`;
                  const isOpen = !!openItems[itemKey];
                  return (
                    <div 
                      key={item.q}
                      className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm"
                    >
                      <button
                        onClick={() => toggleItem(itemKey)}
                        className="w-full flex items-center justify-between p-5 text-left font-label-md text-label-md text-onyx hover:bg-slate-50 transition-colors"
                      >
                        <CmsText
                          slug={item.qSlug}
                          fallback={item.q}
                          as="span"
                          className="font-bold pr-4"
                        />
                        <ChevronDown 
                          size={18} 
                          className={`text-secondary shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="p-5 pt-0 border-t border-slate-50 font-body-md text-body-md text-secondary leading-relaxed bg-slate-50/30">
                              <CmsText
                                slug={item.aSlug}
                                fallback={item.a}
                                as="p"
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <HelpCircle size={48} className="text-terracotta/30 mx-auto mb-4" />
            <p className="text-secondary font-body-md">Ingen spørsmål eller svar matchet søket ditt. Prøv et annet søkeord.</p>
          </div>
        )}
      </div>

      {/* Support section */}
      <div className="bg-parchment border border-outline-variant/40 rounded-3xl p-10 text-center max-w-2xl mx-auto space-y-4">
        <CmsText
          slug="faq-support-title"
          fallback="Finner du ikke svar på det du lurer på?"
          as="h3"
          className="font-headline-md text-headline-md text-onyx font-bold"
        />
        <p className="font-body-md text-secondary leading-relaxed">
          Send oss gjerne en e-post direkte på <CmsText slug="faq-support-email" fallback="post@hiskingdomministry.no" as="strong" className="text-terracotta" />. Vi svarer vanligvis innen få timer på virkedager!
        </p>
      </div>
    </motion.main>
  );
}

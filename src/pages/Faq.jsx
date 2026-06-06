import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, HelpCircle } from 'lucide-react';

const FAQ_ITEMS = [
  {
    category: 'Frakt & Levering',
    questions: [
      {
        q: 'Hvor lang tid tar leveringen?',
        a: 'Vi sender alle ordrer fra vårt lager i Mandal innen 24 timer. Normal leveringstid er 2-4 virkedager, avhengig av hvor i landet du bor. Du mottar en e-post med sporingsnummer så snart pakken din er sendt.'
      },
      {
        q: 'Hva koster frakten?',
        a: 'Vi tilbyr gratis standardfrakt på alle bestillinger over 800 kr. For bestillinger under dette beløpet er standard fraktpris 49 kr.'
      },
      {
        q: 'Sender dere til utlandet?',
        a: 'Foreløpig sender vi primært til adresser i Norge. Dersom du ønsker levering til utlandet, ta kontakt med oss på e-post før du bestiller, så skal vi se hva vi kan ordne.'
      }
    ]
  },
  {
    category: 'Betaling & Sikkerhet',
    questions: [
      {
        q: 'Hvilke betalingsmetoder kan jeg bruke?',
        a: 'Du kan betale trygt og enkelt med Vipps på mobil, eller bruke vanlige debet- og kredittkort (Visa, Mastercard, American Express). Alle transaksjoner er fullstendig krypterte og håndteres sikkert.'
      },
      {
        q: 'Får jeg kvittering på kjøpet mitt?',
        a: 'Ja, du mottar en ordrebekreftelse på e-post umiddelbart etter at bestillingen er gjennomført. En formell kvittering/faktura sendes også sammen med produktene i forsendelsen din.'
      }
    ]
  },
  {
    category: 'Produkter & Størrelser',
    questions: [
      {
        q: 'Hvordan er klærne i størrelsen?',
        a: 'Klærne våre følger standard skandinaviske størrelser. Våre t-skjorter og hettegensere er laget av 100% organisk bomull og har en myk, tidsriktig passform. Se vår størrelsesguide inne på produktsidene for nøyaktige mål.'
      },
      {
        q: 'Hvordan bør jeg vaske klærne for at motivet skal holde best mulig?',
        a: 'Vi anbefaler å vaske klærne på 30 grader med innsiden ut. Unngå tørketrommel og stryking direkte på motivet for å bevare trykket lengst mulig.'
      },
      {
        q: 'Tilbyr dere spesialdesignede plakater eller motiver?',
        a: 'Ja! Vi gjør regelmessig tilpasninger og tar imot forespørsler om egne bibelvers eller formater. Send oss en e-post på kontakt@hiskingdom.no med dine tanker, så hjelper vi deg.'
      }
    ]
  },
  {
    category: 'Månedspakker & Abonnement',
    questions: [
      {
        q: 'Er det bindingstid på månedspakkene?',
        a: 'Nei, det er absolutt ingen bindingstid på abonnementsløsningene våre. Du kan når som helst endre, pause eller avslutte abonnementet ditt direkte via profilsiden din eller ved å sende oss en e-post.'
      },
      {
        q: 'Når sendes månedspakken ut?',
        a: 'Månedspakkene pakkes og sendes ut fra Mandal den 10. hver måned. Betalingen trekkes automatisk på samme dato hver måned inntil du eventuelt avslutter.'
      }
    ]
  }
];

export default function Faq() {
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
        <span className="text-terracotta font-label-md text-label-md uppercase tracking-widest mb-3 block font-semibold">
          FAQ
        </span>
        <h1 className="font-headline-xl text-headline-xl text-onyx mb-6">
          Ofte stilte spørsmål
        </h1>
        <p className="font-body-lg text-body-lg text-secondary max-w-2xl mx-auto leading-relaxed">
          Finn raske svar på spørsmål om levering, betaling, størrelser og våre populære månedspakker.
        </p>
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
              <h2 className="font-headline-md text-headline-md text-onyx border-b border-outline-variant/30 pb-2 mb-6 font-bold uppercase tracking-wider text-sm">
                {cat.category}
              </h2>
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
                        <span className="font-bold pr-4">{item.q}</span>
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
                              {item.a}
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
        <h3 className="font-headline-md text-headline-md text-onyx font-bold">Finner du ikke svar på det du lurer på?</h3>
        <p className="font-body-md text-secondary leading-relaxed">
          Send oss gjerne en e-post direkte på <strong className="text-terracotta">kontakt@hiskingdom.no</strong>. Vi svarer vanligvis innen få timer på virkedager!
        </p>
      </div>
    </motion.main>
  );
}

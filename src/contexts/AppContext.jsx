import React, { createContext, useState, useEffect, useContext } from 'react';

// Context API Sikkerhetsnett: Initialiser med tom brakett for å unngå "White screen of death"
export const AppContext = createContext({});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Complete product list based on downloaded e-commerce pages
const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Kingdom Life T-skjorte',
    price: 299,
    originalPrice: 399,
    category: 'Klær',
    gender: 'Herre',
    colors: ['#151A21', '#FFFFFF', '#E5E7EB', '#2F4F4F', '#CC712B'], // Onyx, White, Gray, Dark Green, Terracotta
    colorNames: ['Sort', 'Hvit', 'Grå', 'Mørk Grønn', 'Terracotta'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvS2Gg9UZVHCgiu1KenEmwd5GVGafLFLseCDyq34GzrgmK2lY1n2cZdrPOPblGw4Gkqkj89qqoFGdbACf_1m3Aqnn_AlwMZGv1jJ-kZhqmNEY4D0pQGA_Jlsk31RFVpCrbzrNe-WT5MA4eA0tacKmy6s0kSbGni7XNK3ncagu0iiUDLksVxADnEBj6qd5AOHqYMSMZK0bId_Jb5wXfO5b4eU3WaNDC-WjI9dFAJ6rXUgXFSLRBLqmbUcA',
    isBestseller: true,
    isSale: true,
    description: 'En kvalitets t-skjorte i organisk bomull med et kraftfullt budskap. Designet for komfort og stil, perfekt til hverdagsbruk.',
    subcategories: ['T-shirts', 'Klær', 'NORSKE produkter', 'Jesus', 'Bestselgere', 'Populære produkter']
  },
  {
    id: 'prod-2',
    name: 'Faithful Floral Tee',
    price: 349,
    category: 'Klær',
    gender: 'Dame',
    colors: ['#FFFFFF', '#E5E7EB', '#CC712B'],
    colorNames: ['Hvit', 'Grå', 'Terracotta'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvxjkiJesj28gRKog41etEjFio3rjm7GxP7Z0GGpUX73AoFQGGEkX1odNJxGbd2c3oTDwbnQgcT3t2N4ycCMDBcWQ5aUBFZs_EK4PonHa3ToJEVG4lEPoqkX2z8CbyU6_UFwm-dG4OjO9lZKjTH0Jr20F7USM1vgDaJ_gKDbRZNDB_GB3vxA2T9RUnD5kuFTgT4NpDBt6K3s0iDF8qSHe3Q1NtC35vhxNkNa230bEgy6hNvzCvNZk97Yw',
    isBestseller: false,
    isSale: false,
    description: 'En elegant og feminin t-skjorte med et vakkert blomsterbroderi og et diskret trosbudskap.',
    subcategories: ['Dameklær', 'T-shirts', 'Klær', 'ENGLISH products', 'Romantisk']
  },
  {
    id: 'prod-3',
    name: 'Grace Oversized Tee',
    price: 449,
    category: 'Klær',
    gender: 'Unisex',
    colors: ['#FFFFFF', '#E5E7EB', '#151A21'],
    colorNames: ['Hvit', 'Grå', 'Sort'],
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLszihbNKwjOsKdnixf-5r35a6Xba2jlEmuqK6Ow72s8KEL52iJCXqZJrshr6YDlc03OqnuU4KZvmcKRaGwOX7Idbd9VsvxGhNJ8V30WGHf6RRHtzg7bw5ZarKCFYFpP05FYaleB_OCre6P4QrICKQyWws5x-mYsQlu2fhc91h9_obAeP-jeSREE2bDD9RVgwfg1vfpj_wKCPLkN1l4b9MD3SgYwtLtb9RddUykqMykJvv9U4mu43gvsDA',
    isBestseller: false,
    isSale: false,
    description: 'En tidsriktig oversized t-skjorte i tykk, premium bomull. Gir en avslappet look samtidig som den bærer et klart budskap om nåde.',
    subcategories: ['T-shirts', 'Klær', 'ENGLISH products', 'Minimalistisk']
  },
  {
    id: 'prod-4',
    name: 'Little Disciple T-skjorte',
    price: 199,
    category: 'Klær',
    gender: 'Barn',
    colors: ['#FFFFFF', '#E5E7EB', '#CC712B'],
    colorNames: ['Hvit', 'Grå', 'Terracotta'],
    sizes: ['XS', 'S', 'M', 'L'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLv4J8V9jg3579mtqffcPAu_gt1Na1gEpE7X2qkAgryCvtPcOeh0ESfU5U4aLEjB0IMpT9kSdNoYM4An6sQBmkw6iHxUGd4sZ04mdGRPb-szj-DhKGq_ORxArSsY9NhLzzjNhzbqcLZTQdFBEFGTHxiyiAWfuVJ8xBYqPFNjDAHrpPJ_fVO4ypnMcsTbpOVVWijZb7ZpeYQO1ZnuBj9LwVcbOLKJh3vm-vSIveIXCSboeE06hSbr6aV2uw',
    isBestseller: false,
    isSale: false,
    description: 'En søt og slitesterk t-skjorte for de minste disiplene. Laget i supermyk økologisk bomull som tåler lek og moro.',
    subcategories: ['BARN & UNGDOM', 'T-shirts', 'Klær', 'ENGLISH products', 'Mirakel familie']
  },
  {
    id: 'prod-5',
    name: 'Herren velsigne deg T-skjorte',
    price: 299,
    category: 'Klær',
    gender: 'Unisex',
    colors: ['#FFFFFF', '#151A21', '#E5E7EB', '#CC712B'],
    colorNames: ['Hvit', 'Sort', 'Grå', 'Terracotta'],
    sizes: ['S', 'M', 'L', 'XL'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLv4J8V9jg3579mtqffcPAu_gt1Na1gEpE7X2qkAgryCvtPcOeh0ESfU5U4aLEjB0IMpT9kSdNoYM4An6sQBmkw6iHxUGd4sZ04mdGRPb-szj-DhKGq_ORxArSsY9NhLzzjNhzbqcLZTQdFBEFGTHxiyiAWfuVJ8xBYqPFNjDAHrpPJ_fVO4ypnMcsTbpOVVWijZb7ZpeYQO1ZnuBj9LwVcbOLKJh3vm-vSIveIXCSboeE06hSbr6aV2uw',
    isBestseller: true,
    isSale: false,
    description: 'Vår absolutte signatur-tee. Bærer det kjente velsignelses-skriftstedet i et minimalistisk og moderne oppsett.',
    subcategories: ['T-shirts', 'Klær', 'NORSKE produkter', 'Jesus', 'Bestselgere', 'Populære produkter']
  },
  {
    id: 'prod-6',
    name: 'Velsignelse Klistermerkepakke',
    price: 149,
    category: 'Klistermerker',
    colors: [],
    colorNames: [],
    sizes: [],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfCwmveP54NauV6GCq3jtT5CjyWuJFfm53P5Q0CntpY-e7aw2HolefBgeW-AMyk4iOfA-TDFxp80p5xzHIuML2F6n6fxD0uVxwWsviy9DemPlDrR0TuL3sE3xZcj8EbqNcUtRmELU7Y5ykw2TLqLQ7n_y1SbOLkZ2AVq6AYBpn3Wv7pkW3FQebSA0j79zbEbUzAFWKtxHx026HAm5rglxhqmuRnLBVDc3O9odDTpgmCebozSHO046JA-vEO7T0IpGTRNsiwoUOLA',
    isBestseller: true,
    isSale: false,
    description: 'En pakke med 8 ulike slitesterke vinyl-klistermerker med oppmuntrende bibelvers og symboler.',
    subcategories: ['Klistermerker', 'NORSKE produkter', 'Jesus', 'Bestselgere', 'Populære produkter']
  },
  {
    id: 'prod-7',
    name: 'Guds Fred Plakat (A3)',
    price: 199,
    originalPrice: 299,
    category: 'Plakater',
    colors: [],
    colorNames: [],
    sizes: ['A3', 'A4'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPD4ddRN2WNZGZeGxJgL2xYoQca5tBXUENCvryqkqiw4vveF9yvBt7sZ_igqbUvRn034YKCaoMyZyjbs49kKCF3f_cBAW-HU_vLxuWyPRz8zfDWkemX8Dq-jkSZyVOFq0vQsmHaD-U9lRDdYjSPXCGL_WvoW1WpmFVh6OhPrvFFb33vErx2sk0GUQ66oSOY8Sl9s6bxlcpCcVaoU3VaYZTR3wuC-o0fclh3hbveTO5w2DOGajJ3L8SuiKug3bFXgpjrPParjMlfg',
    isBestseller: false,
    isSale: true,
    description: 'Et minimalistisk og elegant kunsttrykk med skriftstedet om Guds fred som overgår all forstand.',
    subcategories: ['Bilder og plakater', 'Minimalistisk', 'NORSKE produkter', 'Svart-hvit', 'Maleri']
  },
  {
    id: 'prod-8',
    name: 'Embroidered Beanie',
    price: 329,
    category: 'Tilbehør',
    colors: ['#151A21', '#CC712B'],
    colorNames: ['Sort', 'Terrakotta'],
    sizes: ['One Size'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLslJCwuNK98ENTsmevd1XZVQ0AYvB63yFBF6VFoj6YsZbOmGnRLWeX0QYRbUgdidhARkJJp0psfGKrJ75-E3GcXbYVkTBqZd-UJssP5At3Uaugj1_AgjWlOse2vRiESTvsCFQnGmH---LF_0wlE8J2Gy4ElY3-53-URuRyGdhNL1wwx8TZkF1hQwG6yC2qq8TJdSxHofICpOWqEwH8_DZTvt0jV5onP6PGtiiepaRU_9VFG8mapnEH3Gw',
    isBestseller: false,
    isSale: false,
    description: 'En varm og lun lue med brodert krone-detalj. Laget i myk, elastisk strikk.',
    subcategories: ['Tilbehør', 'Hatter /caps', 'ENGLISH products']
  },
  {
    id: 'prod-9',
    name: 'Kingdom Phone Case',
    price: 289,
    category: 'Tilbehør',
    colors: ['#151A21', '#CC712B', '#D4C4B5'],
    colorNames: ['Sort', 'Terrakotta', 'Beige'],
    sizes: ['iPhone 13', 'iPhone 14', 'iPhone 15'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtxy7b2t4ReBQEpdU-xdZ2kCnl2UpDNkd8DehvIkXz3cNrFYRvwDKpbTuAW4dcRyZSowggzen0ojoy3ZSbWMEc30-dDmJXHPFz7Q_9uJ8Rvx8tD1tK6YJXJSjDOmPpoeBDD-FiVZLzdsF8MC4nZLkaCqmGCRqatvFOz49FgBg3SeJnqtzMPyDHDEFFM91Xw0g3cHi5q8mo9KW-l87GESrBKRkPPZmfqZm5hvFOzLlXnlH5RhESATdJBjw',
    isBestseller: false,
    isSale: false,
    description: 'Et robust mobildeksel med vakkert, preget design som beskytter telefonen din og minner deg om kongeriket.',
    subcategories: ['Tilbehør', 'Mobildeksel', 'ENGLISH products', 'Spiritual Battle']
  },
  {
    id: 'prod-10',
    name: 'Woven Tote Bag',
    price: 199,
    category: 'Tilbehør',
    colors: ['#E5E7EB', '#CC712B'],
    colorNames: ['Natur', 'Terrakotta'],
    sizes: ['One Size'],
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvZ9LxB_vy0geCI-23OZZG3NkY1bvtYMk9hvZa_D09rxkGXwCrUw8kpXVCbjhpQneGRZBD3eXF8fPwWzRLlDMb7Y2SOns7ym8ayGRvY76i0wP8YK0K46LrSz-jlEWiEuhl-NajQARkVZzUav7cJKQ34kp3L3RCkj0iQTKNfamckPbsbXU6-zufeskjsecr5IMV7HC3OAndRUS6UgQyWmV4RC6RyaCOq9tGQUITX7ePrkoz4RQ9FMOqxPw',
    isBestseller: false,
    isSale: false,
    description: 'Et romslig og slitesterkt handlenett vevd av økologisk bomull. Perfekt til bibel, notatbok eller dagligvarehandel.',
    subcategories: ['Tilbehør', 'Handlenett / Totebag', 'ENGLISH products', 'Jesus']
  },
  {
    id: 'prod-11',
    name: 'Salme 23 Plakat',
    price: 249,
    category: 'Plakater',
    colors: [],
    colorNames: [],
    sizes: ['A3', 'A4'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu3o35G9nlYl0nfPoza5x9mKq5HMS03clg_v2HMWROWJKSWTmVvNz66U4eziJbuZiGbxSOnDZctx_Ea5xIUoAeyFnj3po7-bgCfOCHdSS5YYQSXKFb7etMvOCWoZKo8vMM9Yga3aQsis_odOLs4J3_6QAHeuBssRQljE6OJoM4pQsqN5GEHi-2kxYp4pI_lTp3g1T3xlDA__hfAibdYXRulLQp4hDBEKJ5Dzdv_ZDURnjJoQ6IGOb1St9IkvnumbTioKzZN2ezxQ',
    isBestseller: false,
    isSale: false,
    description: 'Et vakkert kunsttrykk med hele teksten fra Salme 23 ("Herren er min hyrde"). Rammet inn i moderne og elegant oppsett.',
    subcategories: ['Bilder og plakater', 'Typografi', 'NORSKE produkter', 'Retro', 'Maleri']
  }
];

const INITIAL_MESSAGES = [
  {
    id: 'msg-init-1',
    sender: 'assistant',
    text: 'Velkommen til **His Kingdom Designs**! 👋 Jeg er din HKD-assistent. Jeg hjelper deg gjerne med å finne riktig størrelse, fortelle mer om materialene våre, svare på spørsmål om frakt og retur, eller finne det perfekte bibelverset for deg. Hva lurer du på?',
    time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
  }
];

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Chat Assistant State
  const [assistantMessages, setAssistantMessages] = useState(INITIAL_MESSAGES);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [assistantContext, setAssistantContext] = useState({
    title: 'Hjem',
    pageType: 'home',
    url: '/'
  });

  const sendAssistantMessage = (text) => {
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
    };

    setAssistantMessages(prev => [...prev, userMsg]);
    setIsAssistantTyping(true);

    // Dynamic, simulated context-aware response from HKD Assistant
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase().trim();

      if (lower.includes('frakt') || lower.includes('levering') || lower.includes('sende')) {
        reply = '### 🚚 Frakt og Levering\n\n' +
          '- Vi har **gratis frakt på alle bestillinger over 800 kr**!\n' +
          '- For bestillinger under 800 kr koster frakten **49 kr**.\n' +
          '- Vi pakker og sender varer lynraskt – som regel **innen 24 timer** fra vårt lager i Mandal.\n' +
          '- Leveringstid er normalt **2-4 virkedager** med Posten/Bring.\n\n' +
          '💡 Er det noe spesifikt du ønsker å bestille i dag?';
      } 
      else if (lower.includes('retur') || lower.includes('bytte') || lower.includes('fortre')) {
        reply = '### 🔄 Enkel Retur & Bytte\n\n' +
          '- Hos oss har du alltid **30 dagers åpent kjøp** fra du mottar varen.\n' +
          '- Produktet må være ubrukt og i originalemballasjen.\n' +
          '- Du kan enkelt kontakte vår kundeservice på **kontakt@hiskingdomdesigns.no** for å motta en returetikett.\n\n' +
          '💡 Vi ønsker at du skal være 100% fornøyd med kjøpet ditt!';
      } 
      else if (lower.includes('størrelse') || lower.includes('size') || lower.includes('passform')) {
        reply = '### 📏 Størrelsesguide\n\n' +
          '- Våre t-skjorter for herre og unisex har en **standard, komfortabel passform** (true to size).\n' +
          '- `Grace Oversized Tee` er designet for å sitte løst og ledig. Hvis du foretrekker en tettere passform, anbefaler vi å gå ned én størrelse.\n' +
          '- T-skjortene til dame er litt mer figursydde.\n\n' +
          '💡 Du kan velge mellom størrelser fra **XS til 2XL** på de fleste av våre plagg.';
      } 
      else if (lower.includes('materiale') || lower.includes('bomull') || lower.includes('kvalitet')) {
        reply = '### 🌿 Materialer & Bærekraft\n\n' +
          '- Alle våre klær produseres i **100% økologisk bomull**.\n' +
          '- Dette gir en utrolig myk følelse mot huden, god pusteevne og lang holdbarhet.\n' +
          '- Trykkene våre er vannbaserte og miljøvennlige, slik at de holder formen vask etter vask uten å sprekke.\n\n' +
          '💡 Vi anbefaler å vaske plaggene på **30-40 grader med vrangen ut** for å bevare trykket best mulig.';
      } 
      else if (lower.includes('betaling') || lower.includes('vipps') || lower.includes('kort') || lower.includes('visa')) {
        reply = '### 💳 Sikker Betaling\n\n' +
          'Vi tilbyr trygge og raske betalingsløsninger i kassen:\n' +
          '- **Vipps** (enkel betaling med mobilen)\n' +
          '- **Kortbetaling** (Visa og Mastercard via kryptert betalingsløsning)\n\n' +
          '💡 MVA (25%) er inkludert i alle oppgitte priser.';
      }
      else if (lower.includes('t-skjorte') || lower.includes('klær') || lower.includes('kles') || lower.includes('genser') || lower.includes('hoodie')) {
        reply = '### 👕 Våre Klær & T-skjorter\n\n' +
          'Vi har et flott utvalg av kvalitetsklær:\n' +
          '- **Herren velsigne deg T-skjorte** (Vår mest populære signatur-t-skjorte, 299 kr)\n' +
          '- **Kingdom Life T-skjorte** (Salg akkurat nå til 299 kr, før 399 kr)\n' +
          '- **Faithful Floral Tee** (Nydelig dame-tee med blomsterdetaljer, 349 kr)\n' +
          '- **Grace Oversized Tee** (Oversized unisex tee, 449 kr)\n' +
          '- **Little Disciple T-skjorte** (Til barna, 199 kr)\n\n' +
          '💡 Du finner alle under menyen **Klær**! Klikk gjerne dit for å filtrere på farge og størrelse.';
      }
      else if (lower.includes('plakat') || lower.includes('poster') || lower.includes('salme') || lower.includes('bilde')) {
        reply = '### 🖼️ Plakater & Kunsttrykk\n\n' +
          'Pryd veggene hjemme med oppmuntring:\n' +
          '- **Salme 23 Plakat** (Vakkert kunsttrykk med hele hyrdesalmen, 249 kr)\n' +
          '- **Guds Fred Plakat (A3)** (Minimalistisk design på salg til 199 kr, før 299 kr)\n\n' +
          '💡 Plakatene er trykket på tykt, matt kvalitetspapir for et premium uttrykk.';
      }
      else if (lower.includes('sticker') || lower.includes('klister')) {
        reply = '### 🏷️ Klistermerker\n\n' +
          '- Vår populære **Velsignelse Klistermerkepakke** koster **149 kr** og inneholder 8 slitesterke vinyl-klistermerker.\n' +
          '- Perfekt til å dekorere laptopen, vannflasken, bibelen eller mobilen med oppmuntrende budskap.';
      }
      else if (lower.includes('kontakt') || lower.includes('kundeservice') || lower.includes('e-post') || lower.includes('adresse') || lower.includes('telefon')) {
        reply = '### 📞 Kontakt Kundeservice\n\n' +
          'Vi vil gjerne høre fra deg! Du kan kontakte oss på:\n' +
          '- **E-post:** kontakt@hiskingdomdesigns.no\n' +
          '- **Adresse:** Mandal Regnskapskontor / HKD, 4515 Mandal\n\n' +
          '💡 Vi svarer vanligvis innen 24 timer på virkedager.';
      }
      else if (lower.includes('hva handler') || lower.includes('hvor er jeg') || lower.includes('forklar')) {
        reply = `### 🧭 Sideoversikt: ${assistantContext.title}\n\n` +
          `Du er for øyeblikket på siden **${assistantContext.title}**.\n\n` +
          `Her kan du utforske vårt utvalg av kristne kvalitetsprodukter som er designet for å inspirere og spre Guds ord. Spør meg gjerne hvis du trenger hjelp med å finne noe her!`;
      }
      else {
        reply = '### 🛡️ His Kingdom Designs\n\n' +
          'Vi ønsker å spre Guds ord gjennom vakker og moderne design. Alle produktene våre er laget for å starte gode samtaler og gi oppmuntring i hverdagen.\n\n' +
          'Du kan spørre meg om:\n' +
          '• Våre **produkter** (Klær, Plakater, Klistermerker, Tilbehør)\n' +
          '• **Frakt** og leveringstider\n' +
          '• **Bytte og retur** av varer\n' +
          '• **Størrelser** og passform\n\n' +
          'Hva kan jeg hjelpe deg med?';
      }

      setAssistantMessages(prev => [...prev, {
        id: `msg-ast-${Date.now()}`,
        sender: 'assistant',
        text: reply,
        time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsAssistantTyping(false);
    }, 1000);
  };

  return (
    <AppContext.Provider value={{
      products,
      mobileMenuOpen,
      setMobileMenuOpen,
      searchOpen,
      setSearchOpen,
      searchQuery,
      setSearchQuery,
      assistantMessages,
      isAssistantTyping,
      assistantContext,
      setAssistantContext,
      sendAssistantMessage
    }}>
      {children}
    </AppContext.Provider>
  );
};

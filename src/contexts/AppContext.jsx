import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '@/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { wixClient } from '@/lib/wix';

// Context API Sikkerhetsnett: Initialiser med tom brakett for å unngå "White screen of death"
export const AppContext = createContext({});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const parseHex = (hexStr) => {
  let hex = hexStr.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

const parseRgb = (rgbStr) => {
  const match = rgbStr.match(/\d+/g);
  if (match && match.length >= 3) {
    return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
  }
  return { r: 128, g: 128, b: 128 };
};

const getClosestColor = (r, g, b) => {
  const standards = [
    { name: 'Sort', r: 21, g: 26, b: 33, hex: '#151A21' },
    { name: 'Hvit', r: 255, g: 255, b: 255, hex: '#FFFFFF' },
    { name: 'Grå', r: 229, g: 231, b: 235, hex: '#E5E7EB' },
    { name: 'Blå', r: 59, g: 130, b: 246, hex: '#3b82f6' },
    { name: 'Mørkeblå', r: 27, g: 73, b: 101, hex: '#1B4965' },
    { name: 'Rød', r: 239, g: 68, b: 68, hex: '#ef4444' },
    { name: 'Grønn', r: 22, g: 163, b: 74, hex: '#16a34a' },
    { name: 'Gul', r: 234, g: 179, b: 8, hex: '#eab308' },
    { name: 'Rosa', r: 219, g: 39, b: 119, hex: '#db2777' },
    { name: 'Beige', r: 212, g: 196, b: 181, hex: '#d4c4b5' },
    { name: 'Terrakotta', r: 204, g: 113, b: 43, hex: '#CC712B' },
    { name: 'Orange', r: 249, g: 115, b: 22, hex: '#f97316' },
    { name: 'Lilla', r: 168, g: 85, b: 247, hex: '#a855f7' }
  ];

  let minDistance = Infinity;
  let closest = standards[0];

  standards.forEach(std => {
    const dist = Math.sqrt(
      Math.pow(r - std.r, 2) +
      Math.pow(g - std.g, 2) +
      Math.pow(b - std.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = std;
    }
  });

  return closest;
};

export const resolveColor = (rawName) => {
  if (!rawName) return { name: 'Sort', hex: '#151A21' };
  
  let trimName = rawName.trim();
  
  const capitalize = (str) => {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // If it's a dual color split by /
  if (trimName.includes('/')) {
    const parts = trimName.split('/');
    const res1 = resolveColor(parts[0]);
    const res2 = resolveColor(parts[1]);
    const formattedName = [res1.name, res2.name].join('/');
    const gradient = `linear-gradient(135deg, ${res1.hex} 50%, ${res2.hex} 50%)`;
    return { name: formattedName, hex: gradient };
  }

  const lower = trimName.toLowerCase();
  
  // 1. Check if it's an rgb or hex code and classify using RGB distance
  if (lower.startsWith('rgb') || lower.startsWith('#')) {
    const { r, g, b } = lower.startsWith('#') ? parseHex(lower) : parseRgb(lower);
    const closest = getClosestColor(r, g, b);
    return { name: closest.name, hex: closest.hex };
  }

  // 2. Friendly name matching with expanded dictionary
  let displayName = capitalize(trimName);
  let hexCode = '#888888';

  if (lower.includes('sort') || lower.includes('svart') || lower.includes('black') || lower.includes('charcoal') || lower.includes('coal') || lower.includes('dark grey') || lower.includes('night')) {
    displayName = 'Sort';
    hexCode = '#151A21';
  } else if (lower.includes('hvit') || lower.includes('white') || lower.includes('off-white') || lower.includes('weiß') || lower.includes('ivory') || lower.includes('bone') || lower.includes('soft cream')) {
    displayName = 'Hvit';
    hexCode = '#FFFFFF';
  } else if (lower.includes('navy') || lower.includes('marine') || lower.includes('mørkeblå') || lower.includes('deep teal') || lower.includes('teal') || lower.includes('sapphire') || lower.includes('storm')) {
    displayName = 'Mørkeblå';
    hexCode = '#1B4965';
  } else if (lower.includes('royalblue') || lower.includes('royal') || lower.includes('carolina blue') || lower.includes('blue') || lower.includes('blå') || lower.includes('denim') || lower.includes('cornflower') || lower.includes('aqua') || lower.includes('caribbean') || lower.includes('chambray') || lower.includes('sky') || lower.includes('ocean') || lower.includes('chill')) {
    displayName = 'Blå';
    hexCode = '#3b82f6';
  } else if (lower.includes('rød') || lower.includes('red') || lower.includes('maroon') || lower.includes('burgundy') || lower.includes('garnet') || lower.includes('cherry') || lower.includes('cardinal') || lower.includes('bright salmon') || lower.includes('watermelon')) {
    displayName = 'Rød';
    hexCode = '#ef4444';
  } else if (lower.includes('grønn') || lower.includes('green') || lower.includes('forest') || lower.includes('olive') || lower.includes('oliven') || lower.includes('military') || lower.includes('kelly') || lower.includes('irish') || lower.includes('army') || lower.includes('mint') || lower.includes('dusty sage') || lower.includes('fern') || lower.includes('kiwi') || lower.includes('neo mint') || lower.includes('cool mint') || lower.includes('chalky mint') || lower.includes('pistachio')) {
    displayName = 'Grønn';
    hexCode = '#16a34a';
  } else if (lower.includes('gul') || lower.includes('yellow') || lower.includes('gold') || lower.includes('butter') || lower.includes('citron') || lower.includes('daisy') || lower.includes('mustard')) {
    displayName = 'Gul';
    hexCode = '#eab308';
  } else if (lower.includes('rosa') || lower.includes('pink') || lower.includes('azalea') || lower.includes('heliconia') || lower.includes('orchid') || lower.includes('fuchsia') || lower.includes('cotton candy') || lower.includes('peach') || lower.includes('coral') || lower.includes('coral silk') || lower.includes('tangerine') || lower.includes('berry') || lower.includes('mauve') || lower.includes('hibiscus')) {
    displayName = 'Rosa';
    hexCode = '#db2777';
  } else if (lower.includes('beige') || lower.includes('sand') || lower.includes('natural') || lower.includes('stone') || lower.includes('khaki') || lower.includes('tan') || lower.includes('rope') || lower.includes('toast') || lower.includes('saddle') || lower.includes('cocoa') || lower.includes('umber') || lower.includes('dark chocolate') || lower.includes('triblend brown') || lower.includes('natur')) {
    displayName = 'Beige';
    hexCode = '#d4c4b5';
  } else if (lower.includes('terrakotta') || lower.includes('terracotta') || lower.includes('clay')) {
    displayName = 'Terrakotta';
    hexCode = '#CC712B';
  } else if (lower.includes('orange') || lower.includes('tangerine')) {
    displayName = 'Orange';
    hexCode = '#f97316';
  } else if (lower.includes('lilla') || lower.includes('purple') || lower.includes('lavender') || lower.includes('amethyst') || lower.includes('lilak') || lower.includes('future lavender')) {
    displayName = 'Lilla';
    hexCode = '#a855f7';
  } else if (lower.includes('grå') || lower.includes('grey') || lower.includes('gray') || lower.includes('ash') || lower.includes('silver') || lower.includes('cement') || lower.includes('sport grey') || lower.includes('heather') || lower.includes('gravel') || lower.includes('smoke') || lower.includes('paragon')) {
    displayName = 'Grå';
    hexCode = '#E5E7EB';
  }

  // Fallback to closest color if we resolved to standard gray fallback but have a specific name
  if (hexCode === '#888888') {
    return { name: 'Grå', hex: '#E5E7EB' };
  }

  return { name: displayName, hex: hexCode };
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
    subcategories: ['Tilbehør', 'Hatter /caps', 'Hats/Caps', 'Hats/caps', 'caps', 'ENGLISH products']
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
    subcategories: ['Tilbehør', 'Handlenett / Totebag', 'Handlenett/Totebag', 'totebag', 'ENGLISH products', 'Jesus']
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
    isBestseller: true,
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

const FALLBACK_TAXONOMY = {
  'Klær & Bekledning': ['Klær', 'Dameklær', 'Genser', 'Joggebukser', 'T-shirts', 'Hatter /caps', 'Sport / Performance /Outdoor', 'RUSS'],
  'Bilder & Kunst': ['Bilder og plakater', 'Maleri', 'Fotografi', 'Typografi', 'Abstrakt', 'Minimalistisk', 'Fargerik', 'Svart-hvit', 'Retro', 'Romantisk', 'Whimsical'],
  'Tilbehør & Hjem': ['Tilbehør', 'armbånd og smykker', 'Handlenett / Totebag', 'Kopper og flasker', 'Mobildeksel', 'Klistermerker', 'Barnerom'],
  'Barn & Familie': ['BABY', 'BARN & UNGDOM', 'Mirakel familie'],
  'Temaer & Språk': ['Jesus', 'Israel', 'Spiritual Battle', 'Humor', 'Undervisning', 'Varna - Evangeliesenteret Bibelskole', 'Høytider', 'CHRISTMAS', 'PÅSKE', 'Abonnement', 'Digitale filer', 'Kreative bøker', 'NORSKE produkter', 'ENGLISH products', 'ESPAÑOL']
};

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [wixCollections, setWixCollections] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate dynamic taxonomy from Wix collections with fallback
  const categoryTaxonomy = React.useMemo(() => {
    if (wixCollections.length === 0) {
      return FALLBACK_TAXONOMY;
    }

    const taxonomy = {
      'Klær & Bekledning': [],
      'Bilder & Kunst': [],
      'Tilbehør & Hjem': [],
      'Barn & Familie': [],
      'Temaer & Språk': []
    };

    wixCollections.forEach(c => {
      const name = c.name;
      const lower = name.toLowerCase();

           const isKidsFamily = lower.includes('baby') || 
                           lower.includes('barn') || 
                           lower.includes('ungdom') || 
                           lower.includes('familie') || 
                           lower.includes('family') || 
                           lower.includes('kids') || 
                           lower.includes('child') || 
                           lower.includes('boy') || 
                           lower.includes('girl');

      const isClothing = lower.includes('klær') || 
                         lower.includes('genser') || 
                         lower.includes('joggebukse') || 
                         lower.includes('t-shirt') || 
                         lower.includes('hat') || 
                         lower.includes('caps') || 
                         lower.includes('sport') || 
                         lower.includes('russ') || 
                         lower.includes('clothing') || 
                         lower.includes('shirt') || 
                         lower.includes('hoodie') || 
                         lower.includes('sweatshirt') || 
                         lower.includes('jacket') || 
                         lower.includes('socks') || 
                         lower.includes('sweater') || 
                         lower.includes('sweatpants') || 
                         lower.includes('pants');

      const isArt = lower.includes('bilde') || 
                    lower.includes('plakat') || 
                    lower.includes('kunst') || 
                    lower.includes('poster') || 
                    lower.includes('maleri') || 
                    lower.includes('foto') || 
                    lower.includes('typografi') || 
                    lower.includes('abstrakt') || 
                    lower.includes('minimalistisk') || 
                    lower.includes('fargerik') || 
                    lower.includes('svart-hvit') || 
                    lower.includes('retro') || 
                    lower.includes('romantisk') || 
                    lower.includes('whimsical') || 
                    lower.includes('art') || 
                    lower.includes('print');

      const isAccessory = lower.includes('tilbehør') || 
                          lower.includes('smykke') || 
                          lower.includes('jewelry') || 
                          lower.includes('armbånd') || 
                          lower.includes('bracelet') || 
                          lower.includes('bag') || 
                          lower.includes('tote') || 
                          lower.includes('kopp') || 
                          lower.includes('flaske') || 
                          lower.includes('cups') || 
                          lower.includes('bottle') || 
                          lower.includes('deksel') || 
                          lower.includes('cover') || 
                          lower.includes('klister') || 
                          lower.includes('sticker') || 
                          lower.includes('mug') || 
                          lower.includes('accessory') || 
                          lower.includes('accessories') || 
                          lower.includes('home') || 
                          lower.includes('barnerom') || 
                          lower.includes('book');

      if (isKidsFamily) {
        taxonomy['Barn & Familie'].push(name);
      } else if (isClothing) {
        taxonomy['Klær & Bekledning'].push(name);
      } else if (isArt) {
        taxonomy['Bilder & Kunst'].push(name);
      } else if (isAccessory) {
        taxonomy['Tilbehør & Hjem'].push(name);
      } else {
        taxonomy['Temaer & Språk'].push(name);
      }
    });

    // Sort subcategories alphabetically
    Object.keys(taxonomy).forEach(key => {
      taxonomy[key].sort((a, b) => a.localeCompare(b, 'no'));
    });

    return taxonomy;
  }, [wixCollections]);

  // CMS & Admin States
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [cmsContent, setCmsContent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hkm-cms-content') || '{}');
    } catch {
      return {};
    }
  });
  const [toastMessage, setToastMessage] = useState(null);

  // Wix Auth & Member States
  const [member, setMember] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => wixClient.auth.loggedIn());

  useEffect(() => {
    const handleAuthChange = async () => {
      const logged = wixClient.auth.loggedIn();
      setIsLoggedIn(logged);
      if (logged) {
        try {
          const res = await wixClient.members.getCurrentMember();
          if (res && res.member) {
            setMember(res.member);
          }
        } catch (e) {
          console.error('Failed to get current member in AppContext:', e);
        }
      } else {
        setMember(null);
      }
    };

    handleAuthChange();
    window.addEventListener('wix-auth-change', handleAuthChange);
    return () => window.removeEventListener('wix-auth-change', handleAuthChange);
  }, []);

  // Wishlist States
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('hkd-wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hkd-wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Live sync wishlist from Firestore if logged in
  useEffect(() => {
    if (isLoggedIn && member?._id) {
      const docRef = doc(db, 'wishlists', member._id);
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const dbWishlist = docSnap.data().items || [];
          setWishlist(dbWishlist);
        }
      }, (err) => {
        console.warn('Error listening to wishlist in Firestore:', err);
      });
      return () => unsubscribe();
    }
  }, [isLoggedIn, member?._id]);

  // Merge local wishlist with cloud wishlist upon login
  useEffect(() => {
    const mergeWishlists = async () => {
      if (isLoggedIn && member?._id) {
        const docRef = doc(db, 'wishlists', member._id);
        try {
          const docSnap = await getDoc(docRef);
          let cloudItems = [];
          if (docSnap.exists()) {
            cloudItems = docSnap.data().items || [];
          }
          
          // Get local items
          const localSaved = localStorage.getItem('hkd-wishlist');
          const localItems = localSaved ? JSON.parse(localSaved) : [];
          
          if (localItems.length > 0) {
            const merged = [...cloudItems];
            localItems.forEach(localItem => {
              if (!merged.some(cloudItem => cloudItem.id === localItem.id)) {
                merged.push(localItem);
              }
            });
            await setDoc(docRef, { items: merged }, { merge: true });
            setWishlist(merged);
            localStorage.setItem('hkd-wishlist', JSON.stringify([]));
          } else {
            setWishlist(cloudItems);
          }
        } catch (err) {
          console.warn('Failed to merge wishlists:', err);
        }
      }
    };
    mergeWishlists();
  }, [isLoggedIn, member?._id]);

  const toggleWishlist = async (product) => {
    let newWishlist;
    const exists = wishlist.some(p => p.id === product.id);
    if (exists) {
      showToast(`Fjernet "${product.name}" fra ønskelisten`);
      newWishlist = wishlist.filter(p => p.id !== product.id);
    } else {
      showToast(`Lagt til "${product.name}" i ønskelisten`);
      newWishlist = [...wishlist, product];
    }
    setWishlist(newWishlist);
    
    if (isLoggedIn && member?._id) {
      try {
        const docRef = doc(db, 'wishlists', member._id);
        await setDoc(docRef, { items: newWishlist }, { merge: true });
      } catch (err) {
        console.error('Failed to save wishlist to Firestore:', err);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Update CMS Content
  const updateCmsContent = async (slug, value) => {
    setCmsContent(prev => {
      const updated = { ...prev, [slug]: value };
      try {
        localStorage.setItem('hkm-cms-content', JSON.stringify(updated));
      } catch (e) {
        console.error('Klarte ikke lagre cms content i localStorage:', e);
      }
      return updated;
    });

    try {
      const cmsDocRef = doc(db, "cms_configs", "designs");
      await setDoc(cmsDocRef, { [slug]: value }, { merge: true });
    } catch (err) {
      console.error("Feil ved oppdatering av CMS-innhold i Firestore:", err);
    }
  };

  // Realtime Sync from Firestore
  useEffect(() => {
    try {
      const cmsDocRef = doc(db, "cms_configs", "designs");
      const unsubscribe = onSnapshot(cmsDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const dbData = snapshot.data();
          setCmsContent(prev => {
            const merged = { ...prev, ...dbData };
            localStorage.setItem('hkm-cms-content', JSON.stringify(merged));
            return merged;
          });
        }
      }, (err) => {
        console.warn("Kunne ikke synkronisere CMS fra Firestore:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Feil ved oppstart av CMS synkronisering:", e);
    }
  }, []);

  // Load products and collections from Wix
  useEffect(() => {
    const fetchWixData = async () => {
      try {
        console.log('Henter produkter fra Wix...');
        const collectionsList = await wixClient.collections.queryCollections().limit(100).find();
        
        const collectionsMap = {};
        collectionsList.items.forEach(c => {
          collectionsMap[c._id] = c.name;
        });

        const collectionsData = collectionsList.items.map(c => ({
          id: c._id,
          name: c.name,
          slug: c.slug
        })).filter(c => c.name !== 'All Products' && c.name !== 'all-products');
        setWixCollections(collectionsData);

        let allItems = [];
        try {
          let response = await wixClient.products.queryProducts().limit(100).find();
          allItems = [...response.items];

          while (response.hasNext()) {
            response = await response.next();
            allItems = [...allItems, ...response.items];
          }
        } catch (productError) {
          console.warn('Wix product fetch failed, checking token validity...', productError);
          
          const isAuthError = productError?.status === 401 || 
                              productError?.message?.includes('401') || 
                              productError?.message?.includes('Unauthorized') || 
                              productError?.message?.includes('Invalid token') ||
                              productError?.message?.includes('invalid_grant') ||
                              productError?.message?.includes('403') ||
                              productError?.message?.includes('Forbidden');

          if (isAuthError && localStorage.getItem('wix_oauth_tokens')) {
            console.warn('Wix auth token invalid or expired. Performing token recovery (logout)...');
            try {
              localStorage.removeItem('wix_oauth_tokens');
              await wixClient.auth.logout();
              window.dispatchEvent(new Event('wix-auth-change'));
            } catch (logoutErr) {
              console.warn('Failed to logout during token recovery:', logoutErr);
            }
          }

          try {
            // Re-fetch collections list to ensure clean OAuth state
            const collectionsListRetry = await wixClient.collections.queryCollections().limit(100).find();
            const collectionsMapRetry = {};
            collectionsListRetry.items.forEach(c => {
              collectionsMapRetry[c._id] = c.name;
            });
            const collectionsDataRetry = collectionsListRetry.items.map(c => ({
              id: c._id,
              name: c.name,
              slug: c.slug
            })).filter(c => c.name !== 'All Products' && c.name !== 'all-products');
            setWixCollections(collectionsDataRetry);

            let responseRetry = await wixClient.products.queryProducts().limit(100).find();
            allItems = [...responseRetry.items];
            while (responseRetry.hasNext()) {
              responseRetry = await responseRetry.next();
              allItems = [...allItems, ...responseRetry.items];
            }
          } catch (retryError) {
            console.error('Wix product fetch retry failed:', retryError);
            throw retryError;
          }
        }

        console.log(`Hentet totalt ${allItems.length} produkter fra Wix.`);

        // Define lists of collection names belonging to each primary category
        const klaerCollections = ['Klær', 'Dameklær', 'Genser', 'Joggebukser', 'T-shirts', 'Hatter /caps', 'Sport / Performance /Outdoor', 'RUSS', 'BABY', 'BARN & UNGDOM'];
        const plakaterCollections = ['Bilder og plakater', 'Maleri', 'Fotografi', 'Typografi', 'Abstrakt', 'Minimalistisk', 'Fargerik', 'Svart-hvit', 'Retro', 'Romantisk', 'Whimsical'];
        const klistermerkerCollections = ['Klistermerker'];

        // Precise regexes with word boundaries for name keyword matching
        const clothingRegex = /\b(genser|gensere|hettegenser|hettegensere|tskjorte|tskjorter|t-skjorte|t-skjorter|tee|tees|body|bodyer|babybody|babybodyer|babysuit|skjorte|skjorter|topp|topper|caps|lue|luer|beanie|beanies|sokker|bukse|bukser|pants|hoodie|hoodies|sweatshirt|sweatshirts|tights|jakke|jakker)\b/i;
        const stickerRegex = /\b(klistremerke|klistremerker|sticker|stickers)\b/i;
        const posterRegex = /\b(plakat|plakater|poster|postere|kunsttrykk|bilde|bilder|canvas)\b/i;

        const mapped = allItems.map(item => {
          const nameLower = item.name.toLowerCase();
          const resolvedCollections = item.collectionIds?.map(id => collectionsMap[id]).filter(Boolean) || [];
          
          let isSticker = resolvedCollections.some(c => klistermerkerCollections.includes(c)) || stickerRegex.test(nameLower);
          let isClothing = resolvedCollections.some(c => klaerCollections.includes(c)) || clothingRegex.test(nameLower);
          let isPoster = resolvedCollections.some(c => plakaterCollections.includes(c)) || posterRegex.test(nameLower);

          let category = 'Tilbehør';
          if (isClothing) {
            category = 'Klær';
          } else if (isSticker) {
            category = 'Klistermerker';
          } else if (isPoster) {
            category = 'Plakater';
          }

          let sizes = [];
          let colors = [];
          let colorNames = [];
          
          if (item.productOptions) {
            const sizeOpt = item.productOptions.find(o => {
              const name = o.name?.trim().toLowerCase();
              return name && (name.includes('size') || name.includes('størrelse') || name.includes('størrelser') || name.includes('format') || name === 'str' || name === 'str.');
            });
            if (sizeOpt) {
              const rawSizes = sizeOpt.choices?.map(c => c.value) || [];
              sizes = rawSizes.filter(s => {
                if (!s) return false;
                if (s.length > 15) return false;
                const lower = s.toLowerCase();
                if (lower.includes('sticker') || lower.includes('mug') || lower.includes('kopp') || lower.includes('flaske') || lower.includes('valg') || lower.includes('option') || lower.includes('pega') || lower.includes('norsk') || lower.includes('english')) {
                  return false;
                }
                return true;
              });
            }

            const colorOpt = item.productOptions.find(o => {
              const name = o.name?.trim().toLowerCase();
              return name === 'color' || name === 'farge';
            });
            if (colorOpt) {
              const rawColorNames = colorOpt.choices?.map(c => c.value) || [];
              const resolved = rawColorNames.map(name => resolveColor(name));
              colorNames = resolved.map(r => r.name);
              colors = resolved.map(r => r.hex);

              // Filter to unique color names and align colors array
              const uniqueNames = [];
              const uniqueHexes = [];
              colorNames.forEach((name, idx) => {
                if (!uniqueNames.includes(name)) {
                  uniqueNames.push(name);
                  uniqueHexes.push(colors[idx]);
                }
              });
              colorNames = uniqueNames;
              colors = uniqueHexes;
            }
            }

            // Deduplicate sizes
            sizes = Array.from(new Set(sizes));

          // Fallbacks for color & size if empty
          if (colors.length === 0) {
            colors = ['#CC712B'];
            colorNames = ['Terracotta'];
          }
          if (sizes.length === 0) {
            sizes = ['One Size'];
          }

          const price = item.price?.discountedPrice || item.price?.price || 0;
          const originalPrice = item.price?.price || 0;
          const isSale = price < originalPrice || item.discount?.type !== 'NONE' || resolvedCollections.some(c => c.toUpperCase() === 'SALG');
          const isBestseller = resolvedCollections.includes('Bestselgere') || resolvedCollections.includes('Populære produkter');

          // Intelligent weight calculations based on product category & details
          let fallbackWeight = 0.1; // Default fallback (100g)
          if (category === 'Klistermerker') {
            fallbackWeight = 0.005; // 5g per sticker
          } else if (category === 'Plakater') {
            fallbackWeight = 0.15; // 150g per poster
          } else if (category === 'Klær') {
            const nameLower = item.name.toLowerCase();
            if (nameLower.includes('hoodie') || nameLower.includes('genser') || nameLower.includes('sweatshirt') || nameLower.includes('bukse') || nameLower.includes('pants')) {
              fallbackWeight = 0.6; // 600g for hoodies/gensere/bukser
            } else if (nameLower.includes('caps') || nameLower.includes('lue') || nameLower.includes('beanie')) {
              fallbackWeight = 0.1; // 100g for hats
            } else {
              fallbackWeight = 0.2; // 200g for t-shirts
            }
          } else if (category === 'Tilbehør') {
            const nameLower = item.name.toLowerCase();
            if (nameLower.includes('deksel') || nameLower.includes('cover')) {
              fallbackWeight = 0.05; // 50g for phone covers
            } else if (nameLower.includes('nett') || nameLower.includes('bag') || nameLower.includes('tote')) {
              fallbackWeight = 0.15; // 150g for tote bags
            }
          }
          const weight = item.weight || fallbackWeight;

          return {
            id: item._id,
            name: item.name,
            price: price,
            originalPrice: isSale ? originalPrice : undefined,
            category: category,
            colors: colors,
            colorNames: colorNames,
            sizes: sizes,
            weight: weight,
            image: item.media?.mainMedia?.image?.url || 'https://via.placeholder.com/400',
            images: item.media?.items?.filter(mi => mi.mediaType === 'image').map(mi => mi.image?.url).filter(Boolean) || [],
            isBestseller: isBestseller,
            isSale: isSale,
            description: item.description?.replace(/<[^>]*>/g, '') || '',
            subcategories: resolvedCollections,
            productOptions: item.productOptions,
            manageVariants: item.manageVariants,
            variants: item.variants,
            customTextFields: item.customTextFields || []
          };
        });

        if (mapped.length > 0) {
          setProducts(mapped);
          console.log(`Laster ${mapped.length} produkter dynamisk fra Wix.`);
        }
      } catch (error) {
        console.error('Kunne ikke hente produkter fra Wix, faller tilbake til lokale testdata:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchWixData();
  }, []);
  
  // Chat Assistant State
  const [assistantMessages, setAssistantMessages] = useState(INITIAL_MESSAGES);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [assistantContext, setAssistantContext] = useState({
    title: 'Hjem',
    pageType: 'home',
    url: '/'
  });

  const getProductRecommendations = (inputText) => {
    const lower = inputText.toLowerCase().trim();
    
    // Check if the user is asking about recommendations for all / families / all ages
    const isAllAgesQuery = 
      lower.includes('for alle') || 
      lower.includes('alle aldre') || 
      lower.includes('hele familien') || 
      (lower.includes('alle') && (lower.includes('aldre') || lower.includes('anbefal') || lower.includes('produkt') || lower.includes('kategori') || lower.includes('alder')));

    if (isAllAgesQuery) {
      console.log('Backend getProductRecommendations matched all ages / family query');
      // Find kids/baby products
      const kidProds = products.filter(prod => {
        const prodNameLower = prod.name.toLowerCase();
        const prodDescLower = prod.description?.toLowerCase() || '';
        const prodSubcats = prod.subcategories?.map(s => s.toLowerCase()) || [];
        return prod.gender === 'Barn' || 
               prod.category?.toLowerCase().includes('barn') || 
               prodNameLower.includes('barn') || 
               prodNameLower.includes('barne') || 
               prodNameLower.includes('baby') || 
               prodNameLower.includes('body') || 
               prodNameLower.includes('år') || 
               prodNameLower.includes('mnd') || 
               prodDescLower.includes('barn') || 
               prodDescLower.includes('barne') || 
               prodSubcats.some(s => s.includes('barn') || s.includes('ungdom') || s.includes('kids') || s.includes('baby'));
      });

      // Find adult clothing products
      const adultProds = products.filter(prod => {
        const prodNameLower = prod.name.toLowerCase();
        return prod.category === 'Klær' && 
               prod.gender !== 'Barn' && 
               !prodNameLower.includes('barn') && 
               !prodNameLower.includes('barne') && 
               !prodNameLower.includes('baby') && 
               !prodNameLower.includes('body') && 
               !prodNameLower.includes('år');
      });

      // Find posters, stickers or accessories
      const miscProds = products.filter(prod => {
        return prod.category === 'Plakater' || prod.category === 'Klistermerker' || prod.category === 'Tilbehør';
      });

      const selected = [];
      if (kidProds.length > 0) selected.push(kidProds[0]);
      if (adultProds.length > 0) selected.push(adultProds[0]);
      if (miscProds.length > 0) selected.push(miscProds[0]);

      if (selected.length > 0) {
        return selected;
      }
    }

    // Check if the user is asking about products/sales/bestsellers/categories
    const isAskingAboutProducts = 
      lower.includes('produkt') || 
      lower.includes('anbefal') || 
      lower.includes('kjøpe') || 
      lower.includes('butikk') || 
      lower.includes('utvalg') || 
      lower.includes('hva har dere') || 
      lower.includes('vis meg') || 
      lower.includes('søk') || 
      lower.includes('leter etter') ||
      lower.includes('finne') ||
      lower.includes('salg') ||
      lower.includes('tilbud') ||
      lower.includes('rabatt') ||
      lower.includes('bestselger') ||
      lower.includes('populær') ||
      lower.includes('klær') ||
      lower.includes('t-skjorte') ||
      lower.includes('tee') ||
      lower.includes('genser') ||
      lower.includes('plakat') ||
      lower.includes('poster') ||
      lower.includes('bilde') ||
      lower.includes('klister') ||
      lower.includes('sticker') ||
      lower.includes('tilbehør') ||
      lower.includes('lue') ||
      lower.includes('deksel') ||
      lower.includes('bag') ||
      lower.includes('tote');

    // Split input into keywords, removing common small words
    const stopWords = new Set([
      'jeg', 'og', 'i', 'på', 'en', 'et', 'er', 'det', 'har', 'dere', 'noen', 
      'vis', 'meg', 'leter', 'etter', 'hva', 'koster', 'anbefale', 'anbefal',
      'til', 'med', 'for', 'om', 'kan', 'du', 'søk', 'etter', 'produkter', 
      'produkt', 'de', 'den', 'siste', 'nye', 'viser', 'gi', 'meg',
      'hvordan', 'hvem', 'hvor', 'hvorfor', 'gjør', 'gjøre', 'vil', 'skal', 
      'må', 'bør', 'få', 'får', 'ta', 'tar', 'se', 'ser', 'finne', 'finner', 
      'mer', 'om', 'enkel', 'mottar', 'varen', 'ubrukt', 'kontakt'
    ]);
    const words = lower
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.has(w));

    if (words.length === 0 && !isAskingAboutProducts) {
      return null;
    }

    let matches = [];
    const isBestsellerQuery = lower.includes('bestselger') || lower.includes('populær') || lower.includes('topp');
    const isSaleQuery = lower.includes('salg') || lower.includes('tilbud') || lower.includes('rabatt') || lower.includes('billig') || lower.includes('nedsatt');

    const isKidsQuery = 
      lower.includes('barn') || 
      lower.includes('kids') || 
      lower.includes('junior') || 
      lower.includes('gutt') || 
      lower.includes('jente') || 
      lower.includes('ungdom') || 
      lower.includes('baby') || 
      lower.includes('åring') || 
      /\b\d+\s*år\b/.test(lower);

    const isWomenQuery =
      lower.includes('dame') ||
      lower.includes('kvinne') ||
      lower.includes('women') ||
      lower.includes('damer');

    const isMenQuery =
      lower.includes('herre') ||
      lower.includes('mann') ||
      lower.includes('men') ||
      lower.includes('herrer');

    products.forEach(prod => {
      let score = 0;
      const prodNameLower = prod.name.toLowerCase();
      const prodDescLower = prod.description?.toLowerCase() || '';
      const prodCatLower = prod.category.toLowerCase();
      const prodSubcats = prod.subcategories?.map(s => s.toLowerCase()) || [];

      // Flag matching
      if (isBestsellerQuery && prod.isBestseller) score += 8;
      if (isSaleQuery && prod.isSale) score += 8;

      // Target audience boosts
      if (isKidsQuery) {
        const hasKidsTag = 
          prod.gender === 'Barn' || 
          prod.category?.toLowerCase().includes('barn') || 
          prodNameLower.includes('barn') || 
          prodNameLower.includes('barne') || 
          prodNameLower.includes('baby') || 
          prodNameLower.includes('body') || 
          prodNameLower.includes('år') || 
          prodNameLower.includes('mnd') || 
          prodDescLower.includes('barn') || 
          prodDescLower.includes('barne') || 
          prodDescLower.includes('baby') || 
          prodDescLower.includes('body') || 
          prodSubcats.some(s => s.includes('barn') || s.includes('ungdom') || s.includes('kids') || s.includes('baby'));
        
        if (hasKidsTag) {
          score += 35; // Massive boost for child products
        }
      }

      if (isWomenQuery) {
        const hasWomenTag =
          prod.gender === 'Dame' ||
          prod.category?.toLowerCase().includes('dame') ||
          prodNameLower.includes('dame') ||
          prodSubcats.some(s => s.includes('dame') || s.includes('women'));
        
        if (hasWomenTag) {
          score += 25;
        }
      }

      if (isMenQuery) {
        const hasMenTag =
          prod.gender === 'Herre' ||
          prod.category?.toLowerCase().includes('herre') ||
          prodNameLower.includes('herre') ||
          prodSubcats.some(s => s.includes('herre') || s.includes('men'));
        
        if (hasMenTag) {
          score += 25;
        }
      }

      // Word matching
      words.forEach(word => {
        if (prodNameLower === word) {
          score += 15;
        } else if (prodNameLower.includes(word)) {
          score += 8;
        }
        
        if (prodCatLower.includes(word)) {
          score += 6;
        }
        
        prodSubcats.forEach(sub => {
          if (sub.includes(word)) {
            score += 4;
          }
        });

        if (prodDescLower.includes(word)) {
          score += 2;
        }
      });

      if (score > 0) {
        matches.push({ product: prod, score });
      }
    });

    if (matches.length === 0 && isAskingAboutProducts) {
      let fallbackProducts = [];
      if (isSaleQuery) {
        fallbackProducts = products.filter(p => p.isSale);
      } else if (isBestsellerQuery) {
        fallbackProducts = products.filter(p => p.isBestseller);
      } else {
        fallbackProducts = products.filter(p => p.isBestseller || p.isSale);
      }

      if (fallbackProducts.length === 0) {
        fallbackProducts = products.slice(0, 3);
      }

      fallbackProducts.forEach(prod => {
        matches.push({ product: prod, score: 5 });
      });
    }

    matches.sort((a, b) => b.score - a.score);

    const uniqueMatches = [];
    const seenIds = new Set();
    matches.forEach(m => {
      if (!seenIds.has(m.product.id)) {
        seenIds.add(m.product.id);
        uniqueMatches.push(m.product);
      }
    });

    return uniqueMatches.slice(0, 3);
  };

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

      // 1. Prioritize specific customer service topics to prevent false matches on helper words
      if (lower.includes('retur') || lower.includes('bytte') || lower.includes('fortre')) {
        reply = '### 🔄 Enkel Retur & Bytte\n\n' +
          '- Hos oss har du alltid **14 dagers angrefrist** i tråd med angrerettsloven fra du mottar varen.\n' +
          '- Produktet må være ubrukt og i originalemballasjen.\n' +
          '- Du kan enkelt kontakte vår kundeservice på **post@hiskingdomministry.no** for å motta en returetikett.\n\n' +
          '💡 Vi ønsker at du skal være 100% fornøyd med kjøpet ditt!';
      } 
      else if (lower.includes('frakt') || lower.includes('levering') || lower.includes('sende')) {
        reply = '### 🚚 Frakt og Levering\n\n' +
          '- Vi har **gratis frakt på alle bestillinger over 1500 kr**!\n' +
          '- For bestillinger under 1500 kr beregnes frakten ut fra vekt:\n' +
          '  - Opptil 0.07 kg: **39 kr**\n' +
          '  - 0.07 - 0.35 kg: **69 kr**\n' +
          '  - 0.35 - 1.75 kg: **99 kr**\n' +
          '  - 1.75 - 4.0 kg: **149 kr**\n' +
          '  - Over 4.0 kg: **199 kr**\n' +
          '- Vi pakker og sender varer lynraskt – som regel **innen 24 timer** fra vårt lager i Lyngdal.\n' +
          '- Leveringstid er normalt **2-4 virkedager** med Posten/Bring.\n\n' +
          '💡 Er det noe spesifikt du ønsker å bestille i dag?';
      } 
      else if (lower.includes('størrelse') || lower.includes('size') || lower.includes('passform')) {
        reply = '### 📏 Størrelsesguide\n\n' +
          '- Våre t-skjorter for herre og unisex har en **standard, komfortabel passform** (true to size).\n' +
          '- `Grace Oversized Tee` er designet for å sitte løst og ledig. Hvis du foretrekker en tettere passform, anbefaler vi å gå ned én størrelse.\n' +
          '- T-skjortene til dame er litt mer figursydde.\n\n' +
          '💡 Vi tilbyr størrelser opp til **3XL** på de fleste av våre plagg, og utvalgte plagg opp til **5XL**.';
      } 
      else if (lower.includes('materiale') || lower.includes('bomull') || lower.includes('kvalitet')) {
        reply = '### 🌿 Materialer & Kvalitet\n\n' +
          '- Våre klær er laget av **100% bomull eller en behagelig blanding av bomull og polyester**.\n' +
          '- Dette gir en utrolig myk følelse mot huden, god pusteevne og lang holdbarhet.\n' +
          '- Trykkene våre er vannbaserte og holdbare, slik at de holder formen vask etter vask uten å sprekke.\n\n' +
          '💡 Vi anbefaler å vaske plaggene på **30-40 grader med vrangen ut** for å bevare trykket best mulig.';
      } 
      else if (lower.includes('betaling') || lower.includes('vipps') || lower.includes('kort') || lower.includes('visa')) {
        reply = '### 💳 Sikker Betaling\n\n' +
          'Vi tilbyr trygge og raske betalingsløsninger i kassen:\n' +
          '- **Vipps** (enkel betaling med mobilen)\n' +
          '- **Kortbetaling** (Visa og Mastercard via kryptert betalingsløsning)\n\n' +
          '💡 Vi er fritatt for MVA da His Kingdom Designs drives av en frivillig organisasjon.';
      }
      else if (lower.includes('kontakt') || lower.includes('kundeservice') || lower.includes('e-post') || lower.includes('adresse') || lower.includes('telefon')) {
        reply = '### 📞 Kontakt Kundeservice\n\n' +
          'Vi vil gjerne høre fra deg! Du kan kontakte oss på:\n' +
          '- **E-post:** post@hiskingdomministry.no\n' +
          '- **Adresse:** Løkkeveien 3B, 4580 Lyngdal\n\n' +
          '💡 Vi svarer vanligvis innen 24 timer på virkedager.';
      }
      else {
        // 2. Otherwise, check for product recommendations or category pages
        const recommendations = getProductRecommendations(text);

        if (recommendations && recommendations.length > 0) {
          let titleText = '### 🛍️ Her er produkter jeg fant basert på ditt søk:';
          
          const isAllAgesQuery = 
            lower.includes('for alle') || 
            lower.includes('alle aldre') || 
            lower.includes('hele familien') || 
            (lower.includes('alle') && (lower.includes('aldre') || lower.includes('anbefal') || lower.includes('produkt') || lower.includes('kategori') || lower.includes('alder')));

          if (isAllAgesQuery) {
            titleText = '### 👨‍👩‍👧‍👦 Her er våre anbefalinger for hele familien og alle aldre:';
          } else if (lower.includes('salg') || lower.includes('tilbud') || lower.includes('rabatt') || lower.includes('billig') || lower.includes('nedsatt')) {
            titleText = '### 🏷️ Her er våre produkter på tilbud akkurat nå:';
          } else if (lower.includes('bestselger') || lower.includes('populær') || lower.includes('topp')) {
            titleText = '### 🌟 Her er våre mest populære bestselgere:';
          } else if (lower.includes('anbefal') || lower.includes('anbefaling') || lower.includes('tips')) {
            titleText = '### ✨ Her er mine anbefalinger til deg:';
          }

          const itemsText = recommendations.map((prod, idx) => {
            const priceStr = prod.originalPrice 
              ? `**${prod.price} kr** *(Salg! før ${prod.originalPrice} kr)*` 
              : `**${prod.price} kr**`;
            
            const badge = prod.isBestseller ? ' ⭐ *Bestselger!*' : '';
            
            return `${idx + 1}. **[${prod.name}](/product/${prod.id})** – ${priceStr}${badge}\n   *${prod.description ? prod.description.substring(0, 110) + '...' : prod.category}*`;
          }).join('\n\n');

          reply = `${titleText}\n\n${itemsText}\n\n💡 Klikk på produktlenkene over for å se produktdetaljene, velge farger/størrelser og legge dem i handlekurven!`;

          // If they also asked about shipping/return, append a helpful tip
          if (lower.includes('frakt') || lower.includes('levering') || lower.includes('porto')) {
            reply += '\n\n**PS:** Vi har **gratis frakt på alle ordre over 1500 kr** (ellers fra 39 kr basert på vekt) med Bring/Posten.';
          } else if (lower.includes('retur') || lower.includes('bytte')) {
            reply += '\n\n**PS:** Vi tilbyr **14 dagers angrerett** og enkel retur/bytte.';
          }
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

  const getSlugByCategoryName = (name) => {
    if (!name) return '';
    if (name === 'Salg') return 'salg';
    const found = wixCollections.find(c => c.name === name);
    if (found && found.slug) return found.slug;
    
    // Fallback mapping for standard categories
    const staticMap = {
      'Hatter /caps': 'caps',
      'Hatter/caps': 'caps',
      'Hats/Caps': 'caps',
      'Hats/caps': 'caps',
      'caps': 'caps',
      'Handlenett / Totebag': 'totebag',
      'Handlenett/Totebag': 'totebag',
      'Tote Bag': 'totebag',
      'Tote bag': 'totebag',
      'totebag': 'totebag',
      'armbånd og smykker': 'smykker',
      'Kopper og flasker': 'cups-bottles',
      'Bilder og plakater': 'bilder-og-plakater',
      'Klær': 'klær',
      'Dameklær': 'dameklær',
      'Genser': 'genser',
      'Joggebukser': 'bukser',
      'T-shirts': 't-shirts',
      'Sport / Performance /Outdoor': 'sport-performance-outdoor',
      'RUSS': 'russ',
      'BABY': 'babyklær',
      'BARN & UNGDOM': 'barneklær',
      'Barnerom': 'barnerom',
      'Varna - Evangeliesenteret Bibelskole': 'evangeliesenteret-bibelskole-varna',
      'Varne evangliesenter - Bible school': 'evangeliesenteret-bibelskole-varna'
    };
    if (staticMap[name]) return staticMap[name];
    
    return name.toLowerCase()
      .replace(/\//g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9øæå-]/g, '')
      .replace(/-+/g, '-');
  };

  const getCategoryNameBySlug = (slug) => {
    if (!slug) return '';
    if (slug === 'salg') return 'Salg';
    const found = wixCollections.find(c => c.slug === slug);
    if (found && found.name) return found.name;
    
    // Fallback mapping for standard categories
    const staticMap = {
      'caps': 'Hatter /caps',
      'totebag': 'Handlenett / Totebag',
      'smykker': 'armbånd og smykker',
      'cups-bottles': 'Kopper og flasker',
      'bilder-og-plakater': 'Bilder og plakater',
      'klær': 'Klær',
      'dameklær': 'Dameklær',
      'genser': 'Genser',
      'bukser': 'Joggebukser',
      't-shirts': 'T-shirts',
      'sport-performance-outdoor': 'Sport / Performance /Outdoor',
      'russ': 'RUSS',
      'babyklær': 'BABY',
      'barneklær': 'BARN & UNGDOM',
      'barnerom': 'Barnerom',
      'evangeliesenteret-bibelskole-varna': 'Varna - Evangeliesenteret Bibelskole'
    };
    
    for (const [keyName, valSlug] of Object.entries(staticMap)) {
      if (valSlug === slug) return keyName;
    }
    
    return slug;
  };

  return (
    <AppContext.Provider value={{
      products,
      isLoadingProducts,
      wixCollections,
      categoryTaxonomy,
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
      sendAssistantMessage,
      isAdminEditing,
      setIsAdminEditing,
      cmsContent,
      updateCmsContent,
      toastMessage,
      showToast,
      wishlist,
      toggleWishlist,
      isInWishlist,
      getSlugByCategoryName,
      getCategoryNameBySlug
    }}>
      {children}
    </AppContext.Provider>
  );
};

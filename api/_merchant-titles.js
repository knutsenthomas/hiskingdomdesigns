// Builds Norwegian, search-friendly titles for the Google Merchant Center feed.
// Only used by api/products-feed.js — titles in Wix and on the site are unchanged.
// Shape: "<motiv> – kristen <produkttype> [til barn|dame] [med bibelvers] [(størrelser)]"

// Product types, checked in order (most specific first), tested against the
// lower-cased Wix title. label: null = not a physical Shopping product (excluded).
const TYPES = [
  { key: 'digital', re: /\b(pdf|e-book|ebook|digital(e)?|wallpaper|print selv|digital download)\b/, label: null },
  { key: 'subscription', re: /\b(subscription|månedlig|monthly)\b/, label: null },
  { key: 'phonecase', re: /\b(iphone|samsung|mobildeksel|mobile case|phone case|flexi case|tough case)\b/, label: 'kristent mobildeksel' },
  { key: 'babybody', re: /\b(baby ?body|bodysuit|babysuit)\b|body de beb/, label: 'kristen babybody' },
  { key: 'bib', re: /\b(smekke|babysmekke|siklesmekke)\b/, label: 'kristen babysmekke' },
  { key: 'apron', re: /\b(apron|forkle)\b/, label: 'kristent barneforkle' },
  { key: 'sticker', re: /\b(stickers?|klistremerker?|klistermerker?|klistremerke-sett)\b/, label: 'kristne klistremerker' },
  { key: 'bottle', re: /\b(water bottle|vannflaske|glassflaske)\b/, label: 'kristen drikkeflaske' },
  { key: 'travelmug', re: /\btravel mug\b/, label: 'kristen termokopp' },
  { key: 'mug', re: /\b(mug|kopp|koppen|cup|emaljekopp|taza)\b/, label: 'kristen kopp' },
  { key: 'zip', re: /\b(zip hoodie|hettejakke|zip vest)\b/, label: 'kristen hettejakke' },
  { key: 'hoodie', re: /\b(hoodie|hettegenser)\b/, label: 'kristen hettegenser' },
  { key: 'sweater', re: /\b(sweatshirt|genser|barnegenser|treningstrøye|pullover|sweater)\b/, label: 'kristen genser' },
  { key: 'joggers', re: /\bjoggebukse\b/, label: 'kristen joggebukse' },
  { key: 'longsleeve', re: /\blongsleeve\b/, label: 'kristen langermet t-skjorte' },
  { key: 'tshirt', re: /\b(t-?shirt|t-?skjorte|tskjorte|tee|camiseta|dametrøye)\b/, label: 'kristen t-skjorte' },
  { key: 'cap', re: /\b(cap|caps|bucket hat|trucker)\b/, label: 'kristen caps' },
  { key: 'backpack', re: /\bbackpack\b/, label: 'kristen ryggsekk' },
  { key: 'tote', re: /\b(tote ?bag|totebag|handlenett|bolsa)\b/, label: 'kristen totebag' },
  { key: 'ornament', re: /\bornament\b/, label: 'kristen julepynt' },
  { key: 'coloring', re: /\b(coloring book|color by number|activity book|^color|fargeleggingsbok|fargelegg|tegnebok|libro para pintar)\b/, label: 'kristen fargeleggingsbok' },
  { key: 'book', re: /\b(softcover book|memoir|arbeidsbok|workbook|journal|bønnejournal|planner)\b/, label: 'kristen bok' },
  { key: 'poster', re: /\b(poster|plakat|plakater|bibelplakat(er)?|barneplakat|art print|kunsttrykk|wall art|veggdekor|veggkunst|póster|carteles|framed)\b/, label: 'kristen plakat' },
];

// Product/material words removed from anywhere in the motif.
const NOISE = [
  /gildan®?\s*\w+/gi, /sol'?s\s+\w+\s*\d*/gi, /\b\d+\s?(oz|ml)\b/gi,
  /\b(classic|premium|heavyweight|midweight|ultra cotton|organic( in conversion)?|recycled blend|fine art|matte|semi-?glossy|semi-gloss|retro|white( latte)?|ceramic|porcelain|slim|enamel|stainless steel|paper|unisex|crewneck|adult|fleece|comfortable fit|ringer|oversized?|wooden|5 panel)\b/gi,
  /\b(klassisk|halvglanset|halvplanset|halvblank|robust|rustikk|økologisk|søt|keramisk)\b/gi,
  /\bmatt\b(?!\.)/gi,
];

// Product words removed only from the END of the motif ("Love like Jesus Tee").
const TRAILING = /\s*\b(poster|plakat|bibelplakat|bibel ?plakat|bibelvers ?plakat|bibelsk plakat|art print|print|kunsttrykk|wall art|wall decor|decor|t-?shirt|t-?skjorte|tskjorte|tee|hoodie|hettegenser|hettejakke|genser|sweatshirt|mug|kopp|koppen|cup|cap|caps|tote ?bag|totebag|handlenett|babybody|baby ?body|bodysuit|smekke|case|mobildeksel|water bottle|vannflaske|dametrøye|joggebukse|longsleeve|emaljekopp|camiseta|taza|bolsa|kids?|travel|arbeidsbok|workbook)\s*$/i;
const LEADING = /^(kristen\s+)?(plakat|veggdekor|barneplakat)(\s+med)?\s*:?\s+/i;

// English labels for the English feed (api/products-feed.js?lang=en).
const LABELS_EN = {
  phonecase: 'Christian phone case', babybody: 'Christian baby bodysuit', bib: 'Christian baby bib',
  apron: 'Christian kids apron', sticker: 'Christian stickers', bottle: 'Christian water bottle',
  travelmug: 'Christian travel mug', mug: 'Christian mug', zip: 'Christian zip hoodie',
  hoodie: 'Christian hoodie', sweater: 'Christian sweatshirt', joggers: 'Christian joggers',
  longsleeve: 'Christian long sleeve T-shirt', tshirt: 'Christian T-shirt', cap: 'Christian cap',
  backpack: 'Christian backpack', tote: 'Christian tote bag', ornament: 'Christian Christmas ornament',
  coloring: 'Christian coloring book', book: 'Christian book', poster: 'Christian poster',
};

const SIZE_RE = /\(([^)]*(?:\d\s?-\s?\d|xs|xl|år|mnd|months|years|yrs|m\))[^)]*)\)/i;
const VERSE_RE = /\b(salme|salmo|psalm|ordspråkene|proverbs?|jesaja|isaiah|jeremia|jeremiah|matteus|matthew|matt|luke|lukas|romans|romerne|johannes|john|kol|kolosserne|efeserne|phil|klagesangene|5\.?\s?mos|1 kor|song of solomon|ester|esther)\b\.?\s*\d+[:.]\d+/i;

const AUDIENCE = [
  { re: /\b(womens?|woman|lady|dame|dametrøye|mujer)\b/i, word: ' dame', en: ' for women' },
  { re: /\b(kids?|kid´s|junior|barn|barnestr|youth|toddler|\d+\s?-\s?\d+\s?(år|years|yrs))\b/i, word: ' til barn', en: ' for kids' },
  { re: /\bbaby\b/i, word: ' til baby', en: ' for babies' },
];
const CLOTHES = ['tshirt', 'hoodie', 'sweater', 'zip', 'longsleeve', 'joggers'];

const tidy = s => s
  .replace(/[«»"“”​]/g, '')
  .replace(/\(\s*\)/g, '')
  .replace(/\(\s*(mug|cup|kopp|taza)\s*\)/gi, '')
  .replace(/\s*[|/]\s*$/, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/^[\s\-–|:,.]+|[\s\-–|:,]+$/g, '')
  .replace(/\s+\.$/, '')
  .trim();

const letters = s => s.replace(/[^\p{L}]/gu, '').length;

const cleanMotif = s => {
  let m = s.replace(LEADING, '');
  for (const re of NOISE) m = m.replace(re, ' ');
  m = tidy(m);
  let prev;
  do { prev = m; m = tidy(m.replace(TRAILING, '')); } while (m !== prev);
  return m;
};

export function detectType(title = '') {
  const lower = title.toLowerCase();
  return TYPES.find(t => t.re.test(lower)) || null;
}

// Digital goods and subscriptions are not allowed as regular Shopping products.
export function isExcludedFromMerchant(title = '') {
  const t = detectType(title);
  return !!t && t.label === null;
}

// Motif = first segment before " | ", " - " or " – ", cleaned of product words.
function motifOf(title) {
  const base = title.replace(SIZE_RE, '').replace(/\s*\([^)]*(farger|versions|pages|sider|spansk)[^)]*\)/gi, '').replace(/^\d+\.\s+(?=\D)/, '');
  const parts = base.split(/\s+[|–-]\s+|\s*\|\s*|\s+-(?=\S)|(?<=\S)-\s+/).map(tidy).filter(Boolean);
  let motif = cleanMotif(parts[0] || base);
  if (parts.length > 1) {
    const firstHasType = !!detectType(parts[0]);
    const nextHasType = !!detectType(parts[1]);
    const tooShort = letters(motif) < 3;
    const onlyProduct = firstHasType && !nextHasType && !VERSE_RE.test(motif) && motif.split(/\s+/).length <= 2 && letters(cleanMotif(parts[1])) > 3;
    if (tooShort || onlyProduct) motif = cleanMotif(parts[1]);
  }
  if (letters(motif) < 2) motif = tidy(title.split(/[|–]/)[0]);
  return motif;
}

export function merchantMotif(original = '') {
  return motifOf(String(original).replace(/\s+/g, ' ').trim());
}

// lang: 'no' (default) or 'en'.
export function merchantTitle(original = '', lang = 'no') {
  const en = lang === 'en';
  const title = String(original).replace(/\s+/g, ' ').trim();
  const type = detectType(title);
  if (!type || !type.label) return en ? title.replace(/(\d)\s*år\b/gi, '$1 years').replace(/(\d)\s*mnd\b/gi, '$1 months') : title;

  const sizeMatch = title.match(SIZE_RE);
  let sizes = sizeMatch
    ? sizeMatch[1].replace(/barnestr\.?\s*/i, '').replace(/\s*-\s*/g, '-').replace(/\s*,\s*/g, ', ').trim()
    : '';
  if (en) sizes = sizes.replace(/\s*år\b/gi, ' years').replace(/\s*mnd\b/gi, ' months').replace(/\bog\b/g, 'and');

  const motif = motifOf(title);

  let label = en ? LABELS_EN[type.key] : type.label;
  const audience = AUDIENCE.find(a => a.re.test(title));
  if (audience && CLOTHES.includes(type.key)) label += en ? audience.en : audience.word;
  if (type.key === 'poster' && /barnerom|barneplakat|\bbaby\b/i.test(title)) label = en ? 'Christian nursery poster' : 'kristen plakat til barnerommet';
  if (VERSE_RE.test(title) || /\bbibel ?vers|bible verse|bibelplakat|bible poster/i.test(title)) label += en ? ' with Bible verse' : ' med bibelvers';

  let out = `${motif} – ${label}`;
  if (sizes && CLOTHES.concat('babybody').includes(type.key)) out += ` (${sizes})`;
  // Google allows 150 characters.
  return out.length > 150 ? out.slice(0, 147).replace(/\s+\S*$/, '') + '…' : out;
}

// True when the design text (motif) is Norwegian or Spanish rather than English.
// Those products stay out of the English feed: the print itself isn't English.
const NON_ENGLISH = /[æøåñáéíóú]|\b(jeg|er|og|deg|meg|oss|dere|du|vi|gud|guds|herren|herre|salme|salmo|ikke|min|mitt|har|ny|skapning|elsker|elsket|velsigne|velsign|rustning|rustningen|kjærlighet|tro|håp|fred|frihet|kongsdatter|kongerike|barn|smil|liten|stor|hender|naglemerkede|fredsdue|bevar|hjertet|norge|norgeskoppen|jesu|sauen|eselkoppen|gullfisk|sjiraff|koppen|handleliste|evigheten|ingenting|kan|fra|til|med|som|det|alt|gjør|sted|bygg|bygge|rike|mamma|utvalgt|unik|mirakel|framtid|ved|gleden|nåde|lys|levende|brødet|ordspråkene|jesaja|jeremia|matteus|johannes|kolosserne|efeserne|kol|morgenstund|bønnekriger|eldre|gammel|spiste|jona|noas|kall|fuglene|skapt|forandrer|sterkest|igår|idag|samme|lurt|elsk|likevel|nær|mat|metter|styrke|bruden|lammets|bryllup|plakat|sommerlige|skilpadde|stk|norsk|stort|klistermerke|dios|señor|amor|todo|esperanza|amado|aleluya|alaba|cristo|tiempo|como|este|nada|puede|separarnos|por|favor|disfruta|las|cosas|cambia|lo|puedo|que|el)\b/i;

export function isEnglishMotif(original = '') {
  const m = merchantMotif(original);
  return letters(m) >= 2 && !NON_ENGLISH.test(m) && !NON_ENGLISH.test(String(original).split(/[|–]| - /)[0]);
}

export function merchantTypeKey(original = '') {
  const t = detectType(String(original));
  return t ? t.key : '';
}

// Google product taxonomy (full paths are accepted by Merchant Center).
const CATEGORIES = {
  tshirt: 'Apparel & Accessories > Clothing > Shirts & Tops',
  longsleeve: 'Apparel & Accessories > Clothing > Shirts & Tops',
  hoodie: 'Apparel & Accessories > Clothing > Shirts & Tops',
  sweater: 'Apparel & Accessories > Clothing > Shirts & Tops',
  zip: 'Apparel & Accessories > Clothing > Shirts & Tops',
  joggers: 'Apparel & Accessories > Clothing > Pants',
  babybody: 'Apparel & Accessories > Clothing > Baby & Toddler Clothing > Baby One-Pieces',
  cap: 'Apparel & Accessories > Clothing Accessories > Hats',
  tote: 'Luggage & Bags > Shopping Totes',
  backpack: 'Luggage & Bags > Backpacks',
  mug: 'Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs',
  travelmug: 'Home & Garden > Kitchen & Dining > Tableware > Drinkware > Mugs',
  bottle: 'Home & Garden > Kitchen & Dining > Food & Beverage Carriers > Water Bottles',
  poster: 'Home & Garden > Decor > Artwork > Posters, Prints, & Visual Artwork',
  phonecase: 'Electronics > Communications > Telephony > Mobile Phone Accessories > Mobile Phone Cases',
  ornament: 'Home & Garden > Decor > Seasonal & Holiday Decorations > Holiday Ornaments',
  book: 'Media > Books',
  coloring: 'Media > Books',
};

export function merchantCategory(title = '') {
  const t = detectType(String(title));
  return (t && CATEGORIES[t.key]) || '';
}

// age_group for clothing, so Google can match "barn"/"baby" searches.
export function merchantAgeGroup(title = '') {
  const t = detectType(String(title));
  if (!t) return '';
  if (t.key === 'babybody' || t.key === 'bib') return 'infant';
  if (!CLOTHES.includes(t.key) && t.key !== 'cap') return '';
  if (/\bbaby\b|\d+\s?mnd|months/i.test(title)) return 'infant';
  if (/\btoddler\b|\b2T\b/i.test(title)) return 'toddler';
  if (/\b(kids?|kid´s|junior|barn|barnestr|youth)\b|\d+\s?-\s?\d+\s?(år|years|yrs)/i.test(title)) return 'kids';
  return 'adult';
}

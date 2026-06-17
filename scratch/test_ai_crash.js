// Scratch script to test sendAssistantMessage crash

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Kingdom Life T-skjorte',
    price: 299,
    originalPrice: 399,
    category: 'Klær',
    gender: 'Herre',
    colors: ['#151A21', '#FFFFFF', '#E5E7EB', '#2F4F4F', '#CC712B'],
    colorNames: ['Sort', 'Hvit', 'Grå', 'Mørk Grønn', 'Terracotta'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
    image: 'https://static.wixstatic.com/media/3a1544_32a63101ef9342c5a099d64f67dca66f~mv2.jpg',
    isBestseller: true,
    isSale: true,
    description: 'En kvalitets t-skjorte i organisk bomull med et kraftfullt budskap. Designet for komfort og stil, perfekt til hverdagsbruk.',
    subcategories: ['T-shirts', 'Klær', 'NORSKE produkter', 'Jesus', 'Bestselgere', 'Populære produkter']
  },
  {
    id: 'prod-8',
    name: 'Embroidered Beanie',
    price: 329,
    category: 'Tilbehør',
    colors: ['#151A21', '#CC712B'],
    colorNames: ['Sort', 'Terrakotta'],
    sizes: ['One Size'],
    image: 'https://static.wixstatic.com/media/3a1544_d7b0cebde0834129a6862789c043ddef~mv2.jpg',
    isBestseller: false,
    isSale: false,
    description: 'En varm og lun lue med brodert krone-detalj. Laget i myk, elastisk strikk.',
    subcategories: ['Tilbehør', 'Hatter /caps', 'Hats/Caps', 'Hats/caps', 'caps', 'ENGLISH products']
  }
];

const products = INITIAL_PRODUCTS;
const language = undefined; // Like in AppContext.jsx where it's not defined
const t = (key) => key; // Mock translation function
const assistantContext = { title: "Test Page" };

const getProductRecommendations = (inputText) => {
  // Mocked for testing
  return [];
};

function testMessage(text) {
  try {
    let reply = '';
    const lower = text.toLowerCase().trim();

    // Check for unavailable product types requested
    const unavailableTypes = [
      { keys: ['caps', 'hatter', 'capsen', 'capser'], label: { no: 'caps', en: 'caps', es: 'gorras' } },
      { keys: ['lue', 'luen', 'luer', 'beanie'], label: { no: 'luer', en: 'beanies', es: 'gorros' } },
      { keys: ['bukse', 'bukser', 'tights', 'pant'], label: { no: 'bukser', en: 'pants', es: 'pantalones' } },
      { keys: ['sokker', 'sokk', 'socks'], label: { no: 'sokker', en: 'socks', es: 'calcetines' } },
      { keys: ['jakke', 'jakker', 'kåpe', 'jacket'], label: { no: 'jakker', en: 'jackets', es: 'chaquetas' } },
      { keys: ['deksel', 'mobildeksel', 'telefondeksel', 'phonecase'], label: { no: 'mobildeksel', en: 'phone cases', es: 'fundas de móvil' } },
      { keys: ['smykker', 'smykke', 'halskjede', 'ring', 'jewelry'], label: { no: 'smykker', en: 'jewelry', es: 'joyas' } }
    ];

    const matchedUnavailable = unavailableTypes.find(t => t.keys.some(k => lower.includes(k)));
    let hasProduct = false;
    if (matchedUnavailable) {
      hasProduct = products.some(p => {
        const nameLower = p.name.toLowerCase();
        return matchedUnavailable.keys.some(k => nameLower.includes(k));
      });
    }

    console.log("matchedUnavailable:", matchedUnavailable);
    console.log("hasProduct:", hasProduct);

    if (lower.includes('retur') || lower.includes('bytte') || lower.includes('fortre')) {
      reply = 'retur';
    } 
    else if (lower.includes('frakt') || lower.includes('levering') || lower.includes('sende')) {
      reply = 'frakt';
    } 
    else if (lower.includes('størrelse') || lower.includes('size') || lower.includes('passform')) {
      reply = 'størrelse';
    } 
    else if (lower.includes('materiale') || lower.includes('bomull') || lower.includes('kvalitet')) {
      reply = 'materiale';
    } 
    else if (lower.includes('betaling') || lower.includes('vipps') || lower.includes('kort') || lower.includes('visa')) {
      reply = 'betaling';
    }
    else if (lower.includes('kontakt') || lower.includes('kundeservice') || lower.includes('e-post') || lower.includes('adresse') || lower.includes('telefon')) {
      reply = 'kontakt';
    }
    else if (matchedUnavailable && !hasProduct) {
      console.log("Entering matchedUnavailable && !hasProduct block");
      const isKids = 
        lower.includes('barn') || 
        lower.includes('barne') || 
        lower.includes('kids') || 
        lower.includes('baby') || 
        lower.includes('gutt') || 
        lower.includes('jente') || 
        lower.includes('junior') || 
        lower.includes('åring') || 
        /\b\d+\s*år\b/.test(lower);

      const typeLabel = matchedUnavailable.label[language] || matchedUnavailable.label['no'];
      console.log("typeLabel:", typeLabel);

      if (isKids) {
        console.log("Entering isKids block");
        const kidProducts = products.filter(prod => {
          const prodNameLower = prod.name.toLowerCase();
          const prodDescLower = prod.description?.toLowerCase() || '';
          const prodSubcats = prod.subcategories?.map(s => s.toLowerCase()) || [];
          return prod.gender === 'Barn' || 
                 prod.category?.toLowerCase().includes('barn') || 
                 prodNameLower.includes('barn') || 
                 prodNameLower.includes('barne') || 
                 prodNameLower.includes('baby') || 
                 prodDescLower.includes('barn') || 
                 prodDescLower.includes('barne') || 
                 prodSubcats.some(s => s.includes('barn') || s.includes('kids') || s.includes('baby'));
        }).slice(0, 3);

        console.log("kidProducts count:", kidProducts.length);

        if (language === 'en') {
          reply = 'en-kids';
        } else if (language === 'es') {
          reply = 'es-kids';
        } else {
          console.log("Entering Norwegian/Default kids block");
          let altText = '';
          if (kidProducts.length > 0) {
            altText = `Men vi har andre flotte og populære produkter til barn som du kan sjekke ut her:\n\n` +
              kidProducts.map((p, i) => `${i + 1}. **[${p.name}](/product/${p.id})** – **${p.price} kr**`).join('\n') + '\n\n';
          }
          reply = `### 🧢 ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} til barn\n\n` +
            `Vi har dessverre ikke **${typeLabel}** for barn i vårt faste sortiment akkurat nå.\n\n` +
            altText +
            `💡 **Spesialbestilling?** Dersom du ønsker en ${typeLabel.slice(0, -1) || typeLabel} (eller et annet produkt) med et av våre unike trosdesign, må du gjerne **[kontakte oss på e-post](mailto:post@hiskingdomministry.no)**! Vi kan ofte gjøre tilpasninger og trykke spesielle bestillinger på forespørsel.`;
        }
      } else {
        reply = 'not-kids';
      }
    }
    else {
      reply = 'fallback';
    }

    console.log("Reply:\n", reply);
  } catch (err) {
    console.error("CRASH ERROR:", err);
  }
}

testMessage("Har dere caps for barn");

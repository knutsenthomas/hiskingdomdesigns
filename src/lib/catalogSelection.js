// Shared storefront taxonomy and selection: server HTML and React use identical rules.
export const isProductOceaniaExclusive = (item) => {
  if (!item) return false;
  const desc = ((item.description || '') + ' ' + (item.additionalInfoSections?.map(s => s.description).join(' ') || '')).replace(/<[^>]*>/g, ' ');
  const lower = desc.toLowerCase();
  
  return (
    lower.includes('oceania exclusive') ||
    lower.includes('shipping: us, ca and oceania exclusive') ||
    lower.includes('shipping: us, ca & oceania exclusive') ||
    lower.includes('shipping exclusively usa, canada and oceania') ||
    lower.includes('shipping exclusively us, canada and oceania') ||
    lower.includes('shipping: usa, ca and oceania') ||
    lower.includes('usa, canada and oceania') ||
    lower.includes('us, ca and oceania') ||
    lower.includes('us, ca, oceania') ||
    (lower.includes('oceania') && (lower.includes('shipping') || lower.includes('exclusive') || lower.includes('levering')))
  );
};

export const categorySlugForName = (name, wixCollections = []) => {
    if (!name) return '';
    if (name === 'Salg') return 'salg';
    const found = wixCollections.find(c => c.name === name);
    if (found && found.slug) return found.slug;
    
    // Fallback mapping for standard categories and SEO landing pages
    const staticMap = {
      'CHRISTMAS': 'christmas',
      'Jul': 'christmas',
      'Julekolleksjon': 'christmas',
      'Kristne klær': 'kristne-klaer',
      'Kristne T-skjorter': 'kristne-t-skjorter',
      'Kristne gensere': 'kristne-gensere',
      'Kristen streetwear': 'kristen-streetwear',
      'Klær med bibelvers': 'klaer-med-bibelvers',
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
      'Kristne plakater': 'kristne-plakater',
      'Kristne kopper': 'kristne-kopper',
      'Kristne klistremerker': 'kristne-klistermerker',
      'Klistermerker': 'kristne-klistermerker',
      'Plakater': 'kristne-plakater',
      'Kopper': 'kristne-kopper',
      'Klær': 'kristne-klaer',
      'Dameklær': 'dameklær',
      'Genser': 'kristne-gensere',
      'Joggebukser': 'bukser',
      'T-shirts': 'kristne-t-skjorter',
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


        // Define lists of collection names belonging to each primary category
        const pureClothingCollections = ['Klær', 'Dameklær', 'Genser', 'Joggebukser', 'T-shirts', 'Hatter /caps'];
        const plakaterCollections = ['Bilder og plakater', 'Maleri', 'Fotografi', 'Typografi', 'Abstrakt', 'Minimalistisk', 'Fargerik', 'Svart-hvit', 'Retro', 'Romantisk', 'Whimsical'];
        const klistermerkerCollections = ['Klistermerker'];
        const cupsCollections = ['Cups and bottles', 'Kopper og flasker'];

        // Precise regexes with word boundaries for name keyword matching
        const clothingRegex = /\b(genser|gensere|hettegenser|hettegensere|tskjorte|tskjorter|t-skjorte|t-skjorter|tee|tees|body|bodyer|babybody|babybodyer|babysuit|skjorte|skjorter|topp|topper|caps|lue|luer|beanie|beanies|sokker|bukse|bukser|pants|hoodie|hoodies|sweatshirt|sweatshirts|tights|jakke|jakker|smekke|smekker|bib|dametrøye|dametrøyer|treningstrøye|treningstrøyer)\b/i;
        const stickerRegex = /\b(klistremerke|klistremerker|sticker|stickers)\b/i;
        const posterRegex = /\b(plakat|plakater|poster|postere|kunsttrykk|bilde|bilder|canvas|matte paper|glossy paper|semi-glossy|wall art|veggkunst|digital plakat|digital poster)\b/i;
        const cupOrBottleRegex = /\b(kopp|kopper|krus|mug|mugs|flaske|flasker|bottle|bottles|tumbler|travel mug|water bottle)\b/i;
        const bagRegex = /\b(tote|totebag|handlenett|bag|shopping bag)\b/i;

export function productTaxonomy(item, collectionsMap = {}) {
          const nameLower = item.name.toLowerCase();
          const resolvedCollections = item.collectionIds?.map(id => collectionsMap[id]).filter(Boolean) || [];
          
          const hasCupCollection = resolvedCollections.some(c => cupsCollections.includes(c));
          const hasCupName = cupOrBottleRegex.test(nameLower);
          const hasBagName = bagRegex.test(nameLower);
          const hasPosterCollection = resolvedCollections.some(c => plakaterCollections.includes(c));
          const hasPosterName = posterRegex.test(nameLower);
          const hasClothingCollection = resolvedCollections.some(c => pureClothingCollections.includes(c));
          const hasClothingName = clothingRegex.test(nameLower);
          const hasStickerCollection = resolvedCollections.some(c => klistermerkerCollections.includes(c));
          const hasStickerName = stickerRegex.test(nameLower);

          let category = 'Tilbehør';
          if (hasStickerName || (hasStickerCollection && !hasPosterName && !hasClothingName)) {
            category = 'Klistermerker';
          } else if (hasPosterName || (hasPosterCollection && !hasClothingName && !hasClothingCollection)) {
            category = 'Plakater';
          } else if ((hasCupName || hasCupCollection || hasBagName) && !hasClothingName) {
            category = 'Tilbehør';
          } else if (hasClothingName || hasClothingCollection) {
            category = 'Klær';
          } else if (hasPosterCollection) {
            category = 'Plakater';
          }

  return {category, subcategories: resolvedCollections};
}

export function selectCategoryProducts(products, {categorySlug, categoryName, language = "no", wixCollections = [], selectedCategories = [], urlSearch = ""} = {}) {
    const getSlugByCategoryName = name => categorySlugForName(name, wixCollections);
    let result = products.filter(p => p.visible !== false);

    // Hide US, CA & Oceania exclusive products on non-English store
    if (language !== 'en') {
      result = result.filter(p => !p.isOceaniaExclusive);
    }

    // Dedicated SEO Topic Cluster Filters
    if (categorySlug === 'kristne-t-skjorter' || categorySlug === 't-skjorter' || categorySlug === 't-shirts') {
      result = result.filter(p => {
        const nameLower = p.name.toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const subs = (p.subcategories || []).map(s => s.toLowerCase());
        const isNonClothing = /\b(bottle|flaske|mug|kopp|krus|cup|tumbler|totebag|tote|handlenett|sticker|klistremerke|plakat|poster)\b/i.test(nameLower);
        const isClothing = (pCat.includes('klær') || pCat.includes('kler') || subs.includes('klær') || subs.includes('t-shirts') || subs.includes('t-skjorter')) && !isNonClothing;
        const isTee = /\b(t-skjorte|t-skjorter|tskjorte|tskjorter|t-shirt|t-shirts|tee|tees|trøye|trøyer|dametrøye|dametrøyer|treningstrøye|treningstrøyer)\b/i.test(nameLower) || subs.includes('t-shirts') || subs.includes('t-skjorter');
        return isClothing && isTee;
      });
    } else if (categorySlug === 'kristne-gensere' || categorySlug === 'gensere' || categorySlug === 'genser' || categorySlug === 'hettegensere') {
      result = result.filter(p => {
        const nameLower = p.name.toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const subs = (p.subcategories || []).map(s => s.toLowerCase());
        const isNonClothing = /\b(bottle|flaske|mug|kopp|krus|cup|tumbler|totebag|tote|handlenett|sticker|klistremerke|plakat|poster)\b/i.test(nameLower);
        const isClothing = (pCat.includes('klær') || pCat.includes('kler') || subs.includes('klær') || subs.includes('genser')) && !isNonClothing;
        const isSweater = /\b(genser|gensere|hoodie|hoodies|sweatshirt|sweatshirts|hettejakke|hettejakker|hettegenser|hettegensere|crewneck)\b/i.test(nameLower) || subs.includes('genser');
        return isClothing && isSweater;
      });
    } else if (categorySlug === 'kristen-streetwear' || categorySlug === 'streetwear') {
      result = result.filter(p => {
        const nameLower = p.name.toLowerCase();
        const subs = (p.subcategories || []).map(s => s.toLowerCase());
        const isNonClothing = /\b(bottle|flaske|mug|kopp|krus|cup|tumbler|sticker|klistremerke|plakat|poster)\b/i.test(nameLower);
        const isStreet = /\b(hoodie|hoodies|genser|gensere|oversized|street|caps|cap|hat|hatt|hatter|joggebukse|joggebukser)\b/i.test(nameLower) || subs.includes('genser') || subs.includes('hatter /caps') || subs.includes('joggebukser');
        return isStreet && !isNonClothing;
      });
    } else if (categorySlug === 'klaer-med-bibelvers' || categorySlug === 'bibelvers') {
      result = result.filter(p => {
        const nameLower = p.name.toLowerCase();
        const descLower = (p.description || '').toLowerCase();
        const pCat = (p.category || '').toLowerCase();
        const isNonClothing = /\b(bottle|flaske|mug|kopp|krus|cup|tumbler|totebag|tote|handlenett|sticker|klistremerke|plakat|poster)\b/i.test(nameLower);
        const isClothing = (pCat.includes('klær') || pCat.includes('kler') || (p.subcategories || []).some(s => s.toLowerCase().includes('klær') || s.toLowerCase().includes('t-shirts') || s.toLowerCase().includes('genser'))) && !isNonClothing;
        const hasVerse = nameLower.includes('vers') || nameLower.includes('psalm') || nameLower.includes('salme') || nameLower.includes('jesaja') || nameLower.includes('joh') || nameLower.includes('john') || nameLower.includes('matteus') || nameLower.includes('korint') || nameLower.includes('ester') || nameLower.includes('mirakel') || nameLower.includes('velsign') || nameLower.includes('gud') || nameLower.includes('jesus') || nameLower.includes('lord') || nameLower.includes('faith') || nameLower.includes('love god') || descLower.includes('bibel') || descLower.includes('vers') || descLower.includes('salme');
        return isClothing && hasVerse;
      });
    } else if (categorySlug === 'kristne-klaer' || categorySlug === 'klær' || categorySlug === 'kler' || categorySlug === 'klaer') {
      result = result.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const subs = (p.subcategories || []).map(s => s.toLowerCase());
        const isNonClothing = pCat.includes('plakat') || pCat.includes('bilde') || /\b(plakat|plakater|poster|postere|kunsttrykk|bilde|bilder|canvas|matte paper|glossy paper|kopp|kopper|krus|mug|mugs|flaske|flasker|bottle|bottles|tumbler|totebag|tote|handlenett|sticker|klistremerke)\b/i.test(p.name);
        const isClothing = (pCat.includes('klær') || pCat.includes('kler') || subs.includes('klær') || subs.includes('t-shirts') || subs.includes('genser') || subs.includes('dameklær')) && !isNonClothing;
        return isClothing;
      });
    } else if (categorySlug === 'kristne-plakater' || categorySlug === 'plakater' || categorySlug === 'bilder-og-plakater') {
      result = result.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const nameLower = p.name.toLowerCase();
        const subs = (p.subcategories || []).map(s => s.toLowerCase());
        return pCat.includes('plakat') || pCat.includes('bilde') || pCat.includes('poster') || subs.includes('plakater') || /\b(plakat|plakater|poster|postere|kunsttrykk|lerret|canvas)\b/i.test(nameLower);
      });
    } else if (categorySlug === 'kristne-kopper' || categorySlug === 'kopper' || categorySlug === 'cups-bottles') {
      result = result.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const nameLower = p.name.toLowerCase();
        const subs = (p.subcategories || []).map(s => s.toLowerCase());
        return pCat.includes('kopp') || pCat.includes('cup') || pCat.includes('bottle') || pCat.includes('flaske') || subs.includes('kopper') || /\b(kopp|kopper|krus|mug|flaske|termoflaske|bottle)\b/i.test(nameLower);
      });
    } else if (categorySlug === 'kristne-klistermerker' || categorySlug === 'klistermerker' || categorySlug === 'klistremerker' || categorySlug === 'stickers') {
      result = result.filter(p => {
        const pCat = (p.category || '').toLowerCase();
        const nameLower = p.name.toLowerCase();
        const subs = (p.subcategories || []).map(s => s.toLowerCase());
        return pCat.includes('klister') || pCat.includes('klistre') || pCat.includes('sticker') || subs.includes('klistermerker') || /\b(klistermerke|klistermerker|sticker|stickers)\b/i.test(nameLower);
      });
    } else if (categoryName === 'Salg') {
      result = result.filter(p => p.isSale);
    } else if (categoryName) {
      const targetSlug = getSlugByCategoryName(categoryName);
      result = result.filter(p => {
        const pCatSlug = getSlugByCategoryName(p.category);
        const hasMatchingSub = p.subcategories && p.subcategories.some(sub => getSlugByCategoryName(sub) === targetSlug);
        return pCatSlug === targetSlug || hasMatchingSub;
      });
    } else if (selectedCategories.length > 0) {
      const targetSlugs = selectedCategories.map(c => getSlugByCategoryName(c));
      result = result.filter(p => {
        const pCatSlug = getSlugByCategoryName(p.category);
        const hasMatchingSub = p.subcategories && p.subcategories.some(sub => targetSlugs.includes(getSlugByCategoryName(sub)));
        return targetSlugs.includes(pCatSlug) || hasMatchingSub;
      });
    }

    // Filter by search query
    if (urlSearch) {
      const query = urlSearch.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        (p.subcategories && p.subcategories.some(s => s.toLowerCase().includes(query))) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    return result;
}

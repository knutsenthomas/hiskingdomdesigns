// Mock products list based on ACTUAL products in the system
const products = [
  {
    id: 'prod-1',
    name: 'Kingdom Life T-skjorte',
    category: 'Klær',
    gender: 'Herre',
    description: 'En kvalitets t-skjorte i organisk bomull...',
    subcategories: ['T-shirts', 'Klær', 'NORSKE produkter', 'Jesus', 'Bestselgere', 'Populære produkter']
  },
  {
    id: 'prod-4',
    name: 'Little Disciple T-skjorte',
    category: 'Klær',
    gender: 'Barn',
    description: 'En søt og slitesterk t-skjorte for de minste disiplene. Laget i supermyk økologisk bomull...',
    subcategories: ['BARN & UNGDOM', 'T-shirts', 'Klær', 'ENGLISH products']
  },
  {
    id: 'prod-5',
    name: 'Herren velsigne deg T-skjorte',
    category: 'Klær',
    gender: 'Unisex',
    description: 'Vår absolutte signatur-tee...',
    subcategories: ['T-shirts', 'Klær', 'NORSKE produkter', 'Bestselgere']
  }
];

function getProductRecommendations(inputText) {
  const lower = inputText.toLowerCase().trim();
  
  const isAskingAboutProducts = true;
  
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

  const stopWords = new Set(['jeg', 'anbefaling', 'til', 'en']);
  const words = lower
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));

  console.log('Is Kids Query:', isKidsQuery);
  console.log('Search words:', words);

  let matches = [];

  products.forEach(prod => {
    let score = 0;
    const prodNameLower = prod.name.toLowerCase();
    const prodDescLower = prod.description?.toLowerCase() || '';
    const prodCatLower = prod.category.toLowerCase();
    const prodSubcats = prod.subcategories?.map(s => s.toLowerCase()) || [];

    if (isKidsQuery) {
      const hasKidsTag = 
        prod.gender === 'Barn' || 
        prod.category?.toLowerCase().includes('barn') || 
        prodNameLower.includes('barn') || 
        prodDescLower.includes('barn') || 
        prodSubcats.some(s => s.includes('barn') || s.includes('ungdom') || s.includes('kids'));
      
      if (hasKidsTag) {
        score += 35;
      }
    }

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
    });

    if (score > 0) {
      matches.push({ product: prod, score });
    }
  });

  matches.sort((a, b) => b.score - a.score);
  return matches;
}

const res = getProductRecommendations("anbefaling til en 10 åring");
console.log('Results:', JSON.stringify(res, null, 2));

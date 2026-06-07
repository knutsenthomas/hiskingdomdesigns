import { createClient, OAuthStrategy } from '@wix/sdk';
import { products, collections } from '@wix/stores';

const wixClient = createClient({
  modules: {
    products,
    collections,
  },
  auth: OAuthStrategy({
    clientId: '82b2b70d-fb70-4b76-abfd-a2a70f38ac06',
  }),
});

async function main() {
  console.log('Fetching collections from Wix...');
  const collectionsList = await wixClient.collections.queryCollections().limit(100).find();
  const collectionsMap = {};
  collectionsList.items.forEach(c => {
    collectionsMap[c._id] = c.name;
  });

  console.log('\nFetching products from Wix...');
  let response = await wixClient.products.queryProducts().limit(100).find();
  let allItems = [...response.items];
  while (response.hasNext()) {
    response = await response.next();
    allItems = [...allItems, ...response.items];
  }

  console.log(`\nTotal products fetched from Wix: ${allItems.length}`);

  // Base collections
  const klaerCollections = ['Klær', 'Dameklær', 'Genser', 'Joggebukser', 'T-shirts', 'Hatter /caps', 'Sport / Performance /Outdoor', 'RUSS', 'BABY', 'BARN & UNGDOM'];
  const plakaterCollections = ['Bilder og plakater', 'Maleri', 'Fotografi', 'Typografi', 'Abstrakt', 'Minimalistisk', 'Fargerik', 'Svart-hvit', 'Retro', 'Romantisk', 'Whimsical'];
  const klistermerkerCollections = ['Klistermerker'];

  // Precise regexes with word boundaries for name keyword matching
  const clothingRegex = /\b(genser|gensere|hettegenser|hettegensere|tskjorte|tskjorter|t-skjorte|t-skjorter|tee|tees|body|bodyer|babybody|babybodyer|babysuit|skjorte|skjorter|topp|topper|caps|lue|luer|beanie|beanies|sokker|bukse|bukser|pants|hoodie|hoodies|sweatshirt|sweatshirts|tights|jakke|jakker)\b/i;
  const stickerRegex = /\b(klistremerke|klistremerker|sticker|stickers)\b/i;
  const posterRegex = /\b(plakat|plakater|poster|postere|kunsttrykk|bilde|bilder|canvas)\b/i;

  console.log('Testing AppContext mapping logic...');
  
  const mapped = allItems.map(item => {
    try {
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
          return name && (name === 'color' || name === 'farge');
        });
        if (colorOpt) {
          const rawColorNames = colorOpt.choices?.map(c => c.value) || [];
          colorNames = rawColorNames.map(name => {
            if (!name) return 'Sort';
            const lower = name.toLowerCase();
            
            // 1. Sort / Mørk
            if (lower.includes('sort') || lower.includes('black') || lower.includes('charcoal') || lower.includes('coal') || lower.includes('rgb(0,0,0)') || lower.includes('rgb(64,64,64)')) return 'Sort';
            
            // 2. Hvit / Lys
            if (lower.includes('hvit') || lower.includes('white') || lower.includes('rgb(252,252,252)') || lower.includes('rgb(255,255,255)')) return 'Hvit';
            
            // 3. Grå
            if (lower.includes('grå') || lower.includes('grey') || lower.includes('gray') || lower.includes('ash') || lower.includes('silver') || lower.includes('cement') || lower.includes('#a8a8a8') || lower.includes('grey melange') || lower.includes('sport grey')) return 'Grå';
            
            // 4. Blå / Marine
            if (lower.includes('blå') || lower.includes('blue') || lower.includes('navy') || lower.includes('royal') || lower.includes('sky') || lower.includes('sapphire') || lower.includes('teal')) return 'Blå';
            
            // 5. Rød / Vinrød
            if (lower.includes('rød') || lower.includes('red') || lower.includes('maroon') || lower.includes('garnet') || lower.includes('cardinal') || lower.includes('cherry')) return 'Rød';
            
            // 6. Grønn
            if (lower.includes('grønn') || lower.includes('green') || lower.includes('kelly') || lower.includes('mint') || lower.includes('pistachio') || lower.includes('forest')) return 'Grønn';
            
            // 7. Gul / Gull
            if (lower.includes('gul') || lower.includes('yellow') || lower.includes('gold') || lower.includes('daisy') || lower.includes('haze')) return 'Gul';
            
            // 8. Rosa
            if (lower.includes('rosa') || lower.includes('pink') || lower.includes('fuchsia') || lower.includes('azalea') || lower.includes('berry') || lower.includes('heliconia') || lower.includes('magenta')) return 'Rosa';
            
            // 9. Beige / Sand
            if (lower.includes('beige') || lower.includes('sand') || lower.includes('natural') || lower.includes('cream') || lower.includes('creamy')) return 'Beige';
            
            // 10. Terracotta / Brun
            if (lower.includes('terrakotta') || lower.includes('terracotta') || lower.includes('brun') || lower.includes('brown') || lower.includes('chocolate') || lower.includes('clay')) return 'Terracotta';
            
            // 11. Orange
            if (lower.includes('orange') || lower.includes('tangerine') || lower.includes('coral')) return 'Orange';
            
            // 12. Lilla
            if (lower.includes('lilla') || lower.includes('purple') || lower.includes('violet') || lower.includes('orchid') || lower.includes('plum')) return 'Lilla';
            
            // Parse color codes
            if (lower.startsWith('#') || lower.startsWith('rgb')) {
              if (lower.includes('255,255,255') || lower === '#ffffff') return 'Hvit';
              if (lower.includes('0,0,0') || lower === '#000000' || lower === '#151a21') return 'Sort';
              return 'Grå';
            }

            return 'Sort'; // default fallback
          });

          colors = colorNames.map(name => {
            if (name === 'Sort') return '#151A21';
            if (name === 'Hvit') return '#FFFFFF';
            if (name === 'Grå') return '#E5E7EB';
            if (name === 'Rød') return '#ef4444';
            if (name === 'Blå') return '#1e293b';
            if (name === 'Grønn') return '#16a34a';
            if (name === 'Gul') return '#eab308';
            if (name === 'Rosa') return '#db2777';
            if (name === 'Beige') return '#d4c4b5';
            if (name === 'Terracotta') return '#CC712B';
            if (name === 'Orange') return '#f97316';
            if (name === 'Lilla') return '#a855f7';
            return '#888888';
          });
        }
      }

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

      return {
        id: item._id,
        name: item.name,
        price: price,
        originalPrice: isSale ? originalPrice : undefined,
        category: category,
        colors: colors,
        colorNames: colorNames,
        sizes: sizes,
        image: item.media?.mainMedia?.image?.url || 'https://via.placeholder.com/400',
        images: item.media?.items?.filter(mi => mi.mediaType === 'image').map(mi => mi.image?.url).filter(Boolean) || [],
        isBestseller: isBestseller,
        isSale: isSale,
        description: item.description?.replace(/<[^>]*>/g, '') || '',
        subcategories: resolvedCollections,
        productOptions: item.productOptions,
        manageVariants: item.manageVariants,
        variants: item.variants
      };
    } catch (err) {
      console.error(`CRASH on mapping product: "${item.name}" (ID: ${item._id})`);
      throw err;
    }
  });

  console.log(`Successfully mapped ${mapped.length} products!`);
}

main().catch(console.error);

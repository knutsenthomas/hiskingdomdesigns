import { staticWixClient } from '../src/lib/wix.js';
import { getTranslatedProduct } from '../src/lib/productTranslations.js';

async function test() {
  console.log("Fetching products...");
  try {
    const response = await staticWixClient.products.queryProducts()
      .limit(5)
      .descending('_createdDate')
      .find();
    
    const items = response.items || response._items || [];
    console.log(`Fetched ${items.length} products.`);

    items.forEach(p => {
      console.log(`\n=== RAW PRODUCT: ${p.name} (${p._id}) ===`);
      console.log("Raw desc:", p.description);

      const translated = getTranslatedProduct(p, 'no');
      console.log("--- TRANSLATED NORWEGIAN ---");
      console.log("Translated name:", translated.name);
      console.log("Translated desc:", translated.description);

      // Apply the slider processing logic
      let descResult = 'Oppdag vårt nyeste tilskudd i butikken nå!';
      if (translated.description) {
        const formatted = translated.description
          .replace(/<\/p>|<\/li>|<div>|<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\u00A0/g, ' ');
        
        const lines = formatted.split('\n');
        const cleanParagraphs = [];
        
        const specRegex = /(?:papirfinish|paper\s+finish|paper\s+finishing|papirvekt|paper\s+weight|tykkelse|thickness|bærekraftig|sustainable|materiale|material|koppehøyde|mug\s+height|bunndiameter|bottom\s+diameter|leveringstid|delivery|størrelse|size|vaskeanvisning|care\s+instructions|produktsikkerhet|safety|frakt|shipping|vekt|weight)\s*:/i;
        const bulletRegex = /^[-*•]/;
        const authorOrShippingRegex = /(?:designet\s+av|designed\s+by|global\s+frakt|global\s+shipping|world\s+wide\s+shipping|internasjonal\s+frakt)/i;
        
        for (let line of lines) {
          let trimmed = line.trim();
          if (!trimmed) continue;
          
          if (bulletRegex.test(trimmed)) {
            break;
          }
          
          const metaMatch = authorOrShippingRegex.exec(trimmed);
          if (metaMatch) {
            const metaIndex = metaMatch.index;
            trimmed = trimmed.substring(0, metaIndex).trim();
            if (trimmed) {
              trimmed = trimmed.replace(/[:,\-\s\.]+$/, '') + '.';
              cleanParagraphs.push(trimmed);
            }
            break;
          }
          
          const specMatch = specRegex.exec(trimmed);
          if (specMatch) {
            const specIndex = specMatch.index;
            trimmed = trimmed.substring(0, specIndex).trim();
            if (trimmed) {
              trimmed = trimmed.replace(/[:,\-\s\.]+$/, '') + '.';
              cleanParagraphs.push(trimmed);
            }
            break;
          }
          
          cleanParagraphs.push(trimmed);
        }
        
        if (cleanParagraphs.length > 0) {
          descResult = cleanParagraphs.join(' ').trim();
        }
      }

      console.log(">>> FINAL SLIDER DESC:", descResult);
    });
  } catch (err) {
    console.error("Error fetching products:", err);
  }
}

test();

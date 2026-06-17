const specRegex = /(?:papirfinish|paper\s+finish|paper\s+finishing|papirvekt|paper\s+weight|tykkelse|thickness|bærekraftig|sustainable|materiale|material|koppehøyde|mug\s+height|bunndiameter|bottom\s+diameter|leveringstid|delivery|størrelse|size|vaskeanvisning|care\s+instructions|produktsikkerhet|safety|frakt|shipping|vekt|weight)\s*:/i;
const bulletRegex = /^[-*•]/;
const authorOrShippingRegex = /(?:designet\s+av|designed\s+by|global\s+frakt|global\s+shipping|world\s+wide\s+shipping|internasjonal\s+frakt)/i;

const description = "Tro som et sennepsfrø... Plakat laget på vårt lettere, ubestrøkede klassiske matte papir. Det perfekte valget for å vare over tid: Papirfinish: Matt, glatt, ikke-reflekterende overflate. Papirvekt: 170 g/m² (65 lb), tykkelse: 0,19 mm (7,5 mils), solid og slitesterkt. Bærekraftig papir: FSC-sertifisert eller tilsvarende for bærekraft.Designet av Jaana Särg-Raani for His Kingdom Designs.Global frakt.";

const formatted = description
  .replace(/<\/p>|<\/li>|<div>|<br\s*\/?>/gi, '\n')
  .replace(/<[^>]*>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/\u00A0/g, ' ');

const lines = formatted.split('\n');
const cleanParagraphs = [];

for (let line of lines) {
  let trimmed = line.trim();
  if (!trimmed) continue;
  
  if (bulletRegex.test(trimmed)) {
    console.log("Matched bullet: " + trimmed);
    break;
  }
  
  let earliestIndex = -1;
  const metaMatch = authorOrShippingRegex.exec(trimmed);
  const specMatch = specRegex.exec(trimmed);
  
  if (metaMatch && specMatch) {
    earliestIndex = Math.min(metaMatch.index, specMatch.index);
  } else if (metaMatch) {
    earliestIndex = metaMatch.index;
  } else if (specMatch) {
    earliestIndex = specMatch.index;
  }
  
  if (earliestIndex !== -1) {
    trimmed = trimmed.substring(0, earliestIndex).trim();
    if (trimmed) {
      trimmed = trimmed.replace(/[:,\-\s\.]+$/, '') + '.';
      cleanParagraphs.push(trimmed);
    }
    console.log("Matched at index " + earliestIndex + ": " + trimmed);
    break;
  }
  
  cleanParagraphs.push(trimmed);
}

console.log("Result: " + cleanParagraphs.join(' '));

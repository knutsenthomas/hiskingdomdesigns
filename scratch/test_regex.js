const specRegex = /(?:papirfinish|paper\s+finish|paper\s+finishing|papirvekt|paper\s+weight|tykkelse|thickness|bærekraftig|sustainable|materiale|material|koppehøyde|mug\s+height|bunndiameter|bottom\s+diameter|leveringstid|delivery|størrelse|size|vaskeanvisning|care\s+instructions|produktsikkerhet|safety|frakt|shipping|vekt|weight)\s*:/i;
const bulletRegex = /^[-*•]/;
const authorOrShippingRegex = /(?:designet\s+av|designed\s+by|global\s+frakt|global\s+shipping|world\s+wide\s+shipping|internasjonal\s+frakt)/i;

const description = "Plakat laget på vårt lettere, ubestrøkede klassiske matte papir. Det perfekte valget for å vare over tid: Papirfinish: Matt, glatt, ikke-reflekterende overflate.";

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
  
  const metaMatch = authorOrShippingRegex.exec(trimmed);
  if (metaMatch) {
    const metaIndex = metaMatch.index;
    trimmed = trimmed.substring(0, metaIndex).trim();
    if (trimmed) {
      trimmed = trimmed.replace(/[:,\-\s\.]+$/, '') + '.';
      cleanParagraphs.push(trimmed);
    }
    console.log("Matched meta: " + trimmed);
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
    console.log("Matched spec at index " + specIndex + ": " + trimmed);
    break;
  }
  
  cleanParagraphs.push(trimmed);
}

console.log("Result: " + cleanParagraphs.join(' '));

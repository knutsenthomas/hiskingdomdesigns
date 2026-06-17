const specRegex = /(?:papirfinish|paper\s+finish|paper\s+finishing|papirvekt|paper\s+weight|tykkelse|thickness|bærekraftig|sustainable|materiale|material|koppehøyde|mug\s+height|bunndiameter|bottom\s+diameter|leveringstid|delivery|størrelse|size|vaskeanvisning|care\s+instructions|produktsikkerhet|safety|frakt|shipping|vekt|weight)\s*:/i;
const bulletRegex = /^[-*•]/;
const authorOrShippingRegex = /(?:designet\s+av|designed\s+by|global\s+frakt|global\s+shipping|world\s+wide\s+shipping|internasjonal\s+frakt)/i;

const description = "Om dere har tro som et sennepsfrø... Denne vakre keramiske koppen er perfekt for enhver anledning i hverdagen. morgenkaffen, en varm kakao, eller annen varm drikke. Koppen har en glansfull finish som gjør at motivene fremstår klare og levende. Trykket beholder sin høye kvalitet og glans ved bruk i både mikrobølgeovn og oppvaskmaskin.- Keramisk kopp (325 ml).- Tåler oppvaskmaskin og mikrobølgeovn.- Produktsikkerhetstester utført av uavhengige tredjepartslaboratorier.- Koppehøyde 96 mm, bunndiameter 80 mm.- Designet av Jaana Särg-Raani for His Kingdom Designs.- Global frakt.";

const formatted = description
  .replace(/<\/p>|<\/li>|<div>|<br\s*\/?>/gi, '\n')
  .replace(/\.-/g, '.\n-') // Newline before dot-dash
  .replace(/\s+-\s+/g, '\n- ') // Newline before space-dash-space
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

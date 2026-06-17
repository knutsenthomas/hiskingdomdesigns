const testCases = [
  {
    name: "Mug with Ellipsis",
    text: "Om dere har tro som et sennepsfrø... Denne vakre keramiske koppen er perfekt for enhver anledning i hverdagen. morgenkaffen, en varm kakao, eller annen varm drikke. Koppen har en glansfull finish som gjør at motivene fremstår klare og levende."
  },
  {
    name: "Poster",
    text: "Opplev kunst som føles silkemyk med vårt klassiske halvblanke papir av høy kvalitet og lavere vekt. Denne inspirerende rosa bibelversplakaten er et must på soverommet, kontoret, i bønnerommet etc."
  },
  {
    name: "Single sentence",
    text: "En genser i kraftig kvalitet."
  },
  {
    name: "With exclamation",
    text: "Vakker plakat! Perfekt for stuen din. Kjøp i dag!"
  }
];

function getFirstTwoSentences(str) {
  if (!str) return str;
  const cleanStr = str.replace(/\s+/g, ' ').trim();
  const sentences = [];
  let currentStart = 0;
  
  // Matches a period, question mark, exclamation mark, or an ellipsis, followed by a space or end of string.
  // Note: we use [^.] to avoid matching individual dots of an ellipsis as separate sentence boundaries,
  // but we specifically allow three dots (or more) followed by space.
  const boundaryRegex = /(?:\.{3,}|[!?.])(?=\s|$)/g;
  
  let match;
  while ((match = boundaryRegex.exec(cleanStr)) !== null) {
    const endPos = match.index + match[0].length;
    const sentence = cleanStr.substring(currentStart, endPos).trim();
    if (sentence) {
      sentences.push(sentence);
    }
    currentStart = endPos;
    if (sentences.length >= 2) {
      break;
    }
  }
  
  if (sentences.length < 2 && currentStart < cleanStr.length) {
    const remaining = cleanStr.substring(currentStart).trim();
    if (remaining) {
      sentences.push(remaining);
    }
  }
  
  return sentences.join(' ');
}

testCases.forEach(tc => {
  console.log(`--- Test: ${tc.name} ---`);
  console.log("Input: ", tc.text);
  console.log("Output:", getFirstTwoSentences(tc.text));
  console.log("");
});

import { createClient, ApiKeyStrategy } from '@wix/sdk';
import { products } from '@wix/stores';

const wixClient = createClient({
  modules: {
    products
  },
  auth: ApiKeyStrategy({
    siteId: '7682a906-41f6-4e8d-b0b1-bfdb5ee596e7',
    apiKey: 'IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjg2NTkxYjBiLTAwNGUtNDRmMi05NGQ4LWJiNDEyMmYxNzE5ZVwiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjViMDJiNTQ3LWM3NTAtNDNmMS04YjlmLWFlNmVlY2ZiODY3MlwifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkYjRmOTZkOC1lYjhhLTRhN2EtYmVjOS02MzA5YjEyMDNmODNcIn19IiwiaWF0IjoxNzgwODE4MTgyfQ.dFFNriVyZxY1FGkAVdycrLK8YE8qXiVjX54lh5z-2eEW0Hsa_4mR9vtycx5bGQmasWJP8zsAxL7WSIdFSEubEBWeZCbNhSlDUg2O5ejFQi6Id-usmpvTa-1XutoF4pTCyysWeptZXZQAgoY63u7LLzoNzNqNVzUSt6jLrvndqtZhpF1YZwJsIDfLRWw_Rt3qFRtKrtdGl8bBCeSEGdADIKKVlTep0lNsSRFAI-sXvzo3RdhjfMovkNszbG0fHS0wAAb-WHYIk6DC13myaKYaYnmWr8aS-sAx5hleIK4Vww0rDcMfc6MxkOD-3Xk84vYt-JGfFKUgIxCbhrSJDYMgKg'
  }),
});

function translateProductName(originalName, lang) {
  if (!originalName) return originalName;

  let name = originalName;

  // 1. Strip common volume/size/dimension patterns from name to avoid messing up base name
  const patternsToStrip = [
    /\d+\s*ml/gi,
    /\d+\s*oz/gi,
    /\d+x\d+\s*cm/gi,
    /\d+x\d+″/gi,
    /\d+″/gi,
    /325ml/gi,
    /500ml/gi,
    /444ml/gi,
    /355ml/gi
  ];
  patternsToStrip.forEach(pat => {
    name = name.replace(pat, '');
  });

  // 2. Detect and parse details/specifications
  let woodMatch = name.match(/i tre/i) || name.match(/in wood/i) || name.match(/de madera/i);
  let isWood = !!woodMatch;
  if (woodMatch) name = name.replace(woodMatch[0], '');

  let shortSleeveMatch = name.match(/kortermet/i) || name.match(/short sleeve/i) || name.match(/manga corta/i);
  let isShortSleeve = !!shortSleeveMatch;
  if (shortSleeveMatch) name = name.replace(shortSleeveMatch[0], '');
  
  let longSleeveMatch = name.match(/langermet/i) || name.match(/long sleeve/i) || name.match(/manga larga/i);
  let isLongSleeve = !!longSleeveMatch;
  if (longSleeveMatch) name = name.replace(longSleeveMatch[0], '');

  let organicMatch = name.match(/økologisk/i) || name.match(/organic/i) || name.match(/orgánico/i);
  let isOrganic = !!organicMatch;
  if (organicMatch) name = name.replace(organicMatch[0], '');

  let backPrintMatch = name.match(/trykk på ryggen/i) || name.match(/print on back/i) || name.match(/impresión en la espalda/i);
  let isBackPrint = !!backPrintMatch;
  if (backPrintMatch) name = name.replace(backPrintMatch[0], '');

  let englishTextMatch = name.match(/engelsk tekst/i) || name.match(/english text/i) || name.match(/texto en inglés/i) || name.match(/\(engelsk\)/i);
  let isEnglishText = !!englishTextMatch;
  if (englishTextMatch) name = name.replace(englishTextMatch[0], '');

  // Extract size/age/volume (preventing type keywords like stickers from matching as size value)
  const sizeRegex = /str\.\s*([a-z0-9\-]+)/i || /size\s+(?!stickers|t-shirt|tshirt|hoodie|sweatshirt|mug|cup|glassbrikker|koppeunderlag|bottle|totebag|poster|wristband)(\b[a-z0-9\-]+)/i;
  let sizeMatch = name.match(sizeRegex);
  let sizeVal = sizeMatch ? sizeMatch[1].toUpperCase() : null;
  if (sizeMatch) name = name.replace(sizeMatch[0], '');

  let ageMatch = name.match(/(\d+\s*og\s*\d+)\s*år/i) || name.match(/(\d+\s*and\s*\d+)\s*years/i);
  let ageVal = ageMatch ? ageMatch[1] : null;
  if (ageMatch) name = name.replace(ageMatch[0], '');

  let singleAgeMatch = name.match(/(\d+)\s*år/i) || name.match(/(\d+)\s*years/i);
  let singleAgeVal = singleAgeMatch ? singleAgeMatch[1] : null;
  if (singleAgeMatch) name = name.replace(singleAgeMatch[0], '');

  let mndMatch = name.match(/(\d+)\s*mnd/i) || name.match(/(\d+)\s*months/i) || name.match(/(\d+)\s*meses/i);
  let mndVal = mndMatch ? mndMatch[1] : null;
  if (mndMatch) name = name.replace(mndMatch[0], '');

  let mndRangeMatch = name.match(/(\d+\s*-\s*\d+)\s*mnd/i) || name.match(/(\d+\s*-\s*\d+)\s*M/i);
  let mndRangeVal = mndRangeMatch ? mndRangeMatch[1] : null;
  if (mndRangeMatch) name = name.replace(mndRangeMatch[0], '');

  // 3. Identify Product Type (Order matters: check sweatshirt before t-shirt!)
  let type = 'unknown';
  let lower = originalName.toLowerCase();

  if (lower.includes('travel mug') || lower.includes('travelmug') || lower.includes('termokopp')) {
    type = 'travel-mug';
  } else if (lower.includes('enamel mug') || lower.includes('emaljekopp')) {
    type = 'enamel-mug';
  } else if (lower.includes('glassbrikker') || lower.includes('koppeunderlag') || lower.includes('coasters')) {
    type = 'coasters';
  } else if (lower.includes('water bottle') || lower.includes('drikkeflaske')) {
    type = 'bottle';
  } else if (lower.includes('sweatshirt') || lower.includes('genser')) {
    type = 'sweatshirt';
  } else if (lower.includes('hettegenser') || lower.includes('hoodie') || lower.includes('hettejakke')) {
    type = 'hoodie';
  } else if (lower.includes('t-shirt') || lower.includes('tshirt') || lower.includes('tskjorte') || lower.includes('dametrøye') || lower.includes('treningstrøye') || lower.includes('tee')) {
    type = 't-shirt';
  } else if (lower.includes('babybody') || lower.includes('onesie') || lower.includes('body')) {
    type = 'babybody';
  } else if (lower.includes('totebag') || lower.includes('tote bag') || lower.includes('handlenett')) {
    type = 'totebag';
  } else if (lower.includes('klistremerke') || lower.includes('sticker')) {
    type = 'sticker';
  } else if (lower.includes('poster') || lower.includes('print') || lower.includes('plakat')) {
    type = 'poster';
  } else if (lower.includes('wristband') || lower.includes('bracelet') || lower.includes('armbånd')) {
    type = 'wristband';
  } else if (lower.includes('mug') || lower.includes('cup') || lower.includes('kopp') || lower.includes('koppen')) {
    type = 'mug';
  }

  // 4. Extract Design Name (base name)
  let baseName = name;

  // Split on common delimiters first
  let parts = baseName.split(' - ');
  if (parts.length > 1) {
    // If the last part contains type words or specifications, drop it
    let lastPart = parts[parts.length - 1].toLowerCase();
    const isTypeOrDetail = lastPart.includes('str') || 
                           lastPart.includes('mnd') || 
                           lastPart.includes('år') ||
                           lastPart.includes('ml') ||
                           lastPart.includes('oz') ||
                           lastPart.includes('body') ||
                           lastPart.includes('genser') ||
                           lastPart.includes('tskjorte') ||
                           lastPart.includes('kopp') ||
                           lastPart.includes('mug') ||
                           lastPart.includes('t-shirt') ||
                           lastPart.includes('tshirt') ||
                           lastPart.includes('hoodie');
    if (isTypeOrDetail) {
      baseName = parts.slice(0, -1).join(' - ');
    } else {
      baseName = parts.join(' - ');
    }
  }

  // Second pass split on pipe
  let pipeParts = baseName.split(' | ');
  if (pipeParts.length > 1) {
    baseName = pipeParts[0];
  }

  // Strip type keywords and descriptors from the baseName
  const typeWords = [
    'tskjorte', 't-skjorte', 'tshirt', 't-shirt', 'tee', 'dametrøye', 'treningstrøye',
    'genser', 'hettegenser', 'hoodie', 'hettejakke', 'sweatshirt',
    'kopp', 'koppen', 'cup', 'mug', 'travel mug', 'travelmug', 'termokopp', 'emaljekopp',
    'babybody', 'body',
    'totebag', 'tote bag', 'handlenett',
    'sticker', 'stickers', 'klistremerke', 'klistremerker',
    'poster', 'print', 'plakat',
    'wristband', 'bracelet', 'armbånd',
    'water bottle', 'drikkeflaske',
    'glassbrikker', 'koppeunderlag'
  ];

  const descriptors = [
    'kortermet', 'langermet', 'short sleeve', 'long sleeve', 'organic', 'økologisk',
    'classic', 'unisex', 'crewneck', 'ceramic', 'glass', 'wooden', 'wood', 'stainless steel'
  ];

  typeWords.forEach(word => {
    const regex = new RegExp(`(?:\\s*-\\s*|\\s+)\\b${word}\\b.*$`, 'i');
    baseName = baseName.replace(regex, '');
  });

  descriptors.forEach(word => {
    const regex = new RegExp(`(?:\\s*-\\s*|\\s+)\\b${word}\\b.*$`, 'i');
    baseName = baseName.replace(regex, '');
  });

  // Clean trailing spaces and separators from baseName
  baseName = baseName.trim().replace(/[\s\-\|,\(\)]+$/, '').trim();
  // Clean empty parentheses/brackets
  baseName = baseName.replace(/\(\s*\)/g, '').replace(/\[\s*\]/g, '').replace(/\s+/g, ' ').trim();

  // If baseName becomes empty, fallback to a sensible portion of original name
  if (!baseName || baseName.length < 2) {
    baseName = originalName.split(/str\./i)[0].split(/\d+/)[0].trim().replace(/[\s\-\|,\(\)]+$/, '').trim();
  }

  // 5. Translate base design name if it has a match
  let translatedBase = baseName;
  const designTranslations = {
    'FAITH OVER FEAR': 'Faith Over Fear',
    'PRAISE THE LORD': 'Praise The Lord',
    'BORN AGAIN': 'Born Again',
    'GUARD YOUR HEART': 'Guard Your Heart',
    'FEAR NOT': 'Fear Not',
    'AMAZING GRACE': 'Amazing Grace',
    'JESUS SAVES': 'Jesus Saves',
    'FAITH': 'Faith',
    'HOPE': 'Hope',
    'LOVE': { no: 'Love', en: 'Love', es: 'Amor' },
    'PEACE': { no: 'Peace', en: 'Peace', es: 'Paz' },
    'JOY': { no: 'Joy', en: 'Joy', es: 'Gozo' },
    'GRACE': { no: 'Grace', en: 'Grace', es: 'Gracia' },
    'BE STRONG': 'Be Strong',
    'TRUST IN THE LORD': 'Trust In The Lord',
    'LIGHT OF THE WORLD': 'Light Of The World',
    'CHOSEN': 'Chosen',
    'REDEEMED': 'Redeemed',
    'BLESSED': 'Blessed'
  };

  const upperBase = baseName.toUpperCase();
  if (designTranslations[upperBase]) {
    const val = designTranslations[upperBase];
    translatedBase = typeof val === 'object' ? (val[lang] || val['en']) : val;
  }

  // 6. Translate Product Type
  let typeStr = '';
  if (type === 't-shirt') {
    if (lower.includes('treningstrøye')) {
      typeStr = lang === 'no' ? 'Treningstrøye' : lang === 'es' ? 'Camiseta deportiva' : 'Performance Tee';
    } else if (lower.includes('dametrøye')) {
      typeStr = lang === 'no' ? 'Dametrøye' : lang === 'es' ? 'Camiseta de mujer' : "Women's Tee";
    } else {
      typeStr = lang === 'no' ? 'T-skjorte' : lang === 'es' ? 'Camiseta' : 'T-shirt';
    }
  } else if (type === 'hoodie') {
    if (lower.includes('hettejakke')) {
      typeStr = lang === 'no' ? 'Hettejakke' : lang === 'es' ? 'Chaqueta con capucha' : 'Hooded Jacket';
    } else {
      typeStr = lang === 'no' ? 'Hettegenser' : lang === 'es' ? 'Sudadera con capucha' : 'Hoodie';
    }
  } else if (type === 'sweatshirt') {
    typeStr = lang === 'no' ? 'Genser' : lang === 'es' ? 'Sudadera' : 'Sweatshirt';
  } else if (type === 'mug') {
    typeStr = lang === 'no' ? 'Kopp' : lang === 'es' ? 'Taza' : 'Mug';
  } else if (type === 'travel-mug') {
    typeStr = lang === 'no' ? 'Termokopp' : lang === 'es' ? 'Taza de viaje' : 'Travel Mug';
  } else if (type === 'enamel-mug') {
    typeStr = lang === 'no' ? 'Emaljekopp' : lang === 'es' ? 'Taza de esmalte' : 'Enamel Mug';
  } else if (type === 'babybody') {
    let prefix = isOrganic ? (lang === 'no' ? 'Økologisk ' : lang === 'es' ? 'orgánico ' : 'Organic ') : '';
    let style = isShortSleeve ? (lang === 'no' ? ' (kortermet)' : lang === 'es' ? ' de manga corta' : ' (short sleeve)') :
                isLongSleeve ? (lang === 'no' ? ' (langermet)' : lang === 'es' ? ' de manga larga' : ' (long sleeve)') : '';
    
    if (lang === 'no') {
      typeStr = prefix + 'Babybody' + style;
    } else if (lang === 'es') {
      typeStr = 'Body de bebé ' + prefix + style;
    } else {
      typeStr = prefix + 'Baby Onesie' + style;
    }
  } else if (type === 'totebag') {
    typeStr = lang === 'no' ? 'Handlenett' : lang === 'es' ? 'Bolsa de tela' : 'Tote Bag';
  } else if (type === 'sticker') {
    let isPlural = lower.includes('stickers') || lower.includes('klistremerker') || lower.includes('stk');
    typeStr = lang === 'no' ? (isPlural ? 'Klistremerker' : 'Klistremerke') :
              lang === 'es' ? (isPlural ? 'Pegatinas' : 'Pegatina') :
              (isPlural ? 'Stickers' : 'Sticker');
  } else if (type === 'poster') {
    typeStr = lang === 'no' ? 'Plakat' : lang === 'es' ? 'Póster' : 'Poster';
  } else if (type === 'wristband') {
    typeStr = lang === 'no' ? 'Armbånd' : lang === 'es' ? 'Pulsera' : 'Wristband';
  } else if (type === 'bottle') {
    typeStr = lang === 'no' ? 'Drikkeflaske' : lang === 'es' ? 'Botella de agua' : 'Water Bottle';
  } else if (type === 'coasters') {
    if (lower.includes('koppeunderlag')) {
      typeStr = lang === 'no' ? 'Koppeunderlag' : lang === 'es' ? 'Posavasos' : 'Coasters';
    } else {
      typeStr = lang === 'no' ? 'Glassbrikker' : lang === 'es' ? 'Posavasos' : 'Coasters';
    }
  }

  // 7. Translate Specifications / Details
  let details = [];
  if (sizeVal) {
    details.push(lang === 'no' ? `str. ${sizeVal}` : lang === 'es' ? `talla ${sizeVal}` : `size ${sizeVal}`);
  }
  if (ageVal) {
    details.push(lang === 'no' ? `${ageVal} år` : lang === 'es' ? `${ageVal} años` : `${ageVal} years`);
  }
  if (singleAgeVal) {
    details.push(lang === 'no' ? `${singleAgeVal} år` : lang === 'es' ? `${singleAgeVal} años` : `${singleAgeVal} years`);
  }
  if (mndVal) {
    details.push(lang === 'no' ? `${mndVal} mnd` : lang === 'es' ? `${mndVal} months` : `${mndVal} meses`);
  }
  if (mndRangeVal) {
    details.push(lang === 'no' ? `${mndRangeVal} mnd` : lang === 'es' ? `${mndRangeVal}M` : `${mndRangeVal}M`);
  }
  if (isBackPrint) {
    details.push(lang === 'no' ? 'med trykk på ryggen' : lang === 'es' ? 'con impresión en la espalda' : 'with print on back');
  }
  if (isWood) {
    details.push(lang === 'no' ? 'i tre' : lang === 'es' ? 'de madera' : 'in wood');
  }
  if (isEnglishText && lang === 'no') {
    details.push('engelsk tekst');
  }

  let detailsStr = details.length > 0 ? ` (${details.join(', ')})` : '';

  // 8. Handle leading quantity and type-only checks
  let cleanBase = translatedBase.trim();
  let leadingQtyMatch = cleanBase.match(/^(\d+)\s+/);
  let leadingQty = leadingQtyMatch ? leadingQtyMatch[1] : '';
  if (leadingQty) {
    cleanBase = cleanBase.replace(/^(\d+)\s+/, '');
  }

  const isJustType = typeWords.some(w => cleanBase.toLowerCase() === w) || cleanBase.toLowerCase() === typeStr.toLowerCase() || cleanBase === '';

  // 9. Assemble final name
  let finalName = '';
  let qtyPrefix = leadingQty ? `${leadingQty} ` : '';

  if (lang === 'no') {
    finalName = isJustType ? `${qtyPrefix}${typeStr}${detailsStr}` : `${qtyPrefix}${cleanBase} ${typeStr}${detailsStr}`;
  } else if (lang === 'es') {
    if (typeStr) {
      finalName = isJustType ? `${qtyPrefix}${typeStr}${detailsStr}` : `${qtyPrefix}${typeStr} ${cleanBase}${detailsStr}`;
    } else {
      finalName = `${qtyPrefix}${cleanBase}${detailsStr}`;
    }
  } else {
    // English
    finalName = isJustType ? `${qtyPrefix}${typeStr}${detailsStr}` : `${qtyPrefix}${cleanBase} ${typeStr}${detailsStr}`;
  }

  // Clean double spaces and capitalization helper
  finalName = finalName.replace(/\s+/g, ' ').trim();
  
  // Title case formatting
  return finalName.split(' ').map(word => {
    if (!word) return '';
    if (/[0-9]/.test(word) || word === 'II' || word === 'III') return word;
    // Keep sizes like S, M, L, XL, XS in uppercase
    if (/^[A-Z\-]+$/.test(word) && word.length <= 4) return word;
    const lowerWord = word.toLowerCase();
    if (['på', 'ny', 'til', 'i', 'og', 'med', 'de', 'el', 'la', 'y', 'sobre', 'en', 'of', 'the', 'in', 'and'].includes(lowerWord)) {
      return lowerWord;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ').trim();
}

async function main() {
  try {
    const res = await wixClient.products.queryProducts().limit(100).find();
    console.log(`Testing updated translation engine on ${res.items.length} products...\n`);

    res.items.forEach(p => {
      const noName = translateProductName(p.name, 'no');
      const enName = translateProductName(p.name, 'en');
      const esName = translateProductName(p.name, 'es');
      console.log(`Original: "${p.name}"`);
      console.log(`   -> NEW NO: "${noName}"`);
      console.log(`   -> NEW EN: "${enName}"`);
      console.log(`   -> NEW ES: "${esName}"`);
      console.log('');
    });
  } catch (err) {
    console.error(err);
  }
}

main();

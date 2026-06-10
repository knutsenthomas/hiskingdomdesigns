import { translations } from './translations';

// Product Translations Dictionary mapping specific products by ID or name keywords
export const productTranslations = {
  // Exact ID mappings
  ids: {
    // Kristus identitet
    '89facf2a-cbca-5217-c7ba-582e68e317a4': {
      no: {
        name: 'Kristus identitet - opplegg til bibelgruppe',
        description: 'Komplett opplegg for bibelgrupper. Inneholder presentasjoner, pdf-filer og bilder for å utforske vår identitet i Kristus.'
      },
      en: {
        name: 'Identity in Christ - Bible Group Study Guide',
        description: 'A complete study guide for Bible groups. Includes presentations, PDF worksheets, and graphics to explore our identity in Christ.'
      },
      es: {
        name: 'Nuestra identidad en Cristo - Guía de estudio bíblico',
        description: 'Una guía de estudio completa para grupos bíblicos. Incluye presentaciones, hojas de trabajo en PDF y gráficos para explorar nuestra identidad en Cristo.'
      }
    },
    // Spansk Kristus identitet
    'e0a423b8-1661-91ff-42c7-4bc58ccdfe98': {
      no: {
        name: 'Kristus identitet - opplegg til bibelgruppe (Spansk)',
        description: 'Spansk bibelgruppeopplegg om vår identitet i Kristus.'
      },
      en: {
        name: 'Identity in Christ - Bible Study Guide (Spanish)',
        description: 'Spanish Bible study guide exploring our identity in Christ.'
      },
      es: {
        name: 'Nuestro identidad en Cristo - Guía de estudio',
        description: 'Guía de estudio bíblico en español para explorar nuestra identidad en Cristo.'
      }
    },
    // Bønnejournal
    'db2656da-1f25-2d4b-3903-d787ac984e40': {
      no: {
        name: 'Daglig bønnejournal',
        description: 'En vakker journal for dine daglige bønner, bibelvers, refleksjoner og takknemlighet.'
      },
      en: {
        name: 'Daily Prayer Journal',
        description: 'A beautiful journal for your daily prayers, scriptures, reflections, and gratitude.'
      },
      es: {
        name: 'Diario de oración diario',
        description: 'Un hermoso diario para tus oraciones diarias, pasajes bíblicos, reflexiones y gratitud.'
      }
    },
    // Mystery klistermerke
    'bcf7626f-9509-7151-8a1e-d7ce4c3c7cef': {
      no: {
        name: 'Mystery klistremerke (1 stk, 4-5 cm)',
        description: 'Ett tilfeldig klistremerke med et oppmuntrende kristent motiv eller bibelvers. Perfekt for mobiler, laptoper og journaler!'
      },
      en: {
        name: 'Mystery Sticker (1 pc, 4-5 cm)',
        description: 'One random sticker featuring an encouraging Christian motif or Bible verse. Perfect for phones, laptops, and journals!'
      },
      es: {
        name: 'Pegatina misteriosa (1 ud, 4-5 cm)',
        description: 'Una pegatina aleatoria con un motivo cristiano alentador o versículo bíblico. ¡Perfecto para móviles, portátiles y diarios!'
      }
    },
    // Guard your Heart - Genser / Sweatshirt
    'cf67a5ee-b838-452a-9dc2-3827b182e5c2': {
      no: {
        name: 'Guard your Heart Genser',
        description: 'Klassisk og behagelig unisex genser med det vakre "Guard your Heart" (Vokt ditt hjerte) designet. Laget av myk bomullsmiks av høy kvalitet.'
      },
      en: {
        name: 'Guard your Heart Sweatshirt',
        description: 'Classic and comfortable unisex crewneck sweatshirt with the beautiful "Guard your Heart" design. Made of high-quality soft cotton blend.'
      },
      es: {
        name: 'Sudadera Guard your Heart',
        description: 'Sudadera clásica unisex de cuello redondo con el hermoso diseño "Guard your Heart". Hecha de una mezcla de algodón suave de alta calidad.'
      }
    },
    // Guard your Heart - T-skjorte / T-shirt
    '3709ad8b-bb94-4d7a-8cf2-7063f48b34c2': {
      no: {
        name: 'Guard your Heart T-skjorte',
        description: 'Klassisk og behagelig unisex t-skjorte med det vakre "Guard your Heart" (Vokt ditt hjerte) designet. Laget av 100% myk bomull.'
      },
      en: {
        name: 'Guard your Heart T-shirt',
        description: 'Classic and comfortable unisex crewneck t-shirt with the beautiful "Guard your Heart" design. Made of 100% soft cotton.'
      },
      es: {
        name: 'Camiseta Guard your Heart',
        description: 'Camiseta clásica unisex con el hermoso diseño "Guard your Heart". Hecha de 100% algodón suave.'
      }
    },
    // Guard your Heart - Kopp / Mug
    '9b7d6a34-ee7e-487f-9f19-22f96afffae1': {
      no: {
        name: 'Guard your Heart Kopp',
        description: 'Vakker keramisk kopp med det inspirerende designet "Guard your Heart". Perfekt for morgenkaffen eller teen.'
      },
      en: {
        name: 'Guard your Heart Mug',
        description: 'Beautiful ceramic mug featuring the inspiring "Guard your Heart" design. Perfect for your morning coffee or tea.'
      },
      es: {
        name: 'Taza Guard your Heart',
        description: 'Hermosa taza de cerámica con el inspirador diseño "Guard your Heart". Perfecta para el café o té de la mañana.'
      }
    },
    // Guard your Heart - Drikkeflaske / Water Bottle
    'e50b6076-5213-44cb-bdb4-77f32f1b143e': {
      no: {
        name: 'Guard your Heart Drikkeflaske',
        description: 'Holdbar drikkeflaske i rustfritt stål med "Guard your Heart" designet. Holder drikken din kald eller varm hele dagen.'
      },
      en: {
        name: 'Guard your Heart Water Bottle',
        description: 'Durable stainless steel water bottle with the "Guard your Heart" design. Keeps your drinks cold or hot all day.'
      },
      es: {
        name: 'Botella de agua Guard your Heart',
        description: 'Botella de agua de acero inoxidable duradera con el diseño "Guard your Heart". Mantiene tus bebidas frías o calientes todo el día.'
      }
    },
    // Guard your Heart - Cropped T-skjorte / Cropped T-Shirt
    '5b62896c-6c06-45d6-9650-43bd32aa4d7c': {
      no: {
        name: 'Guard your Heart Cropped T-skjorte',
        description: 'Stilig cropped t-skjorte til dame med det vakre "Guard your Heart" designet. Laget av myk og behagelig bomull.'
      },
      en: {
        name: 'Guard your Heart Cropped T-Shirt',
        description: 'Stylish women\'s cropped t-shirt with the beautiful "Guard your Heart" design. Made of soft and comfortable cotton.'
      },
      es: {
        name: 'Camiseta Cropped Guard your Heart',
        description: 'Camiseta cropped de mujer con el hermoso diseño "Guard your Heart". Hecha de algodón suave y cómodo.'
      }
    },
    // Guard your Heart - Singlet / Tank Top
    'e8b82748-76bc-40ea-8e8f-47fff23c8170': {
      no: {
        name: 'Guard your Heart Singlet',
        description: 'Lett og behagelig unisex singlet med det vakre "Guard your Heart" designet. Perfekt for varme dager eller trening.'
      },
      en: {
        name: 'Guard your Heart Tank Top',
        description: 'Lightweight and comfortable unisex tank top with the beautiful "Guard your Heart" design. Perfect for warm days or workouts.'
      },
      es: {
        name: 'Camiseta de tirantes Guard your Heart',
        description: 'Camiseta de tirantes unisex ligera y cómoda con el hermoso diseño "Guard your Heart". Perfecta para días cálidos o entrenamientos.'
      }
    }
  },

  // Keyword/Name-based fallbacks for dynamic translation of matching products
  keywords: [
    {
      pattern: /galatians 5:22 wristband/i,
      translations: {
        no: {
          name: 'Galaterne 5:22 Armbånd (Åndens frukt)',
          description: 'Høykvalitets silikonarmbånd preget med Galaterne 5:22. En daglig påminnelse om Åndens frukt: kjærlighet, glede, fred...'
        },
        en: {
          name: 'Galatians 5:22 Wristband (Fruit of the Spirit)',
          description: 'High-quality silicone wristband embossed with Galatians 5:22. A daily reminder of the Fruit of the Spirit: love, joy, peace...'
        },
        es: {
          name: 'Pulsera Gálatas 5:22 (Fruto del Espíritu)',
          description: 'Pulsera de silicona de alta calidad grabada con Gálatas 5:22. Un recordatorio diario del Fruto del Espíritu: amor, gozo, paz...'
        }
      }
    },
    {
      pattern: /john 3:16 wristband/i,
      translations: {
        no: {
          name: 'Johannes 3:16 Armbånd',
          description: 'Høykvalitets silikonarmbånd preget med Johannes 3:16. En daglig påminnelse om Guds kjærlighet for verden.'
        },
        en: {
          name: 'John 3:16 Wristband',
          description: 'High-quality silicone wristband embossed with John 3:16. A daily reminder of Gods love for the world.'
        },
        es: {
          name: 'Pulsera Juan 3:16',
          description: 'Pulsera de silicona de alta calidad grabada con Juan 3:16. Un recordatorio diario del amor de Dios por el mundo.'
        }
      }
    },
    {
      pattern: /colossians 3:2 wristband/i,
      translations: {
        no: {
          name: 'Kolosserne 3:2 Armbånd',
          description: 'Høykvalitets silikonarmbånd preget med Kolosserne 3:2: La sinnet være vendt mot det som er der oppe...'
        },
        en: {
          name: 'Colossians 3:2 Wristband',
          description: 'High-quality silicone wristband embossed with Colossians 3:2: Set your minds on things above...'
        },
        es: {
          name: 'Pulsera Colosenses 3:2',
          description: 'Pulsera de silicona de alta calidad grabada con Colosenses 3:2: Poned la mira en las cosas de arriba...'
        }
      }
    },
    {
      pattern: /isaiah 41:10 wristband/i,
      translations: {
        no: {
          name: 'Jesaja 41:10 Armbånd',
          description: 'Høykvalitets silikonarmbånd preget med Jesaja 41:10: Frykt ikke, for jeg er med deg...'
        },
        en: {
          name: 'Isaiah 41:10 Wristband',
          description: 'High-quality silicone wristband embossed with Isaiah 41:10: Fear not, for I am with you...'
        },
        es: {
          name: 'Pulsera Isaías 41:10',
          description: 'Pulsera de silicona de alta calidad grabada con Isaías 41:10: No temas, porque yo estoy contigo...'
        }
      }
    },
    {
      pattern: /joshua 1:9 wristband/i,
      translations: {
        no: {
          name: 'Josva 1:9 Armbånd',
          description: 'Høykvalitets silikonarmbånd preget med Josva 1:9: Vær modig og sterk! Frykt ikke...'
        },
        en: {
          name: 'Joshua 1:9 Wristband',
          description: 'High-quality silicone wristband embossed with Joshua 1:9: Be strong and courageous! Do not be afraid...'
        },
        es: {
          name: 'Pulsera Josué 1:9',
          description: 'Pulsera de silicona de alta calidad grabada con Josué 1:9: ¡Sé fuerte y valiente! No temas...'
        }
      }
    },
    {
      pattern: /wristband/i,
      translations: {
        no: {
          name: 'Bibelvers Armbånd',
          description: 'Høykvalitets silikonarmbånd preget med inspirerende bibelvers på engelsk.'
        },
        en: {
          name: 'Bible Verse Wristband',
          description: 'High-quality silicone wristband embossed with inspiring Bible verses.'
        },
        es: {
          name: 'Pulsera con versículo bíblico',
          description: 'Pulsera de silicona de alta calidad grabada con versículos bíblicos inspiradores.'
        }
      }
    },
    {
      pattern: /bibleverse cards/i,
      translations: {
        no: {
          name: 'Bibelvers-kort',
          description: 'Små og oppmuntrende kort med trykte bibelvers på engelsk. Fine å dele ut eller ha i boken.'
        },
        en: {
          name: 'Bible Verse Cards',
          description: 'Small, encouraging cards featuring printed Bible verses. Perfect for sharing or keeping in your book.'
        },
        es: {
          name: 'Tarjetas con versículos bíblicos',
          description: 'Tarjetas pequeñas y alentadoras con versículos bíblicos impresos. Perfectas para compartir o guardar en tu libro.'
        }
      }
    },
    {
      pattern: /kristne inspirasjonsklistremerker/i,
      translations: {
        no: {
          name: '12 kristne inspirasjonsklistremerker',
          description: 'Pakke med 12 vakre og slitesterke klistremerker med kristne motiver og sitater.'
        },
        en: {
          name: '12 Christian Inspiration Stickers',
          description: 'A pack of 12 beautiful and durable stickers featuring Christian motifs and quotes.'
        },
        es: {
          name: '12 pegatinas de inspiración cristiana',
          description: 'Un paquete de 12 hermosas y duraderas pegatinas con motivos y citas cristianas.'
        }
      }
    },
    {
      pattern: /mini-klistremerker/i,
      translations: {
        no: {
          name: '10 mini-klistremerker',
          description: 'Pakke med 10 fargerike mini-klistremerker med tro-temaer.'
        },
        en: {
          name: '10 Mini Stickers',
          description: 'A pack of 10 colorful mini stickers with faith-based themes.'
        },
        es: {
          name: '10 mini pegatinas',
          description: 'Un paquete de 10 pegatinas mini coloridas con temas de fe.'
        }
      }
    }
  ]
};

// Dynamic name clean & auto-translator
const cleanAndTranslateName = (name, lang) => {
  if (!name) return name;
  
  let baseName = name;
  let suffix = '';
  
  if (name.includes(' - ')) {
    const parts = name.split(' - ');
    baseName = parts[0].trim();
    suffix = parts.slice(1).join(' - ').trim();
  } else if (name.includes(' | ')) {
    const parts = name.split(' | ');
    baseName = parts[0].trim();
    suffix = parts.slice(1).join(' | ').trim();
  }

  let translatedBase = baseName;
  if (lang === 'no') {
    const translationsDb = {
      'FAITH OVER FEAR': 'Tro over frykt',
      'FAITH OVER FEAR COFFEE MUG': 'Tro over frykt kopp',
      'PRAISE THE LORD': 'Pris Herren',
      'BORN AGAIN': 'Født på ny',
      'GUARD YOUR HEART': 'Vokt ditt hjerte',
      'FEAR NOT': 'Frykt ikke',
      'AMAZING GRACE': 'Utrolig nåde',
      'JESUS SAVES': 'Jesus frelser',
      'FAITH': 'Tro',
      'HOPE': 'Håp',
      'LOVE': 'Kjærlighet',
      'PEACE': 'Fred',
      'JOY': 'Glede',
      'GRACE': 'Nåde',
      'BE STRONG': 'Vær sterk',
      'TRUST IN THE LORD': 'Stol på Herren',
      'LIGHT OF THE WORLD': 'Verdens lys',
      'CHOSEN': 'Utvalgt',
      'REDEEMED': 'Frikjøpt',
      'BLESSED': 'Velsignet'
    };
    
    const upperBase = baseName.toUpperCase();
    if (translationsDb[upperBase]) {
      translatedBase = translationsDb[upperBase];
    } else {
      Object.entries(translationsDb).forEach(([en, no]) => {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translatedBase = translatedBase.replace(regex, no);
      });
    }
    
    if (suffix) {
      const lowerSuffix = suffix.toLowerCase();
      if (lowerSuffix.includes('ceramic mug') || lowerSuffix.includes('coffee mug') || lowerSuffix.includes('mug')) {
        translatedBase += ' Kopp';
      } else if (lowerSuffix.includes('hoodie') || lowerSuffix.includes('sweatshirt')) {
        translatedBase += ' Hettegenser';
      } else if (lowerSuffix.includes('t-shirt') || lowerSuffix.includes('tee')) {
        translatedBase += ' T-skjorte';
      } else if (lowerSuffix.includes('totebag') || lowerSuffix.includes('tote bag') || lowerSuffix.includes('bag')) {
        translatedBase += ' Handlenett';
      } else if (lowerSuffix.includes('sticker') || lowerSuffix.includes('decal')) {
        translatedBase += ' Klistremerke';
      } else if (lowerSuffix.includes('poster') || lowerSuffix.includes('print')) {
        translatedBase += ' Plakat';
      } else if (lowerSuffix.includes('wristband') || lowerSuffix.includes('bracelet')) {
        translatedBase += ' Armbånd';
      } else if (lowerSuffix.includes('water bottle') || lowerSuffix.includes('bottle')) {
        translatedBase += ' Drikkeflaske';
      }
    }
  } else if (lang === 'es') {
    const translationsDb = {
      'FAITH OVER FEAR': 'Fe sobre el temor',
      'PRAISE THE LORD': 'Alabad al Señor',
      'BORN AGAIN': 'Nacido de nuevo',
      'GUARD YOUR HEART': 'Guarda tu corazón',
      'FEAR NOT': 'No temas',
      'AMAZING GRACE': 'Sublime gracia',
      'JESUS SAVES': 'Jesús salva',
      'FAITH': 'Fe',
      'HOPE': 'Esperanza',
      'LOVE': 'Amor',
      'PEACE': 'Paz',
      'JOY': 'Gozo',
      'GRACE': 'Gracia',
      'BE STRONG': 'Sé fuerte',
      'TRUST IN THE LORD': 'Confía en el Señor',
      'LIGHT OF THE WORLD': 'Luz del mundo',
      'CHOSEN': 'Elegido',
      'REDEEMED': 'Redimido',
      'BLESSED': 'Bendecido'
    };
    
    const upperBase = baseName.toUpperCase();
    if (translationsDb[upperBase]) {
      translatedBase = translationsDb[upperBase];
    } else {
      Object.entries(translationsDb).forEach(([en, es]) => {
        const regex = new RegExp(`\\b${en}\\b`, 'gi');
        translatedBase = translatedBase.replace(regex, es);
      });
    }

    if (suffix) {
      const lowerSuffix = suffix.toLowerCase();
      if (lowerSuffix.includes('ceramic mug') || lowerSuffix.includes('coffee mug') || lowerSuffix.includes('mug')) {
        translatedBase = 'Taza ' + translatedBase;
      } else if (lowerSuffix.includes('hoodie') || lowerSuffix.includes('sweatshirt')) {
        translatedBase = 'Sudadera ' + translatedBase;
      } else if (lowerSuffix.includes('t-shirt') || lowerSuffix.includes('tee')) {
        translatedBase = 'Camiseta ' + translatedBase;
      } else if (lowerSuffix.includes('totebag') || lowerSuffix.includes('tote bag') || lowerSuffix.includes('bag')) {
        translatedBase = 'Bolsa de tela ' + translatedBase;
      } else if (lowerSuffix.includes('sticker') || lowerSuffix.includes('decal')) {
        translatedBase = 'Pegatina ' + translatedBase;
      } else if (lowerSuffix.includes('poster') || lowerSuffix.includes('print')) {
        translatedBase = 'Póster ' + translatedBase;
      } else if (lowerSuffix.includes('wristband') || lowerSuffix.includes('bracelet')) {
        translatedBase = 'Pulsera ' + translatedBase;
      } else if (lowerSuffix.includes('water bottle') || lowerSuffix.includes('bottle')) {
        translatedBase = 'Botella de agua ' + translatedBase;
      }
    }
  } else {
    if (suffix) {
      const lowerSuffix = suffix.toLowerCase();
      if (lowerSuffix.includes('ceramic mug') || lowerSuffix.includes('coffee mug') || lowerSuffix.includes('mug')) {
        translatedBase += ' Mug';
      } else if (lowerSuffix.includes('hoodie') || lowerSuffix.includes('sweatshirt')) {
        translatedBase += ' Hoodie';
      } else if (lowerSuffix.includes('t-shirt') || lowerSuffix.includes('tee')) {
        translatedBase += ' T-Shirt';
      } else if (lowerSuffix.includes('totebag') || lowerSuffix.includes('tote bag') || lowerSuffix.includes('bag')) {
        translatedBase += ' Tote Bag';
      } else if (lowerSuffix.includes('sticker') || lowerSuffix.includes('decal')) {
        translatedBase += ' Sticker';
      } else if (lowerSuffix.includes('poster') || lowerSuffix.includes('print')) {
        translatedBase += ' Poster';
      } else if (lowerSuffix.includes('wristband') || lowerSuffix.includes('bracelet')) {
        translatedBase += ' Wristband';
      } else if (lowerSuffix.includes('water bottle') || lowerSuffix.includes('bottle')) {
        translatedBase += ' Water Bottle';
      }
    }
  }

  return translatedBase.split(' ').map(word => {
    if (!word) return '';
    if (/[0-9]/.test(word) || word === 'II' || word === 'III') return word;
    const lower = word.toLowerCase();
    if (['på', 'ny', 'til', 'i', 'og', 'med', 'de', 'el', 'la', 'y', 'sobre', 'en', 'of', 'the', 'in', 'and'].includes(lower)) {
      return lower;
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ').trim();
};

// Dynamic description auto-translator & HTML wash
const cleanAndTranslateDesc = (desc, lang) => {
  if (!desc) return desc;

  let cleaned = desc
    .replace(/<[^>]*>/g, '') 
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ') 
    .trim();

  if (lang === 'no') {
    const replacements = [
      { en: /\bthis beautiful ceramic mug is perfect for any event of the day\b/gi, no: 'Denne vakre keramiske koppen er perfekt for enhver anledning i hverdagen' },
      { en: /\byour morning coffee, a hot chocolate, or any other hot beverage\b/gi, no: 'morgenkaffen, en varm kakao, eller annen varm drikke' },
      { en: /\bthe mug is glossy white and the prints come out beautifully and vividly\b/gi, no: 'Koppen har en glansfull finish som gjør at motivene fremstår klare og levende' },
      { en: /\bthe print retains its quality and luster when used in both microwave and dishwasher\b/gi, no: 'Trykket beholder sin høye kvalitet og glans ved bruk i både mikrobølgeovn og oppvaskmaskin' },
      { en: /\bceramic 11oz mug\b/gi, no: 'Keramisk kopp (325 ml)' },
      { en: /\bdishwasher and microwave safe\b/gi, no: 'Tåler oppvaskmaskin og mikrobølgeovn' },
      { en: /\bunisex t-shirt\b/gi, no: 'unisex t-skjorte' },
      { en: /\bmade of 100% ring-spun cotton\b/gi, no: 'laget av 100% kjemmet bomull' },
      { en: /\bsoft and comfy\b/gi, no: 'myk og behagelig' },
      { en: /\bdouble stitching on the neckline and sleeves add more durability\b/gi, no: 'dobbeltsøm i hals og ermer gir økt slitestyrke' },
      { en: /\bhigh quality\b/gi, no: 'høy kvalitet' },
      { en: /\bperfect for\b/gi, no: 'perfekt for' }
    ];

    replacements.forEach(r => {
      cleaned = cleaned.replace(r.en, r.no);
    });
  } else if (lang === 'es') {
    const replacements = [
      { en: /\bthis beautiful ceramic mug is perfect for any event of the day\b/gi, es: 'Esta hermosa taza de cerámica es perfecta para cualquier momento del día' },
      { en: /\byour morning coffee, a hot chocolate, or any other hot beverage\b/gi, es: 'su café de la mañana, un chocolate caliente o cualquier otra bebida caliente' },
      { en: /\bthe mug is glossy white and the prints come out beautifully and vividly\b/gi, es: 'La taza es de color blanco brillante y los diseños se muestran de forma clara y vívida' },
      { en: /\bthe print retains its quality and luster when used in both microwave and dishwasher\b/gi, es: 'El diseño conserva su alta calidad y brillo tanto en el microondas como en el lavavajillas' },
      { en: /\bceramic 11oz mug\b/gi, es: 'Taza de cerámica (325 ml)' },
      { en: /\bdishwasher and microwave safe\b/gi, es: 'Apta para lavavajillas y microondas' },
      { en: /\bunisex t-shirt\b/gi, es: 'camiseta unisex' },
      { en: /\bmade of 100% ring-spun cotton\b/gi, es: 'hecha de 100% algodón hilado en anillo' },
      { en: /\bsoft and comfy\b/gi, es: 'suave y cómoda' },
      { en: /\bdouble stitching on the neckline and sleeves add more durability\b/gi, es: 'doble costura en el cuello y las mangas para mayor durabilidad' }
    ];

    replacements.forEach(r => {
      cleaned = cleaned.replace(r.en, r.es);
    });
  }

  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
};

// Main function to get translated product fields (name, description and category)
export function getTranslatedProduct(product, language) {
  if (!product) return product;
  const lang = (language || 'no').toLowerCase();

  const dict = translations[lang] || translations['no'];
  const translatedCategory = product.category 
    ? (dict[product.category] || dict[`category.${product.category.toLowerCase()}`] || translations['no'][product.category] || product.category)
    : product.category;

  const washText = (text) => {
    if (!text) return '';
    return text
      .replace(/&nbsp;|\u00A0/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const makeTranslated = (name, desc) => {
    const finalName = washText(name || product.name);
    const finalDesc = washText(desc || product.description);
    return {
      ...product,
      name: finalName,
      description: finalDesc,
      category: translatedCategory
    };
  };

  // 1. Check if we have an exact ID match
  if (productTranslations.ids[product.id] && productTranslations.ids[product.id][lang]) {
    const translation = productTranslations.ids[product.id][lang];
    return makeTranslated(translation.name, translation.description);
  }

  // 2. Check name keywords fallbacks
  if (product.name) {
    const match = productTranslations.keywords.find(k => k.pattern.test(product.name));
    if (match && match.translations[lang]) {
      const translation = match.translations[lang];
      return makeTranslated(translation.name, translation.description);
    }
  }

  // 3. Fallback: Clean and Translate dynamically
  const autoName = cleanAndTranslateName(product.name, lang);
  const autoDesc = cleanAndTranslateDesc(product.description, lang);
  return makeTranslated(autoName, autoDesc);
}

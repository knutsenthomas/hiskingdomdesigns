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
    }
  },

  // Keyword/Name-based fallbacks for dynamic translation of matching products
  keywords: [
    {
      pattern: /guard your heart/i,
      translations: {
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
      }
    },
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

// Main function to get translated product fields (name, description and category)
export function getTranslatedProduct(product, language) {
  if (!product) return product;
  const lang = (language || 'no').toLowerCase();

  const dict = translations[lang] || translations['no'];
  const translatedCategory = product.category 
    ? (dict[product.category] || dict[`category.${product.category.toLowerCase()}`] || translations['no'][product.category] || product.category)
    : product.category;

  const makeTranslated = (name, desc) => ({
    ...product,
    name: name || product.name,
    description: desc || product.description,
    category: translatedCategory
  });

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

  // 3. Fallback: If Norwegian, clean name of pipe details for better presentation as default
  if (lang === 'no' && product.name && product.name.includes('|')) {
    return makeTranslated(product.name.split('|')[0].trim(), product.description);
  }

  return makeTranslated(product.name, product.description);
}

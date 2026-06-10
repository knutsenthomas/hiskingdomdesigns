import { translations } from './translations.js';

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
    },
    // 5 BIG size Stickers Monthly
    '834c1b89-4c2d-ddc2-8f03-3f55a4586408': {
      no: {
        name: 'Månedlig abonnement på 5 store klistremerker',
        description: 'Månedlig abonnement på 5 store klistremerker (5,5 - 8 cm). Du får 10% rabatt og betaler 45 kr per måned + frakt (49 kr i Norge). I denne pakken får du: - månedens 5 store klistremerker på engelsk/norsk (avhengig av hvilket land du er fra) - månedens bibelvers/tekst sammen med et studie på engelsk/norsk (avhengig av hvilket land du er fra) - du får også en overraskelsesgave i den første forsendelsen, og deretter hver 6. måned. Med denne pakken kan du både lære av Guds ord, dekorere tingene dine eller gi vakre bibelklistremerker som gave til noen du er glad i. Overskuddet vårt går til misjon og kristent arbeid i Norge og internasjonalt. Abonnementet har én måneds oppsigelsestid. Du kan avslutte abonnementet når du selv ønsker. Det eneste du forplikter deg til er to bestillinger (første bestilling og oppsigelsesbestillingen).'
      },
      en: {
        name: '5 BIG size Stickers Monthly',
        description: 'MONTHLY SUBSCRIPTION OF 5 BIG STICKERS  (5,5 - 8cm)You have a 10% discount and pay 45NOK per month + shipping (49kr i Norge).  In this package you get:- the 5 big stickers of the month in English/Norwegian, (depending on what country you are from)- the Bible verse/passage of the month along with a study in English/Norwegian (depending on what country you are from)- You also get a surprise gift in the first shipment, and every 6 months after that. With this package you can both learn from God\'s word, decorate your things or give beautiful Bible Stickers away as gifts to someone you love.  Our profits go to missions and Christian work in Norway and internationally.  The subscription has an one month\'s notice. You can cancel the subscription whenever you want. The only thing you are committed to is two orders (First order and the cancellation order).'
      },
      es: {
        name: 'Suscripción mensual de 5 pegatinas grandes',
        description: 'Suscripción mensual de 5 pegatinas grandes (5,5 - 8 cm). Tienes un 10% de descuento y pagas 45 NOK al mes + envío (49 kr en Noruega). En este paquete recibes: - las 5 pegatinas grandes del mes en inglés/noruego (según el país de donde seas) - el versículo/pasaje bíblico del mes junto con un estudio en inglés/noruego (según el país de donde seas) - también recibes un regalo sorpresa en el primer envío, y cada 6 meses después de eso. Con este paquete puedes aprender de la palabra de Dios, decorar tus cosas o regalar hermosas pegatinas bíblicas a alguien que amas. Nuestras ganancias se destinan a misiones y trabajo cristiano en Noruega y a nivel internacional. La suscripción tiene un mes de preaviso. Puedes cancelar la suscripción cuando quieras. Lo único a lo que te comprometes es a dos pedidos (el primer pedido y el pedido de cancelación).'
      }
    },
    // Monthly English T-shirt subscription
    '981a3735-b209-5083-5a36-747fc1382288': {
      no: {
        name: 'Månedlig t-skjorte-abonnement',
        description: 'Månedlig abonnement på t-skjorter. Du betaler 349 kr per måned + frakt (49 kr i Norge). I denne pakken får du: - månedens t-skjorte - et engelsk bibelklistremerke - månedens bibelvers med et studie. - Du får også en overraskelsesgave i den første forsendelsen, og deretter hver 3. måned. Med denne månedlige pakken kan du lære av Guds ord, kle deg med et kristent budskap og spre hans ord hvor enn du går. Du vil få tilsendt månedens t-skjorte i din ønskede størrelse. Farger kan variere. Vi leverer kvalitetssikrede unisex t-skjorter med et kristent budskap på engelsk. Overskuddet vårt går til misjon og kristent arbeid i Norge og internasjonalt. Abonnementet har én måneds oppsigelsestid. Du kan avslutte abonnementet når du selv ønsker. Det eneste du forplikter deg til er to bestillinger (første bestilling og oppsigelsesbestillingen).'
      },
      en: {
        name: 'Monthly English T-shirt subscription',
        description: 'Monthly subscription of Tshirts.You pay 349NOK per month + shipping (49kr i Norge)In this package you get:-the t-shirt of the month- one English Bible sticker- the Bible verse of the month with a study.- You also get a surprise gift in the first shipment, and every 3 months after that. With this monthly package you can learn from God\'s word, dress with a Christian message and spread His word wherever you go.  You will be sent the T-shirt of the month in your desired size. Colors may vary. We deliver unisex quality t-shirts with a Christian message in English.Our profits go to missions and Christian work in Norway and internationally.  The subscription has an one month\'s notice. You can cancel the subscription whenever you want. The only thing you are committed to is two orders (First order and cancellation order).'
      },
      es: {
        name: 'Suscripción mensual de camisetas',
        description: 'Suscripción mensual de camisetas. Pagas 349 NOK al mes + envío (49 kr en Noruega). En este paquete recibes: - la camiseta del mes - una pegatina bíblica en inglés - el versículo bíblico del mes con un estudio. - También recibes un regalo sorpresa en el primer envío, y cada 3 meses después de eso. Con este paquete mensual puedes aprender de la palabra de Dios, vestirte con un mensaje cristiano y difundir su palabra dondequiera que vayas. Se te enviará la camiseta del mes en la talla deseada. Los colores pueden variar. Entregamos camisetas unisex de calidad con un mensaje cristiano en inglés. Nuestras ganancias se destinan a misiones y trabajo cristiano en Noruega y a nivel internacional. La suscripción tiene un mes de preaviso. Puedes cancelar la suscripción cuando quieras. Lo único a lo que te comprometes es a dos pedidos (el primer pedido y el pedido de cancelación).'
      }
    },
    // Monthly coffee cup subscription
    '84b670b9-1d94-173d-5dc5-6b8b391c1eae': {
      no: {
        name: 'Månedlig kaffekopp-abonnement',
        description: 'Månedlig abonnement på kaffekopp. Du betaler 179 kr per måned + frakt (99 kr i Norge) – 10% rabatt på ordinær pris. I denne pakken får du: månedens kopp (engelsk/norsk), ett engelsk/norsk bibelklistremerke (avhengig av hvilket land du er fra) og månedens bibelvers med et studie. På denne måten kan du både lære av Guds ord, drikke morgenkaffen med et kristent budskap og meditere på hans ord uansett hvor du er. Du får også en overraskelsesgave i den første forsendelsen, og deretter hver 3. måned. Overskuddet vårt går til misjon og kristent arbeid i Norge og internasjonalt. Abonnementet har én måneds oppsigelsestid. Du kan avslutte abonnementet når du selv ønsker. Det eneste du forplikter deg til er to bestillinger (første bestilling og oppsigelsesbestillingen).'
      },
      en: {
        name: 'Monthly coffee cup subscription',
        description: 'Monthly subscription of Coffee cup.You pay 179NOK per month + shipping (99kr for Norge) 10% discount of normal price. In this package you get: the cup/mug of the month English/Norwegian, one English/Norwegian Bible sticker (depending on what country you are from) and the Bible verse of the month with a study. This way you can both learn from God\'s word, drink your morning coffee with a Christian message and meditate on His word wherever you are.  You also get a surprise gift in the first shipment, and every 3 months after that. Our profits go to missions and Christian work in Norway and internationally.  The subscription has an one month\'s notice. You can cancel the subscription whenever you want. The only thing you are committed to is two orders (First order and the cancellation order).'
      },
      es: {
        name: 'Suscripción mensual de tazas de café',
        description: 'Suscripción mensual de taza de café. Pagas 179 NOK al mes + envío (99 kr en Noruega) – 10% de descuento sobre el precio normal. En este paquete recibes: la taza del mes (inglés/noruego), una pegatina bíblica en inglés/noruego (según el país de donde seas) y el versículo bíblico del mes con un estudio. De esta manera puedes aprender de la palabra de Dios, tomar tu café de la mañana con un mensaje cristiano y meditar en su palabra dondequiera que estés. También recibes un regalo sorpresa en el primer envío, y cada 3 meses después de eso. Nuestras ganancias se destinan a misiones y trabajo cristiano en Noruega y a nivel internacional. La suscripción tiene un mes de preaviso. Puedes cancelar la suscripción cuando quieras. Lo único a lo que te comprometes es a dos pedidos (el primer pedido y el pedido de cancelación).'
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
    },
    {
      pattern: /norsk flagg/i,
      translations: {
        no: {
          name: 'Norsk flagg klistremerke (11 x 8 cm)',
          description: 'Flott klistremerke av det norske flagget. Perfekt for russen til mai-feiringen!'
        },
        en: {
          name: 'Norwegian Flag Sticker (11 x 8 cm)',
          description: 'Great sticker of the Norwegian flag. Perfect for celebrating Norway\'s national day!'
        },
        es: {
          name: 'Pegatina de la bandera de Noruega (11 x 8 cm)',
          description: 'Excelente pegatina de la bandera de Noruega. ¡Ideal para celebraciones!'
        }
      }
    },
    {
      pattern: /50 stk israel flagg/i,
      translations: {
        no: {
          name: '50 stk Israel-flagg klistremerker (11 x 8 cm)',
          description: 'Pakke med 50 slitesterke klistremerker med det israelske flagget.'
        },
        en: {
          name: '50 pcs Israel Flag Stickers (11 x 8 cm)',
          description: 'Pack of 50 durable stickers featuring the Israeli flag.'
        },
        es: {
          name: '50 pegatinas de la bandera de Israel (11 x 8 cm)',
          description: 'Paquete de 50 pegatinas duraderas con la bandera de Israel.'
        }
      }
    },
    {
      pattern: /holografisk israel flagg/i,
      translations: {
        no: {
          name: 'Holografisk Israel-flagg klistremerker (6,5 x 5 cm)',
          description: 'Vakre holografiske klistremerker med det israelske flagget som skinner i lyset.'
        },
        en: {
          name: 'Holographic Israel Flag Stickers (6.5 x 5 cm)',
          description: 'Beautiful holographic stickers featuring the Israeli flag that shines in the light.'
        },
        es: {
          name: 'Pegatinas holográficas de la bandera de Israel (6,5 x 5 cm)',
          description: 'Hermosas pegatinas holográficas con la bandera de Israel que brilla con la luz.'
        }
      }
    },
    {
      pattern: /israel flagg.*4\s*x\s*3/i,
      translations: {
        no: {
          name: 'Israel-flagg klistremerke (4 x 3 cm)',
          description: 'Slitesterkt klistremerke av det israelske flagget i størrelse 4 x 3 cm.'
        },
        en: {
          name: 'Israel Flag Sticker (4 x 3 cm)',
          description: 'Durable sticker of the Israeli flag, size 4 x 3 cm.'
        },
        es: {
          name: 'Pegatina de la bandera de Israel (4 x 3 cm)',
          description: 'Pegatina duradera de la bandera de Israel, tamaño 4 x 3 cm.'
        }
      }
    },
    {
      pattern: /israels flagg i en hjerteform/i,
      translations: {
        no: {
          name: 'Hjerteformet Israel-flagg klistremerke',
          description: 'Klistremerke med det israelske flagget formet som et hjerte.'
        },
        en: {
          name: 'Heart-shaped Israel Flag Sticker',
          description: 'Sticker featuring the Israeli flag shaped as a heart.'
        },
        es: {
          name: 'Pegatina de la bandera de Israel en forma de corazón',
          description: 'Pegatina con la bandera de Israel en forma de corazón.'
        }
      }
    },
    {
      pattern: /israel flagg/i,
      translations: {
        no: {
          name: 'Israel-flagg klistremerke',
          description: 'Håndlagt klistremerke med det israelske flagget.'
        },
        en: {
          name: 'Israel Flag Sticker',
          description: 'Handmade sticker featuring the Israeli flag.'
        },
        es: {
          name: 'Pegatina de la bandera de Israel',
          description: 'Pegatina hecha a mano con la bandera de Israel.'
        }
      }
    },
    {
      pattern: /fredsdue med/i,
      translations: {
        no: {
          name: 'Fredsdue med Israel-flagg klistremerke',
          description: 'Nydelig klistremerke som viser en fredsdue med det israelske flagget.'
        },
        en: {
          name: 'Peace Dove with Israel Flag Sticker',
          description: 'Beautiful sticker showing a peace dove with the Israeli flag.'
        },
        es: {
          name: 'Pegatina de paloma de la paz con la bandera de Israel',
          description: 'Hermosa pegatina que muestra una paloma de la paz con la bandera de Israel.'
        }
      }
    },
    {
      pattern: /bokmerke med bibelvers/i,
      translations: {
        no: {
          name: 'Bokmerke med Bibelvers (engelsk)',
          description: 'Flott bokmerke med oppmuntrende bibelvers på engelsk.'
        },
        en: {
          name: 'Bookmark with Bible Verses (English)',
          description: 'Beautiful bookmark featuring encouraging Bible verses.'
        },
        es: {
          name: 'Marca-páginas con versículos bíblicos (inglés)',
          description: 'Hermoso marcador de páginas con versículos bíblicos alentadores en inglés.'
        }
      }
    },
    {
      pattern: /small bibleverse cards/i,
      translations: {
        no: {
          name: 'Lite Bibelvers-kort (engelsk)',
          description: 'Lite og oppmuntrende kort med trykt bibelvers på engelsk. Perfekt til å dele ut.'
        },
        en: {
          name: 'Small Bible Verse Card (English)',
          description: 'Small and encouraging card with a printed Bible verse. Perfect for sharing.'
        },
        es: {
          name: 'Tarjeta pequeña con versículo bíblico (inglés)',
          description: 'Tarjeta pequeña y alentadora con un versículo bíblico impreso. Perfecta para compartir.'
        }
      }
    },
    {
      pattern: /evangeliseringskort/i,
      translations: {
        no: {
          name: 'Små evangeliseringskort (engelsk)',
          description: 'Pakke med små kort med oppmuntrende budskap og bibelvers på engelsk.'
        },
        en: {
          name: 'Small Evangelism Cards (English)',
          description: 'Pack of small cards featuring encouraging messages and Bible verses.'
        },
        es: {
          name: 'Tarjetas pequeñas de evangelización (inglés)',
          description: 'Paquete de tarjetas pequeñas con mensajes alentadores y versículos bíblicos.'
        }
      }
    },
    {
      pattern: /pennal til bibelskrivesaker/i,
      translations: {
        no: {
          name: 'Pennal til Bibelskrivesaker',
          description: 'Praktisk og fint pennal for oppbevaring av skrivesaker til bibelstudiet. Tilgjengelig i flere farger og motiver.'
        },
        en: {
          name: 'Bible Stationery Pencil Case',
          description: 'Practical and nice pencil case for storing stationery for Bible study. Available in multiple colors and designs.'
        },
        es: {
          name: 'Estuche para artículos de escritura bíblica',
          description: 'Estuche práctico y bonito para guardar artículos de escritura para el estudio bíblico. Disponible en varios colores y designs.'
        }
      }
    },
    {
      pattern: /jesus underviser.*lerret/i,
      translations: {
        no: {
          name: 'Jesus Underviser - Lerret med Svart Ramme (30 x 40 cm)',
          description: 'Vakkert og inspirerende trykk på lerret av Jesus som underviser. Leveres med en stilren svart ramme.'
        },
        en: {
          name: 'Jesus Teaching - Canvas Print with Black Frame (30 x 40 cm)',
          description: 'Beautiful and inspiring print on canvas of Jesus teaching. Comes with a stylish black frame.'
        },
        es: {
          name: 'Lienzo de Jesús Enseñando con Marco Negro (30 x 40 cm)',
          description: 'Hermosa e inspiradora impresión en lienzo de Jesús enseñando. Viene con un elegante marco negro.'
        }
      }
    }
  ]
};

// Dynamic name clean & auto-translator
const cleanAndTranslateName = (originalName, lang, product = {}) => {
  if (!originalName) return originalName;

  let name = originalName;

  // 1. Strip common volume/size/dimension patterns from name to avoid messing up base name
  const patternsToStrip = [
    /\d+\s*ml/gi,
    /\d+\s*oz/gi,
    /\d+\s*x\s*\d+\s*cm/gi,
    /\d+\s*x\s*\d+\s*″/gi,
    /\d+\s*″/gi,
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

  // 3. Identify Product Type (Order matters: check sweatshirt/hoodie before t-shirt!)
  let type = 'unknown';
  let lower = originalName.toLowerCase();
  const subcats = (product.subcategories || []).map(s => s.toLowerCase());
  const categoryLower = (product.category || '').toLowerCase();

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
  } else if (lower.includes('t-shirt') || lower.includes('tshirt') || lower.includes('tskjorte') || lower.includes('tsjorte') || lower.includes('dametrøye') || lower.includes('treningstrøye') || lower.includes('tee')) {
    type = 't-shirt';
  } else if (lower.includes('babybody') || lower.includes('onesie') || lower.includes('body')) {
    type = 'babybody';
  } else if (lower.includes('totebag') || lower.includes('tote bag') || lower.includes('handlenett')) {
    type = 'totebag';
  } else if (
    lower.includes('klistremerke') || 
    lower.includes('klistermerke') || 
    lower.includes('sticker') || 
    categoryLower === 'klistermerker' ||
    categoryLower === 'stickers' ||
    subcats.includes('klistermerker') ||
    subcats.includes('stickers') ||
    (subcats.includes('israel') && (lower.includes('flagg') || lower.includes('flag') || lower.includes('fredsdue')))
  ) {
    type = 'sticker';
  } else if (lower.includes('poster') || lower.includes('print') || lower.includes('plakat')) {
    type = 'poster';
  } else if (lower.includes('lerret') || lower.includes('canvas')) {
    type = 'canvas';
  } else if (lower.includes('wristband') || lower.includes('bracelet') || lower.includes('armbånd')) {
    type = 'wristband';
  } else if (lower.includes('mug') || lower.includes('cup') || lower.includes('kopp') || lower.includes('koppen')) {
    type = 'mug';
  } else if (lower.includes('bokmerke') || lower.includes('bookmark')) {
    type = 'bookmark';
  } else if (lower.includes('kort') || lower.includes('card')) {
    type = 'card';
  } else if (lower.includes('pennal') || lower.includes('pencilcase') || lower.includes('pencil case')) {
    type = 'pencil-case';
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
                           lastPart.includes('tsjorte') ||
                           lastPart.includes('kopp') ||
                           lastPart.includes('mug') ||
                           lastPart.includes('t-shirt') ||
                           lastPart.includes('tshirt') ||
                           lastPart.includes('hoodie') ||
                           lastPart.includes('klistremerke') ||
                           lastPart.includes('klistermerke') ||
                           lastPart.includes('sticker') ||
                           lastPart.includes('lerret') ||
                           lastPart.includes('canvas') ||
                           lastPart.includes('plakat') ||
                           lastPart.includes('poster') ||
                           lastPart.includes('pennal') ||
                           lastPart.includes('bokmerke') ||
                           lastPart.includes('bookmark') ||
                           lastPart.includes('kort') ||
                           lastPart.includes('card');
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
    'tskjorte', 't-skjorte', 'tshirt', 't-shirt', 'tee', 'dametrøye', 'treningstrøye', 'tsjorte',
    'genser', 'hettegenser', 'hoodie', 'hettejakke', 'sweatshirt',
    'kopp', 'koppen', 'cup', 'mug', 'travel mug', 'travelmug', 'termokopp', 'emaljekopp',
    'babybody', 'body',
    'totebag', 'tote bag', 'handlenett',
    'sticker', 'stickers', 'klistremerke', 'klistremerker', 'klistermerke', 'klistermerker',
    'poster', 'print', 'plakat', 'lerret', 'canvas',
    'wristband', 'bracelet', 'armbånd',
    'water bottle', 'drikkeflaske',
    'glassbrikker', 'koppeunderlag',
    'bokmerke', 'bookmark', 'bokmerker', 'bookmarks',
    'kort', 'card', 'cards', 'evangeliseringskort',
    'pennal', 'pencilcase', 'pencil case'
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
    let isPlural = lower.includes('stickers') || lower.includes('klistremerker') || lower.includes('klistermerker') || lower.includes('stk');
    typeStr = lang === 'no' ? (isPlural ? 'Klistremerker' : 'Klistremerke') :
              lang === 'es' ? (isPlural ? 'Pegatinas' : 'Pegatina') :
              (isPlural ? 'Stickers' : 'Sticker');
  } else if (type === 'poster') {
    typeStr = lang === 'no' ? 'Plakat' : lang === 'es' ? 'Póster' : 'Poster';
  } else if (type === 'canvas') {
    typeStr = lang === 'no' ? 'Lerret' : lang === 'es' ? 'Lienzo' : 'Canvas';
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
  } else if (type === 'bookmark') {
    let isPlural = lower.includes('bokmerker') || lower.includes('bookmarks') || !lower.includes('1 bokmerke');
    typeStr = lang === 'no' ? (isPlural ? 'Bokmerker' : 'Bokmerke') :
              lang === 'es' ? (isPlural ? 'Marcadores de páginas' : 'Marcador de páginas') :
              (isPlural ? 'Bookmarks' : 'Bookmark');
  } else if (type === 'card') {
    let isPlural = lower.includes('kort') || lower.includes('cards') || !lower.includes('1 random');
    typeStr = lang === 'no' ? 'Kort' :
              lang === 'es' ? (isPlural ? 'Tarjetas' : 'Tarjeta') :
              (isPlural ? 'Cards' : 'Card');
  } else if (type === 'pencil-case') {
    typeStr = lang === 'no' ? 'Pennal' : lang === 'es' ? 'Estuche' : 'Pencil Case';
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
    details.push(lang === 'no' ? `${mndVal} mnd` : lang === 'es' ? `${mndVal} meses` : `${mndVal} months`);
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
      // Kopp-spesifikke setninger (mug)
      { en: /\bthis beautiful ceramic mug is perfect for any event of the day\.?/gi, no: 'Denne vakre keramiske koppen er perfekt for enhver anledning i hverdagen.' },
      { en: /\byour morning coffee, a hot chocolate, or any other hot beverage( you enjoy)?\.?/gi, no: 'morgenkaffen, en varm kakao, eller annen varm drikke.' },
      { en: /\bthe mug is glossy white and the prints come out beautifully and vividly( on it)?\.?/gi, no: 'Koppen har en glansfull finish som gjør at motivene fremstår klare og levende.' },
      { en: /\bthe print retains its quality and luster when used in both microwaves? and (the )?dishwasher\.?/gi, no: 'Trykket beholder sin høye kvalitet og glans ved bruk i både mikrobølgeovn og oppvaskmaskin.' },
      { en: /\bceramic 11oz mug\.?/gi, no: 'Keramisk kopp (325 ml).' },
      { en: /\bdishwasher and microwave safe\.?/gi, no: 'Tåler oppvaskmaskin og mikrobølgeovn.' },
      { en: /\bunisex t-shirt\b/gi, no: 'unisex t-skjorte' },
      { en: /\bmade of 100% ring-spun cotton\b/gi, no: 'laget av 100% kjemmet bomull' },
      { en: /\bsoft and comfy\b/gi, no: 'myk og behagelig' },
      { en: /\bdouble stitching on the neckline and sleeves add more durability\b/gi, no: 'dobbeltsøm i hals og ermer gir økt slitestyrke' },
      { en: /\bhigh quality\b/gi, no: 'høy kvalitet' },
      { en: /\bperfect for\b/gi, no: 'perfekt for' },
      
      // Faith Over Fear & Mustard Seed
      { en: /\bif you have faith like a mustard seed\s*(\.{2,4})?/gi, no: 'Om dere har tro som et sennepsfrø...' },
      { en: /\bfaith like a mustard seed\s*(\.{2,4})?/gi, no: 'Tro som et sennepsfrø...' },
      
      // Barnegenser (Kids sweatshirt)
      { en: /\ba comfortable and eco-friendly sweatshirt for kids made from a blend of cotton and recycled polyester\.?/gi, no: 'En komfortabel og miljøvennlig genser for barn, laget av en blanding av bomull og resirkulert polyester.' },
      { en: /\b80% cotton \/ 20% recycled polyester blend\.?/gi, no: '80% bomull og 20% resirkulert polyester.' },
      { en: /\bbrushed fleece lining for added warmth\.?/gi, no: 'Børstet fleecefôr for ekstra varme.' },
      { en: /\bribbed cuffs and hem for a snug fit\.?/gi, no: 'Ribbestrikkede mansjetter og nederkant for en god passform.' },
      { en: /\bavailable in multiple colors\.?/gi, no: 'Tilgjengelig i flere farger.' },
      { en: /\bdurable and soft fabric\.?/gi, no: 'Slitesterkt og mykt stoff.' },

      // Totebag / Handlenett
      { en: /\bcover all your grab and go needs with these long handle tote bags while being eco-conscious\.?/gi, no: 'Dekk alle dine behov på farten med disse miljøvennlige handlenettene med lange håndtak.' },
      { en: /\bthese tote bags feature reinforced stitching on handles for more stability\.?/gi, no: 'Disse handlenettene har forsterkede sømmer på håndtakene for økt stabilitet.' },
      { en: /\b(the unique|the) designs will stand out on these 100% cotton fabric tote bags\.?/gi, no: 'Designet vil skille seg ut på disse handlenettene i 100% bomull.' },
      { en: /\breinforced stitching on handles\.?/gi, no: 'Forsterkede sømmer på håndtakene.' },
      { en: /\blarge printable area for front & back\.?/gi, no: 'Stort trykkområde på for- og baksiden.' },
      { en: /\blarge printable area for front &amp; back\.?/gi, no: 'Stort trykkområde på for- og baksiden.' },
      { en: /\bcapacity 10 litres\.?/gi, no: 'Kapasitet: 10 liter.' },
      { en: /\b100% cotton\.?/gi, no: '100% bomull.' },
      { en: /\b3 - 5 oz\/yard², 100 - 170 g\/m²\.?/gi, no: '100 - 170 g/m².' },
      { en: /\bany whites in your design will be treated as transparent in the printing process for the natural color tote bags. please keep this in mind to ensure optimal results\.?/gi, no: 'Eventuelle hvite partier i designet vil bli behandlet som transparente i trykkprosessen på naturfargede handlenett. Vennligst husk dette for optimalt resultat.' },

      // Sweatshirts (Gildan 18000 etc.)
      { en: /\ba heavy blend sweatshirt\b/gi, no: 'En genser i kraftig kvalitet.' },
      { en: /\bcrafted from a soft blend of 50% cotton and 50% polyester\b/gi, no: 'Laget av en myk blanding av 50% bomull og 50% polyester.' },
      { en: /\bfeatures air jet yarn for a softer feel and reduced pilling\b/gi, no: 'Laget med luftspunnet garn for en mykere følelse og mindre nupping.' },
      { en: /\bdouble-needle stitching at shoulder, armhole, neck, waistband, and cuffs\b/gi, no: 'Doble sømmer ved skuldre, ermehull, hals, linning og mansjetter.' },
      { en: /\b1x1 rib with spandex for enhanced stretch and recovery\b/gi, no: '1x1 ribbestrikk med spandex for økt elastisitet og formfasthet.' },
      { en: /\bclassic fit for everyday comfort\b/gi, no: 'Klassisk passform for hverdagsbruk.' },

      // Sweatshirt SF000
      { en: /\bmaterial composition:\b/gi, no: 'Materiale:' },
      { en: /\b80% ringspun us cotton, 20% polyester\b/gi, no: '80% ringspunnet amerikansk bomull, 20% polyester.' },
      { en: /\b2-end ringspun cotton face fleece, made with 80% sustainably and fairly grown usa cotton\b/gi, no: '2-tråds ringspunnet bomullsoverflate, laget med 80% bærekraftig og rettferdig dyrket USA-bomull.' },
      { en: /\b1x1 rib with spandex cuffs and bottom band for enhanced stretch and recovery, dropped shoulder\b/gi, no: '1x1 ribb med spandex på mansjetter og nederkant for økt elastisitet, samt senkede skuldre.' },
      { en: /\bdouble-needle topstitching throughout\b/gi, no: 'Doble stikninger over hele plagget.' },
      { en: /\bclassic fit with a tubular body\b/gi, no: 'Klassisk passform med rundstrikket bol.' },

      // Poster-detaljer (plakater)
      { en: /\bexperience art that feels silky to the touch with our high-quality, lighter-weight, classic semi-glossy paper\.?/gi, no: 'Opplev kunst som føles silkemyk med vårt klassiske halvblanke papir av høy kvalitet og lavere vekt.' },
      { en: /\bposter made on our lighter-weight, uncoated classic matte paper\. The perfect option to stand the test of time:?/gi, no: 'Plakat laget på vårt lettere, ubestrøkede klassiske matte papir. Det perfekte valget for å vare over tid:' },
      { en: /\bpaper finishing: semi-glossy, enhances colors with a subtle shine\.?/gi, no: 'Papirfinish: Halvblank, fremhever farger med en subtil glans.' },
      { en: /\bpaper finishing: matte, smooth, non-reflective surface\.?/gi, no: 'Papirfinish: Matt, glatt, ikke-reflekterende overflate.' },
      { en: /\bpaper weight: 170 gsm \(65 lb\), thickness: 0.19 mm \(7.5 mils\), sturdy and durable\.?/gi, no: 'Papirvekt: 170 g/m² (65 lb), tykkelse: 0,19 mm (7,5 mils), solid og slitesterkt.' },
      { en: /\bsustainable paper: fsc-certified or equivalent for sustainability\.?/gi, no: 'Bærekraftig papir: FSC-sertifisert eller tilsvarende for bærekraft.' },

      // Generelle linjer
      { en: /\bdesigned by ([^,.\-]+) for his kingdom designs(,\s*[a-zA-Z]+\s*\d{4})?\.?/gi, no: 'Designet av $1 for His Kingdom Designs.' },
      { en: /\bdesigned by Jaana Särg-Raani for His Kingdom Designs(,\s*[a-zA-Z]+\s*\d{4})?\.?/gi, no: 'Designet av Jaana Särg-Raani for His Kingdom Designs.' },
      { en: /\bworld wide shipping\.?/gi, no: 'Global frakt.' },
      { en: /\bglobal shipping, including oceania, us & ca\.?/gi, no: 'Global frakt, inkludert Oseania, USA og Canada.' },
      { en: /\bglobal shipping, including us & ca\.?/gi, no: 'Global frakt, inkludert USA og Canada.' },
      { en: /\bglobal shipping\.?/gi, no: 'Global frakt.' },
      { en: /\binternational shipping, including us & ca\.?/gi, no: 'Global frakt, inkludert USA og Canada.' },
      { en: /\bmug height 96mm, bottom diameter 80mm\.?/gi, no: 'Koppehøyde 96 mm, bunndiameter 80 mm.' },
      { en: /\bproduct safety tests conducted by independent third party laboratories\.?/gi, no: 'Produktsikkerhetstester utført av uavhengige tredjepartslaboratorier.' }
    ];

    replacements.forEach(r => {
      cleaned = cleaned.replace(r.en, r.no);
    });
  } else if (lang === 'es') {
    const replacements = [
      // Kopp-spesifikke setninger (mug)
      { en: /\bthis beautiful ceramic mug is perfect for any event of the day\.?/gi, es: 'Esta hermosa taza de cerámica es perfecta para cualquier momento del día.' },
      { en: /\byour morning coffee, a hot chocolate, or any other hot beverage( you enjoy)?\.?/gi, es: 'su café de la mañana, un chocolate caliente o cualquier otra bebida caliente.' },
      { en: /\bthe mug is glossy white and the prints come out beautifully and vividly( on it)?\.?/gi, es: 'La taza es de color blanco brillante y los diseños se muestran de forma clara y vívida.' },
      { en: /\bthe print retains its quality and luster when used in both microwaves? and (the )?dishwasher\.?/gi, es: 'El diseño conserva su alta calidad y brillo tanto en el microondas como en el lavavajillas.' },
      { en: /\bceramic 11oz mug\.?/gi, es: 'Taza de cerámica (325 ml).' },
      { en: /\bdishwasher and microwave safe\.?/gi, es: 'Apta para lavavajillas y microondas.' },
      { en: /\bunisex t-shirt\b/gi, es: 'camiseta unisex' },
      { en: /\bmade of 100% ring-spun cotton\b/gi, es: 'hecha de 100% algodón hilado en anillo' },
      { en: /\bsoft and comfy\b/gi, es: 'suave y cómoda' },
      { en: /\bdouble stitching on the neckline and sleeves add more durability\b/gi, es: 'doble costura en el cuello y las mangas para mayor durabilidad' },

      // Faith Over Fear & Mustard Seed
      { en: /\bif you have faith like a mustard seed\s*(\.{2,4})?/gi, es: 'Si tienen fe como un grano de mostaza...' },
      { en: /\bfaith like a mustard seed\s*(\.{2,4})?/gi, es: 'Fe como un grano de mostaza...' },
      
      // Barnegenser (Kids sweatshirt)
      { en: /\ba comfortable and eco-friendly sweatshirt for kids made from a blend of cotton and recycled polyester\.?/gi, es: 'Una sudadera cómoda y ecológica para niños hecha de una mezcla de algodón y poliéster reciclado.' },
      { en: /\b80% cotton \/ 20% recycled polyester blend\.?/gi, es: 'Mezcla de 80% algodón y 20% poliéster reciclado.' },
      { en: /\bbrushed fleece lining for added warmth\.?/gi, es: 'Forro de felpa cepillada para mayor calidez.' },
      { en: /\bribbed cuffs and hem for a snug fit\.?/gi, es: 'Puños y dobladillo acanalados para un ajuste ceñido.' },
      { en: /\bavailable in multiple colors\.?/gi, es: 'Disponible en múltiples colores.' },
      { en: /\bdurable and soft fabric\.?/gi, es: 'Tejido suave y duradero.' },

      // Totebag / Handlenett
      { en: /\bcover all your grab and go needs with these long handle tote bags while being eco-conscious\.?/gi, es: 'Cubre todas tus necesidades sobre la marcha con estas bolsas de tela con asas largas mientras cuidas el medio ambiente.' },
      { en: /\bthese tote bags feature reinforced stitching on handles for more stability\.?/gi, es: 'Estas bolsas de tela cuentan con costuras reforzadas en las asas para mayor estabilidad.' },
      { en: /\b(the unique|the) designs will stand out on these 100% cotton fabric tote bags\.?/gi, es: 'Los diseños únicos destacarán en estas bolsas de tela de algodón 100%.' },
      { en: /\breinforced stitching on handles\.?/gi, es: 'Costuras reforzadas en las asas.' },
      { en: /\blarge printable area for front & back\.?/gi, es: 'Gran área de impresión para el frente y la espalda.' },
      { en: /\blarge printable area for front &amp; back\.?/gi, es: 'Gran área de impresión para el frente y la espalda.' },
      { en: /\bcapacity 10 litres\.?/gi, es: 'Capacidad: 10 litros.' },
      { en: /\b100% cotton\.?/gi, es: '100% algodón.' },
      { en: /\b3 - 5 oz\/yard², 100 - 170 g\/m²\.?/gi, es: '100 - 170 g/m².' },
      { en: /\bany whites in your design will be treated as transparent in the printing process for the natural color tote bags. please keep this in mind to ensure optimal results\.?/gi, es: 'Cualquier color blanco en su diseño se tratará como transparente en el proceso de impresión para las bolsas de tela de color natural. Tenga esto en cuenta para garantizar resultados óptimos.' },

      // Sweatshirts (Gildan 18000 etc.)
      { en: /\ba heavy blend sweatshirt\b/gi, es: 'Una sudadera de mezcla pesada.' },
      { en: /\bcrafted from a soft blend of 50% cotton and 50% polyester\b/gi, es: 'Hecha de una mezcla suave de 50% algodón y 50% poliéster.' },
      { en: /\bfeatures air jet yarn for a softer feel and reduced pilling\b/gi, es: 'Hecha con hilo de chorro de aire para una sensación más suave y menos pelusa.' },
      { en: /\bdouble-needle stitching at shoulder, armhole, neck, waistband, and cuffs\b/gi, es: 'Doble costura en hombros, sisas, cuello, cinturilla y puños.' },
      { en: /\b1x1 rib with spandex for enhanced stretch and recovery\b/gi, es: 'Canalé 1x1 con spandex para mayor elasticidad y recuperación.' },
      { en: /\bclassic fit for everyday comfort\b/gi, es: 'Ajuste clásico para comodidad diaria.' },

      // Sweatshirt SF000
      { en: /\bmaterial composition:\b/gi, es: 'Composición del material:' },
      { en: /\b80% ringspun us cotton, 20% polyester\b/gi, es: '80% algodón estadounidense hilado en anillo, 20% poliéster.' },
      { en: /\b2-end ringspun cotton face fleece, made with 80% sustainably and fairly grown usa cotton\b/gi, es: 'Felpa exterior de algodón hilado en anillo de 2 cabos, hecha con 80% de algodón de EE. UU. cultivado de manera sostenible y justa.' },
      { en: /\b1x1 rib with spandex cuffs and bottom band for enhanced stretch and recovery, dropped shoulder\b/gi, es: 'Canalé 1x1 con puños de spandex y banda inferior para mayor elasticidad y recuperación, hombro caído.' },
      { en: /\bdouble-needle topstitching throughout\b/gi, es: 'Doble costura en toda la prenda.' },
      { en: /\bclassic fit with a tubular body\b/gi, es: 'Ajuste clásico con cuerpo tubular.' },

      // Poster-detaljer (plakater)
      { en: /\bexperience art that feels silky to the touch with our high-quality, lighter-weight, classic semi-glossy paper\.?/gi, es: 'Disfruta de obras de arte que se sienten sedosas al tacto con nuestro papel semi-brillante clásico de alta calidad y peso ligero.' },
      { en: /\bposter made on our lighter-weight, uncoated classic matte paper\. The perfect option to stand the test of time:?/gi, es: 'Póster fabricado en nuestro papel mate clásico sin revestimiento de menor peso. La opción perfecta para resistir el paso del tiempo:' },
      { en: /\bpaper finishing: semi-glossy, enhances colors with a subtle shine\.?/gi, es: 'Acabado del papel: Semi-brillante, realza los colores con un brillo sutil.' },
      { en: /\bpaper finishing: matte, smooth, non-reflective surface\.?/gi, es: 'Acabado del papel: Mate, superficie lisa y no reflectante.' },
      { en: /\bpaper weight: 170 gsm \(65 lb\), thickness: 0.19 mm \(7.5 mils\), sturdy and durable\.?/gi, es: 'Peso del papel: 170 gsm (65 lb), grosor: 0.19 mm (7.5 mils), resistente y duradero.' },
      { en: /\bsustainable paper: fsc-certified or equivalent for sustainability\.?/gi, es: 'Papel sostenible: Certificado FSC o equivalente para la sostenibilidad.' },

      // Generelle linjer
      { en: /\bdesigned by ([[^,.\-]+) for his kingdom designs(,\s*[a-zA-Z]+\s*\d{4})?\.?/gi, es: 'Diseñado por $1 para His Kingdom Designs.' },
      { en: /\bdesigned by Jaana Särg-Raani for His Kingdom Designs(,\s*[a-zA-Z]+\s*\d{4})?\.?/gi, es: 'Diseñado por Jaana Särg-Raani para His Kingdom Designs.' },
      { en: /\bworld wide shipping\.?/gi, es: 'Envío mundial.' },
      { en: /\bglobal shipping, including oceania, us & ca\.?/gi, es: 'Envío mundial, incluidos Oceanía, EE. UU. y Canadá.' },
      { en: /\bglobal shipping, including us & ca\.?/gi, es: 'Envío mundial, incluidos EE. UU. y Canadá.' },
      { en: /\bglobal shipping\.?/gi, es: 'Envío mundial.' },
      { en: /\binternational shipping, including us & ca\.?/gi, es: 'Envío internacional, incluidos EE. UU. y Canadá.' },
      { en: /\bmug height 96mm, bottom diameter 80mm\.?/gi, es: 'Altura de la taza 96 mm, diámetro de la base 80 mm.' },
      { en: /\bproduct safety tests conducted by independent third party laboratories\.?/gi, es: 'Pruebas de seguridad del producto realizadas por laboratorios independientes de terceros.' }
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
  const autoName = cleanAndTranslateName(product.name, lang, product);
  const autoDesc = cleanAndTranslateDesc(product.description, lang);
  return makeTranslated(autoName, autoDesc);
}

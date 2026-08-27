import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { resolveColor, PRODUCT_COLOR_ORDER_OVERRIDES } from '@/lib/colors';

const getWixClient = async () => {
  const { wixClient } = await import('@/lib/wix');
  return wixClient;
};

const getFirestoreDb = async () => {
  const { db } = await import('@/firebase');
  const firestore = await import('firebase/firestore');
  return { db, ...firestore };
};

// Context API Sikkerhetsnett: Initialiser med tom brakett for å unngå "White screen of death"
export const AppContext = createContext({});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

const INITIAL_MESSAGES = [
  {
    id: 'msg-init-1',
    sender: 'assistant',
    text: 'Velkommen til **His Kingdom Designs**! 👋 Jeg er din HKD-assistent. Jeg hjelper deg gjerne med å finne riktig størrelse, fortelle mer om materialene våre, svare på spørsmål om frakt og retur, eller finne det perfekte bibelverset for deg. Hva lurer du på?',
    time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
  }
];

const FALLBACK_TAXONOMY = {
  'Klær & Bekledning': ['Klær', 'Dameklær', 'Genser', 'Joggebukser', 'T-shirts', 'Hatter /caps', 'Sport / Performance /Outdoor', 'RUSS'],
  'Bilder & Kunst': ['Bilder og plakater', 'Maleri', 'Fotografi', 'Typografi', 'Abstrakt', 'Minimalistisk', 'Fargerik', 'Svart-hvit', 'Retro', 'Romantisk', 'Whimsical'],
  'Tilbehør & Hjem': ['Tilbehør', 'armbånd og smykker', 'Handlenett / Totebag', 'Kopper og flasker', 'Mobildeksel', 'Klistermerker', 'Barnerom'],
  'Barn & Familie': ['BABY', 'BARN & UNGDOM', 'Mirakel familie'],
  'Temaer & Språk': ['Jesus', 'Israel', 'Spiritual Battle', 'Humor', 'Undervisning', 'Varna - Evangeliesenteret Bibelskole', 'Høytider', 'CHRISTMAS', 'PÅSKE', 'Abonnement', 'Digitale filer', 'Kreative bøker', 'NORSKE produkter', 'ENGLISH products', 'ESPAÑOL']
};



export const isProductOceaniaExclusive = (item) => {
  if (!item) return false;
  const desc = ((item.description || '') + ' ' + (item.additionalInfoSections?.map(s => s.description).join(' ') || '')).replace(/<[^>]*>/g, ' ');
  const lower = desc.toLowerCase();
  
  return (
    lower.includes('oceania exclusive') ||
    lower.includes('shipping: us, ca and oceania exclusive') ||
    lower.includes('shipping: us, ca & oceania exclusive') ||
    lower.includes('shipping exclusively usa, canada and oceania') ||
    lower.includes('shipping exclusively us, canada and oceania') ||
    lower.includes('shipping: usa, ca and oceania') ||
    lower.includes('usa, canada and oceania') ||
    lower.includes('us, ca and oceania') ||
    lower.includes('us, ca, oceania') ||
    (lower.includes('oceania') && (lower.includes('shipping') || lower.includes('exclusive') || lower.includes('levering')))
  );
};

export const AppProvider = ({ children }) => {
  const { language } = useLanguage();
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('hkm-products-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validRealProducts = parsed.filter(p => p.id && !String(p.id).startsWith('prod-'));
          if (validRealProducts.length > 0) {
            return validRealProducts;
          }
        }
      }
    } catch (e) {
      console.warn('Feil ved lesing av produkt-cache fra localStorage:', e);
    }
    return [];
  });

  const [isLoadingProducts, setIsLoadingProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('hkm-products-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return false; // Instant load, no spinner!
        }
      }
    } catch (e) {}
    return true;
  });

  const [wixCollections, setWixCollections] = useState(() => {
    try {
      const cached = localStorage.getItem('hkm-wix-collections-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return [];
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Generate dynamic taxonomy from Wix collections with fallback
  const categoryTaxonomy = React.useMemo(() => {
    if (wixCollections.length === 0) {
      return FALLBACK_TAXONOMY;
    }

    const taxonomy = {
      'Klær & Bekledning': [],
      'Bilder & Kunst': [],
      'Tilbehør & Hjem': [],
      'Barn & Familie': [],
      'Temaer & Språk': []
    };

    wixCollections.forEach(c => {
      const name = c.name;
      const lower = name.toLowerCase();

           const isKidsFamily = lower.includes('baby') || 
                           lower.includes('barn') || 
                           lower.includes('ungdom') || 
                           lower.includes('familie') || 
                           lower.includes('family') || 
                           lower.includes('kids') || 
                           lower.includes('child') || 
                           lower.includes('boy') || 
                           lower.includes('girl');

      const isClothing = lower.includes('klær') || 
                         lower.includes('genser') || 
                         lower.includes('joggebukse') || 
                         lower.includes('t-shirt') || 
                         lower.includes('hat') || 
                         lower.includes('caps') || 
                         lower.includes('sport') || 
                         lower.includes('russ') || 
                         lower.includes('clothing') || 
                         lower.includes('shirt') || 
                         lower.includes('hoodie') || 
                         lower.includes('sweatshirt') || 
                         lower.includes('jacket') || 
                         lower.includes('socks') || 
                         lower.includes('sweater') || 
                         lower.includes('sweatpants') || 
                         lower.includes('pants');

      const isArt = lower.includes('bilde') || 
                    lower.includes('plakat') || 
                    lower.includes('kunst') || 
                    lower.includes('poster') || 
                    lower.includes('maleri') || 
                    lower.includes('foto') || 
                    lower.includes('typografi') || 
                    lower.includes('abstrakt') || 
                    lower.includes('minimalistisk') || 
                    lower.includes('fargerik') || 
                    lower.includes('svart-hvit') || 
                    lower.includes('retro') || 
                    lower.includes('romantisk') || 
                    lower.includes('whimsical') || 
                    lower.includes('art') || 
                    lower.includes('print');

      const isAccessory = lower.includes('tilbehør') || 
                          lower.includes('smykke') || 
                          lower.includes('jewelry') || 
                          lower.includes('armbånd') || 
                          lower.includes('bracelet') || 
                          lower.includes('bag') || 
                          lower.includes('tote') || 
                          lower.includes('kopp') || 
                          lower.includes('flaske') || 
                          lower.includes('cups') || 
                          lower.includes('bottle') || 
                          lower.includes('deksel') || 
                          lower.includes('cover') || 
                          lower.includes('klister') || 
                          lower.includes('sticker') || 
                          lower.includes('mug') || 
                          lower.includes('accessory') || 
                          lower.includes('accessories') || 
                          lower.includes('home') || 
                          lower.includes('barnerom') || 
                          lower.includes('book');

      if (isKidsFamily) {
        taxonomy['Barn & Familie'].push(name);
      } else if (isClothing) {
        taxonomy['Klær & Bekledning'].push(name);
      } else if (isArt) {
        taxonomy['Bilder & Kunst'].push(name);
      } else if (isAccessory) {
        taxonomy['Tilbehør & Hjem'].push(name);
      } else {
        taxonomy['Temaer & Språk'].push(name);
      }
    });

    // Sort subcategories alphabetically
    Object.keys(taxonomy).forEach(key => {
      taxonomy[key].sort((a, b) => a.localeCompare(b, 'no'));
    });

    return taxonomy;
  }, [wixCollections]);

  // CMS & Admin States
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [cmsContent, setCmsContent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hkm-cms-content') || '{}');
    } catch {
      return {};
    }
  });
  const [toastMessage, setToastMessage] = useState(null);

  // Wix Auth & Member States
  const [member, setMember] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleAuthChange = async () => {
      const wixClient = await getWixClient();
      const logged = wixClient.auth.loggedIn();
      setIsLoggedIn(logged);
      if (logged) {
        try {
          const res = await wixClient.members.getCurrentMember({ fieldsets: ['FULL'] });
          if (res && res.member) {
            setMember(res.member);
            
            // Sync admin role to localStorage defensively
            const ADMIN_EMAILS = [
              'knutsenthomas@gmail.com',
              'thomas@hiskingdomministry.no',
              'thomas@hiskingdomministry',
              'hildekarin@gmail.com',
              'hildekarin@hiskingdomministry.no',
              'thomas@tk-design.no'
            ];
            const ADMIN_MEMBER_IDS = [
              '18cf516e-0caa-430c-9bb5-6150854fcd6f' // Thomas Knutsen
            ];

            // Helper to get email
            const getEmail = (m) => {
              if (!m) return '';
              if (m.loginEmail) return m.loginEmail;
              const cdEmails = m.contactDetails?.emails || [];
              if (cdEmails[0]) return typeof cdEmails[0] === 'object' ? cdEmails[0].email : cdEmails[0];
              const cEmails = m.contact?.emails || [];
              if (cEmails[0]) return typeof cEmails[0] === 'object' ? cEmails[0].email : cEmails[0];
              return m.contactDetails?.email || m.contact?.email || '';
            };

            const email = getEmail(res.member).toLowerCase();
            const memberId = res.member._id;

            if (ADMIN_MEMBER_IDS.includes(memberId) || (email && ADMIN_EMAILS.includes(email))) {
              localStorage.setItem('hkm-user-role', 'admin');
            } else {
              localStorage.removeItem('hkm-user-role');
            }
          }
        } catch (e) {
          console.error('Failed to get current member in AppContext:', e);
        }
      } else {
        setMember(null);
        localStorage.removeItem('hkm-user-role');
      }
    };

    handleAuthChange();
    window.addEventListener('wix-auth-change', handleAuthChange);
    return () => window.removeEventListener('wix-auth-change', handleAuthChange);
  }, []);

  // Wishlist States
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('hkd-wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('hkd-wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error('Failed to save wishlist to localStorage', e);
    }
  }, [wishlist]);

  // Live sync wishlist from Firestore if logged in
  useEffect(() => {
    let unsubscribe = null;
    const setupSync = async () => {
      if (isLoggedIn && member?._id) {
        const { db, doc, onSnapshot } = await getFirestoreDb();
        const docRef = doc(db, 'wishlists', member._id);
        unsubscribe = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const dbWishlist = docSnap.data().items || [];
            setWishlist(dbWishlist);
          }
        }, (err) => {
          console.warn('Error listening to wishlist in Firestore:', err);
        });
      }
    };
    setupSync();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isLoggedIn, member?._id]);

  // Merge local wishlist with cloud wishlist upon login
  useEffect(() => {
    const mergeWishlists = async () => {
      if (isLoggedIn && member?._id) {
        try {
          const { db, doc, getDoc, setDoc } = await getFirestoreDb();
          const docRef = doc(db, 'wishlists', member._id);
          const docSnap = await getDoc(docRef);
          let cloudItems = [];
          if (docSnap.exists()) {
            cloudItems = docSnap.data().items || [];
          }
          
          // Get local items
          const localSaved = localStorage.getItem('hkd-wishlist');
          const localItems = localSaved ? JSON.parse(localSaved) : [];
          
          if (localItems.length > 0) {
            const merged = [...cloudItems];
            localItems.forEach(localItem => {
              if (!merged.some(cloudItem => cloudItem.id === localItem.id)) {
                merged.push(localItem);
              }
            });
            await setDoc(docRef, { items: merged }, { merge: true });
            setWishlist(merged);
            localStorage.setItem('hkd-wishlist', JSON.stringify([]));
          } else {
            setWishlist(cloudItems);
          }
        } catch (err) {
          console.warn('Failed to merge wishlists:', err);
        }
      }
    };
    mergeWishlists();
  }, [isLoggedIn, member?._id]);

  const toggleWishlist = async (product) => {
    let newWishlist;
    const exists = wishlist.some(p => p.id === product.id);
    if (exists) {
      showToast(`Fjernet "${product.name}" fra ønskelisten`);
      newWishlist = wishlist.filter(p => p.id !== product.id);
    } else {
      showToast(`Lagt til "${product.name}" i ønskelisten`);
      newWishlist = [...wishlist, product];
    }
    setWishlist(newWishlist);
    
    if (isLoggedIn && member?._id) {
      try {
        const { db, doc, setDoc } = await getFirestoreDb();
        const docRef = doc(db, 'wishlists', member._id);
        await setDoc(docRef, { items: newWishlist }, { merge: true });
      } catch (err) {
        console.error('Failed to save wishlist to Firestore:', err);
      }
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(p => p.id === productId);
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Update CMS Content
  const updateCmsContent = async (slug, value) => {
    setCmsContent(prev => {
      const updated = { ...prev, [slug]: value };
      try {
        localStorage.setItem('hkm-cms-content', JSON.stringify(updated));
      } catch (e) {
        console.error('Klarte ikke lagre cms content i localStorage:', e);
      }
      return updated;
    });

    try {
      const { db, doc, setDoc } = await getFirestoreDb();
      const cmsDocRef = doc(db, "cms_configs", "designs");
      await setDoc(cmsDocRef, { [slug]: value }, { merge: true });
    } catch (err) {
      console.error("Feil ved oppdatering av CMS-innhold i Firestore:", err);
    }
  };

  // Realtime Sync from Firestore
  useEffect(() => {
    let unsubscribe = null;
    const setupCmsSync = async () => {
      try {
        const { db, doc, onSnapshot } = await getFirestoreDb();
        const cmsDocRef = doc(db, "cms_configs", "designs");
        unsubscribe = onSnapshot(cmsDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const dbData = snapshot.data();
            setCmsContent(prev => {
              const merged = { ...prev, ...dbData };
              localStorage.setItem('hkm-cms-content', JSON.stringify(merged));
              return merged;
            });
          }
        }, (err) => {
          console.warn("Kunne ikke synkronisere CMS fra Firestore:", err);
        });
      } catch (e) {
        console.warn("Feil ved oppstart av CMS synkronisering:", e);
      }
    };
    setupCmsSync();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Load products and collections from Wix
  useEffect(() => {
    const fetchWixData = async () => {
      try {
        console.log('Henter produkter fra Wix...');
        const wixClient = await getWixClient();
        const collectionsList = await wixClient.collections.queryCollections().limit(100).find();
        
        const collectionsMap = {};
        collectionsList.items.forEach(c => {
          collectionsMap[c._id] = c.name;
        });

        const collectionsData = collectionsList.items.map(c => ({
          id: c._id,
          name: c.name,
          slug: c.slug
        })).filter(c => c.name !== 'All Products' && c.name !== 'all-products');
        setWixCollections(collectionsData);
        try {
          localStorage.setItem('hkm-wix-collections-cache', JSON.stringify(collectionsData));
        } catch (e) {}

        let allItems = [];
        try {
          const firstPage = await wixClient.products.queryProducts().descending('createdDate').limit(100).find();
          allItems = [...firstPage.items];
          const totalCount = firstPage.totalCount || 0;
          if (totalCount > 100) {
            const totalPages = Math.ceil(totalCount / 100);
            const promises = [];
            for (let i = 1; i < totalPages; i++) {
              promises.push(wixClient.products.queryProducts().descending('createdDate').limit(100).skip(i * 100).find());
            }
            const results = await Promise.all(promises);
            results.forEach(res => {
              if (res.items) {
                allItems = [...allItems, ...res.items];
              }
            });
          }
        } catch (productError) {
          console.warn('Wix product fetch failed, checking token validity...', productError);
          
          const isAuthError = productError?.status === 401 || 
                              productError?.message?.includes('401') || 
                              productError?.message?.includes('Unauthorized') || 
                              productError?.message?.includes('Invalid token') ||
                              productError?.message?.includes('invalid_grant') ||
                              productError?.message?.includes('403') ||
                              productError?.message?.includes('Forbidden');

          if (isAuthError && localStorage.getItem('wix_oauth_tokens')) {
            console.warn('Wix auth token invalid or expired. Performing token recovery (logout)...');
            try {
              localStorage.removeItem('wix_oauth_tokens');
              await wixClient.auth.logout();
              window.dispatchEvent(new Event('wix-auth-change'));
            } catch (logoutErr) {
              console.warn('Failed to logout during token recovery:', logoutErr);
            }
          }

          try {
            // Re-fetch collections list to ensure clean OAuth state
            const collectionsListRetry = await wixClient.collections.queryCollections().limit(100).find();
            const collectionsMapRetry = {};
            collectionsListRetry.items.forEach(c => {
              collectionsMapRetry[c._id] = c.name;
            });
            const collectionsDataRetry = collectionsListRetry.items.map(c => ({
              id: c._id,
              name: c.name,
              slug: c.slug
            })).filter(c => c.name !== 'All Products' && c.name !== 'all-products');
            setWixCollections(collectionsDataRetry);
            try {
              localStorage.setItem('hkm-wix-collections-cache', JSON.stringify(collectionsDataRetry));
            } catch (e) {}

            const firstPageRetry = await wixClient.products.queryProducts().descending('createdDate').limit(100).find();
            allItems = [...firstPageRetry.items];
            const totalCountRetry = firstPageRetry.totalCount || 0;
            if (totalCountRetry > 100) {
              const totalPagesRetry = Math.ceil(totalCountRetry / 100);
              const promisesRetry = [];
              for (let i = 1; i < totalPagesRetry; i++) {
                promisesRetry.push(wixClient.products.queryProducts().descending('createdDate').limit(100).skip(i * 100).find());
              }
              const resultsRetry = await Promise.all(promisesRetry);
              resultsRetry.forEach(res => {
                if (res.items) {
                  allItems = [...allItems, ...res.items];
                }
              });
            }
          } catch (retryError) {
            console.error('Wix product fetch retry failed:', retryError);
            throw retryError;
          }
        }

        console.log(`Hentet totalt ${allItems.length} produkter fra Wix.`);

        // Define lists of collection names belonging to each primary category
        const pureClothingCollections = ['Klær', 'Dameklær', 'Genser', 'Joggebukser', 'T-shirts', 'Hatter /caps', 'RUSS'];
        const plakaterCollections = ['Bilder og plakater', 'Maleri', 'Fotografi', 'Typografi', 'Abstrakt', 'Minimalistisk', 'Fargerik', 'Svart-hvit', 'Retro', 'Romantisk', 'Whimsical'];
        const klistermerkerCollections = ['Klistermerker'];

        // Precise regexes with word boundaries for name keyword matching
        const clothingRegex = /\b(genser|gensere|hettegenser|hettegensere|tskjorte|tskjorter|t-skjorte|t-skjorter|tee|tees|body|bodyer|babybody|babybodyer|babysuit|skjorte|skjorter|topp|topper|caps|lue|luer|beanie|beanies|sokker|bukse|bukser|pants|hoodie|hoodies|sweatshirt|sweatshirts|tights|jakke|jakker|smekke|smekker|bib)\b/i;
        const stickerRegex = /\b(klistremerke|klistremerker|sticker|stickers)\b/i;
        const posterRegex = /\b(plakat|plakater|poster|postere|kunsttrykk|bilde|bilder|canvas|matte paper|glossy paper|semi-glossy|wall art|veggkunst|digital plakat|digital poster)\b/i;

        const mapped = allItems.map(item => {
          const nameLower = item.name.toLowerCase();
          const resolvedCollections = item.collectionIds?.map(id => collectionsMap[id]).filter(Boolean) || [];
          
          const hasPosterCollection = resolvedCollections.some(c => plakaterCollections.includes(c));
          const hasPosterName = posterRegex.test(nameLower);
          const hasClothingCollection = resolvedCollections.some(c => pureClothingCollections.includes(c));
          const hasClothingName = clothingRegex.test(nameLower);
          const hasStickerCollection = resolvedCollections.some(c => klistermerkerCollections.includes(c));
          const hasStickerName = stickerRegex.test(nameLower);

          let category = 'Tilbehør';
          if (hasStickerName || (hasStickerCollection && !hasPosterName && !hasClothingName)) {
            category = 'Klistermerker';
          } else if (hasPosterName || (hasPosterCollection && !hasClothingName && !hasClothingCollection)) {
            category = 'Plakater';
          } else if (hasClothingName || hasClothingCollection) {
            category = 'Klær';
          } else if (hasPosterCollection) {
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
                const isDimension = s.includes('cm') || s.includes('″') || s.includes('"') || s.toLowerCase().includes('x');
                if (s.length > 15 && !isDimension) return false;
                const lower = s.toLowerCase();
                if (lower.includes('sticker') || lower.includes('mug') || lower.includes('kopp') || lower.includes('flaske') || lower.includes('valg') || lower.includes('option') || lower.includes('pega') || lower.includes('norsk') || lower.includes('english')) {
                  return false;
                }
                return true;
              });
            }

            const colorOpt = item.productOptions.find(o => {
              const name = o.name?.trim().toLowerCase();
              return name === 'color' || name === 'farge';
            });
            if (colorOpt) {
              const resolved = colorOpt.choices?.map(c => resolveColor(c.value, c.description || c.name)) || [];
              colorNames = resolved.map(r => r.name);
              colors = resolved.map(r => r.hex);

              // Filter to unique color names and align colors array
              const uniqueNames = [];
              const uniqueHexes = [];
              colorNames.forEach((name, idx) => {
                if (!uniqueNames.includes(name)) {
                  uniqueNames.push(name);
                  uniqueHexes.push(colors[idx]);
                }
              });
              colorNames = uniqueNames;
              colors = uniqueHexes;

              if (PRODUCT_COLOR_ORDER_OVERRIDES[item._id]) {
                colorNames = PRODUCT_COLOR_ORDER_OVERRIDES[item._id].map(c => c.name);
                colors = PRODUCT_COLOR_ORDER_OVERRIDES[item._id].map(c => c.hex);
              }
            }
          }

          // Deduplicate sizes
            sizes = Array.from(new Set(sizes));

          // Only include colors and sizes if product has actual options in Wix
          if (colors.length === 0) {
            colors = [];
            colorNames = [];
          }
          if (sizes.length === 0) {
            sizes = [];
          }

          const price = item.price?.discountedPrice || item.price?.price || 0;
          const originalPrice = item.price?.price || 0;
          const isSale = price < originalPrice || item.discount?.type !== 'NONE' || resolvedCollections.some(c => c.toUpperCase() === 'SALG');
          const isBestseller = resolvedCollections.includes('Bestselgere') || resolvedCollections.includes('Populære produkter');

          // Intelligent weight calculations based on product category & details
          let fallbackWeight = 0.1; // Default fallback (100g)
          if (category === 'Klistermerker') {
            fallbackWeight = 0.005; // 5g per sticker
          } else if (category === 'Plakater') {
            fallbackWeight = 0.15; // 150g per poster
          } else if (category === 'Klær') {
            const nameLower = item.name.toLowerCase();
            if (nameLower.includes('hoodie') || nameLower.includes('genser') || nameLower.includes('sweatshirt') || nameLower.includes('bukse') || nameLower.includes('pants')) {
              fallbackWeight = 0.6; // 600g for hoodies/gensere/bukser
            } else if (nameLower.includes('caps') || nameLower.includes('lue') || nameLower.includes('beanie')) {
              fallbackWeight = 0.1; // 100g for hats
            } else {
              fallbackWeight = 0.2; // 200g for t-shirts
            }
          } else if (category === 'Tilbehør') {
            const nameLower = item.name.toLowerCase();
            if (nameLower.includes('deksel') || nameLower.includes('cover')) {
              fallbackWeight = 0.05; // 50g for phone covers
            } else if (nameLower.includes('nett') || nameLower.includes('bag') || nameLower.includes('tote')) {
              fallbackWeight = 0.15; // 150g for tote bags
            }
          }
          const weight = item.weight || fallbackWeight;

          return {
            id: item._id,
            name: item.name,
            price: price,
            originalPrice: isSale ? originalPrice : undefined,
            category: category,
            colors: colors,
            colorNames: colorNames,
            sizes: sizes,
            weight: weight,
            sku: item.sku || item._id,
            image: item.media?.mainMedia?.image?.url || 'https://via.placeholder.com/400',
            images: item.media?.items?.filter(mi => mi.mediaType === 'image').map(mi => mi.image?.url).filter(Boolean) || [],
            media: item.media,
            mediaItems: item.media?.items || [],
            isBestseller: isBestseller,
            isSale: isSale,
            isOceaniaExclusive: isProductOceaniaExclusive(item),
            description: item.description || '',
            subcategories: resolvedCollections,
            productOptions: item.productOptions,
            manageVariants: item.manageVariants,
            variants: item.variants,
            customTextFields: item.customTextFields || [],
            createdDate: item.createdDate || item._createdDate || null
          };
        });

        if (mapped.length > 0) {
          setProducts(mapped);
          try {
            // Prune heavy fields for localStorage to stay well under the 5MB quota
            const lightweight = mapped.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              originalPrice: p.originalPrice,
              category: p.category,
              colors: p.colors,
              colorNames: p.colorNames,
              sizes: p.sizes,
              weight: p.weight,
              image: p.image,
              isBestseller: p.isBestseller,
              isSale: p.isSale,
              isOceaniaExclusive: p.isOceaniaExclusive,
              subcategories: p.subcategories
            }));
            localStorage.setItem('hkm-products-cache', JSON.stringify(lightweight));
          } catch (e) {
            console.warn('Feil ved lagring av produkt-cache:', e);
          }
          console.log(`Laster ${mapped.length} produkter dynamisk fra Wix.`);
        }
      } catch (error) {
        console.error('Kunne ikke hente produkter fra Wix, faller tilbake til lokale testdata:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchWixData();
    const interval = setInterval(fetchWixData, 30000); // Check for backend changes every 30 seconds
    return () => clearInterval(interval);
  }, []);
  
  // Chat Assistant State
  const [assistantMessages, setAssistantMessages] = useState(INITIAL_MESSAGES);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [assistantContext, setAssistantContext] = useState({
    title: 'Hjem',
    pageType: 'home',
    url: '/'
  });

  const getProductRecommendations = (inputText) => {
    const lower = inputText.toLowerCase().trim();
    
    // Check if the user is asking about recommendations for all / families / all ages
    const isAllAgesQuery = 
      lower.includes('for alle') || 
      lower.includes('alle aldre') || 
      lower.includes('hele familien') || 
      (lower.includes('alle') && (lower.includes('aldre') || lower.includes('anbefal') || lower.includes('produkt') || lower.includes('kategori') || lower.includes('alder')));

    if (isAllAgesQuery) {
      console.log('Backend getProductRecommendations matched all ages / family query');
      // Find kids/baby products
      const kidProds = products.filter(prod => {
        const prodNameLower = prod.name.toLowerCase();
        const prodDescLower = prod.description?.toLowerCase() || '';
        const prodSubcats = prod.subcategories?.map(s => s.toLowerCase()) || [];
        return prod.gender === 'Barn' || 
               prod.category?.toLowerCase().includes('barn') || 
               prodNameLower.includes('barn') || 
               prodNameLower.includes('barne') || 
               prodNameLower.includes('baby') || 
               prodNameLower.includes('body') || 
               prodNameLower.includes('år') || 
               prodNameLower.includes('mnd') || 
               prodDescLower.includes('barn') || 
               prodDescLower.includes('barne') || 
               prodSubcats.some(s => s.includes('barn') || s.includes('ungdom') || s.includes('kids') || s.includes('baby'));
      });

      // Find adult clothing products
      const adultProds = products.filter(prod => {
        const prodNameLower = prod.name.toLowerCase();
        return prod.category === 'Klær' && 
               prod.gender !== 'Barn' && 
               !prodNameLower.includes('barn') && 
               !prodNameLower.includes('barne') && 
               !prodNameLower.includes('baby') && 
               !prodNameLower.includes('body') && 
               !prodNameLower.includes('år');
      });

      // Find posters, stickers or accessories
      const miscProds = products.filter(prod => {
        return prod.category === 'Plakater' || prod.category === 'Klistermerker' || prod.category === 'Tilbehør';
      });

      const selected = [];
      if (kidProds.length > 0) selected.push(kidProds[0]);
      if (adultProds.length > 0) selected.push(adultProds[0]);
      if (miscProds.length > 0) selected.push(miscProds[0]);

      if (selected.length > 0) {
        return selected;
      }
    }

    // Check if the user is asking about products/sales/bestsellers/categories
    const isAskingAboutProducts = 
      lower.includes('produkt') || 
      lower.includes('anbefal') || 
      lower.includes('kjøpe') || 
      lower.includes('butikk') || 
      lower.includes('utvalg') || 
      lower.includes('hva har dere') || 
      lower.includes('vis meg') || 
      lower.includes('søk') || 
      lower.includes('leter etter') ||
      lower.includes('finne') ||
      lower.includes('salg') ||
      lower.includes('tilbud') ||
      lower.includes('rabatt') ||
      lower.includes('bestselger') ||
      lower.includes('populær') ||
      lower.includes('klær') ||
      lower.includes('t-skjorte') ||
      lower.includes('tee') ||
      lower.includes('genser') ||
      lower.includes('plakat') ||
      lower.includes('poster') ||
      lower.includes('bilde') ||
      lower.includes('klister') ||
      lower.includes('sticker') ||
      lower.includes('tilbehør') ||
      lower.includes('lue') ||
      lower.includes('deksel') ||
      lower.includes('bag') ||
      lower.includes('tote');

    // Split input into keywords, removing common small words
    const stopWords = new Set([
      'jeg', 'og', 'i', 'på', 'en', 'et', 'er', 'det', 'har', 'dere', 'noen', 
      'vis', 'meg', 'leter', 'etter', 'hva', 'koster', 'anbefale', 'anbefal',
      'til', 'med', 'for', 'om', 'kan', 'du', 'søk', 'etter', 'produkter', 
      'produkt', 'de', 'den', 'siste', 'nye', 'viser', 'gi', 'meg',
      'hvordan', 'hvem', 'hvor', 'hvorfor', 'gjør', 'gjøre', 'vil', 'skal', 
      'må', 'bør', 'få', 'får', 'ta', 'tar', 'se', 'ser', 'finne', 'finner', 
      'mer', 'om', 'enkel', 'mottar', 'varen', 'ubrukt', 'kontakt'
    ]);
    const words = lower
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 1 && !stopWords.has(w));

    if (words.length === 0 && !isAskingAboutProducts) {
      return null;
    }

    let matches = [];
    const isBestsellerQuery = lower.includes('bestselger') || lower.includes('populær') || lower.includes('topp');
    const isSaleQuery = lower.includes('salg') || lower.includes('tilbud') || lower.includes('rabatt') || lower.includes('billig') || lower.includes('nedsatt');

    const isKidsQuery = 
      lower.includes('barn') || 
      lower.includes('kids') || 
      lower.includes('junior') || 
      lower.includes('gutt') || 
      lower.includes('jente') || 
      lower.includes('ungdom') || 
      lower.includes('baby') || 
      lower.includes('åring') || 
      /\b\d+\s*år\b/.test(lower);

    const isWomenQuery =
      lower.includes('dame') ||
      lower.includes('kvinne') ||
      lower.includes('women') ||
      lower.includes('damer');

    const isMenQuery =
      lower.includes('herre') ||
      lower.includes('mann') ||
      lower.includes('men') ||
      lower.includes('herrer');

    products.forEach(prod => {
      let score = 0;
      const prodNameLower = (prod.name || '').toLowerCase();
      const prodDescLower = prod.description?.toLowerCase() || '';
      const prodCatLower = (prod.category || '').toLowerCase();
      const prodSubcats = prod.subcategories?.map(s => s.toLowerCase()) || [];

      // Flag matching
      if (isBestsellerQuery && prod.isBestseller) score += 8;
      if (isSaleQuery && prod.isSale) score += 8;

      // Target audience boosts
      if (isKidsQuery) {
        const hasKidsTag = 
          prod.gender === 'Barn' || 
          prod.category?.toLowerCase().includes('barn') || 
          prodNameLower.includes('barn') || 
          prodNameLower.includes('barne') || 
          prodNameLower.includes('baby') || 
          prodNameLower.includes('body') || 
          prodNameLower.includes('år') || 
          prodNameLower.includes('mnd') || 
          prodDescLower.includes('barn') || 
          prodDescLower.includes('barne') || 
          prodDescLower.includes('baby') || 
          prodDescLower.includes('body') || 
          prodSubcats.some(s => s.includes('barn') || s.includes('ungdom') || s.includes('kids') || s.includes('baby'));
        
        if (hasKidsTag) {
          score += 35; // Massive boost for child products
        }
      }

      if (isWomenQuery) {
        const hasWomenTag =
          prod.gender === 'Dame' ||
          prod.category?.toLowerCase().includes('dame') ||
          prodNameLower.includes('dame') ||
          prodSubcats.some(s => s.includes('dame') || s.includes('women'));
        
        if (hasWomenTag) {
          score += 25;
        }
      }

      if (isMenQuery) {
        const hasMenTag =
          prod.gender === 'Herre' ||
          prod.category?.toLowerCase().includes('herre') ||
          prodNameLower.includes('herre') ||
          prodSubcats.some(s => s.includes('herre') || s.includes('men'));
        
        if (hasMenTag) {
          score += 25;
        }
      }

      // Word matching
      words.forEach(word => {
        if (prodNameLower === word) {
          score += 15;
        } else if (prodNameLower.includes(word)) {
          score += 8;
        }
        
        if (prodCatLower.includes(word)) {
          score += 6;
        }
        
        prodSubcats.forEach(sub => {
          if (sub.includes(word)) {
            score += 4;
          }
        });

        if (prodDescLower.includes(word)) {
          score += 2;
        }
      });

      if (score > 0) {
        matches.push({ product: prod, score });
      }
    });

    if (matches.length === 0 && isAskingAboutProducts) {
      let fallbackProducts = [];
      if (isSaleQuery) {
        fallbackProducts = products.filter(p => p.isSale);
      } else if (isBestsellerQuery) {
        fallbackProducts = products.filter(p => p.isBestseller);
      } else {
        fallbackProducts = products.filter(p => p.isBestseller || p.isSale);
      }

      if (fallbackProducts.length === 0) {
        fallbackProducts = products.slice(0, 3);
      }

      fallbackProducts.forEach(prod => {
        matches.push({ product: prod, score: 5 });
      });
    }

    matches.sort((a, b) => b.score - a.score);

    const uniqueMatches = [];
    const seenIds = new Set();
    matches.forEach(m => {
      if (!seenIds.has(m.product.id)) {
        seenIds.add(m.product.id);
        uniqueMatches.push(m.product);
      }
    });

    return uniqueMatches.slice(0, 3);
  };

  const generateAiResponseText = (text, lang = language) => {
    let reply = '';
    const lower = text.toLowerCase().trim();

    // Check for unavailable product types requested
    const unavailableTypes = [
      { keys: ['caps', 'hatter', 'capsen', 'capser'], label: { no: 'caps', en: 'caps', es: 'gorras' } },
      { keys: ['lue', 'luen', 'luer', 'beanie'], label: { no: 'luer', en: 'beanies', es: 'gorros' } },
      { keys: ['bukse', 'bukser', 'tights', 'pant'], label: { no: 'bukser', en: 'pants', es: 'pantalones' } },
      { keys: ['sokker', 'sokk', 'socks'], label: { no: 'sokker', en: 'socks', es: 'calcetines' } },
      { keys: ['jakke', 'jakker', 'kåpe', 'jacket'], label: { no: 'jakker', en: 'jackets', es: 'chaquetas' } },
      { keys: ['deksel', 'mobildeksel', 'telefondeksel', 'phonecase'], label: { no: 'mobildeksel', en: 'phone cases', es: 'fundas de móvil' } },
      { keys: ['smykker', 'smykke', 'halskjede', 'ring', 'jewelry'], label: { no: 'smykker', en: 'jewelry', es: 'joyas' } }
    ];

    const matchedUnavailable = unavailableTypes.find(t => t.keys.some(k => lower.includes(k)));
    let hasProduct = false;
    if (matchedUnavailable) {
      hasProduct = products.some(p => {
        const nameLower = p.name.toLowerCase();
        return matchedUnavailable.keys.some(k => nameLower.includes(k));
      });
    }

    // 1. Prioritize specific customer service topics to prevent false matches on helper words
    if (lower.includes('retur') || lower.includes('bytte') || lower.includes('angre') || lower.includes('angrerett') || lower.includes('fortre')) {
      reply = '### 🔄 Enkel Retur & Bytte\n\n' +
        'Hei! Det er helt i orden å ombestemme seg eller bytte størrelse. Du har **14 dagers angrerett** fra du mottar varen.\n' +
        'Produktet må være ubrukt, i original stand og i originalemballasjen. Du må selv dekke returportoen med mindre annet er avtalt.\n' +
        'Send oss en melding her eller på e-post med ordrenummeret ditt, så sender vi deg instruksjoner for retur. 🔄';
    } 
    else if (lower.includes('rabattkode') || lower.includes('rabatt') || lower.includes('kampanje') || lower.includes('koden virker ikke') || lower.includes('feil kode')) {
      reply = '### 🎟️ Problemer med rabattkode\n\n' +
        'Hei! Beklager at rabattkoden ikke fungerer som den skal. Vennligst dobbeltsjekk at den er stavet riktig, og at den ikke har utløpt.\n' +
        'Merk at rabattkoder ofte ikke gjelder på allerede nedsatte varer. Hvis det fortsatt ikke fungerer, send koden til meg her, så skal jeg sjekke den for deg med en gang! 🎟️';
    }
    else if (lower.includes('frakt') || lower.includes('levering') || lower.includes('sende')) {
      reply = '### 🚚 Leveringstid & Frakt\n\n' +
        'Hei! Vi pakker og sender bestillinger fortløpende. Siden produktene våre produseres på bestilling (print-on-demand), er normal total leveringstid ca. **2 uker** (produksjonstid 1-2 uker pluss frakt).\n' +
        'Du vil motta en bekreftelse på e-post med sporingsinfo så snart pakken din er på vei! 📦\n\n' +
        '**Vektbaserte fraktsatser i Norge:**\n' +
        '- Opptil 0.07 kg: **39 kr**\n' +
        '- 0.07 - 0.35 kg: **69 kr**\n' +
        '- 0.35 - 1.75 kg: **99 kr**\n' +
        '- 1.75 - 4.0 kg: **149 kr**\n' +
        '- Over 4.0 kg: **199 kr**\n\n' +
        '**Frakt til utlandet:**\n' +
        'Vi sender til hele verden! Europa fra 79 kr, USA og resten av verden fra 99 kr (vektbasert).';
    } 
    else if (lower.includes('størrelse') || lower.includes('size') || lower.includes('passform')) {
      reply = '### 📏 Størrelsesguide\n\n' +
        'Hei! Generelt er klærne våre normale i størrelsen (standard passform), men hvis du ønsker en mer "oversized" eller løs stil, anbefaler vi å gå opp én størrelse.\n' +
        'Du finner en detaljert størrelsesguide under produktbeskrivelsen på hver enkelt vare.';
    } 
    else if (lower.includes('plakat') || lower.includes('poster') || lower.includes('bilde') || lower.includes('digital fil') || lower.includes('pdf')) {
      reply = '### 🖼️ Plakater og digitale filer\n\n' +
        'Hei! Våre fysiske plakater trykkes i høy kvalitet på matt papir som gir et moderne og minimalistisk uttrykk.\n' +
        'Vi tilbyr også enkelte digitale filer under kategorien "Digital Fil" – disse kan du kjøpe, laste ned og printe ut selv med en gang! 🖨️';
    }
    else if (lower.includes('budskap') || lower.includes('motiv') || lower.includes('visjon') || lower.includes('verdi') || lower.includes('kristen') || lower.includes('trosdesign')) {
      reply = '### ✨ Om produktene og budskapet\n\n' +
        'Så hyggelig at du ser på produktene våre! Alle våre klær, plakater og klistremerker er designet med kristne motiver og tekster for å formidle tro og oppmuntre til gode samtaler. Er det et spesifikt produkt eller design du lurer på?';
    }
    else if (lower.includes('materiale') || lower.includes('bomull') || lower.includes('kvalitet')) {
      reply = '### 🌿 Materialer & Kvalitet\n\n' +
        '- Våre klær er laget av **100% bomull eller en behagelig blanding av bomull og polyester**.\n' +
        '- Dette gir en utrolig myk følelse mot huden, god pusteevne og lang holdbarhet.\n' +
        '- Trykkene våre er vannbaserte og holdbare, slik at de holder formen vask etter vask uten å sprekke.\n\n' +
        '💡 Vi anbefaler å vaske plaggene på **30 grader med innsiden ut (vrangen ut)** for å bevare trykket best mulig.';
    } 
    else if ((lower.includes('klistremerke') || lower.includes('sticker')) && (lower.includes('kvalitet') || lower.includes('vannfast') || lower.includes('tåler') || lower.includes('drikkeflaske'))) {
      reply = '### 💦 Kvalitet på klistremerker\n\n' +
        'Hei! Våre håndlagde klistremerker er laget av slitesterk vinyl av høy kvalitet. De tåler fint daglig bruk på for eksempel matbokser, drikkeflasker, PC-en eller i bibelen.\n' +
        'Vi anbefaler likevel håndvask av drikkeflasker med klistremerker for maksimal levetid! 💦';
    }
    else if (lower.includes('sende som gave') || lower.includes('sende direkte') || lower.includes('gave til mottaker') || (lower.includes('gave') && lower.includes('leveringsadresse'))) {
      reply = '### 🎁 Sende som gave direkte til mottaker\n\n' +
        'Hei! Så koselig at du vil gi en gave! Du kan fint bestille og få pakken sendt direkte til mottakeren. Da legger du bare inn din egen adresse under "Fakturaadresse", og mottakerens adresse under "Leveringsadresse" i kassen.\n' +
        'Vi legger selvfølgelig ikke ved kvittering med pris i pakken når det sendes som gave. 🎁';
    }
    else if (lower.includes('personlig hilsen') || lower.includes('håndskrevet hilsen') || lower.includes('hilsen i pakken') || lower.includes('legge ved hilsen')) {
      reply = '### ✍️ Personlig hilsen i pakken\n\n' +
        'Hei! Vi legger gjerne ved en liten, håndskrevet hilsen i pakken om du ønsker det. Skriv teksten du vil ha med i kommentarfeltet i kassen (eller send den til oss her sammen med ordrenummeret ditt rett etter bestilling), så fikser vi det! ✍️';
    }
    else if (lower.includes('betaling') || lower.includes('vipps') || lower.includes('kort') || lower.includes('visa') || lower.includes('betalingsmetoder') || lower.includes('apple pay') || lower.includes('klarna')) {
      reply = '### 💳 Sikker Betaling\n\n' +
        'Hei! I nettbutikken vår kan du betale trygt og enkelt med **Vipps** eller **betalingskort** (Visa og Mastercard via kryptert betalingsløsning). Du velger ganske enkelt den metoden som passer best for deg når du kommer til kassen. 💳\n\n' +
        '💡 Vi er fritatt for MVA da His Kingdom Designs drives av en frivillig organisasjon.';
    }
    else if (lower.includes('kontakt') || lower.includes('kundeservice') || lower.includes('e-post') || lower.includes('adresse') || lower.includes('telefon')) {
      reply = '### 📞 Kontakt Kundeservice\n\n' +
        'Vi vil gjerne høre fra deg! Du kan kontakte oss på:\n' +
        '- **E-post:** post@hiskingdomministry.no\n' +
        '- **Adresse:** Augerødlia 48, 1591 Sperrebotn\n\n' +
        '💡 Vi svarer vanligvis innen 24 timer på virkedager.';
    }
    else if (lower.includes('samarbeid') || lower.includes('russ') || lower.includes('menighet') || lower.includes('skole') || lower.includes('leir') || lower.includes('spesialbestill') || lower.includes('kvantumsrabatt') || lower.includes('gruppe')) {
      reply = '### 🤝 Spesialbestillinger / Gruppebestillinger\n\n' +
        'Hei! Så spennende! Vi gjør gjerne spesialavtaler eller gruppebestillinger til russegrupper, bibelskoler, menigheter eller andre arrangementer.\n' +
        'Fortell oss litt om hva dere ønsker (antall, produkttype og designønsker), så setter vi opp et uforpliktende tilbud til dere! 🤝';
    }
    else if (lower.includes('hvem er dere') || lower.includes('om oss') || lower.includes('organisasjon') || lower.includes('formål') || lower.includes('misjon') || lower.includes('overskudd') || lower.includes('pengene til') || lower.includes('støtte')) {
      reply = '### 🛡️ Om His Kingdom Designs\n\n' +
        '- Vårt formål er å spre Guds ord gjennom vakker og moderne design som oppmuntrer i hverdagen og starter gode samtaler.\n' +
        '- His Kingdom Designs drives på frivillig basis av organisasjonen **His Kingdom Ministry**.\n' +
        '- Alt overskudd fra salget går direkte til å **støtte misjonsarbeid og drift av organisasjonen**.\n\n' +
        '💡 Ved å handle hos oss er du med på å utgjøre en forskjell!';
    }
    else if (lower.includes('gavekort') || lower.includes('giftcard') || lower.includes('gift card') || lower.includes('presang')) {
      reply = '### 🎁 Gavekort\n\n' +
        '- Vi tilbyr **digitale gavekort** som er den perfekte gaven til konfirmasjon, bursdager eller som en oppmuntring!\n' +
        '- Gavekortet sendes raskt og enkelt direkte til e-postadressen din etter kjøp.\n\n' +
        '💡 Du finner gavekortene våre under kategorien **Tilbehør** i nettbutikken, eller du kan søke direkte på "gavekort" i søkefeltet.';
    }
    else if (lower.includes('skadet') || lower.includes('ødelagt') || lower.includes('feilvare') || lower.includes('reklamasjon') || lower.includes('hull') || lower.includes('feil trykk') || lower.includes('reklamere')) {
      reply = '### ⚠️ Reklamasjon & Feil på varen\n\n' +
        'Hei! Uff, det var kjempetrist å høre. Slik skal det absolutt ikke være, og vi vil ordne opp med en gang! Kunne du sendt oss et bilde av skaden og oppgitt ordrenummeret ditt her (eller til vår e-post **post@hiskingdomministry.no**)? Da sender vi deg et nytt produkt uten ekstra kostnad. 🤍';
    }
    else if (lower.includes('manger en vare') || lower.includes('mangler vare') || lower.includes('feil vare sendt') || lower.includes('feil produkt') || lower.includes('feil pakking') || lower.includes('mangel')) {
      reply = '### 📦 Mangler en vare i pakken / feil vare sendt\n\n' +
        'Hei! Beklager så mye for at det har skjedd en feil under pakkingen hos oss. Vennligst oppgi ordrenummeret ditt og fortell hvilken vare som manglet/ble feil, så ettersender vi riktig vare til deg med en gang! 📦';
    }
    else if (lower.includes('hente') || lower.includes('hente selv') || lower.includes('sperrebotn') || lower.includes('lyngdal') || lower.includes('henteadresse') || lower.includes('fysisk butikk') || lower.includes('butikk')) {
      reply = '### 📍 Hente selv / Fysisk butikk\n\n' +
        '- Vi har dessverre **ikke mulighet for at du kan hente varene selv** på vår adresse i Sperrebotn, og vi har heller ikke en fysisk butikk.\n' +
        '- Alle bestillinger produseres på bestilling og sendes direkte hjem til deg eller til ditt nærmeste hentested med Posten.\n\n' +
        '💡 Frakten beregnes automatisk i kassen basert på vekt (fra kun 39 kr).';
    }
    else if (lower.includes('avbestille') || lower.includes('kansellere') || lower.includes('endre ordre') || lower.includes('stoppe') || lower.includes('endre bestilling')) {
      reply = '### ⏱️ Endring av bestilling\n\n' +
        'Hei! Hvis du akkurat har lagt inn en bestilling og ønsker å endre eller avbestille den, må du svare på ordrebekreftelsen din eller skrive ordrenummeret ditt her med en gang.\n' +
        'Hvis pakken ikke er pakket eller sendt ennå, fikser vi det gjerne for deg!';
    }
    else if (lower.includes('vaske') || lower.includes('krympe') || lower.includes('tørketrommel') || lower.includes('stryke') || lower.includes('vaskeråd')) {
      reply = '### 🧼 Vask & Bevaring av trykket\n\n' +
        'Hei! For at trykket og passformen på klærne skal holde seg penest mulig over tid, anbefaler vi å vaske plaggene på 30 grader med innsiden ut. Unngå tørketrommel og ikke stryk direkte på selve trykket. 👕✨';
    }
    else if (lower.includes('takk for hjelpen') || lower.includes('ha en fin dag') || lower.includes('ha en velsignet dag') || lower.includes('velsignet dag') || lower.includes('takk skal du ha')) {
      reply = 'Da sier vi det! Da håper jeg du blir kjempefornøyd med produktene. Bare ta kontakt igjen om det skulle være noe mer senere. Ønsker deg en kjempefin og velsignet dag videre! 🌟';
    }
    else if (matchedUnavailable && !hasProduct) {
      const isKids = 
        lower.includes('barn') || 
        lower.includes('barne') || 
        lower.includes('kids') || 
        lower.includes('baby') || 
        lower.includes('gutt') || 
        lower.includes('jente') || 
        lower.includes('junior') || 
        lower.includes('åring') || 
        /\b\d+\s*år\b/.test(lower);

      const typeLabel = matchedUnavailable.label[lang] || matchedUnavailable.label['no'];

      if (isKids) {
        // Find alternative kids products
        const kidProducts = products.filter(prod => {
          const prodNameLower = prod.name.toLowerCase();
          const prodDescLower = prod.description?.toLowerCase() || '';
          const prodSubcats = prod.subcategories?.map(s => s.toLowerCase()) || [];
          return prod.gender === 'Barn' || 
                 prod.category?.toLowerCase().includes('barn') || 
                 prodNameLower.includes('barn') || 
                 prodNameLower.includes('barne') || 
                 prodNameLower.includes('baby') || 
                 prodDescLower.includes('barn') || 
                 prodDescLower.includes('barne') || 
                 prodSubcats.some(s => s.includes('barn') || s.includes('kids') || s.includes('baby'));
        }).slice(0, 3);

        if (lang === 'en') {
          let altText = '';
          if (kidProducts.length > 0) {
            altText = `However, we have other great products for children that you can check out here:\n\n` +
              kidProducts.map((p, i) => `${i + 1}. **[${p.name}](/product/${p.id})** – **${p.price} NOK**`).join('\n') + '\n\n';
          }
          reply = `### 🧢 ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} for kids\n\n` +
            `Unfortunately, we do not have **${typeLabel}** for children in our standard collection at the moment.\n\n` +
            altText +
            `💡 **Custom order?** If you would like a ${typeLabel.slice(0, -1) || typeLabel} (or another product) with one of our unique faith designs, please feel free to contact us by **[email](mailto:post@hiskingdomministry.no)**! We can often make customizations and print special orders upon request.`;
        } else if (lang === 'es') {
          let altText = '';
          if (kidProducts.length > 0) {
            altText = `Sin embargo, tenemos otros excelentes productos para niños que puedes ver aquí:\n\n` +
              kidProducts.map((p, i) => `${i + 1}. **[${p.name}](/product/${p.id})** – **${p.price} NOK**`).join('\n') + '\n\n';
          }
          reply = `### 🧢 ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} para niños\n\n` +
            `Lamentablemente, no tenemos **${typeLabel}** para niños en nuestra colección estándar en este momento.\n\n` +
            altText +
            `💡 **¿Pedido personalizado?** Si deseas una ${typeLabel.slice(0, -1) || typeLabel} (u otro producto) con uno de nuestros diseños de fe únicos, ¡no dudes en contactarnos por **[correo electrónico](mailto:post@hiskingdomministry.no)**! A menudo podemos realizar personalizaciones e imprimir pedidos especiales bajo petición.`;
        } else { // 'no' / default
          let altText = '';
          if (kidProducts.length > 0) {
            altText = `Men vi har andre flotte og populære produkter til barn som du kan sjekke ut her:\n\n` +
              kidProducts.map((p, i) => `${i + 1}. **[${p.name}](/product/${p.id})** – **${p.price} kr**`).join('\n') + '\n\n';
          }
          reply = `### 🧢 ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} til barn\n\n` +
            `Vi har dessverre ikke **${typeLabel}** for barn i vårt faste sortiment akkurat nå.\n\n` +
            altText +
            `💡 **Spesialbestilling?** Dersom du ønsker en ${typeLabel.slice(0, -1) || typeLabel} (eller et annet produkt) med et av våre unike trosdesign, må du gjerne kontakte oss på **[e-post](mailto:post@hiskingdomministry.no)**! Vi kan ofte gjøre tilpasninger og trykke spesielle bestillinger på forespørsel.`;
        }
      } else {
        // General alternative products (bestsellers)
        const bestsellers = products.filter(p => p.isBestseller).slice(0, 3);

        if (lang === 'en') {
          let altText = '';
          if (bestsellers.length > 0) {
            altText = `However, we have other great bestseller products that you can check out here:\n\n` +
              bestsellers.map((p, i) => `${i + 1}. **[${p.name}](/product/${p.id})** – **${p.price} NOK**`).join('\n') + '\n\n';
          }
          reply = `### 🛍️ ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}\n\n` +
            `Unfortunately, we do not have **${typeLabel}** in our standard collection at the moment.\n\n` +
            altText +
            `💡 **Custom order?** If you would like a ${typeLabel.slice(0, -1) || typeLabel} (or another product) with one of our unique faith designs, please feel free to contact us by **[email](mailto:post@hiskingdomministry.no)**! We can often make customizations and print special orders upon request.`;
        } else if (lang === 'es') {
          let altText = '';
          if (bestsellers.length > 0) {
            altText = `Sin embargo, tenemos otros excelentes productos más vendidos que puedes ver aquí:\n\n` +
              bestsellers.map((p, i) => `${i + 1}. **[${p.name}](/product/${p.id})** – **${p.price} NOK**`).join('\n') + '\n\n';
          }
          reply = `### 🛍️ ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}\n\n` +
            `Lamentablemente, no tenemos **${typeLabel}** en nuestra colección estándar en este momento.\n\n` +
            altText +
            `💡 **¿Pedido personalizado?** Si deseas una ${typeLabel.slice(0, -1) || typeLabel} (u otro producto) con uno de nuestros diseños de fe únicos, ¡no dudes en contactarnos por **[correo electrónico](mailto:post@hiskingdomministry.no)**! A menudo podemos realizar personalizaciones e imprimir pedidos especiales bajo petición.`;
        } else { // 'no' / default
          let altText = '';
          if (bestsellers.length > 0) {
            altText = `Men vi har mange andre flotte bestselgere som du kan sjekke ut her:\n\n` +
              bestsellers.map((p, i) => `${i + 1}. **[${p.name}](/product/${p.id})** – **${p.price} kr**`).join('\n') + '\n\n';
          }
          reply = `### 🛍️ ${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)}\n\n` +
            `Vi har dessverre ikke **${typeLabel}** i vårt faste sortiment akkurat nå.\n\n` +
            altText +
            `💡 **Spesialbestilling?** Dersom du ønsker en ${typeLabel.slice(0, -1) || typeLabel} med et av våre unike trosdesign, må du gjerne kontakte oss på **[e-post](mailto:post@hiskingdomministry.no)**! Vi kan ofte gjøre tilpasninger og trykke spesielle bestillinger på forespørsel.`;
        }
      }
    }
    else {
      // 2. Otherwise, check for product recommendations or category pages
      const recommendations = getProductRecommendations(text);

      if (recommendations && recommendations.length > 0) {
        let titleText = '### 🛍️ Her er produkter jeg fant basert på ditt søk:';
        
        const isAllAgesQuery = 
          lower.includes('for alle') || 
          lower.includes('alle aldre') || 
          lower.includes('hele familien') || 
          (lower.includes('alle') && (lower.includes('aldre') || lower.includes('anbefal') || lower.includes('produkt') || lower.includes('kategori') || lower.includes('alder')));

        if (isAllAgesQuery) {
          titleText = '### 👨‍👩‍👧‍👦 Her er våre anbefalinger for hele familien og alle aldre:';
        } else if (lower.includes('salg') || lower.includes('tilbud') || lower.includes('rabatt') || lower.includes('billig') || lower.includes('nedsatt')) {
          titleText = '### 🏷️ Her er våre produkter på tilbud akkurat nå:';
        } else if (lower.includes('bestselger') || lower.includes('populær') || lower.includes('topp')) {
          titleText = '### 🌟 Her er våre mest populære bestselgere:';
        } else if (lower.includes('anbefal') || lower.includes('anbefaling') || lower.includes('tips')) {
          titleText = '### ✨ Her er mine anbefalinger til deg:';
        }

        const itemsText = recommendations.map((prod, idx) => {
          const priceStr = prod.originalPrice 
            ? `**${prod.price} kr** *(Salg! før ${prod.originalPrice} kr)*` 
            : `**${prod.price} kr**`;
          
          const badge = prod.isBestseller ? ' ⭐ *Bestselger!*' : '';
          
          return `${idx + 1}. **[${prod.name}](/product/${prod.id})** – ${priceStr}${badge}\n   *${prod.description ? prod.description.replace(/<[^>]*>/g, '').substring(0, 110) + '...' : prod.category}*`;
        }).join('\n\n');

        reply = `${titleText}\n\n${itemsText}\n\n💡 Klikk på produktlenkene over for å se produktdetaljene, velge farger/størrelser og legge dem i handlekurven!`;

        // If they also asked about shipping/return, append a helpful tip
        if (lower.includes('frakt') || lower.includes('levering') || lower.includes('porto')) {
          reply += '\n\n**PS:** Frakten beregnes ut fra vekt (fra 39 kr).';
        } else if (lower.includes('retur') || lower.includes('bytte')) {
          reply += '\n\n**PS:** Vi tilbyr **14 dagers angrerett** og enkel retur/bytte.';
        }
      }
      else if (lower.includes('hva handler') || lower.includes('hvor er jeg') || lower.includes('forklar')) {
        reply = `### 🧭 Sideoversikt: ${assistantContext.title}\n\n` +
          `Du er for øyeblikket på siden **${assistantContext.title}**.\n\n` +
          `Her kan du utforske vårt utvalg av kristne kvalitetsprodukter som er designet for å inspirere og spre Guds ord. Spør meg gjerne hvis du trenger hjelp med å finne noe her!`;
      }
      else {
        reply = '### 🛡️ His Kingdom Designs\n\n' +
          'Vi ønsker å spre Guds ord gjennom vakker og moderne design. Alle produktene våre er laget for å starte gode samtaler og gi oppmuntring i hverdagen.\n\n' +
          'Du kan spørre meg om:\n' +
          '• Våre **produkter** (Klær, Plakater, Klistermerker, Tilbehør)\n' +
          '• **Frakt** og leveringstider\n' +
          '• **Bytte og retur** av varer\n' +
          '• **Størrelser** og passform\n\n' +
          'Hva kan jeg hjelpe deg med?';
      }
    }
    return reply;
  };

  const sendAssistantMessage = (text) => {
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
    };

    setAssistantMessages(prev => [...prev, userMsg]);
    setIsAssistantTyping(true);

    // Dynamic, simulated context-aware response from HKD Assistant
    setTimeout(() => {
      try {
        const reply = generateAiResponseText(text);
        setAssistantMessages(prev => [...prev, {
          id: `msg-ast-${Date.now()}`,
          sender: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
        }]);
      } catch (err) {
        console.error('Error in HKD Assistant reply generator:', err);
        setAssistantMessages(prev => [...prev, {
          id: `msg-ast-${Date.now()}`,
          sender: 'assistant',
          text: 'Beklager, det oppstod en feil under generering av svar. Vennligst prøv igjen, eller bytt til Kundeservice (Live) i fanen over for å kontakte oss direkte.',
          time: new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
        }]);
      } finally {
        setIsAssistantTyping(false);
      }
    }, 1000);
  };

  const getSlugByCategoryName = (name) => {
    if (!name) return '';
    if (name === 'Salg') return 'salg';
    const found = wixCollections.find(c => c.name === name);
    if (found && found.slug) return found.slug;
    
    // Fallback mapping for standard categories and SEO landing pages
    const staticMap = {
      'Kristne klær': 'kristne-klaer',
      'Kristne T-skjorter': 'kristne-t-skjorter',
      'Kristne gensere': 'kristne-gensere',
      'Kristen streetwear': 'kristen-streetwear',
      'Klær med bibelvers': 'klaer-med-bibelvers',
      'Hatter /caps': 'caps',
      'Hatter/caps': 'caps',
      'Hats/Caps': 'caps',
      'Hats/caps': 'caps',
      'caps': 'caps',
      'Handlenett / Totebag': 'totebag',
      'Handlenett/Totebag': 'totebag',
      'Tote Bag': 'totebag',
      'Tote bag': 'totebag',
      'totebag': 'totebag',
      'armbånd og smykker': 'smykker',
      'Kopper og flasker': 'cups-bottles',
      'Bilder og plakater': 'bilder-og-plakater',
      'Klær': 'kristne-klaer',
      'Dameklær': 'dameklær',
      'Genser': 'kristne-gensere',
      'Joggebukser': 'bukser',
      'T-shirts': 'kristne-t-skjorter',
      'Sport / Performance /Outdoor': 'sport-performance-outdoor',
      'RUSS': 'russ',
      'BABY': 'babyklær',
      'BARN & UNGDOM': 'barneklær',
      'Barnerom': 'barnerom',
      'Varna - Evangeliesenteret Bibelskole': 'evangeliesenteret-bibelskole-varna',
      'Varne evangliesenter - Bible school': 'evangeliesenteret-bibelskole-varna'
    };
    if (staticMap[name]) return staticMap[name];
    
    return name.toLowerCase()
      .replace(/\//g, '-')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9øæå-]/g, '')
      .replace(/-+/g, '-');
  };

  const getCategoryNameBySlug = (slug) => {
    if (!slug) return '';
    if (slug === 'salg') return 'Salg';
    
    // Dedicated SEO landing pages
    if (slug === 'kristne-klaer' || slug === 'klaer' || slug === 'klær' || slug === 'kler') return 'Kristne klær';
    if (slug === 'kristne-t-skjorter' || slug === 't-skjorter' || slug === 't-shirts') return 'Kristne T-skjorter';
    if (slug === 'kristne-gensere' || slug === 'gensere' || slug === 'genser' || slug === 'hettegensere') return 'Kristne gensere';
    if (slug === 'kristen-streetwear' || slug === 'streetwear') return 'Kristen streetwear';
    if (slug === 'klaer-med-bibelvers' || slug === 'bibelvers-klaer' || slug === 'bibelvers') return 'Klær med bibelvers';

    const found = wixCollections.find(c => c.slug === slug);
    if (found && found.name) return found.name;
    
    // Fallback mapping for standard categories
    const staticMap = {
      'caps': 'Hatter /caps',
      'totebag': 'Handlenett / Totebag',
      'smykker': 'armbånd og smykker',
      'cups-bottles': 'Kopper og flasker',
      'bilder-og-plakater': 'Bilder og plakater',
      'kristne-klaer': 'Kristne klær',
      'klær': 'Kristne klær',
      'dameklær': 'Dameklær',
      'kristne-gensere': 'Kristne gensere',
      'genser': 'Kristne gensere',
      'bukser': 'Joggebukser',
      'kristne-t-skjorter': 'Kristne T-skjorter',
      't-shirts': 'Kristne T-skjorter',
      'kristen-streetwear': 'Kristen streetwear',
      'klaer-med-bibelvers': 'Klær med bibelvers',
      'sport-performance-outdoor': 'Sport / Performance /Outdoor',
      'russ': 'RUSS',
      'babyklær': 'BABY',
      'barneklær': 'BARN & UNGDOM',
      'barnerom': 'Barnerom',
      'evangeliesenteret-bibelskole-varna': 'Varna - Evangeliesenteret Bibelskole'
    };
    
    for (const [keyName, valSlug] of Object.entries(staticMap)) {
      if (valSlug === slug) return keyName;
    }
    
    return slug;
  };

  return (
    <AppContext.Provider value={{
      products,
      isLoadingProducts,
      wixCollections,
      categoryTaxonomy,
      mobileMenuOpen,
      setMobileMenuOpen,
      searchOpen,
      setSearchOpen,
      searchQuery,
      setSearchQuery,
      assistantMessages,
      isAssistantTyping,
      assistantContext,
      setAssistantContext,
      sendAssistantMessage,
      generateAiResponseText,
      isAdminEditing,
      setIsAdminEditing,
      cmsContent,
      updateCmsContent,
      toastMessage,
      showToast,
      wishlist,
      toggleWishlist,
      isInWishlist,
      getSlugByCategoryName,
      getCategoryNameBySlug,
      member,
      isLoggedIn,
      // Build version v1.0.2 - Force rebuild and CDN cache flush
      buildVersion: '1.0.2'
    }}>
      {children}
    </AppContext.Provider>
  );
};

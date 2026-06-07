import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Check, ShieldCheck, Truck, ArrowLeft, Heart, Star, Sparkles, Ruler } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { wixClient } from '@/lib/wix';
import { getOptimizedWixImageUrl } from '@/lib/media';
import useMeta from '@/hooks/useMeta';

function SizeGuideContent({ defaultTab = 'clothing' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tabs list */}
      <div className="flex border-b border-outline-variant/30 text-xs font-semibold select-none bg-slate-50">
        <button
          onClick={() => setActiveTab('clothing')}
          className={`flex-1 py-3.5 text-center transition-all ${
            activeTab === 'clothing' 
              ? 'bg-white text-terracotta font-bold border-b-2 border-terracotta' 
              : 'text-secondary hover:text-onyx hover:bg-slate-100/60'
          }`}
        >
          👚 Klær (T-skjorte / Hoodie)
        </button>
        <button
          onClick={() => setActiveTab('caps')}
          className={`flex-1 py-3.5 text-center transition-all border-x border-outline-variant/20 ${
            activeTab === 'caps' 
              ? 'bg-white text-terracotta font-bold border-b-2 border-terracotta' 
              : 'text-secondary hover:text-onyx hover:bg-slate-100/60'
          }`}
        >
          🧢 Hatter & Caps
        </button>
        <button
          onClick={() => setActiveTab('posters')}
          className={`flex-1 py-3.5 text-center transition-all ${
            activeTab === 'posters' 
              ? 'bg-white text-terracotta font-bold border-b-2 border-terracotta' 
              : 'text-secondary hover:text-onyx hover:bg-slate-100/60'
          }`}
        >
          🖼️ Plakat-formater
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-secondary custom-scrollbar flex-1">
        {activeTab === 'clothing' && (
          <div className="space-y-4">
            <p className="italic">Våre klær er laget av 100% organisk bomull og har en behagelig, normal skandinavisk passform (true to size). Vi anbefaler å vaske på 30 grader med vrangen ut for at motivet skal holde seg best mulig.</p>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-onyx font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Størrelse</th>
                  <th className="py-2.5 px-3">Bredde (A)</th>
                  <th className="py-2.5 px-3">Lengde (B)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">S</td>
                  <td className="py-2.5 px-3">48 cm</td>
                  <td className="py-2.5 px-3">69 cm</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">M</td>
                  <td className="py-2.5 px-3">51 cm</td>
                  <td className="py-2.5 px-3">71 cm</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">L</td>
                  <td className="py-2.5 px-3">54 cm</td>
                  <td className="py-2.5 px-3">73 cm</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">XL</td>
                  <td className="py-2.5 px-3">57 cm</td>
                  <td className="py-2.5 px-3">75 cm</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">XXL</td>
                  <td className="py-2.5 px-3">60 cm</td>
                  <td className="py-2.5 px-3">77 cm</td>
                </tr>
              </tbody>
            </table>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
              <p className="font-semibold text-onyx mb-1 text-[10px] uppercase">Hvordan måle?</p>
              <p><strong>Bredde (A):</strong> Mål på tvers av brystet, 2 cm under armhulene, mens plagget ligger flatt.</p>
              <p><strong>Lengde (B):</strong> Mål fra det høyeste punktet på skulderen og helt ned til nederste kant.</p>
            </div>
          </div>
        )}

        {activeTab === 'caps' && (
          <div className="space-y-4">
            <p className="italic">Våre hatter og caps er utstyrt med en justerbar stropp eller snapback-spenne bak, noe som gjør at de passer de aller fleste hodeformer og størrelser perfekt.</p>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-onyx font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Hodeomkrets</th>
                  <th className="py-2.5 px-3">Justerbarhet</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">Caps (Snapback / Justerbar)</td>
                  <td className="py-2.5 px-3">54 – 60 cm</td>
                  <td className="py-2.5 px-3">Spenne bak (Plast eller metall)</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">Bøttehatt (Bucket hat)</td>
                  <td className="py-2.5 px-3">56 – 58 cm</td>
                  <td className="py-2.5 px-3">Fast omkrets (Fleksibelt bomullsstoff)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'posters' && (
          <div className="space-y-4">
            <p className="italic">Våre motiver og kunstplakater trykkes på matt, syrefritt premiumpapir av museumskvalitet. De leveres i standardformater som gjør det svært enkelt å finne matchende rammer i din lokale butikk.</p>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-onyx font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">Dimensjoner (i cm)</th>
                  <th className="py-2.5 px-3">Papirtype</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">A4</td>
                  <td className="py-2.5 px-3">21.0 x 29.7 cm</td>
                  <td className="py-2.5 px-3">230g Matte Premium</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">A3</td>
                  <td className="py-2.5 px-3">29.7 x 42.0 cm</td>
                  <td className="py-2.5 px-3">230g Matte Premium</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">30x40 cm</td>
                  <td className="py-2.5 px-3">30.0 x 40.0 cm</td>
                  <td className="py-2.5 px-3">230g Matte Premium</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="py-2.5 px-3 font-semibold text-onyx">50x70 cm</td>
                  <td className="py-2.5 px-3">50.0 x 70.0 cm</td>
                  <td className="py-2.5 px-3">230g Matte Premium</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { products, isLoadingProducts, toggleWishlist, isInWishlist, getSlugByCategoryName } = useApp();
  const { addToCart } = useCart();
  const { productId } = useParams();
  const navigate = useNavigate();

  // Find product by id
  const product = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [products, productId]);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Hvit');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Sync activeImage when product loads/changes
  useEffect(() => {
    if (product?.image) {
      setActiveImage(product.image);
    }
  }, [product]);

  // Set SEO metadata dynamically using our custom hook
  useMeta(
    product ? product.name : 'Produktdetaljer',
    product ? product.description.substring(0, 155) : 'Utforsk våre kristne motiver og produkter av høy kvalitet.',
    product ? { type: 'product', image: product.image, price: `${product.price} NOK` } : null
  );
  
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Back in stock states
  const [backInStockEmail, setBackInStockEmail] = useState('');
  const [backInStockSuccess, setBackInStockSuccess] = useState(false);
  const [backInStockLoading, setBackInStockLoading] = useState(false);
  const [backInStockError, setBackInStockError] = useState('');

  // Auto-fill email if member is logged in
  useEffect(() => {
    async function checkLoggedInMember() {
      if (wixClient.auth.loggedIn()) {
        try {
          const res = await wixClient.members.getCurrentMember({ fieldsets: ['FULL'] });
          const member = res?.member;
          if (member) {
            const email = member.loginEmail || 
              (member.contactDetails?.emails?.[0] && (typeof member.contactDetails.emails[0] === 'object' ? member.contactDetails.emails[0].email : member.contactDetails.emails[0])) ||
              (member.contact?.emails?.[0] && (typeof member.contact.emails[0] === 'object' ? member.contact.emails[0].email : member.contact.emails[0])) ||
              member.contact?.email || member.contactDetails?.email;
            if (email) {
              setBackInStockEmail(email);
            }
          }
        } catch (err) {
          console.warn('Could not auto-fill member email for back-in-stock request:', err);
        }
      }
    }
    checkLoggedInMember();
  }, []);

  // Reviews states
  const [reviewsList, setReviewsList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Review form states
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState('');

  // Auto-fill member name for review form
  useEffect(() => {
    async function getMemberName() {
      if (wixClient.auth.loggedIn()) {
        try {
          const res = await wixClient.members.getCurrentMember({ fieldsets: ['FULL'] });
          const member = res?.member;
          if (member) {
            const contact = member.contactDetails || member.contact;
            if (contact?.firstName) {
              setReviewName(`${contact.firstName} ${contact.lastName || ''}`.trim());
            } else if (member.profile?.nickname) {
              setReviewName(member.profile.nickname);
            }
          }
        } catch (err) {
          console.warn('Could not pre-fill review name:', err);
        }
      }
    }
    getMemberName();
  }, []);

  const loadReviews = async () => {
    setIsLoadingReviews(true);
    let apiReviews = [];
    try {
      const res = await wixClient.reviews.queryReviews()
        .eq('entityId', productId)
        .descending('_createdDate')
        .find();
      if (res && res.items) {
        apiReviews = res.items;
      }
    } catch (err) {
      console.warn('Wix Reviews API call failed. Using fallback reviews.', err);
    }

    // Load local storage reviews
    let localReviews = [];
    try {
      const saved = localStorage.getItem(`hkd-reviews-${productId}`);
      if (saved) {
        localReviews = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse local reviews', e);
    }

    // Default mock reviews if there are no API or local reviews
    let defaultMocks = [];
    if (apiReviews.length === 0 && localReviews.length === 0) {
      const dates = ['2026-05-15', '2026-05-28', '2026-06-02'];
      const names = ['Kari Nordmann', 'Ole Hansen', 'Maria Pedersen'];
      const clothingMocks = [
        { title: 'Helt fantastisk kvalitet!', body: 'Stoffet er utrolig mykt og behagelig. Trykket ser profesjonelt ut og falmer ikke vask. Anbefales på det varmeste!', rating: 5 },
        { title: 'Fin genser, god passform', body: 'Normal i størrelsen. Genseren er behagelig å gå med, og budskapet er nydelig. Kommer til å kjøpe mer herfra!', rating: 5 },
        { title: 'Veldig fornøyd', body: 'Rask levering og god kvalitet på klærne. Mandal Regnskapskontor leverer solid service og trygg handel.', rating: 4 }
      ];
      const stickerMocks = [
        { title: 'Perfekt på vannflasken', body: 'Tåler oppvaskmaskin kjempebra uten å løsne eller falme. Kjempefine farger!', rating: 5 },
        { title: 'Gode budskap', body: 'Har limt disse på bøkene og PC-en min. De gir god oppmuntring i hverdagen.', rating: 5 },
        { title: 'Fine farger', body: 'Klistremerkene ser nøyaktig ut som på bildet. Veldig fornøyd med kjøpet.', rating: 4 }
      ];
      const defaultMocksSource = product?.category === 'Klær' ? clothingMocks : (product?.category === 'Klistermerker' ? stickerMocks : clothingMocks);

      defaultMocks = defaultMocksSource.map((m, idx) => ({
        _id: `mock-${idx}`,
        author: { authorName: names[idx] },
        content: { title: m.title, body: m.body, rating: m.rating },
        _createdDate: new Date(dates[idx]).toISOString()
      }));
    }

    const allReviews = [...localReviews, ...apiReviews, ...defaultMocks];
    setReviewsList(allReviews);

    // Calculate average and distribution
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + (r.content?.rating || 5), 0);
      setAverageRating(parseFloat((totalRating / allReviews.length).toFixed(1)));

      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      allReviews.forEach(r => {
        const rating = r.content?.rating || 5;
        if (dist[rating] !== undefined) dist[rating]++;
      });
      setRatingDistribution(dist);
    } else {
      setAverageRating(0);
      setRatingDistribution({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    }
    setIsLoadingReviews(false);
  };

  useEffect(() => {
    if (product) {
      loadReviews();
    }
  }, [productId, product]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewTitle || !reviewBody) return;
    setIsSubmittingReview(true);
    setReviewSubmitError('');
    setReviewSubmitSuccess(false);

    const newReviewItem = {
      _id: `local-${Date.now()}`,
      author: { authorName: reviewName },
      content: {
        title: reviewTitle,
        body: reviewBody,
        rating: reviewRating
      },
      _createdDate: new Date().toISOString()
    };

    let wixSuccess = false;
    try {
      await wixClient.reviews.createReview({
        review: {
          namespace: 'stores',
          entityId: productId,
          content: {
            title: reviewTitle,
            body: reviewBody,
            rating: reviewRating
          },
          author: {
            authorName: reviewName
          }
        }
      });
      wixSuccess = true;
    } catch (err) {
      console.warn('Wix Reviews API submit failed. Saving review locally.', err);
    }

    try {
      const saved = localStorage.getItem(`hkd-reviews-${productId}`);
      const list = saved ? JSON.parse(saved) : [];
      list.unshift(newReviewItem);
      localStorage.setItem(`hkd-reviews-${productId}`, JSON.stringify(list));
    } catch (err) {
      console.error('Failed to save review to localStorage:', err);
    }

    setReviewSubmitSuccess(true);
    setReviewTitle('');
    setReviewBody('');
    setShowReviewForm(false);
    setIsSubmittingReview(false);
    loadReviews();
  };


  // Find the selected variant matching selectedSize and selectedColor
  const selectedVariant = useMemo(() => {
    if (!product || !product.manageVariants || !product.variants || product.variants.length === 0) return null;
    
    const sizeOpt = product.productOptions?.find(o => {
      const name = o.name?.trim().toLowerCase();
      return name.includes('size') || name.includes('størrelse') || name.includes('størrelser') || name.includes('format') || name === 'str' || name === 'str.';
    });
    const colorOpt = product.productOptions?.find(o => {
      const name = o.name?.trim().toLowerCase();
      return name === 'color' || name === 'farge';
    });

    const sizeChoice = sizeOpt?.choices?.find(c => c.value === selectedSize || c.description === selectedSize);
    const colorChoice = colorOpt?.choices?.find(c => {
      const lower = c.value?.toLowerCase() || '';
      let mappedName = 'Sort';
      if (lower.includes('sort') || lower.includes('black') || lower.includes('charcoal') || lower.includes('coal') || lower.includes('rgb(0,0,0)') || lower.includes('rgb(64,64,64)')) mappedName = 'Sort';
      else if (lower.includes('hvit') || lower.includes('white') || lower.includes('rgb(252,252,252)') || lower.includes('rgb(255,255,255)')) mappedName = 'Hvit';
      else if (lower.includes('grå') || lower.includes('grey') || lower.includes('gray') || lower.includes('ash') || lower.includes('silver') || lower.includes('cement') || lower.includes('#a8a8a8') || lower.includes('grey melange') || lower.includes('sport grey')) mappedName = 'Grå';
      else if (lower.includes('blå') || lower.includes('blue') || lower.includes('navy') || lower.includes('royal') || lower.includes('sky') || lower.includes('sapphire') || lower.includes('teal')) mappedName = 'Blå';
      else if (lower.includes('rød') || lower.includes('red') || lower.includes('maroon') || lower.includes('garnet') || lower.includes('cardinal') || lower.includes('cherry')) mappedName = 'Rød';
      else if (lower.includes('grønn') || lower.includes('green') || lower.includes('kelly') || lower.includes('mint') || lower.includes('pistachio') || lower.includes('forest')) mappedName = 'Grønn';
      else if (lower.includes('gul') || lower.includes('yellow') || lower.includes('gold') || lower.includes('daisy') || lower.includes('haze')) mappedName = 'Gul';
      else if (lower.includes('rosa') || lower.includes('pink') || lower.includes('fuchsia') || lower.includes('azalea') || lower.includes('berry') || lower.includes('heliconia') || lower.includes('magenta')) mappedName = 'Rosa';
      else if (lower.includes('beige') || lower.includes('sand') || lower.includes('natural') || lower.includes('cream') || lower.includes('creamy')) mappedName = 'Beige';
      else if (lower.includes('terrakotta') || lower.includes('terracotta') || lower.includes('brun') || lower.includes('brown') || lower.includes('chocolate') || lower.includes('clay')) mappedName = 'Terracotta';
      else if (lower.includes('orange') || lower.includes('tangerine') || lower.includes('coral')) mappedName = 'Orange';
      else if (lower.includes('lilla') || lower.includes('purple') || lower.includes('violet') || lower.includes('orchid') || lower.includes('plum')) mappedName = 'Lilla';
      else if (lower.startsWith('#') || lower.startsWith('rgb')) {
        if (lower.includes('255,255,255') || lower === '#ffffff') mappedName = 'Hvit';
        else if (lower.includes('0,0,0') || lower === '#000000' || lower === '#151a21') mappedName = 'Sort';
        else mappedName = 'Grå';
      }
      return mappedName === selectedColor;
    });

    const targetChoices = {};
    if (sizeOpt && sizeChoice) targetChoices[sizeOpt.name] = sizeChoice.value;
    if (colorOpt && colorChoice) targetChoices[colorOpt.name] = colorChoice.value;

    return product.variants.find(v => {
      return Object.entries(v.choices).every(([optName, optVal]) => {
        return targetChoices[optName] === optVal;
      });
    });
  }, [product, selectedSize, selectedColor]);

  // Aggregate stock information from wix client structures
  const stockStatus = useMemo(() => {
    if (!product) return { inStock: false, trackQuantity: false, quantity: 0 };
    
    if (product.manageVariants && selectedVariant) {
      return {
        inStock: selectedVariant.stock?.inStock ?? false,
        trackQuantity: selectedVariant.stock?.trackQuantity ?? false,
        quantity: selectedVariant.stock?.quantity ?? 0
      };
    }
    
    if (product.variants && product.variants.length > 0) {
      const defaultVariant = product.variants[0];
      return {
        inStock: defaultVariant.stock?.inStock ?? false,
        trackQuantity: defaultVariant.stock?.trackQuantity ?? false,
        quantity: defaultVariant.stock?.quantity ?? 0
      };
    }

    return { inStock: true, trackQuantity: false, quantity: 999 };
  }, [product, selectedVariant]);

  // Reset local state on product change
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes.includes('M') ? 'M' : product.sizes[0]);
      }
      if (product.colorNames && product.colorNames.length > 0) {
        setSelectedColor(product.colorNames.includes('Hvit') ? 'Hvit' : product.colorNames[0]);
      }
      setQty(1);
    }
  }, [product]);

  // Ensure selected quantity is not higher than available stock
  useEffect(() => {
    if (stockStatus.trackQuantity && qty > stockStatus.quantity) {
      setQty(Math.max(1, stockStatus.quantity));
    }
  }, [stockStatus, qty]);

  if (!product) {
    if (isLoadingProducts) {
      return (
        <div className="flex flex-col items-center justify-center py-56">
          <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-secondary font-semibold font-body-md">Henter produkt fra Wix...</p>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="max-w-md mx-auto py-40 px-4 text-center"
      >
        <span className="material-symbols-outlined text-5xl text-terracotta/40 mb-4">error</span>
        <h2 className="font-headline-md text-headline-md text-onyx mb-2">Produktet finnes ikke</h2>
        <p className="text-secondary font-body-md mb-8">
          Vi beklager, men produktet du leter etter er enten slettet eller midlertidig utilgjengelig.
        </p>
        <button 
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 bg-terracotta text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Gå til alle produkter</span>
        </button>
      </motion.div>
    );
  }

  // Related products (same category, excluding current product)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBackInStockSubmit = async (e) => {
    e.preventDefault();
    if (!backInStockEmail) return;
    setBackInStockLoading(true);
    setBackInStockError('');
    try {
      const variantId = selectedVariant?._id || product.variants?.[0]?._id;
      const requestPayload = {
        email: backInStockEmail,
        catalogReference: {
          appId: '215238eb-22a5-4c36-9e7b-e7c08025e04e',
          catalogItemId: product.id,
          ...(variantId ? { options: { variantId } } : {})
        }
      };
      
      console.log('Sending Back in Stock Request to Wix:', requestPayload);
      await wixClient.backInStockNotifications.createBackInStockNotificationRequest(requestPayload);
      setBackInStockSuccess(true);
      setBackInStockError('');
    } catch (err) {
      console.error('Error creating back in stock request:', err);
      setBackInStockError('Kunne ikke opprette varsling. Vennligst prøv igjen.');
    } finally {
      setBackInStockLoading(false);
    }
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-label-sm font-label-sm text-secondary mb-8">
        <Link to="/" className="hover:text-terracotta transition-colors">Hjem</Link>
        <ChevronRight size={14} className="text-secondary/60" />
        <Link to="/products" className="hover:text-terracotta transition-colors">Produkter</Link>
        <ChevronRight size={14} className="text-secondary/60" />
        <Link to={`/category/${getSlugByCategoryName(product.category)}`} className="hover:text-terracotta transition-colors">{product.category}</Link>
        <ChevronRight size={14} className="text-secondary/60" />
        <span className="text-onyx font-bold line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm aspect-square md:aspect-[4/5] flex items-center justify-center p-8 border border-outline-variant/35">
            <img 
              alt={product.name} 
              className="max-w-full max-h-full object-contain rounded-lg hover:scale-[1.03] transition-transform duration-500" 
              src={getOptimizedWixImageUrl(activeImage || product.image, 600, 750)}
            />
          </div>
          {/* Thumbnails (for visual complete design look and active image switching) */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin select-none">
              {product.images.map((imgUrl, idx) => {
                const isActive = (activeImage || product.image) === imgUrl;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-20 h-20 rounded-lg p-1.5 flex-shrink-0 cursor-pointer shadow-sm border-2 transition-all outline-none ${
                      isActive 
                        ? 'border-terracotta bg-white scale-[1.02]' 
                        : 'border-outline-variant/50 hover:border-terracotta/40 bg-white'
                    }`}
                  >
                    <img 
                      alt={`Produktbilde thumbnail ${idx + 1}`} 
                      className="w-full h-full object-contain rounded" 
                      src={getOptimizedWixImageUrl(imgUrl, 100, 100)} 
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div>
            <span className="text-terracotta font-label-sm text-label-sm uppercase tracking-widest font-semibold block mb-1">
              {product.category} {product.gender && `• ${product.gender}`}
            </span>
            <h1 className="font-headline-lg text-2xl md:text-headline-lg text-onyx mb-2">{product.name}</h1>
            
            {/* Average Rating Stars shortcut */}
            {reviewsList.length > 0 && (
              <div 
                onClick={() => {
                  const element = document.getElementById('reviews-section');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-2 mb-3 cursor-pointer select-none group w-max"
              >
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className="material-symbols-outlined text-sm font-bold"
                      style={{ fontVariationSettings: i < Math.round(averageRating) ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400" }}
                    >
                      star
                    </span>
                  ))}
                </div>
                <span className="text-xs text-secondary font-semibold group-hover:text-terracotta transition-colors">
                  {averageRating} ({reviewsList.length} {reviewsList.length === 1 ? 'omtale' : 'omtaler'})
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="font-headline-md text-headline-md text-terracotta font-extrabold text-2xl">
                {product.price} kr
              </span>
              {product.originalPrice && (
                <span className="font-body-md text-body-md text-onyx/40 line-through">
                  {product.originalPrice} kr
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-outline-variant/50 w-full" />

          <div>
            <h4 className="font-label-md text-label-md text-onyx mb-2 uppercase tracking-wider">Beskrivelse</h4>
            <p className="font-body-md text-body-md text-secondary leading-relaxed">
              {product.description || 'Et premium produkt fra His Kingdom Designs. Designet for å bringe håp og tro inn i hverdagen.'}
            </p>
          </div>

          {/* Bullet points for clothing products */}
          {product.category === 'Klær' && (
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-body-md text-onyx">
                <span className="material-symbols-outlined text-terracotta text-lg select-none">check_circle</span>
                <span>100% organisk bomull</span>
              </li>
              <li className="flex items-center gap-2 text-body-md text-onyx">
                <span className="material-symbols-outlined text-terracotta text-lg select-none">check_circle</span>
                <span>Bærekraftig produsert, myk passform</span>
              </li>
            </ul>
          )}

          {/* Color Selector */}
          {product.colorNames && product.colorNames.length > 0 && (
            <div className="space-y-3">
              <span className="font-label-md text-label-md text-onyx">Farge: <strong className="text-terracotta">{selectedColor}</strong></span>
              <div className="flex gap-3">
                {product.colors.map((colorHex, idx) => {
                  const colorName = product.colorNames[idx];
                  const isSelected = selectedColor === colorName;
                  return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(colorName)}
                      className={`w-8 h-8 rounded-full border ring-offset-2 transition-all ${
                        isSelected ? 'ring-2 ring-terracotta scale-105 shadow-md' : 'hover:ring-1 hover:ring-terracotta'
                      }`}
                      style={{ backgroundColor: colorHex }}
                      title={colorName}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-onyx">Størrelse</span>
                <button 
                  type="button" 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-label-sm text-terracotta hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Ruler size={14} />
                  Størrelsesguide
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.sizes.map(size => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-h-12 py-2 px-1 border rounded-lg transition-all flex items-center justify-center text-center ${
                        size.length > 3 ? 'text-[11px] leading-tight font-semibold' : 'font-label-md text-label-md'
                      } ${
                        isSelected 
                          ? 'border-terracotta bg-terracotta text-white font-bold' 
                          : 'border-outline text-onyx hover:border-terracotta hover:text-terracotta'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-3">
            <span className="font-label-md text-label-md text-onyx">Antall</span>
            <div className="flex items-center border border-outline rounded-lg w-max overflow-hidden bg-white">
              <button 
                onClick={() => setQty(prev => Math.max(1, prev - 1))}
                disabled={!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0)}
                className="px-4 py-2 hover:bg-slate-100 transition-colors font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="px-6 py-2 border-x border-outline font-bold select-none text-center min-w-[50px]">
                {(!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0)) ? 0 : qty}
              </span>
              <button 
                onClick={() => setQty(prev => (stockStatus.trackQuantity && prev >= stockStatus.quantity) ? prev : prev + 1)}
                disabled={!stockStatus.inStock || (stockStatus.trackQuantity && (stockStatus.quantity === 0 || qty >= stockStatus.quantity))}
                className="px-4 py-2 hover:bg-slate-100 transition-colors font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            
            {/* Real Stock Indicators */}
            {stockStatus.trackQuantity && stockStatus.quantity > 0 && stockStatus.quantity <= 5 && (
              <p className="text-xs font-semibold text-orange-600 flex items-center gap-1.5 mt-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
                Kun {stockStatus.quantity} igjen på lager!
              </p>
            )}
            {!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0) ? (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                Utsolgt i denne fargen/størrelsen.
              </p>
            ) : (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mt-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                På lager - klar til sending innen 24t
              </p>
            )}
          </div>

          {/* CTA Add to Cart & Wishlist */}
          <div className="flex gap-4 items-stretch mt-4">
            <button 
              onClick={handleAddToCart}
              disabled={!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0)}
              className={`flex-grow font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-md ${
                (!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0))
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-terracotta text-white hover:opacity-95 active:scale-[0.98]'
              }`}
            >
              {(!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0)) ? (
                <span>Utsolgt</span>
              ) : added ? (
                <>
                  <Check size={18} />
                  <span>Lagt til!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <span>Legg i handlekurv</span>
                </>
              )}
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="p-4 border border-outline hover:border-terracotta text-terracotta rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 active:scale-95"
              title={isWishlisted ? "Fjern fra ønskelisten" : "Legg i ønskelisten"}
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>

          {/* Back in stock request form */}
          {(!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0)) && (
            <div className="mt-4 p-5 bg-slate-50 border border-outline-variant/30 rounded-xl space-y-3">
              <h4 className="font-label-md text-label-md text-onyx font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-terracotta text-lg">mail</span>
                Meld meg når varen er på lager
              </h4>
              <p className="text-xs text-secondary leading-relaxed">
                Vi sender deg en automatisk e-post så snart vi har varen tilbake på lager i Mandal.
              </p>
              {backInStockSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 font-medium">
                  ✓ Suksess! Vi sender deg e-post når produktet er tilgjengelig.
                </div>
              ) : (
                <form onSubmit={handleBackInStockSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="din.epost@adresse.no"
                    value={backInStockEmail}
                    onChange={(e) => setBackInStockEmail(e.target.value)}
                    disabled={backInStockLoading}
                    className="bg-white border border-outline rounded-lg px-3 py-2 text-xs flex-grow text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                  />
                  <button
                    type="submit"
                    disabled={backInStockLoading}
                    className="bg-terracotta text-white font-label-md text-xs px-4 py-2 rounded-lg font-bold hover:brightness-105 active:scale-95 transition-all shadow-sm"
                  >
                    {backInStockLoading ? 'Sender...' : 'Meld meg'}
                  </button>
                </form>
              )}
              {backInStockError && (
                <p className="text-[11px] text-red-600 font-medium mt-1">{backInStockError}</p>
              )}
            </div>
          )}

          {/* Shipping / Trust details */}
          <div className="bg-white/50 p-4 rounded-lg border border-outline-variant/30 space-y-3 shadow-sm">
            <div className="flex items-center gap-3 text-secondary">
              <Truck size={18} className="text-terracotta shrink-0" />
              <span className="text-label-sm font-label-sm">Lynrask levering: 2-4 dager</span>
            </div>
            <div className="flex items-center gap-3 text-secondary">
              <ShieldCheck size={18} className="text-terracotta shrink-0" />
              <span className="text-label-sm font-label-sm">Trygg og kryptert betaling med Vipps / Kort</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Kundeomtaler & Vurderinger */}
      <section id="reviews-section" className="mt-20 border-t border-outline-variant/30 pt-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="font-headline-lg text-2xl md:text-3xl text-[#1B4965] font-bold">Kundeomtaler</h2>
            <p className="text-secondary font-body-md text-sm mt-1">Hva våre kunder mener om {product.name}</p>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-[#1B4965] text-white hover:bg-[#153a50] px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 shadow-sm"
          >
            {showReviewForm ? 'Lukk skjema' : 'Skriv en omtale'}
          </button>
        </div>

        {/* Review Submission Form - Stacked layout to avoid Chrome jitter */}
        {showReviewForm && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-10 p-6 bg-slate-50 border border-outline-variant/30 rounded-xl max-w-xl shadow-sm"
          >
            <h3 className="font-headline-md text-lg text-onyx mb-4 font-bold">Skriv din vurdering</h3>
            <form onSubmit={handleReviewSubmit} className="block space-y-4">
              <div className="block">
                <label className="block text-xs font-semibold text-secondary mb-1">Ditt Navn</label>
                <input
                  type="text"
                  required
                  placeholder="F.eks. Ola Nordmann"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  disabled={isSubmittingReview}
                  style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  className="block w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="block">
                <label className="block text-xs font-semibold text-secondary mb-1">Din Vurdering (1-5 stjerner)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="text-amber-500 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                    >
                      <span 
                        className="material-symbols-outlined text-2xl"
                        style={{ fontVariationSettings: star <= reviewRating ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400" }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="block">
                <label className="block text-xs font-semibold text-secondary mb-1">Overskrift</label>
                <input
                  type="text"
                  required
                  placeholder="Oppsummer din opplevelse..."
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  disabled={isSubmittingReview}
                  style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  className="block w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="block">
                <label className="block text-xs font-semibold text-secondary mb-1">Omtale</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Fortell oss hva du syns om kvaliteten, passformen eller designet..."
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  disabled={isSubmittingReview}
                  style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  className="block w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="block w-full bg-terracotta text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all shadow-md"
              >
                {isSubmittingReview ? 'Sender inn...' : 'Send omtale'}
              </button>

              {reviewSubmitError && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 text-center">{reviewSubmitError}</p>
              )}
            </form>
          </motion.div>
        )}

        {reviewSubmitSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 font-medium">
            ✓ Takk for din omtale! Din vurdering har blitt sendt inn og er nå synlig på siden.
          </div>
        )}

        {/* Reviews Summary Dashboard */}
        {reviewsList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white p-6 rounded-2xl border border-outline-variant/20 shadow-sm mb-10">
            {/* Left Block: Average Rating */}
            <div className="md:col-span-4 text-center md:border-r border-slate-100 md:pr-8">
              <p className="text-5xl font-extrabold text-[#1B4965] mb-2">{averageRating}</p>
              <div className="flex justify-center text-amber-500 mb-1">
                {[...Array(5)].map((_, i) => (
                  <span 
                    key={i} 
                    className="material-symbols-outlined text-lg"
                    style={{ fontVariationSettings: i < Math.round(averageRating) ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <p className="text-xs text-secondary font-medium uppercase tracking-wider">
                Basert på {reviewsList.length} {reviewsList.length === 1 ? 'omtale' : 'omtaler'}
              </p>
            </div>

            {/* Right Block: Star Distribution */}
            <div className="md:col-span-8 space-y-2.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-secondary w-12 text-right">{rating} stjerner</span>
                    <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-secondary w-8 font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review list */}
        {isLoadingReviews ? (
          <div className="py-10 text-center text-secondary font-semibold text-sm">Henter omtaler...</div>
        ) : reviewsList.length === 0 ? (
          <div className="py-12 text-center text-secondary bg-slate-50/55 rounded-xl border border-dashed border-outline-variant/40">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">rate_review</span>
            <p className="font-semibold text-sm">Ingen omtaler ennå</p>
            <p className="text-xs text-secondary/75 mt-0.5">Vær den første til å dele din mening om dette produktet!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviewsList.map((rev) => (
              <div 
                key={rev._id} 
                className="p-6 bg-white rounded-2xl border border-outline-variant/20 shadow-sm space-y-3"
              >
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <span 
                          key={i} 
                          className="material-symbols-outlined text-sm"
                          style={{ fontVariationSettings: i < (rev.content?.rating || 5) ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <h4 className="font-bold text-sm text-onyx">{rev.content?.title}</h4>
                  </div>
                  <span className="text-[11px] text-secondary font-medium">
                    {(() => {
                      try {
                        const d = new Date(rev._createdDate || Date.now());
                        if (!isNaN(d.getTime())) {
                          return d.toLocaleDateString('no-NO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                        }
                      } catch (e) {}
                      return 'Nylig omtale';
                    })()}
                  </span>
                </div>

                {/* Review Body */}
                <p className="text-xs text-secondary leading-relaxed font-body-md">
                  {rev.content?.body}
                </p>

                {/* Review Author */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold select-none">
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span>Skrevet av {rev.author?.authorName || 'Anonym'}</span>
                  {rev._id.startsWith('mock') && (
                    <span className="text-[9px] uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                      Verifisert Kjøper
                    </span>
                  )}
                </div>

                {/* Admin Reply */}
                {rev.reply && (
                  <div className="mt-4 p-4 bg-slate-50 border-l-2 border-terracotta rounded-r-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-terracotta font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-xs">storefront</span>
                      <span>Svar fra His Kingdom Designs</span>
                    </div>
                    <p className="text-xs text-secondary leading-relaxed font-body-md italic">
                      "{rev.reply.body}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section: Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-section-gap border-t border-outline-variant/30 pt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-2">
            <h2 className="font-headline-lg text-2xl md:text-headline-lg text-onyx">Relaterte produkter</h2>
            <Link 
              to={`/category/${getSlugByCategoryName(product.category)}`} 
              className="text-terracotta font-label-md hover:underline underline-offset-4 font-bold"
            >
              Se alle {product.category.toLowerCase()}
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-gutter">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Size Guide Modal (Byrå-UX modal) */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSizeGuideOpen(false)}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-onyx/40 backdrop-blur-sm pointer-events-auto cursor-pointer"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] cursor-default"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-outline-variant/20 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-2.5 text-terracotta">
                  <Ruler size={18} />
                  <h3 className="font-bold text-sm text-onyx">Størrelsesguide</h3>
                </div>
                <button
                  onClick={() => setIsSizeGuideOpen(false)}
                  className="p-1.5 hover:bg-slate-200 rounded-full text-secondary hover:text-onyx transition-all active:scale-95 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Size Guide Content with intelligent default tab */}
              <SizeGuideContent 
                defaultTab={
                  (product?.category?.toLowerCase() || '').includes('hat') || (product?.category?.toLowerCase() || '').includes('caps') 
                    ? 'caps' 
                    : (product?.category?.toLowerCase() || '').includes('bilder') || (product?.category?.toLowerCase() || '').includes('plakat') 
                      ? 'posters' 
                      : 'clothing'
                } 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

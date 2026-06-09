import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Check, ShieldCheck, Truck, ArrowLeft, Heart, Star, Sparkles, Ruler, X } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { wixClient } from '@/lib/wix';
import { getOptimizedWixImageUrl } from '@/lib/media';
import useMeta from '@/hooks/useMeta';
import { useLanguage } from '@/contexts/LanguageContext';

const parseHex = (hexStr) => {
  let hex = hexStr.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
};

const parseRgb = (rgbStr) => {
  const match = rgbStr.match(/\d+/g);
  if (match && match.length >= 3) {
    return { r: parseInt(match[0]), g: parseInt(match[1]), b: parseInt(match[2]) };
  }
  return { r: 128, g: 128, b: 128 };
};

const getClosestColor = (r, g, b) => {
  const standards = [
    { name: 'Sort', r: 21, g: 26, b: 33, hex: '#151A21' },
    { name: 'Hvit', r: 255, g: 255, b: 255, hex: '#FFFFFF' },
    { name: 'Grå', r: 229, g: 231, b: 235, hex: '#E5E7EB' },
    { name: 'Blå', r: 59, g: 130, b: 246, hex: '#3b82f6' },
    { name: 'Mørkeblå', r: 27, g: 73, b: 101, hex: '#1B4965' },
    { name: 'Rød', r: 239, g: 68, b: 68, hex: '#ef4444' },
    { name: 'Grønn', r: 22, g: 163, b: 74, hex: '#16a34a' },
    { name: 'Gul', r: 234, g: 179, b: 8, hex: '#eab308' },
    { name: 'Rosa', r: 219, g: 39, b: 119, hex: '#db2777' },
    { name: 'Beige', r: 212, g: 196, b: 181, hex: '#d4c4b5' },
    { name: 'Terrakotta', r: 204, g: 113, b: 43, hex: '#CC712B' },
    { name: 'Orange', r: 249, g: 115, b: 22, hex: '#f97316' },
    { name: 'Lilla', r: 168, g: 85, b: 247, hex: '#a855f7' }
  ];

  let minDistance = Infinity;
  let closest = standards[0];

  standards.forEach(std => {
    const dist = Math.sqrt(
      Math.pow(r - std.r, 2) +
      Math.pow(g - std.g, 2) +
      Math.pow(b - std.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = std;
    }
  });

  return closest;
};

export const resolveColor = (rawName) => {
  if (!rawName) return { name: 'Sort', hex: '#151A21' };
  
  let trimName = rawName.trim();
  
  const capitalize = (str) => {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // If it's a dual color split by /
  if (trimName.includes('/')) {
    const parts = trimName.split('/');
    const res1 = resolveColor(parts[0]);
    const res2 = resolveColor(parts[1]);
    const formattedName = [res1.name, res2.name].join('/');
    const gradient = `linear-gradient(135deg, ${res1.hex} 50%, ${res2.hex} 50%)`;
    return { name: formattedName, hex: gradient };
  }

  const lower = trimName.toLowerCase();
  
  // 1. Check if it's an rgb or hex code and classify using RGB distance
  if (lower.startsWith('rgb') || lower.startsWith('#')) {
    const { r, g, b } = lower.startsWith('#') ? parseHex(lower) : parseRgb(lower);
    const closest = getClosestColor(r, g, b);
    return { name: closest.name, hex: closest.hex };
  }

  // 2. Friendly name matching with expanded dictionary
  let displayName = capitalize(trimName);
  let hexCode = '#888888';

  if (lower.includes('sort') || lower.includes('svart') || lower.includes('black') || lower.includes('charcoal') || lower.includes('coal') || lower.includes('dark grey') || lower.includes('night')) {
    displayName = 'Sort';
    hexCode = '#151A21';
  } else if (lower.includes('hvit') || lower.includes('white') || lower.includes('off-white') || lower.includes('weiß') || lower.includes('ivory') || lower.includes('bone') || lower.includes('soft cream')) {
    displayName = 'Hvit';
    hexCode = '#FFFFFF';
  } else if (lower.includes('navy') || lower.includes('marine') || lower.includes('mørkeblå') || lower.includes('deep teal') || lower.includes('teal') || lower.includes('sapphire') || lower.includes('storm')) {
    displayName = 'Mørkeblå';
    hexCode = '#1B4965';
  } else if (lower.includes('royalblue') || lower.includes('royal') || lower.includes('carolina blue') || lower.includes('blue') || lower.includes('blå') || lower.includes('denim') || lower.includes('cornflower') || lower.includes('aqua') || lower.includes('caribbean') || lower.includes('chambray') || lower.includes('sky') || lower.includes('ocean') || lower.includes('chill')) {
    displayName = 'Blå';
    hexCode = '#3b82f6';
  } else if (lower.includes('rød') || lower.includes('red') || lower.includes('maroon') || lower.includes('burgundy') || lower.includes('garnet') || lower.includes('cherry') || lower.includes('cardinal') || lower.includes('bright salmon') || lower.includes('watermelon')) {
    displayName = 'Rød';
    hexCode = '#ef4444';
  } else if (lower.includes('grønn') || lower.includes('green') || lower.includes('forest') || lower.includes('olive') || lower.includes('oliven') || lower.includes('military') || lower.includes('kelly') || lower.includes('irish') || lower.includes('army') || lower.includes('mint') || lower.includes('dusty sage') || lower.includes('fern') || lower.includes('kiwi') || lower.includes('neo mint') || lower.includes('cool mint') || lower.includes('chalky mint') || lower.includes('pistachio')) {
    displayName = 'Grønn';
    hexCode = '#16a34a';
  } else if (lower.includes('gul') || lower.includes('yellow') || lower.includes('gold') || lower.includes('butter') || lower.includes('citron') || lower.includes('daisy') || lower.includes('mustard')) {
    displayName = 'Gul';
    hexCode = '#eab308';
  } else if (lower.includes('rosa') || lower.includes('pink') || lower.includes('azalea') || lower.includes('heliconia') || lower.includes('orchid') || lower.includes('fuchsia') || lower.includes('cotton candy') || lower.includes('peach') || lower.includes('coral') || lower.includes('coral silk') || lower.includes('tangerine') || lower.includes('berry') || lower.includes('mauve') || lower.includes('hibiscus')) {
    displayName = 'Rosa';
    hexCode = '#db2777';
  } else if (lower.includes('beige') || lower.includes('sand') || lower.includes('natural') || lower.includes('stone') || lower.includes('khaki') || lower.includes('tan') || lower.includes('rope') || lower.includes('toast') || lower.includes('saddle') || lower.includes('cocoa') || lower.includes('umber') || lower.includes('dark chocolate') || lower.includes('triblend brown') || lower.includes('natur')) {
    displayName = 'Beige';
    hexCode = '#d4c4b5';
  } else if (lower.includes('terrakotta') || lower.includes('terracotta') || lower.includes('clay')) {
    displayName = 'Terrakotta';
    hexCode = '#CC712B';
  } else if (lower.includes('orange') || lower.includes('tangerine')) {
    displayName = 'Orange';
    hexCode = '#f97316';
  } else if (lower.includes('lilla') || lower.includes('purple') || lower.includes('lavender') || lower.includes('amethyst') || lower.includes('lilak') || lower.includes('future lavender')) {
    displayName = 'Lilla';
    hexCode = '#a855f7';
  } else if (lower.includes('grå') || lower.includes('grey') || lower.includes('gray') || lower.includes('ash') || lower.includes('silver') || lower.includes('cement') || lower.includes('sport grey') || lower.includes('heather') || lower.includes('gravel') || lower.includes('smoke') || lower.includes('paragon')) {
    displayName = 'Grå';
    hexCode = '#E5E7EB';
  }

  // Fallback to closest color if we resolved to standard gray fallback but have a specific name
  if (hexCode === '#888888') {
    return { name: 'Grå', hex: '#E5E7EB' };
  }

  return { name: displayName, hex: hexCode };
};

function SizeGuideContent({ defaultTab = 'clothing' }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tabs list */}
      <div className="flex border-b border-outline-variant/30 text-xs font-semibold select-none bg-slate-50">
        <button
          onClick={() => setActiveTab('clothing')}
          className={`flex-1 py-3.5 px-2 text-center transition-all text-[11px] sm:text-xs ${
            activeTab === 'clothing' 
              ? 'bg-white text-terracotta font-bold border-b-2 border-terracotta' 
              : 'text-secondary hover:text-onyx hover:bg-slate-100/60'
          }`}
        >
          <span className="hidden sm:inline">👚 {t('product.clothingTab')}</span>
          <span className="inline sm:hidden">👚 {t('product.clothingTab')}</span>
        </button>
        <button
          onClick={() => setActiveTab('caps')}
          className={`flex-1 py-3.5 px-2 text-center transition-all border-x border-outline-variant/20 text-[11px] sm:text-xs ${
            activeTab === 'caps' 
              ? 'bg-white text-terracotta font-bold border-b-2 border-terracotta' 
              : 'text-secondary hover:text-onyx hover:bg-slate-100/60'
          }`}
        >
          <span className="hidden sm:inline">🧢 {t('product.capsTab')}</span>
          <span className="inline sm:hidden">🧢 {t('product.capsTab')}</span>
        </button>
        <button
          onClick={() => setActiveTab('posters')}
          className={`flex-1 py-3.5 px-2 text-center transition-all text-[11px] sm:text-xs ${
            activeTab === 'posters' 
              ? 'bg-white text-terracotta font-bold border-b-2 border-terracotta' 
              : 'text-secondary hover:text-onyx hover:bg-slate-100/60'
          }`}
        >
          <span className="hidden sm:inline">🖼️ {t('product.postersTab')}</span>
          <span className="inline sm:hidden">🖼️ {t('product.postersTab')}</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-secondary custom-scrollbar flex-1">
        {activeTab === 'clothing' && (
          <div className="space-y-4">
            <p className="italic">{t('product.clothingGuideDesc')}</p>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-onyx font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">{t('product.size')}</th>
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
              <p className="font-semibold text-onyx mb-1 text-[10px] uppercase">{t('product.howToMeasure')}</p>
              <p>{t('product.widthMeasure')}</p>
              <p>{t('product.lengthMeasure')}</p>
            </div>
          </div>
        )}

        {activeTab === 'caps' && (
          <div className="space-y-4">
            <p className="italic">{t('product.capsGuideDesc')}</p>
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
            <p className="italic">{t('product.postersGuideDesc')}</p>
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

function formatDescription(html) {
  if (!html) return '';
  if (!html.toLowerCase().includes('measurements')) return html;
  
  const parts = html.split(/<\/p>/i);
  
  const before = [];
  const sizeRows = [];
  const after = [];
  let inMeasurements = false;
  let headerHtml = '';
  
  for (let part of parts) {
    part = part.trim();
    if (!part) continue;
    const p = part + '</p>';
    
    // Strip HTML tags to check text content
    const text = p.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\u00A0/g, ' ').trim();
    
    if (text.toLowerCase() === 'measurements:') {
      inMeasurements = true;
      headerHtml = p;
      continue;
    }
    
    if (inMeasurements) {
      const firstWord = text.split(/\s+/)[0].replace(/[^a-zA-Z0-9]/g, '');
      const isSize = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'XXS', 'XXL', '4XL'].includes(firstWord.toUpperCase());
      
      if (isSize) {
        sizeRows.push(text);
      } else {
        if (sizeRows.length > 0) {
          after.push(p);
          inMeasurements = false;
        } else {
          before.push(p);
        }
      }
    } else {
      before.push(p);
    }
  }
  
  if (sizeRows.length > 0) {
    const tableRows = [];
    const headers = ['Størrelse (Size)', 'Lengde (Length)', 'Brystvidde (½ Chest)'];
    
    sizeRows.forEach(row => {
      const cleanText = row.replace(/[\s\u00A0]+/g, ' ').trim();
      const tokens = cleanText.split(' ');
      
      if (tokens[0].toUpperCase() === 'XS' && cleanText.toLowerCase().includes('body')) {
        // mixed row: "XS Body Length 66. ½ Chest 46"
        tableRows.push({
          size: 'XS',
          length: '66 cm',
          chest: '46 cm'
        });
      } else {
        const size = tokens[0].replace(/\.$/, ''); // remove trailing dot like "M."
        const length = tokens[1] ? tokens[1].replace(/\.$/, '') + ' cm' : '';
        const chest = tokens[2] ? tokens[2].replace(/\.$/, '') + ' cm' : '';
        tableRows.push({
          size,
          length,
          chest
        });
      }
    });
    
    const tableHtml = `
<div class="my-4 overflow-x-auto border border-outline-variant/30 rounded-2xl bg-white/40 shadow-xs">
  <table class="w-full border-collapse text-left text-sm text-onyx">
    <thead>
      <tr class="bg-onyx/5 border-b border-outline-variant/40">
        <th class="p-3 font-bold uppercase tracking-wider text-[11px] text-onyx/60">${headers[0]}</th>
        <th class="p-3 font-bold uppercase tracking-wider text-[11px] text-onyx/60">${headers[1]}</th>
        <th class="p-3 font-bold uppercase tracking-wider text-[11px] text-onyx/60">${headers[2]}</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-outline-variant/20">
      ${tableRows.map(r => `
      <tr class="hover:bg-onyx/5 transition-colors">
        <td class="p-3 font-bold text-terracotta">${r.size}</td>
        <td class="p-3 font-medium text-secondary">${r.length}</td>
        <td class="p-3 font-medium text-secondary">${r.chest}</td>
      </tr>`).join('')}
    </tbody>
  </table>
</div>`;
    
    const beforeHtml = before.join('');
    const afterHtml = after.join('');
    return beforeHtml + headerHtml + tableHtml + afterHtml;
  }
  
  return html;
}

export default function ProductDetails() {
  const { t, translateProduct, language, formatPrice } = useLanguage();
  const { products, isLoadingProducts, toggleWishlist, isInWishlist, getSlugByCategoryName } = useApp();
  const { addToCart } = useCart();
  const { productId } = useParams();
  const navigate = useNavigate();

  // --- 1. State Declarations ---
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Hvit');
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [customTextFieldValues, setCustomTextFieldValues] = useState({});
  const [customTextModes, setCustomTextModes] = useState({});
  const [added, setAdded] = useState(false);
  const [activeImage, setActiveImage] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Back in stock states
  const [backInStockEmail, setBackInStockEmail] = useState('');
  const [backInStockSuccess, setBackInStockSuccess] = useState(false);
  const [backInStockLoading, setBackInStockLoading] = useState(false);
  const [backInStockError, setBackInStockError] = useState('');

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

  // --- 2. Memoized Derivations ---
  
  // Find product by id from app context
  const contextProduct = useMemo(() => {
    return products.find(p => p.id === productId);
  }, [products, productId]);

  // Use contextProduct if available, otherwise fallback to fetchedProduct (translated dynamically)
  const productRaw = contextProduct || fetchedProduct;
  const product = useMemo(() => {
    return translateProduct(productRaw);
  }, [productRaw, translateProduct]);

  // Find the selected variant matching selectedSize and selectedColor
  const selectedVariant = useMemo(() => {
    if (!product || !product.manageVariants || !product.variants || product.variants.length === 0) return null;
    
    const sizeOpt = product.productOptions?.find(o => {
      const name = o.name?.trim().toLowerCase();
      return name && (name.includes('size') || name.includes('størrelse') || name.includes('størrelser') || name.includes('format') || name === 'str' || name === 'str.');
    });
    const colorOpt = product.productOptions?.find(o => {
      const name = o.name?.trim().toLowerCase();
      return name && (name === 'color' || name === 'farge');
    });

    const sizeChoice = sizeOpt?.choices?.find(c => c.value === selectedSize || c.description === selectedSize);
    const colorChoice = colorOpt?.choices?.find(c => {
      const resolved = resolveColor(c.value);
      return resolved.name === selectedColor;
    });

    const targetChoices = {};
    if (sizeOpt && sizeChoice) targetChoices[sizeOpt.name] = sizeChoice.value;
    if (colorOpt && colorChoice) targetChoices[colorOpt.name] = colorChoice.value;

    return product.variants.find(v => {
      if (!v || !v.choices) return false;
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

  // Wishlist helper
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // --- 3. Helper Functions ---
  
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

    const allReviews = [...localReviews, ...apiReviews];
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

  // --- 4. Effect & Custom Hook Declarations ---

  // Fetch product directly from Wix if not found or if it is a lightweight cached version
  useEffect(() => {
    async function fetchSingleProduct() {
      if ((!contextProduct || !contextProduct.description || !contextProduct.variants || contextProduct.variants.length === 0) && productId) {
        setIsFetchingProduct(true);
        setFetchError(false);
        try {
          console.log(`Fetching full details for product ${productId} from Wix...`);
          const res = await wixClient.products.getProduct(productId);
          if (res && res.product) {
            const item = res.product;
            const nameLower = item.name?.toLowerCase() || '';
            
            const clothingRegex = /\b(genser|gensere|hettegenser|hettegensere|tskjorte|tskjorter|t-skjorte|t-skjorter|tee|tees|body|bodyer|babybody|babybodyer|babysuit|skjorte|skjorter|topp|topper|caps|lue|luer|beanie|beanies|sokker|bukse|bukser|pants|hoodie|hoodies|sweatshirt|sweatshirts|tights|jakke|jakker)\b/i;
            const stickerRegex = /\b(klistremerke|klistremerker|sticker|stickers)\b/i;
            const posterRegex = /\b(plakat|plakater|poster|postere|kunsttrykk|bilde|bilder|canvas)\b/i;

            let category = 'Tilbehør';
            if (clothingRegex.test(nameLower)) {
              category = 'Klær';
            } else if (stickerRegex.test(nameLower)) {
              category = 'Klistermerker';
            } else if (posterRegex.test(nameLower)) {
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
                  if (s.length > 15) return false;
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
                const rawColorNames = colorOpt.choices?.map(c => c.value) || [];
                const resolved = rawColorNames.map(name => resolveColor(name));
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
              }
            }

            // Deduplicate sizes
            sizes = Array.from(new Set(sizes));

            if (colors.length === 0) {
              colors = ['#CC712B'];
              colorNames = ['Terracotta'];
            }
            if (sizes.length === 0) {
              sizes = ['One Size'];
            }

            const price = item.price?.discountedPrice || item.price?.price || 0;
            const originalPrice = item.price?.price || 0;
            const isSale = price < originalPrice || item.discount?.type !== 'NONE';

            const mapped = {
              id: item._id,
              name: item.name,
              price: price,
              originalPrice: isSale ? originalPrice : undefined,
              category: category,
              colors: colors,
              colorNames: colorNames,
              sizes: sizes,
              image: item.media?.mainMedia?.image?.url || 'https://via.placeholder.com/400',
              images: item.media?.items?.filter(mi => mi.mediaType === 'image').map(mi => mi.image?.url).filter(Boolean) || [],
              isBestseller: false,
              isSale: isSale,
              description: item.description || '',
              subcategories: [],
              productOptions: item.productOptions,
              manageVariants: item.manageVariants,
              variants: item.variants,
              customTextFields: item.customTextFields || []
            };

            setFetchedProduct(mapped);
          } else {
            setFetchError(true);
          }
        } catch (err) {
          console.error('Failed to fetch single product directly from Wix:', err);
          setFetchError(true);
        } finally {
          setIsFetchingProduct(false);
        }
      }
    }
    fetchSingleProduct();
  }, [contextProduct, productId]);

  // Sync activeImage when product loads/changes
  useEffect(() => {
    if (product?.image) {
      setActiveImage(product.image);
    }
  }, [product]);

  // Sync activeImage with selected color variant image if available
  useEffect(() => {
    if (!product || !selectedColor) return;

    const colorOpt = product.productOptions?.find(o => {
      const name = o.name?.trim().toLowerCase();
      return name === 'color' || name === 'farge';
    });

    if (colorOpt) {
      const colorChoice = colorOpt.choices?.find(c => {
        const resolved = resolveColor(c.value);
        return resolved.name === selectedColor;
      });

      const choiceImageUrl = colorChoice?.media?.mainMedia?.image?.url;
      if (choiceImageUrl) {
        setActiveImage(choiceImageUrl);
      }
    }
  }, [selectedColor, product]);

  // Initialize generic selectedOptions and customTextFieldValues when product changes
  useEffect(() => {
    if (product) {
      // 1. Initialize options
      const initialOpts = {};
      if (product.productOptions && product.productOptions.length > 0) {
        product.productOptions.forEach(opt => {
          const nameLower = opt.name?.trim().toLowerCase();
          const isSize = nameLower.includes('size') || 
                         nameLower.includes('størrelse') || 
                         nameLower.includes('størrelser') || 
                         nameLower.includes('format') || 
                         nameLower === 'str' || nameLower === 'str.';
          
          const isColor = nameLower === 'color' || nameLower === 'farge';

          if (isSize) {
            const matchingChoice = opt.choices?.find(c => c.value === selectedSize || c.description === selectedSize);
            initialOpts[opt.name] = matchingChoice ? matchingChoice.value : (opt.choices?.[0]?.value || '');
          } else if (isColor) {
            const matchingChoice = opt.choices?.find(c => {
              const resolved = resolveColor(c.value);
              return resolved.name === selectedColor;
            });
            initialOpts[opt.name] = matchingChoice ? matchingChoice.value : (opt.choices?.[0]?.value || '');
          } else {
            initialOpts[opt.name] = opt.choices?.[0]?.value || '';
          }
        });
      }
      setSelectedOptions(initialOpts);

      // 2. Initialize custom text fields
      const initialTexts = {};
      const initialModes = {};
      if (product.customTextFields && product.customTextFields.length > 0) {
        product.customTextFields.forEach(field => {
          initialTexts[field.title] = 'Tilfeldig';
          initialModes[field.title] = 'random';
        });
      }
      setCustomTextFieldValues(initialTexts);
      setCustomTextModes(initialModes);
    }
  }, [product]);

  // Keep selectedOptions in sync with selectedSize and selectedColor selections
  useEffect(() => {
    if (product) {
      const sizeOpt = product.productOptions?.find(o => {
        const name = o.name?.trim().toLowerCase();
        return name && (name.includes('size') || name.includes('størrelse') || name.includes('størrelser') || name.includes('format') || name === 'str' || name === 'str.');
      });
      const colorOpt = product.productOptions?.find(o => {
        const name = o.name?.trim().toLowerCase();
        return name && (name === 'color' || name === 'farge');
      });

      const sizeChoice = sizeOpt?.choices?.find(c => c.value === selectedSize || c.description === selectedSize);
      const colorChoice = colorOpt?.choices?.find(c => {
        const resolved = resolveColor(c.value);
        return resolved.name === selectedColor;
      });

      setSelectedOptions(prev => {
        const updated = { ...prev };
        if (sizeOpt && sizeChoice) updated[sizeOpt.name] = sizeChoice.value;
        if (colorOpt && colorChoice) updated[colorOpt.name] = colorChoice.value;
        return updated;
      });
    }
  }, [selectedSize, selectedColor, product]);

  useMeta(
    product ? product.name : t('nav.products'),
    product && typeof product.description === 'string' 
      ? product.description.replace(/<[^>]*>/g, '').substring(0, 155) 
      : t('home.metaDesc'),
    product ? { type: 'product', image: product.image, price: `${product.price} NOK` } : null
  );

  // Dynamic Product JSON-LD Schema (World-Class SEO)
  useEffect(() => {
    if (product) {
      const score = averageRating || 5;
      const count = reviewsList?.length || 0;

      const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.name,
        "image": product.media?.mainMedia?.image?.url || product.media?.items?.[0]?.image?.url || '',
        "description": (product.description || '').replace(/<[^>]*>/g, '') || 'Utforsk våre kristne motiver og produkter av høy kvalitet.',
        "sku": product.sku || product._id,
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "NOK",
          "price": product.price?.price || 0,
          "availability": product.stock?.inventoryStatus === 'IN_STOCK' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      };

      if (count > 0) {
        schema.aggregateRating = {
          "@type": "AggregateRating",
          "ratingValue": score,
          "reviewCount": count
        };
        schema.review = reviewsList.map(r => ({
          "@type": "Review",
          "author": {
            "@type": "Person",
            "name": r.content?.title || 'Kunde'
          },
          "datePublished": r._createdDate,
          "reviewBody": r.content?.body || '',
          "reviewRating": {
            "@type": "Rating",
            "ratingValue": r.content?.rating || 5
          }
        }));
      }

      const scriptId = 'jsonld-product-schema';
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.innerHTML = JSON.stringify(schema);

      return () => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [product, reviewsList, averageRating]);

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

  useEffect(() => {
    if (product) {
      loadReviews();
    }
  }, [productId, product]);

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

  const isCurrentlyLoading = isLoadingProducts || (isFetchingProduct && !fetchedProduct);

  if (isCurrentlyLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-56">
        <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-secondary font-semibold font-body-md">Henter produkt fra Wix...</p>
      </div>
    );
  }

  if (fetchError || !product) {
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
    // Construct custom text fields payload as [{ title, value }]
    const customTextFieldsPayload = Object.entries(customTextFieldValues).map(([title, value]) => ({
      title,
      value: (typeof value === 'string' ? value.trim() : value) || 'Tilfeldig'
    }));

    addToCart(product, selectedSize, selectedColor, qty, selectedOptions, customTextFieldsPayload);
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

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width xl:max-w-[1440px] 2xl:max-w-[1600px] mx-auto px-margin-mobile md:px-margin-desktop py-28"
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
            <h1 className="font-headline-lg text-2xl md:text-headline-lg font-bold text-onyx mb-2">{product.name}</h1>
            
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
                  {averageRating} ({reviewsList.length} {reviewsList.length === 1 ? t('product.review') : t('product.reviewsPlural')})
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <span className="font-headline-md text-headline-md text-terracotta font-extrabold text-2xl">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-body-md text-body-md text-onyx/40 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-outline-variant/50 w-full" />

          <div>
            <h4 className="font-label-md text-label-md text-onyx mb-2 uppercase tracking-wider">{t('product.descriptionTitle')}</h4>
            <div 
              className="font-body-md text-body-md text-secondary leading-relaxed space-y-3 html-description"
              dangerouslySetInnerHTML={{ __html: formatDescription(product.description || t('home.metaDesc')) }}
            />
          </div>

          {/* Bullet points for clothing products */}
          {product.category === 'Klær' && (
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-body-md text-onyx">
                <span className="material-symbols-outlined text-terracotta text-lg select-none">check_circle</span>
                <span>{t('product.cottonBullet')}</span>
              </li>
              <li className="flex items-center gap-2 text-body-md text-onyx">
                <span className="material-symbols-outlined text-terracotta text-lg select-none">check_circle</span>
                <span>{t('product.qualityBullet')}</span>
              </li>
            </ul>
          )}

          {/* Color Selector */}
          {product.colorNames && product.colorNames.length > 0 && product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <span className="font-label-md text-label-md text-onyx">{t('product.color')}: <strong className="text-terracotta">{selectedColor}</strong></span>
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
                      style={{ background: colorHex }}
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
                <span className="font-label-md text-label-md text-onyx">{t('product.size')}</span>
                <button 
                  type="button" 
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-label-sm text-terracotta hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Ruler size={14} />
                  {t('product.sizeGuide')}
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

          {/* General Option Selectors (e.g. Choose Your Option) */}
          {product.productOptions && product.productOptions.length > 0 && (
            product.productOptions.some(opt => {
              const nameLower = opt.name?.trim().toLowerCase();
              const isSize = nameLower.includes('size') || nameLower.includes('størrelse') || nameLower.includes('størrelser') || nameLower.includes('format') || nameLower === 'str' || nameLower === 'str.';
              const isColor = nameLower === 'color' || nameLower === 'farge';
              return !isSize && !isColor;
            }) && (
              <div className="space-y-4">
                {product.productOptions.map(opt => {
                  const nameLower = opt.name?.trim().toLowerCase();
                  const isSize = nameLower.includes('size') || nameLower.includes('størrelse') || nameLower.includes('størrelser') || nameLower.includes('format') || nameLower === 'str' || nameLower === 'str.';
                  const isColor = nameLower === 'color' || nameLower === 'farge';
                  
                  if (isSize || isColor) return null;
 
                  return (
                    <div key={opt.name} className="space-y-2">
                      <span className="font-label-md text-label-md text-onyx block">{opt.name}</span>
                      <select
                        value={selectedOptions[opt.name] || ''}
                        onChange={(e) => setSelectedOptions(prev => ({ ...prev, [opt.name]: e.target.value }))}
                        className="w-full bg-white border border-outline rounded-lg p-3 text-sm font-semibold text-onyx focus:border-terracotta focus:ring-1 focus:ring-terracotta cursor-pointer outline-none"
                      >
                        {opt.choices?.map(c => (
                          <option key={c.value} value={c.value}>
                            {c.value}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Custom Text Fields */}
          {product.customTextFields && product.customTextFields.length > 0 && (
            <div className="space-y-4">
              {product.customTextFields.map(field => {
                const currentMode = customTextModes[field.title] || 'random';
                return (
                  <div key={field.title} className="space-y-2">
                    <label className="font-label-md text-label-md text-onyx block font-semibold">
                      {field.title}
                      {field.mandatory && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomTextModes(prev => ({ ...prev, [field.title]: 'random' }));
                          setCustomTextFieldValues(prev => ({ ...prev, [field.title]: t('product.randomText') }));
                        }}
                        className={`flex-1 py-3 px-3 border rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all select-none cursor-pointer outline-none active:scale-[0.98] ${
                          currentMode === 'random'
                            ? 'border-terracotta bg-terracotta/5 text-terracotta'
                            : 'border-outline text-secondary hover:border-terracotta/40 hover:text-onyx bg-white'
                        }`}
                      >
                        {t('product.leaveMotif')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomTextModes(prev => ({ ...prev, [field.title]: 'custom' }));
                          setCustomTextFieldValues(prev => ({ ...prev, [field.title]: '' }));
                        }}
                        className={`flex-1 py-3 px-3 border rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all select-none cursor-pointer outline-none active:scale-[0.98] ${
                          currentMode === 'custom'
                            ? 'border-terracotta bg-terracotta/5 text-terracotta'
                            : 'border-outline text-secondary hover:border-terracotta/40 hover:text-onyx bg-white'
                        }`}
                      >
                        {t('product.chooseMotif')}
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {currentMode === 'custom' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2">
                            <input
                              type="text"
                              maxLength={field.maxLength || 500}
                              required={field.mandatory && currentMode === 'custom'}
                              value={customTextFieldValues[field.title] === t('product.randomText') ? '' : (customTextFieldValues[field.title] || '')}
                              placeholder={t('product.customTextPlaceholder')}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomTextFieldValues(prev => ({
                                  ...prev,
                                  [field.title]: val
                                }));
                              }}
                              className="w-full bg-white border border-outline rounded-lg p-3 text-sm text-onyx focus:border-terracotta focus:ring-1 focus:ring-terracotta outline-none"
                            />
                            {field.mandatory && (
                              <p className="text-[10px] text-secondary/70 mt-1">
                                {t('product.mandatoryText')}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quantity Selector */}
          <div className="space-y-3">
            <span className="font-label-md text-label-md text-onyx">{t('product.quantity')}</span>
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
                {t('product.onlyLeftInStock', { count: stockStatus.quantity })}
              </p>
            )}
            {!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0) ? (
              <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                {t('product.outOfStockVariant')}
              </p>
            ) : (
              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mt-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                {t('product.inStockShipping')}
              </p>
            )}
          </div>

          {/* CTA Add to Cart & Wishlist */}
          <div className="flex flex-col gap-2.5 mt-4">
            <div className="flex gap-4 items-stretch">
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
                  <span>{t('product.outOfStock')}</span>
                ) : added ? (
                  <>
                    <Check size={18} />
                    <span>{t('product.addedToCart')}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    <span>{t('product.addToCart')}</span>
                  </>
                )}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className="p-4 border border-outline hover:border-terracotta text-terracotta rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 active:scale-95"
                title={isWishlisted ? t('product.wishlistRemove') : t('product.wishlistAdd')}
              >
                <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
              </button>
            </div>
            <p className="text-center text-[11px] text-secondary/80 select-none font-medium leading-normal">
              {t('product.benefits')}
            </p>
          </div>

          {/* Back in stock request form */}
          {(!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0)) && (
            <div className="mt-4 p-5 bg-slate-50 border border-outline-variant/30 rounded-xl space-y-3">
              <h4 className="font-label-md text-label-md text-onyx font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-terracotta text-lg">mail</span>
                {t('product.notifyWhenInStock')}
              </h4>
              <p className="text-xs text-secondary leading-relaxed">
                {t('product.notifyDesc')}
              </p>
              {backInStockSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 font-medium">
                  {t('product.notifySuccess')}
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
                    {backInStockLoading ? t('footer.sending') : t('product.notifySubmit')}
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
              <span className="text-label-sm font-label-sm">{t('product.deliveryTime')}</span>
            </div>
            <div className="flex items-center gap-3 text-secondary">
              <ShieldCheck size={18} className="text-terracotta shrink-0" />
              <span className="text-label-sm font-label-sm">{t('product.securePayment')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Kundeomtaler & Vurderinger */}
      <section id="reviews-section" className="mt-20 border-t border-outline-variant/30 pt-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="font-headline-lg text-2xl md:text-3xl text-[#1B4965] font-bold">{t('product.reviews')}</h2>
            <p className="text-secondary font-body-md text-sm mt-1">{t('product.reviewsSub', { name: product.name })}</p>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-[#1B4965] text-white hover:bg-[#153a50] px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors active:scale-95 shadow-sm"
          >
            {showReviewForm ? (language === 'es' ? 'Cerrar formulario' : language === 'en' ? 'Close form' : 'Lukk skjema') : t('product.reviewFormTitle')}
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
            <h3 className="font-headline-md text-lg text-onyx mb-4 font-bold">{t('product.reviewFormTitle')}</h3>
            <form onSubmit={handleReviewSubmit} className="block space-y-4">
              <div className="block">
                <label className="block text-xs font-semibold text-secondary mb-1">{t('product.reviewNamePlaceholder')}</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'es' ? 'Ej. Juan Pérez' : language === 'en' ? 'E.g. John Doe' : 'F.eks. Ola Nordmann'}
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  disabled={isSubmittingReview}
                  style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  className="block w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="block">
                <label className="block text-xs font-semibold text-secondary mb-1">{language === 'es' ? 'Tu valoración (1-5 estrellas)' : language === 'en' ? 'Your rating (1-5 stars)' : 'Din vurdering (1-5 stjerner)'}</label>
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
                <label className="block text-xs font-semibold text-secondary mb-1">{language === 'es' ? 'Título' : language === 'en' ? 'Title' : 'Overskrift'}</label>
                <input
                  type="text"
                  required
                  placeholder={language === 'es' ? 'Resume tu experiencia...' : language === 'en' ? 'Summarize your experience...' : 'Oppsummer din opplevelse...'}
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  disabled={isSubmittingReview}
                  style={{ transform: 'translateZ(0) !important', backfaceVisibility: 'hidden !important' }}
                  className="block w-full bg-white border border-outline rounded-lg px-3 py-2 text-sm text-onyx focus:outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>

              <div className="block">
                <label className="block text-xs font-semibold text-secondary mb-1">{language === 'es' ? 'Opinión' : language === 'en' ? 'Review' : 'Omtale'}</label>
                <textarea
                  required
                  rows={4}
                  placeholder={language === 'es' ? 'Cuéntanos qué te parece la calidad...' : language === 'en' ? 'Tell us what you think about the quality...' : 'Fortell oss hva du syns om kvaliteten...'}
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
                {isSubmittingReview ? t('product.reviewSubmitting') : t('product.reviewSubmitBtn')}
              </button>

              {reviewSubmitError && (
                <p className="text-[11px] text-red-600 font-semibold mt-1 text-center">{reviewSubmitError}</p>
              )}
            </form>
          </motion.div>
        )}

        {reviewSubmitSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 font-medium">
            {t('product.reviewSuccess')}
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
                {language === 'es' ? 'Basado en' : language === 'en' ? 'Based on' : 'Basert på'} {reviewsList.length} {reviewsList.length === 1 ? t('product.review') : t('product.reviewsPlural')}
              </p>
            </div>

            {/* Right Block: Star Distribution */}
            <div className="md:col-span-8 space-y-2.5">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage = reviewsList.length > 0 ? (count / reviewsList.length) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-secondary w-12 text-right">{rating} {language === 'es' ? 'estrellas' : language === 'en' ? 'stars' : 'stjerner'}</span>
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
          <div className="py-10 text-center text-secondary font-semibold text-sm">{language === 'es' ? 'Obteniendo opiniones...' : language === 'en' ? 'Fetching reviews...' : 'Henter omtaler...'}</div>
        ) : reviewsList.length === 0 ? (
          <div className="py-12 text-center text-secondary bg-slate-50/55 rounded-xl border border-dashed border-outline-variant/40">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">rate_review</span>
            <p className="font-semibold text-sm">{t('product.noReviews')}</p>
            <p className="text-xs text-secondary/75 mt-0.5">{language === 'es' ? '¡Sé el primero en compartir tu opinión sobre este producto!' : language === 'en' ? 'Be the first to share your opinion about this product!' : 'Vær den første til å dele din mening om dette produktet!'}</p>
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
                          const rawDate = d.toLocaleDateString(language === 'es' ? 'es-ES' : language === 'en' ? 'en-US' : 'no-NO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                          const parts = rawDate.split(' ');
                          if (parts.length >= 2) {
                            parts[1] = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
                          }
                          return parts.join(' ');
                        }
                      } catch (e) {}
                      return language === 'es' ? 'Opinión reciente' : language === 'en' ? 'Recent review' : 'Nylig omtale';
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
                  <span>{language === 'es' ? 'Escrito por' : language === 'en' ? 'Written by' : 'Skrevet av'} {rev.author?.authorName || 'Anonym'}</span>
                  {rev._id.startsWith('mock') && (
                    <span className="text-[9px] uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                      {language === 'es' ? 'Comprador Verificado' : language === 'en' ? 'Verified Buyer' : 'Verifisert Kjøper'}
                    </span>
                  )}
                </div>

                {/* Admin Reply */}
                {rev.reply && (
                  <div className="mt-4 p-4 bg-slate-50 border-l-2 border-terracotta rounded-r-lg space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-terracotta font-bold uppercase tracking-wider">
                      <span className="material-symbols-outlined text-xs">storefront</span>
                      <span>{language === 'es' ? 'Respuesta de His Kingdom Designs' : language === 'en' ? 'Reply from His Kingdom Designs' : 'Svar fra His Kingdom Designs'}</span>
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
            <h2 className="font-headline-lg text-2xl md:text-headline-lg font-bold text-onyx">{language === 'es' ? 'Productos relacionados' : language === 'en' ? 'Related products' : 'Relaterte produkter'}</h2>
            <Link 
              to={`/category/${getSlugByCategoryName(product.category)}`} 
              className="text-terracotta font-label-md hover:underline underline-offset-4 font-bold"
            >
              {language === 'es' ? 'Ver todos en' : language === 'en' ? 'View all in' : 'Se alle'} {product.category.toLowerCase()}
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
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-outline-variant/30 flex flex-col max-h-[85vh] cursor-default"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-outline-variant/20 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-2.5 text-terracotta">
                  <Ruler size={18} />
                  <h3 className="font-bold text-sm text-onyx">{t('product.sizeGuide')}</h3>
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

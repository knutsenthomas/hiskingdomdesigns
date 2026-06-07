import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Check, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

export default function ProductDetails() {
  const { products, isLoadingProducts } = useApp();
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
        <Link to={`/category/${product.category}`} className="hover:text-terracotta transition-colors">{product.category}</Link>
        <ChevronRight size={14} className="text-secondary/60" />
        <span className="text-onyx font-bold line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery Column */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm aspect-square md:aspect-[4/5] flex items-center justify-center p-8 border border-outline-variant/35">
            <img 
              alt={product.name} 
              className="max-w-full max-h-full object-contain rounded-lg hover:scale-105 transition-transform duration-500" 
              src={product.image}
            />
          </div>
          {/* Thumbnails (for visual complete design look) */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="w-20 h-20 bg-white rounded-lg border-2 border-terracotta p-1.5 flex-shrink-0 cursor-pointer shadow-sm">
              <img alt="Thumbnail" className="w-full h-full object-contain rounded" src={product.image} />
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div>
            <span className="text-terracotta font-label-sm text-label-sm uppercase tracking-widest font-semibold block mb-1">
              {product.category} {product.gender && `• ${product.gender}`}
            </span>
            <h1 className="font-headline-lg text-2xl md:text-headline-lg text-onyx mb-2">{product.name}</h1>
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
                <button className="text-label-sm text-terracotta hover:underline">Størrelsesguide</button>
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

          {/* CTA Add to Cart */}
          <button 
            onClick={handleAddToCart}
            disabled={!stockStatus.inStock || (stockStatus.trackQuantity && stockStatus.quantity === 0)}
            className={`w-full font-bold py-4 rounded-xl transition-all shadow-md mt-4 flex items-center justify-center gap-2 text-md ${
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

      {/* Section: Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-section-gap border-t border-outline-variant/30 pt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-2">
            <h2 className="font-headline-lg text-2xl md:text-headline-lg text-onyx">Relaterte produkter</h2>
            <Link 
              to={`/category/${product.category}`} 
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
    </motion.main>
  );
}

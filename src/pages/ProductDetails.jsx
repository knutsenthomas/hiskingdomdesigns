import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ShoppingCart, Check, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';

export default function ProductDetails() {
  const { products } = useApp();
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

  if (!product) {
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
                      className={`h-12 border rounded-lg font-label-md transition-all flex items-center justify-center ${
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
            <div className="flex items-center border border-outline rounded-lg w-max overflow-hidden">
              <button 
                onClick={() => setQty(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 hover:bg-slate-100 transition-colors font-bold text-lg"
              >
                -
              </button>
              <span className="px-6 py-2 border-x border-outline font-bold select-none text-center min-w-[50px]">
                {qty}
              </span>
              <button 
                onClick={() => setQty(prev => prev + 1)}
                className="px-4 py-2 hover:bg-slate-100 transition-colors font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* CTA Add to Cart */}
          <button 
            onClick={handleAddToCart}
            className="w-full bg-terracotta text-white font-bold py-4 rounded-xl hover:opacity-95 active:scale-[0.98] transition-all shadow-md mt-4 flex items-center justify-center gap-2 text-md"
          >
            {added ? (
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

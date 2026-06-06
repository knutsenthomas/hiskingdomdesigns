import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault(); // Stop navigation to details page
    e.stopPropagation();

    // Default values for quick add
    const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : 'M';
    const defaultColor = product.colorNames && product.colorNames.length > 0 ? product.colorNames[0] : 'Hvit';

    addToCart(product, defaultSize, defaultColor, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="group relative bg-white border border-outline-variant/50 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="block relative aspect-[0.92] overflow-hidden bg-parchment flex-shrink-0">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
          {product.isSale && (
            <span className="bg-sale-red text-white font-label-sm text-label-sm px-3 py-1 uppercase font-bold rounded">
              SALG
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-terracotta text-white font-label-sm text-label-sm px-3 py-1 uppercase font-bold rounded">
              BESTSELGER
            </span>
          )}
        </div>

        {/* Product Image */}
        <img 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          src={product.image}
          loading="lazy"
        />

        {/* Quick Add Button */}
        <button 
          onClick={handleQuickAdd}
          className={`absolute bottom-4 right-4 bg-white/95 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg hover:bg-terracotta hover:text-white ${
            added ? 'text-green-500' : 'text-terracotta'
          }`}
          title="Legg i handlekurv"
        >
          {added ? (
            <Check size={18} />
          ) : (
            <ShoppingCart size={18} />
          )}
        </button>
      </Link>

      {/* Info */}
      <div className="p-6 flex flex-col flex-grow justify-between">
        <div>
          <p className="font-label-sm text-label-sm text-terracotta mb-1 uppercase tracking-widest">
            {product.category} {product.gender && `• ${product.gender}`}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-base md:text-lg text-onyx mb-2 group-hover:text-terracotta transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="font-headline-md text-headline-md text-terracotta font-extrabold">
            {product.price} kr
          </span>
          {product.originalPrice && (
            <span className="font-body-md text-body-md text-onyx/40 line-through">
              {product.originalPrice} kr
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

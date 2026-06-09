import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useApp } from '@/contexts/AppContext';
import { getOptimizedWixImageUrl } from '@/lib/media';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useApp();
  const [added, setAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);

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
        {/* Wishlist Heart Button */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 z-10 bg-white/95 p-2 rounded-full shadow-md hover:bg-slate-50 transition-all text-terracotta flex items-center justify-center cursor-pointer"
          title={isWishlisted ? "Fjern fra ønskelisten" : "Legg i ønskelisten"}
        >
          <motion.div
            key={isWishlisted ? "wishlisted" : "not-wishlisted"}
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Heart 
              size={16} 
              fill={isWishlisted ? "currentColor" : "none"} 
              className={isWishlisted ? "text-terracotta fill-terracotta" : "text-terracotta/75 hover:text-terracotta"} 
            />
          </motion.div>
        </motion.button>

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
          src={getOptimizedWixImageUrl(product.image, 400, 400)}
          loading="lazy"
        />

        {/* Quick Add Button */}
        <button 
          onClick={handleQuickAdd}
          className={`absolute bottom-4 right-4 bg-white/95 p-3 rounded-full shadow-lg hover:bg-terracotta hover:text-white transition-all duration-300 ${
            added ? 'text-green-500' : 'text-terracotta'
          } lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 opacity-100 translate-y-0 cursor-pointer`}
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
      <div className="p-4 sm:p-6 flex flex-col flex-grow justify-between">
        <div>
          <p className="font-label-sm text-label-sm text-terracotta mb-1 uppercase tracking-widest">
            {product.category} {product.gender && `• ${product.gender}`}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-base md:text-lg text-onyx mb-2 group-hover:text-terracotta transition-colors line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mt-2">
          <span className="text-base sm:text-[18px] font-extrabold text-terracotta whitespace-nowrap">
            {Math.round(product.price)} kr
          </span>
          {product.originalPrice && (
            <span className="text-[13px] sm:text-sm text-onyx/40 line-through font-normal whitespace-nowrap">
              {Math.round(product.originalPrice)} kr
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

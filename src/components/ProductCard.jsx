import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Heart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getOptimizedWixImageUrl } from '@/lib/media';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useApp();
  const { t, translateProduct, formatPrice, localizedPath } = useLanguage();
  const [added, setAdded] = useState(false);
  const isWishlisted = isInWishlist(product.id);

  const translatedProduct = translateProduct(product);

  const handleQuickAdd = (e) => {
    e.preventDefault(); // Stop navigation to details page
    e.stopPropagation();

    // Default values for quick add
    const defaultSize = translatedProduct.sizes && translatedProduct.sizes.length > 0 ? translatedProduct.sizes[0] : 'M';
    const defaultColor = translatedProduct.colorNames && translatedProduct.colorNames.length > 0 ? translatedProduct.colorNames[0] : 'Hvit';

    addToCart(translatedProduct, defaultSize, defaultColor, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <article className="group relative bg-white border border-outline-variant/50 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden flex flex-col h-full">
      <Link to={localizedPath('/product/' + translatedProduct.id)} className="block relative aspect-[0.92] overflow-hidden bg-parchment flex-shrink-0">
        {/* Wishlist Heart Button */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(translatedProduct);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 z-10 bg-white/95 p-2 rounded-full shadow-md hover:bg-slate-50 transition-all text-terracotta flex items-center justify-center cursor-pointer"
          title={isWishlisted ? t('product.wishlistRemove') : t('product.wishlistAdd')}
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
          {translatedProduct.isSale && (
            <span className="bg-sale-red text-white font-label-sm text-label-sm px-3 py-1 uppercase font-bold rounded">
              {t('product.sale')}
            </span>
          )}
          {translatedProduct.isBestseller && (
            <span className="bg-terracotta text-white font-label-sm text-label-sm px-3 py-1 uppercase font-bold rounded">
              {t('product.bestseller')}
            </span>
          )}
        </div>

        {/* Product Image */}
        <img 
          alt={translatedProduct.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          src={getOptimizedWixImageUrl(translatedProduct.image, 400, 400)}
          loading="lazy"
        />

        {translatedProduct.images?.[1] && (
          <img 
            alt={`${translatedProduct.name} - sekundærbilde`} 
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
            src={getOptimizedWixImageUrl(translatedProduct.images[1], 400, 400)}
            loading="lazy"
          />
        )}

        {/* Quick Add Button */}
        <button 
          onClick={handleQuickAdd}
          className={`absolute bottom-4 right-4 bg-white/95 p-3 rounded-full shadow-lg hover:bg-terracotta hover:text-white transition-all duration-300 ${
            added ? 'text-green-500' : 'text-terracotta'
          } lg:opacity-0 lg:translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 opacity-100 translate-y-0 cursor-pointer`}
          title={t('product.addToCart')}
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
            {translatedProduct.category} {translatedProduct.gender && `• ${translatedProduct.gender}`}
          </p>
          <Link to={localizedPath('/product/' + translatedProduct.id)}>
            <h3 className="font-bold text-base md:text-lg text-onyx mb-2 group-hover:text-terracotta transition-colors line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
              {translatedProduct.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5 mt-2">
          <span className="text-base sm:text-[18px] font-extrabold text-terracotta whitespace-nowrap">
            {formatPrice(translatedProduct.price)}
          </span>
          {translatedProduct.originalPrice && (
            <span className="text-[13px] sm:text-sm text-onyx/40 line-through font-normal whitespace-nowrap">
              {formatPrice(translatedProduct.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

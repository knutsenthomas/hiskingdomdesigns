import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getOptimizedWixImageUrl } from "@/lib/media";
import {
  ChevronLeft,
  ChevronRight,
  Ruler,
  Check,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
} from "lucide-react";
import { PRODUCT_COLOR_ORDER_OVERRIDES, resolveColor } from "@/lib/colors";
import { formatDescription } from "../lib/formatDescription";
import CmsText from "@/components/CmsText";

export default function ProductPurchase({
  activeImage,
  activeOriginalPrice,
  activePrice,
  added,
  averageRating,
  backInStockEmail,
  backInStockError,
  backInStockLoading,
  backInStockSuccess,
  customTextFieldValues,
  customTextModes,
  formatPrice,
  getColorImageUrl,
  handleAddToCart,
  handleBackInStockSubmit,
  handleNextImage,
  handlePrevImage,
  imagesList,
  isWishlisted,
  language,
  product,
  qty,
  reviewsList,
  selectedColor,
  selectedOptions,
  selectedSize,
  setActiveImage,
  setBackInStockEmail,
  setCustomTextFieldValues,
  setCustomTextModes,
  setIsSizeGuideOpen,
  setLanguage,
  setQty,
  setSelectedColor,
  setSelectedOptions,
  setSelectedSize,
  setValidationErrors,
  stockStatus,
  t,
  toggleWishlist,
  validationErrors,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Gallery Column */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="relative group bg-white rounded-xl overflow-hidden shadow-sm aspect-square md:aspect-[4/5] max-h-[500px] md:max-h-[550px] lg:max-h-[600px] flex items-center justify-center p-8 border border-outline-variant/35">
          <motion.img
            key={activeImage || product.image}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            alt={product.name}
            className="max-w-full max-h-full object-contain rounded-lg hover:scale-[1.02] transition-transform duration-500"
            src={getOptimizedWixImageUrl(
              activeImage || product.image,
              600,
              750,
            )}
            width="600"
            height="750"
            fetchPriority="high"
          />

          {/* Image navigation arrows */}
          {imagesList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-onyx w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 active:scale-95 z-10"
                aria-label="Forrige bilde"
              >
                <ChevronLeft size={20} className="text-[#1B4965]" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-onyx w-10 h-10 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-105 active:scale-95 z-10"
                aria-label="Neste bilde"
              >
                <ChevronRight size={20} className="text-[#1B4965]" />
              </button>
            </>
          )}
        </div>
        {/* Thumbnails (for visual complete design look and active image switching) */}
        {imagesList && imagesList.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar select-none">
            {imagesList.map((imgUrl, idx) => {
              const isActive = (activeImage || product.image) === imgUrl;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveImage(imgUrl);
                    if (
                      product?.id &&
                      PRODUCT_COLOR_ORDER_OVERRIDES[product.id]
                    ) {
                      const override =
                        PRODUCT_COLOR_ORDER_OVERRIDES[product.id][idx];
                      if (override) {
                        setSelectedColor(override.name);
                        return;
                      }
                    }
                    if (product?.productOptions) {
                      const colorOpt = product.productOptions.find((o) => {
                        const name = o.name?.trim().toLowerCase();
                        return name === "color" || name === "farge";
                      });
                      if (colorOpt && colorOpt.choices) {
                        let matchedColor = null;
                        for (let i = 0; i < colorOpt.choices.length; i++) {
                          const c = colorOpt.choices[i];
                          const resolved = resolveColor(
                            c.value,
                            c.description || c.name,
                          );
                          const cImg = getColorImageUrl(
                            resolved.name,
                            selectedSize,
                          );
                          if (cImg === imgUrl) {
                            matchedColor = resolved.name;
                            break;
                          }
                        }
                        if (!matchedColor && product.images) {
                          const imgIdx = product.images.indexOf(imgUrl);
                          if (
                            imgIdx !== -1 &&
                            imgIdx < colorOpt.choices.length
                          ) {
                            const resolved = resolveColor(
                              colorOpt.choices[imgIdx].value,
                              colorOpt.choices[imgIdx].description ||
                                colorOpt.choices[imgIdx].name,
                            );
                            matchedColor = resolved.name;
                          }
                        }
                        if (matchedColor) {
                          setSelectedColor(matchedColor);
                        }
                      }
                    }
                  }}
                  onMouseEnter={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 rounded-lg p-1.5 flex-shrink-0 cursor-pointer shadow-sm border-2 transition-all outline-none ${
                    isActive
                      ? "border-terracotta bg-white scale-[1.02]"
                      : "border-outline-variant/50 hover:border-terracotta/40 bg-white"
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
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div>
          <span className="text-terracotta font-label-sm text-label-sm uppercase tracking-widest font-semibold block mb-1">
            {product.category} {product.gender && `• ${product.gender}`}
          </span>
          <h1 className="font-headline-lg text-2xl md:text-headline-lg font-bold text-onyx mb-2">
            {product.name}
          </h1>

          {/* Average Rating Stars shortcut */}
          {reviewsList.length > 0 && (
            <div
              onClick={() => {
                const element = document.getElementById("reviews-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex items-center gap-2 mb-3 cursor-pointer select-none group w-max"
            >
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-sm font-bold"
                    style={{
                      fontVariationSettings:
                        i < Math.round(averageRating)
                          ? "'FILL' 1, 'wght' 400"
                          : "'FILL' 0, 'wght' 400",
                    }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-xs text-secondary font-semibold group-hover:text-terracotta transition-colors">
                {averageRating} ({reviewsList.length}{" "}
                {reviewsList.length === 1
                  ? t("product.review")
                  : t("product.reviewsPlural")}
                )
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <span className="font-headline-md text-headline-md text-terracotta font-extrabold text-2xl">
              {formatPrice(activePrice)}
            </span>
            {activeOriginalPrice && (
              <span className="font-body-md text-body-md text-onyx/40 line-through">
                {formatPrice(activeOriginalPrice)}
              </span>
            )}
          </div>

          {product.isOceaniaExclusive && language !== "en" && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-onyx flex items-start gap-3 shadow-xs">
              <span className="material-symbols-outlined text-amber-600 text-xl shrink-0 mt-0.5 select-none">
                public_off
              </span>
              <div className="space-y-1">
                <p className="font-bold text-sm text-onyx">
                  {t("product.oceaniaExclusiveTitle")}
                </p>
                <p className="text-xs text-secondary leading-relaxed">
                  {t("product.oceaniaExclusiveDesc")}
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className="text-xs font-bold text-terracotta hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {t("product.oceaniaSwitchToEn")} &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-outline-variant/50 w-full" />

        <div>
          <h4 className="font-label-md text-label-md text-onyx mb-2 uppercase tracking-wider">
            {t("product.descriptionTitle")}
          </h4>
          <div
            className="font-body-md text-body-md text-secondary leading-relaxed space-y-3 html-description"
            dangerouslySetInnerHTML={{
              __html: formatDescription(
                product.description || t("home.metaDesc"),
                language,
              ),
            }}
          />
        </div>

        {/* Bullet points for clothing products */}
        {product.category === "Klær" && (
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-body-md text-onyx">
              <span className="material-symbols-outlined text-terracotta text-lg select-none">
                check_circle
              </span>
              <span>{t("product.cottonBullet")}</span>
            </li>
            <li className="flex items-center gap-2 text-body-md text-onyx">
              <span className="material-symbols-outlined text-terracotta text-lg select-none">
                check_circle
              </span>
              <span>{t("product.qualityBullet")}</span>
            </li>
          </ul>
        )}

        {/* Color Selector */}
        {product.colorNames &&
          product.colorNames.length > 0 &&
          product.colors &&
          product.colors.length > 0 && (
            <div className="space-y-3">
              <span className="font-label-md text-label-md text-onyx">
                <CmsText
                  slug="product-label-color"
                  fallback={t("product.color")}
                  as="span"
                />
                : <strong className="text-terracotta">{selectedColor}</strong>
              </span>
              <div className="flex gap-3">
                {product.colors.map((colorHex, idx) => {
                  const colorName = product.colorNames[idx];
                  const isSelected = selectedColor === colorName;
                  return (
                    <button
                      key={colorName}
                      onClick={() => {
                        setSelectedColor(colorName);
                        const imgUrl = getColorImageUrl(
                          colorName,
                          selectedSize,
                        );
                        if (imgUrl) {
                          setActiveImage(imgUrl);
                        }
                      }}
                      className={`w-8 h-8 rounded-full border ring-offset-2 transition-all ${
                        isSelected
                          ? "ring-2 ring-terracotta scale-105 shadow-md"
                          : "hover:ring-1 hover:ring-terracotta"
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
              <CmsText
                slug="product-label-size"
                fallback={t("product.size")}
                as="span"
                className="font-label-md text-label-md text-onyx"
              />
              {["Klær", "Bilder & Kunst", "Plakater"].includes(
                product.category,
              ) && (
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="text-label-sm text-terracotta hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Ruler size={14} />
                  <CmsText
                    slug="product-label-sizeguide"
                    fallback={t("product.sizeGuide")}
                    as="span"
                  />
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.sizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-h-12 py-2 px-1 border rounded-lg transition-all flex items-center justify-center text-center ${
                      size.length > 3
                        ? "text-[11px] leading-tight font-semibold"
                        : "font-label-md text-label-md"
                    } ${
                      isSelected
                        ? "border-terracotta bg-terracotta text-white font-bold"
                        : "border-outline text-onyx hover:border-terracotta hover:text-terracotta"
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
        {product.productOptions &&
          product.productOptions.length > 0 &&
          product.productOptions.some((opt) => {
            const nameLower = opt.name?.trim().toLowerCase();
            const isSize =
              nameLower.includes("size") ||
              nameLower.includes("størrelse") ||
              nameLower.includes("størrelser") ||
              nameLower.includes("format") ||
              nameLower === "str" ||
              nameLower === "str.";
            const isColor = nameLower === "color" || nameLower === "farge";
            return !isSize && !isColor;
          }) && (
            <div className="space-y-4">
              {product.productOptions.map((opt) => {
                const nameLower = opt.name?.trim().toLowerCase();
                const isSize =
                  nameLower.includes("size") ||
                  nameLower.includes("størrelse") ||
                  nameLower.includes("størrelser") ||
                  nameLower.includes("format") ||
                  nameLower === "str" ||
                  nameLower === "str.";
                const isColor = nameLower === "color" || nameLower === "farge";

                if (isSize || isColor) return null;

                return (
                  <div key={opt.name} className="space-y-2">
                    <span className="font-label-md text-label-md text-onyx block">
                      {opt.name}
                    </span>
                    <select
                      value={selectedOptions[opt.name] || ""}
                      onChange={(e) =>
                        setSelectedOptions((prev) => ({
                          ...prev,
                          [opt.name]: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-outline rounded-lg p-3 text-sm font-semibold text-onyx focus:border-terracotta focus:ring-1 focus:ring-terracotta cursor-pointer outline-none"
                    >
                      {opt.choices?.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.value}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}

        {/* Custom Text Fields */}
        {product.customTextFields && product.customTextFields.length > 0 && (
          <div className="space-y-4">
            {product.customTextFields.map((field) => {
              const currentMode = customTextModes[field.title] || "random";
              const isGiftCard =
                product.name?.toLowerCase().includes("gavekort") ||
                product.name?.toLowerCase().includes("gift card") ||
                product.category === "Gavekort";
              const lowerTitle = field.title.toLowerCase();
              const isMotifField =
                !isGiftCard &&
                (lowerTitle.includes("tekst") ||
                  lowerTitle.includes("vers") ||
                  lowerTitle.includes("motiv") ||
                  lowerTitle.includes("skriftsted") ||
                  lowerTitle.includes("bibel"));

              if (!isMotifField) {
                // Direct input field for gift cards and standard custom text properties (email, name, greetings, etc.)
                return (
                  <div key={field.title} className="space-y-2">
                    <label className="font-label-md text-label-md text-onyx block font-semibold">
                      {field.title}
                      {field.mandatory && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      maxLength={field.maxLength || 500}
                      required={field.mandatory}
                      value={customTextFieldValues[field.title] || ""}
                      placeholder={field.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomTextFieldValues((prev) => ({
                          ...prev,
                          [field.title]: val,
                        }));
                        if (val.trim()) {
                          setValidationErrors((prev) => {
                            const next = { ...prev };
                            delete next[field.title];
                            return next;
                          });
                        }
                      }}
                      className={`w-full bg-white border rounded-lg p-3 text-sm text-onyx focus:ring-1 outline-none transition-all ${
                        validationErrors[field.title]
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                          : "border-outline focus:border-terracotta focus:ring-terracotta"
                      }`}
                    />
                    {validationErrors[field.title] && (
                      <p
                        id={`field-err-${field.title}`}
                        className="text-xs text-red-500 font-semibold mt-1"
                      >
                        {validationErrors[field.title]}
                      </p>
                    )}
                  </div>
                );
              }

              // Motif field (e.g. customized poster or clothing with random/custom toggle buttons)
              return (
                <div key={field.title} className="space-y-2">
                  <label className="font-label-md text-label-md text-onyx block font-semibold">
                    {field.title}
                    {field.mandatory && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTextModes((prev) => ({
                          ...prev,
                          [field.title]: "random",
                        }));
                        setCustomTextFieldValues((prev) => ({
                          ...prev,
                          [field.title]: t("product.randomText"),
                        }));
                        setValidationErrors((prev) => {
                          const next = { ...prev };
                          delete next[field.title];
                          return next;
                        });
                      }}
                      className={`flex-1 py-3 px-3 border rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all select-none cursor-pointer outline-none active:scale-[0.98] ${
                        currentMode === "random"
                          ? "border-terracotta bg-terracotta/5 text-terracotta"
                          : "border-outline text-secondary hover:border-terracotta/40 hover:text-onyx bg-white"
                      }`}
                    >
                      {t("product.leaveMotif")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTextModes((prev) => ({
                          ...prev,
                          [field.title]: "custom",
                        }));
                        setCustomTextFieldValues((prev) => ({
                          ...prev,
                          [field.title]: "",
                        }));
                      }}
                      className={`flex-1 py-3 px-3 border rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all select-none cursor-pointer outline-none active:scale-[0.98] ${
                        currentMode === "custom"
                          ? "border-terracotta bg-terracotta/5 text-terracotta"
                          : "border-outline text-secondary hover:border-terracotta/40 hover:text-onyx bg-white"
                      }`}
                    >
                      {t("product.chooseMotif")}
                    </button>
                  </div>

                  <AnimatePresence initial={false}>
                    {currentMode === "custom" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pt-2">
                          <input
                            type="text"
                            maxLength={field.maxLength || 500}
                            required={
                              field.mandatory && currentMode === "custom"
                            }
                            value={
                              customTextFieldValues[field.title] ===
                              t("product.randomText")
                                ? ""
                                : customTextFieldValues[field.title] || ""
                            }
                            placeholder={t("product.customTextPlaceholder")}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCustomTextFieldValues((prev) => ({
                                ...prev,
                                [field.title]: val,
                              }));
                              if (val.trim()) {
                                setValidationErrors((prev) => {
                                  const next = { ...prev };
                                  delete next[field.title];
                                  return next;
                                });
                              }
                            }}
                            className={`w-full bg-white border rounded-lg p-3 text-sm text-onyx focus:ring-1 outline-none transition-all ${
                              validationErrors[field.title]
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/10"
                                : "border-outline focus:border-terracotta focus:ring-terracotta"
                            }`}
                          />
                          {validationErrors[field.title] ? (
                            <p
                              id={`field-err-${field.title}`}
                              className="text-xs text-red-500 font-semibold mt-1"
                            >
                              {validationErrors[field.title]}
                            </p>
                          ) : (
                            field.mandatory && (
                              <p className="text-[10px] text-secondary/70 mt-1">
                                {t("product.mandatoryText")}
                              </p>
                            )
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
          <CmsText
            slug="product-label-quantity"
            fallback={t("product.quantity")}
            as="span"
            className="font-label-md text-label-md text-onyx"
          />
          <div className="flex items-center border border-outline rounded-lg w-max overflow-hidden bg-white">
            <button
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              disabled={
                !stockStatus.inStock ||
                (stockStatus.trackQuantity && stockStatus.quantity === 0)
              }
              className="px-4 py-2 hover:bg-slate-100 transition-colors font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              -
            </button>
            <span className="px-6 py-2 border-x border-outline font-bold select-none text-center min-w-[50px]">
              {!stockStatus.inStock ||
              (stockStatus.trackQuantity && stockStatus.quantity === 0)
                ? 0
                : qty}
            </span>
            <button
              onClick={() =>
                setQty((prev) =>
                  stockStatus.trackQuantity && prev >= stockStatus.quantity
                    ? prev
                    : prev + 1,
                )
              }
              disabled={
                !stockStatus.inStock ||
                (stockStatus.trackQuantity &&
                  (stockStatus.quantity === 0 || qty >= stockStatus.quantity))
              }
              className="px-4 py-2 hover:bg-slate-100 transition-colors font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          {/* Real Stock Indicators */}
          {stockStatus.trackQuantity &&
            stockStatus.quantity > 0 &&
            stockStatus.quantity <= 5 && (
              <p className="text-xs font-semibold text-orange-600 flex items-center gap-1.5 mt-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse"></span>
                {t("product.onlyLeftInStock", { count: stockStatus.quantity })}
              </p>
            )}
          {!stockStatus.inStock ||
          (stockStatus.trackQuantity && stockStatus.quantity === 0) ? (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1.5 mt-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              {t("product.outOfStockVariant")}
            </p>
          ) : (
            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 mt-1 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              {t("product.inStockShipping")}
            </p>
          )}
        </div>

        {/* CTA Add to Cart & Wishlist */}
        <div className="flex flex-col gap-2.5 mt-4">
          <div className="flex gap-4 items-stretch">
            <button
              onClick={handleAddToCart}
              disabled={
                !stockStatus.inStock ||
                (stockStatus.trackQuantity && stockStatus.quantity === 0)
              }
              className={`flex-grow font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-md ${
                !stockStatus.inStock ||
                (stockStatus.trackQuantity && stockStatus.quantity === 0)
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-terracotta text-white hover:opacity-95 active:scale-[0.98]"
              }`}
            >
              {!stockStatus.inStock ||
              (stockStatus.trackQuantity && stockStatus.quantity === 0) ? (
                <CmsText
                  slug="product-btn-outofstock"
                  fallback={t("product.outOfStock")}
                  as="span"
                />
              ) : added ? (
                <>
                  <Check size={18} />
                  <CmsText
                    slug="product-btn-added"
                    fallback={t("product.addedToCart")}
                    as="span"
                  />
                </>
              ) : (
                <>
                  <ShoppingCart size={18} />
                  <CmsText
                    slug="product-btn-addtocart"
                    fallback={t("product.addToCart")}
                    as="span"
                  />
                </>
              )}
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="p-4 border border-outline hover:border-terracotta text-terracotta rounded-xl shadow-sm hover:bg-slate-50 transition-all flex items-center justify-center shrink-0 active:scale-95"
              title={
                isWishlisted
                  ? t("product.wishlistRemove")
                  : t("product.wishlistAdd")
              }
            >
              <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
            </button>
          </div>
          <CmsText
            slug="product-benefits-note"
            fallback={t("product.benefits")}
            as="p"
            className="text-center text-[11px] text-secondary/80 select-none font-medium leading-normal"
          />
        </div>

        {/* Back in stock request form */}
        {(!stockStatus.inStock ||
          (stockStatus.trackQuantity && stockStatus.quantity === 0)) && (
          <div className="mt-4 p-5 bg-slate-50 border border-outline-variant/30 rounded-xl space-y-3">
            <h4 className="font-label-md text-label-md text-onyx font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-terracotta text-lg">
                mail
              </span>
              {t("product.notifyWhenInStock")}
            </h4>
            <p className="text-xs text-secondary leading-relaxed">
              {t("product.notifyDesc")}
            </p>
            {backInStockSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 text-xs p-3 rounded-lg border border-emerald-200 font-medium">
                {t("product.notifySuccess")}
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
                  {backInStockLoading
                    ? t("footer.sending")
                    : t("product.notifySubmit")}
                </button>
              </form>
            )}
            {backInStockError && (
              <p className="text-[11px] text-red-600 font-medium mt-1">
                {backInStockError}
              </p>
            )}
          </div>
        )}

        {/* Shipping / Trust details */}
        <div className="bg-white/50 p-4 rounded-lg border border-outline-variant/30 space-y-3 shadow-sm">
          <div className="flex items-center gap-3 text-secondary">
            <Truck size={18} className="text-terracotta shrink-0" />
            <CmsText
              slug="product-delivery-time-note"
              fallback={t("product.deliveryTime")}
              as="span"
              className="text-label-sm font-label-sm"
            />
          </div>
          <div className="flex items-center gap-3 text-secondary">
            <ShieldCheck size={18} className="text-terracotta shrink-0" />
            <CmsText
              slug="product-secure-payment-note"
              fallback={t("product.securePayment")}
              as="span"
              className="text-label-sm font-label-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

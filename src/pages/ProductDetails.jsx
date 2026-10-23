import ProductPurchase from "../features/product/panels/ProductPurchase";
import ProductReviews from "../features/product/panels/ProductReviews";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApp, isProductOceaniaExclusive } from "@/contexts/AppContext";
import { useCart } from "@/contexts/CartContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { resolveColor, PRODUCT_COLOR_ORDER_OVERRIDES } from "@/lib/colors";
import { PRODUCT_COLOR_IMAGE_OVERRIDES } from "../features/product/lib/PRODUCT_COLOR_IMAGE_OVERRIDES";
import { wixClient } from "@/lib/wix";
import { getOptimizedWixImageUrl } from "@/lib/media";
import useMeta from "@/hooks/useMeta";
import { buildProductSchema } from "@/lib/productSeo";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Ruler,
  Check,
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  X,
} from "lucide-react";
import { formatDescription } from "../features/product/lib/formatDescription";
import CmsText from "@/components/CmsText";
import ProductCard from "@/components/ProductCard";
import { SizeGuideContent } from "../features/product/components/SizeGuideContent";

export default function ProductDetails() {
  const {
    t,
    translateProduct,
    language,
    setLanguage,
    formatPrice,
    localizedPath,
  } = useLanguage();
  const {
    products,
    isLoadingProducts,
    toggleWishlist,
    isInWishlist,
    getSlugByCategoryName,
  } = useApp();
  const { addToCart } = useCart();
  const { productId } = useParams();
  const navigate = useNavigate();

  // --- 1. State Declarations ---
  const [fetchedProduct, setFetchedProduct] = useState(null);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Hvit");
  const [qty, setQty] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [customTextFieldValues, setCustomTextFieldValues] = useState({});
  const [customTextModes, setCustomTextModes] = useState({});
  const [added, setAdded] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [activeImage, setActiveImage] = useState(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Back in stock states
  const [backInStockEmail, setBackInStockEmail] = useState("");
  const [backInStockSuccess, setBackInStockSuccess] = useState(false);
  const [backInStockLoading, setBackInStockLoading] = useState(false);
  const [backInStockError, setBackInStockError] = useState("");

  // Reviews states
  const [reviewsList, setReviewsList] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Review form states
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState("");

  // --- 2. Memoized Derivations ---

  // Find product by id or slug from app context
  const contextProduct = useMemo(() => {
    return products.find((p) => p.id === productId || p.slug === productId);
  }, [products, productId]);

  // Use fetchedProduct if available (contains full options/variants), otherwise fallback to contextProduct
  const productRaw = fetchedProduct || contextProduct;
  const product = useMemo(() => {
    return translateProduct(productRaw);
  }, [productRaw, translateProduct]);

  // Find the selected variant matching selectedSize, selectedColor and any other selected options
  const selectedVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0)
      return null;

    const sizeOpt = product.productOptions?.find((o) => {
      const name = o.name?.trim().toLowerCase();
      return (
        name &&
        (name.includes("size") ||
          name.includes("størrelse") ||
          name.includes("størrelser") ||
          name.includes("format") ||
          name === "str" ||
          name === "str.")
      );
    });
    const colorOpt = product.productOptions?.find((o) => {
      const name = o.name?.trim().toLowerCase();
      return name && (name === "color" || name === "farge");
    });

    const sizeChoice = sizeOpt?.choices?.find(
      (c) => c.value === selectedSize || c.description === selectedSize,
    );
    const colorChoice = colorOpt?.choices?.find((c) => {
      const resolved = resolveColor(c.value, c.description || c.name);
      return resolved.name === selectedColor;
    });

    const targetChoices = { ...selectedOptions };
    if (sizeOpt && sizeChoice) targetChoices[sizeOpt.name] = sizeChoice.value;
    if (colorOpt && colorChoice)
      targetChoices[colorOpt.name] = colorChoice.value;

    // 1. Exact match on choices
    let match = product.variants.find((v) => {
      if (!v || !v.choices) return false;
      return Object.entries(v.choices).every(([optName, optVal]) => {
        return targetChoices[optName] === optVal;
      });
    });

    // 2. Fallback match resolving colors with resolveColor
    if (!match) {
      match = product.variants.find((v) => {
        if (!v || !v.choices) return false;
        return Object.entries(v.choices).every(([optName, optVal]) => {
          const lower = optName.toLowerCase();
          if (lower === "color" || lower === "farge") {
            const vResolved = resolveColor(optVal);
            const tResolved = resolveColor(
              targetChoices[optName] || selectedColor,
            );
            return vResolved.name === tResolved.name;
          }
          if (
            lower.includes("size") ||
            lower.includes("størrelse") ||
            lower === "str"
          ) {
            return (
              String(optVal).trim().toLowerCase() ===
              String(targetChoices[optName] || selectedSize)
                .trim()
                .toLowerCase()
            );
          }
          return targetChoices[optName] === optVal;
        });
      });
    }

    return match || product.variants[0] || null;
  }, [product, selectedSize, selectedColor, selectedOptions]);

  // Dynamic prices based on selected variant if present
  const activePrice = useMemo(() => {
    if (
      selectedVariant &&
      selectedVariant.variant?.priceData?.discountedPrice !== undefined
    ) {
      return selectedVariant.variant.priceData.discountedPrice;
    }
    return product ? product.price : 0;
  }, [selectedVariant, product]);

  const activeOriginalPrice = useMemo(() => {
    if (selectedVariant) {
      const price = selectedVariant.variant?.priceData?.price;
      const discPrice = selectedVariant.variant?.priceData?.discountedPrice;
      if (price !== undefined && discPrice !== undefined && price > discPrice) {
        return price;
      }
      return undefined;
    }
    return product ? product.originalPrice : undefined;
  }, [selectedVariant, product]);

  // Aggregate stock information from wix client structures
  const stockStatus = useMemo(() => {
    if (
      selectedVariant &&
      selectedVariant.stock &&
      typeof selectedVariant.stock.inStock === "boolean"
    ) {
      return {
        inStock: selectedVariant.stock.inStock,
        trackQuantity: selectedVariant.stock.trackQuantity || false,
        quantity: selectedVariant.stock.quantity ?? 999999,
      };
    }
    if (productRaw?.stock && typeof productRaw.stock.inStock === "boolean") {
      return {
        inStock: productRaw.stock.inStock,
        trackQuantity: productRaw.stock.trackQuantity || false,
        quantity: productRaw.stock.quantity ?? 999999,
      };
    }
    if (productRaw && typeof productRaw.inStock === "boolean") {
      return {
        inStock: productRaw.inStock,
        trackQuantity: false,
        quantity: 999999,
      };
    }
    return {
      inStock: true,
      trackQuantity: false,
      quantity: 999999,
    };
  }, [selectedVariant, productRaw]);

  // Related products (intelligent similarity ranking based on raw properties)
  const relatedProducts = useMemo(() => {
    if (!productRaw || !products || products.length === 0) return [];

    const getKeywords = (name) => {
      if (!name) return [];
      return name
        .toLowerCase()
        .replace(/[^a-z0-9æøå ]/g, " ")
        .split(/\s+/)
        .filter(
          (w) =>
            w.length > 2 &&
            ![
              "med",
              "paa",
              "for",
              "den",
              "det",
              "the",
              "and",
              "with",
              "pinn",
              "til",
            ].includes(w),
        );
    };

    const currentKeywords = getKeywords(productRaw.name);
    const currentSubcategories = productRaw.subcategories || [];

    const scored = products
      .filter(
        (p) =>
          p.id !== productRaw.id &&
          (language === "en" || !p.isOceaniaExclusive),
      ) // Exclude current product and regional exclusives on non-English store
      .map((p) => {
        let score = 0;

        // 1. Primary Category match (large boost)
        if (p.category === productRaw.category) {
          score += 100;
        }

        // 2. Subcategory (collection) overlap
        if (
          p.subcategories &&
          p.subcategories.length > 0 &&
          currentSubcategories.length > 0
        ) {
          const commonSubs = p.subcategories.filter((sub) =>
            currentSubcategories.includes(sub),
          );
          score += commonSubs.length * 50; // High score for matching collections (e.g. "Hatter /caps" or "Nøkkelring")
        }

        // 3. Name keyword overlap
        const pKeywords = getKeywords(p.name);
        if (pKeywords.length > 0 && currentKeywords.length > 0) {
          const commonKeywords = pKeywords.filter((w) =>
            currentKeywords.includes(w),
          );
          score += commonKeywords.length * 30; // Boost for design family (e.g. both having "Norge" or "Brodert")
        }

        // 4. Minor tie-breaker (bestsellers, sale)
        if (p.isBestseller) score += 5;
        if (p.isSale) score += 2;

        return { product: p, score };
      });

    // Sort by score descending and take top 3
    return scored
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product)
      .slice(0, 3);
  }, [productRaw, products, language]);

  // Helper to reliably find the mockup image URL for any specific color variant using Wix variant mediaId and options
  const getColorImageUrl = useMemo(() => {
    return (colorName, sizeValue) => {
      if (!product || !colorName) return null;

      // 0. Check explicit exact override
      if (product.id && PRODUCT_COLOR_IMAGE_OVERRIDES[product.id]) {
        const overrides = PRODUCT_COLOR_IMAGE_OVERRIDES[product.id];
        const match = overrides[colorName.toLowerCase()];
        if (match) return match;
      }

      const colorOpt = product.productOptions?.find((o) => {
        const name = o.name?.trim().toLowerCase();
        return name === "color" || name === "farge";
      });

      const sizeOpt = product.productOptions?.find((o) => {
        const name = o.name?.trim().toLowerCase();
        return (
          name &&
          (name.includes("size") ||
            name.includes("størrelse") ||
            name.includes("størrelser") ||
            name.includes("format") ||
            name === "str" ||
            name === "str.")
        );
      });

      const activeSize = sizeValue || selectedSize;
      const sizeChoice = sizeOpt?.choices?.find(
        (c) => c.value === activeSize || c.description === activeSize,
      );
      const colorChoice = colorOpt?.choices?.find((c) => {
        const resolved = resolveColor(c.value, c.description || c.name);
        return resolved.name.toLowerCase() === colorName.toLowerCase();
      });

      // 1. Direct mediaId lookup from Wix variants
      if (product.variants && product.variants.length > 0) {
        const matchingVariant =
          product.variants.find((v) => {
            if (!v || !v.choices) return false;
            let colorMatch = false;
            let sizeMatch = true;
            Object.entries(v.choices).forEach(([optName, optVal]) => {
              const lower = optName.toLowerCase();
              if (lower === "color" || lower === "farge") {
                const vResolved = resolveColor(optVal);
                const targetResolved = resolveColor(colorName);
                if (vResolved.name === targetResolved.name) {
                  colorMatch = true;
                }
              } else if (
                lower.includes("size") ||
                lower.includes("størrelse") ||
                lower === "str"
              ) {
                if (
                  sizeChoice &&
                  optVal !== sizeChoice.value &&
                  optVal.toLowerCase() !== activeSize.toLowerCase()
                ) {
                  sizeMatch = false;
                }
              }
            });
            return colorMatch && sizeMatch;
          }) ||
          product.variants.find((v) => {
            if (!v || !v.choices) return false;
            return Object.entries(v.choices).some(([optName, optVal]) => {
              const lower = optName.toLowerCase();
              if (lower === "color" || lower === "farge") {
                const vResolved = resolveColor(optVal);
                const targetResolved = resolveColor(colorName);
                return vResolved.name === targetResolved.name;
              }
              return false;
            });
          });

        if (matchingVariant) {
          // Check mediaId from Wix variant
          const varMediaId =
            matchingVariant.mediaId ||
            matchingVariant.variant?.mediaId ||
            matchingVariant.media?.mainMedia?.id;
          if (varMediaId) {
            const allMediaItems =
              product.mediaItems ||
              product.media?.items ||
              productRaw?.media?.items ||
              [];
            const mediaMatch = allMediaItems.find(
              (mi) =>
                mi._id === varMediaId ||
                mi.id === varMediaId ||
                mi.image?.id === varMediaId,
            );
            if (mediaMatch?.image?.url) {
              return mediaMatch.image.url;
            }
          }
          if (matchingVariant.media?.mainMedia?.image?.url) {
            return matchingVariant.media.mainMedia.image.url;
          }
          if (matchingVariant.media?.items?.[0]?.image?.url) {
            return matchingVariant.media.items[0].image.url;
          }
        }
      }

      // 2. Direct media on color choice
      if (colorChoice) {
        if (colorChoice.media?.mainMedia?.image?.url) {
          return colorChoice.media.mainMedia.image.url;
        }
        if (colorChoice.media?.items?.[0]?.image?.url) {
          return colorChoice.media.items[0].image.url;
        }
        const choiceMediaId =
          colorChoice.media?.mainMedia?.id || colorChoice.mediaId;
        if (choiceMediaId) {
          const allMediaItems =
            product.mediaItems ||
            product.media?.items ||
            productRaw?.media?.items ||
            [];
          const mediaMatch = allMediaItems.find(
            (mi) =>
              mi._id === choiceMediaId ||
              mi.id === choiceMediaId ||
              mi.image?.id === choiceMediaId,
          );
          if (mediaMatch?.image?.url) {
            return mediaMatch.image.url;
          }
        }
      }

      // 3. Media on size choice (Printify / POD pattern)
      if (colorOpt && colorOpt.choices) {
        const colorIndex = colorOpt.choices.findIndex((c) => {
          const resolved = resolveColor(c.value, c.description || c.name);
          return resolved.name.toLowerCase() === colorName.toLowerCase();
        });

        if (colorIndex !== -1 && sizeOpt && sizeOpt.choices) {
          const currentSizeChoice = sizeChoice || sizeOpt.choices[0];
          if (currentSizeChoice?.media?.items?.[colorIndex]?.image?.url) {
            return currentSizeChoice.media.items[colorIndex].image.url;
          }
        }

        // 4. Fallback to product.images gallery matching index
        if (colorIndex !== -1 && product.images && product.images.length > 0) {
          if (product.images[colorIndex]) {
            return product.images[colorIndex];
          }
          return product.images[0];
        }
      }

      return product.image;
    };
  }, [product, selectedSize, productRaw]);

  const imagesList = useMemo(() => {
    if (!product) return [];

    // Check if product has explicit override for images and colors
    if (product.id && PRODUCT_COLOR_ORDER_OVERRIDES[product.id]) {
      return PRODUCT_COLOR_ORDER_OVERRIDES[product.id].map((c) => c.image);
    }

    const colorOpt = product.productOptions?.find((o) => {
      const name = o.name?.trim().toLowerCase();
      return name === "color" || name === "farge";
    });

    if (colorOpt && colorOpt.choices?.length > 0) {
      // 1. Build list of color-specific mockup images in the exact order of display colors
      const uniqueDisplayColors = [];
      const colorImages = [];
      colorOpt.choices.forEach((c) => {
        const resolved = resolveColor(c.value, c.description || c.name);
        if (!uniqueDisplayColors.includes(resolved.name)) {
          uniqueDisplayColors.push(resolved.name);
          const url = getColorImageUrl(resolved.name, selectedSize);
          if (url && !colorImages.includes(url)) {
            colorImages.push(url);
          }
        }
      });

      // 2. Identify all mockup URLs across all variants to filter them out of extra images
      const allMockupUrls = new Set(colorImages);
      const sizeOpt = product.productOptions?.find((o) => {
        const name = o.name?.trim().toLowerCase();
        return (
          name &&
          (name.includes("size") ||
            name.includes("størrelse") ||
            name.includes("størrelser") ||
            name.includes("format") ||
            name === "str" ||
            name === "str.")
        );
      });
      if (sizeOpt) {
        sizeOpt.choices?.forEach((sc) => {
          sc.media?.items?.forEach((item) => {
            if (item?.image?.url) {
              allMockupUrls.add(item.image.url);
            }
          });
        });
      }
      colorOpt.choices.forEach((cc) => {
        if (cc.media?.mainMedia?.image?.url) {
          allMockupUrls.add(cc.media.mainMedia.image.url);
        }
      });

      // 3. Find extra unique images in product.images that are not mockups
      const extraImages =
        product.images?.filter((url) => !allMockupUrls.has(url)) || [];

      // Combine color mockups first, then extra images
      const combined = [...colorImages, ...extraImages];
      return combined.length > 0
        ? combined
        : product.images?.length > 0
          ? product.images
          : [product.image];
    }

    return product.images && product.images.length > 0
      ? product.images
      : [product.image];
  }, [product, selectedSize, getColorImageUrl]);

  // Wishlist helper
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // --- 3. Helper Functions ---

  const loadReviews = async () => {
    setIsLoadingReviews(true);
    let apiReviews = [];
    try {
      const res = await wixClient.reviews
        .queryReviews()
        .eq("entityId", productId)
        .descending("_createdDate")
        .find();
      if (res && res.items) {
        apiReviews = res.items;
      }
    } catch (err) {
      console.warn("Wix Reviews API call failed. Using fallback reviews.", err);
    }

    // Load local storage reviews
    let localReviews = [];
    try {
      const saved = localStorage.getItem(`hkd-reviews-${productId}`);
      if (saved) {
        localReviews = JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse local reviews", e);
    }

    const allReviews = [...localReviews, ...apiReviews];
    setReviewsList(allReviews);

    // Calculate average and distribution
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce(
        (sum, r) => sum + (r.content?.rating || 5),
        0,
      );
      setAverageRating(
        parseFloat((totalRating / allReviews.length).toFixed(1)),
      );

      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      allReviews.forEach((r) => {
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
      const targetId = contextProduct?.id || productId;
      if (
        (!contextProduct ||
          !contextProduct.description ||
          !contextProduct.variants ||
          contextProduct.variants.length === 0) &&
        targetId
      ) {
        setIsFetchingProduct(true);
        setFetchError(false);
        try {
          console.log(
            `Fetching full details for product ${targetId} from Wix...`,
          );
          const res = await wixClient.products.getProduct(targetId);
          if (res && res.product) {
            const item = res.product;
            const nameLower = item.name?.toLowerCase() || "";

            const clothingRegex =
              /\b(genser|gensere|hettegenser|hettegensere|tskjorte|tskjorter|t-skjorte|t-skjorter|tee|tees|body|bodyer|babybody|babybodyer|babysuit|skjorte|skjorter|topp|topper|caps|lue|luer|beanie|beanies|sokker|bukse|bukser|pants|hoodie|hoodies|sweatshirt|sweatshirts|tights|jakke|jakker|smekke|smekker|bib)\b/i;
            const stickerRegex =
              /\b(klistremerke|klistremerker|sticker|stickers)\b/i;
            const posterRegex =
              /\b(plakat|plakater|poster|postere|kunsttrykk|bilde|bilder|canvas|matte paper|glossy paper|semi-glossy|wall art|veggkunst|digital plakat|digital poster)\b/i;

            let category = "Tilbehør";
            if (stickerRegex.test(nameLower)) {
              category = "Klistermerker";
            } else if (posterRegex.test(nameLower)) {
              category = "Plakater";
            } else if (clothingRegex.test(nameLower)) {
              category = "Klær";
            }

            let sizes = [];
            let colors = [];
            let colorNames = [];

            if (item.productOptions) {
              const sizeOpt = item.productOptions.find((o) => {
                const name = o.name?.trim().toLowerCase();
                return (
                  name &&
                  (name.includes("size") ||
                    name.includes("størrelse") ||
                    name.includes("størrelser") ||
                    name.includes("format") ||
                    name === "str" ||
                    name === "str.")
                );
              });
              if (sizeOpt) {
                const rawSizes = sizeOpt.choices?.map((c) => c.value) || [];
                sizes = rawSizes.filter((s) => {
                  if (!s) return false;
                  const isDimension =
                    s.includes("cm") ||
                    s.includes("″") ||
                    s.includes('"') ||
                    s.toLowerCase().includes("x");
                  if (s.length > 15 && !isDimension) return false;
                  const lower = s.toLowerCase();
                  if (
                    lower.includes("sticker") ||
                    lower.includes("mug") ||
                    lower.includes("kopp") ||
                    lower.includes("flaske") ||
                    lower.includes("valg") ||
                    lower.includes("option") ||
                    lower.includes("pega") ||
                    lower.includes("norsk") ||
                    lower.includes("english")
                  ) {
                    return false;
                  }
                  return true;
                });
              }

              const colorOpt = item.productOptions.find((o) => {
                const name = o.name?.trim().toLowerCase();
                return name === "color" || name === "farge";
              });
              if (colorOpt) {
                const resolved =
                  colorOpt.choices?.map((c) =>
                    resolveColor(c.value, c.description || c.name),
                  ) || [];
                colorNames = resolved.map((r) => r.name);
                colors = resolved.map((r) => r.hex);

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

              if (PRODUCT_COLOR_ORDER_OVERRIDES[item._id]) {
                colorNames = PRODUCT_COLOR_ORDER_OVERRIDES[item._id].map(
                  (c) => c.name,
                );
                colors = PRODUCT_COLOR_ORDER_OVERRIDES[item._id].map(
                  (c) => c.hex,
                );
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
            const isSale =
              price < originalPrice || item.discount?.type !== "NONE";

            const mapped = {
              id: item._id,
              name: item.name,
              price: price,
              originalPrice: isSale ? originalPrice : undefined,
              category: category,
              colors: colors,
              colorNames: colorNames,
              sizes: sizes,
              sku: item.sku || item._id,
              image:
                item.media?.mainMedia?.image?.url ||
                "https://via.placeholder.com/400",
              images:
                item.media?.items
                  ?.filter((mi) => mi.mediaType === "image")
                  .map((mi) => mi.image?.url)
                  .filter(Boolean) || [],
              media: item.media,
              mediaItems: item.media?.items || [],
              isBestseller: false,
              isSale: isSale,
              isOceaniaExclusive: isProductOceaniaExclusive(item),
              stock: item.stock,
              description: item.description || "",
              subcategories: [],
              productOptions: item.productOptions,
              manageVariants: item.manageVariants,
              variants: item.variants,
              customTextFields: item.customTextFields || [],
            };

            setFetchedProduct(mapped);
          } else {
            setFetchError(true);
          }
        } catch (err) {
          console.error(
            "Failed to fetch single product directly from Wix:",
            err,
          );
          setFetchError(true);
        } finally {
          setIsFetchingProduct(false);
        }
      }
    }
    fetchSingleProduct();
  }, [contextProduct, productId]);

  // Sync activeImage, default selectedColor and selectedSize when product loads/changes
  useEffect(() => {
    if (product) {
      if (product.image) {
        setActiveImage(product.image);
      }
      if (product.colorNames && product.colorNames.length > 0) {
        if (!selectedColor || !product.colorNames.includes(selectedColor)) {
          setSelectedColor(product.colorNames[0]);
        }
      }
      if (product.sizes && product.sizes.length > 0) {
        if (!selectedSize || !product.sizes.includes(selectedSize)) {
          setSelectedSize(product.sizes[0]);
        }
      }
    }
  }, [product?.id]);

  // Preload all product images in parallel for instant gallery transitions
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      product.images.forEach((imgUrl) => {
        const img = new Image();
        img.src = getOptimizedWixImageUrl(imgUrl, 600, 750);
      });
    }
  }, [product]);

  // Sync activeImage with selected color variant image
  useEffect(() => {
    if (!product || !selectedColor) return;
    const imgUrl = getColorImageUrl(selectedColor, selectedSize);
    if (imgUrl) {
      setActiveImage(imgUrl);
    }
  }, [selectedColor, selectedSize, product, getColorImageUrl]);

  // Initialize generic selectedOptions and customTextFieldValues when product changes
  useEffect(() => {
    if (product) {
      // 1. Initialize options
      const initialOpts = {};
      if (product.productOptions && product.productOptions.length > 0) {
        product.productOptions.forEach((opt) => {
          const nameLower = opt.name?.trim().toLowerCase();
          const isSize =
            nameLower.includes("size") ||
            nameLower.includes("størrelse") ||
            nameLower.includes("størrelser") ||
            nameLower.includes("format") ||
            nameLower === "str" ||
            nameLower === "str.";

          const isColor = nameLower === "color" || nameLower === "farge";

          if (isSize) {
            const matchingChoice = opt.choices?.find(
              (c) => c.value === selectedSize || c.description === selectedSize,
            );
            initialOpts[opt.name] = matchingChoice
              ? matchingChoice.value
              : opt.choices?.[0]?.value || "";
          } else if (isColor) {
            const matchingChoice = opt.choices?.find((c) => {
              const resolved = resolveColor(c.value, c.description || c.name);
              return resolved.name === selectedColor;
            });
            initialOpts[opt.name] = matchingChoice
              ? matchingChoice.value
              : opt.choices?.[0]?.value || "";
          } else {
            initialOpts[opt.name] = opt.choices?.[0]?.value || "";
          }
        });
      }
      setSelectedOptions(initialOpts);

      // 2. Initialize custom text fields
      const initialTexts = {};
      const initialModes = {};
      const isGiftCard =
        product.name?.toLowerCase().includes("gavekort") ||
        product.name?.toLowerCase().includes("gift card") ||
        product.category === "Gavekort";

      if (product.customTextFields && product.customTextFields.length > 0) {
        product.customTextFields.forEach((field) => {
          const lowerTitle = field.title.toLowerCase();
          const isMotifField =
            !isGiftCard &&
            (lowerTitle.includes("tekst") ||
              lowerTitle.includes("vers") ||
              lowerTitle.includes("motiv") ||
              lowerTitle.includes("skriftsted") ||
              lowerTitle.includes("bibel"));

          if (isMotifField) {
            initialTexts[field.title] = "Tilfeldig";
            initialModes[field.title] = "random";
          } else {
            initialTexts[field.title] = "";
            initialModes[field.title] = "custom";
          }
        });
      }
      setCustomTextFieldValues(initialTexts);
      setCustomTextModes(initialModes);
      setValidationErrors({});
    }
  }, [product]);

  // Keep selectedOptions in sync with selectedSize and selectedColor selections
  useEffect(() => {
    if (product) {
      const sizeOpt = product.productOptions?.find((o) => {
        const name = o.name?.trim().toLowerCase();
        return (
          name &&
          (name.includes("size") ||
            name.includes("størrelse") ||
            name.includes("størrelser") ||
            name.includes("format") ||
            name === "str" ||
            name === "str.")
        );
      });
      const colorOpt = product.productOptions?.find((o) => {
        const name = o.name?.trim().toLowerCase();
        return name && (name === "color" || name === "farge");
      });

      const sizeChoice = sizeOpt?.choices?.find(
        (c) => c.value === selectedSize || c.description === selectedSize,
      );
      const colorChoice = colorOpt?.choices?.find((c) => {
        const resolved = resolveColor(c.value, c.description || c.name);
        return resolved.name === selectedColor;
      });

      setSelectedOptions((prev) => {
        const updated = { ...prev };
        if (sizeOpt && sizeChoice) updated[sizeOpt.name] = sizeChoice.value;
        if (colorOpt && colorChoice) updated[colorOpt.name] = colorChoice.value;
        return updated;
      });
    }
  }, [selectedSize, selectedColor, product]);

  const productMetaTitle = product
    ? `${product.name} | His Kingdom Designs`
    : t("nav.products");

  useMeta(
    productMetaTitle,
    product && typeof product.description === "string"
      ? product.description.replace(/<[^>]*>/g, "").substring(0, 155)
      : t("home.metaDesc"),
    product
      ? { type: "product", image: product.image, price: `${activePrice} NOK` }
      : null,
    product,
  );

  // Dynamic Product & Breadcrumbs JSON-LD Schema (World-Class SEO)
  useEffect(() => {
    if (product) {
      const score = averageRating || 5;
      const count = reviewsList?.length || 0;

      // Extract and optimize all product images to ensure Googlebot gets clean, absolute CDN URLs
      const imageUrls = [];
      if (product.image) {
        imageUrls.push(getOptimizedWixImageUrl(product.image, 800, 1000));
      }
      if (product.images && product.images.length > 0) {
        product.images.forEach((img) => {
          const opt = getOptimizedWixImageUrl(img, 800, 1000);
          if (opt && !imageUrls.includes(opt)) {
            imageUrls.push(opt);
          }
        });
      }

      const productSchema = buildProductSchema(product, {
        price: activePrice,
        images: imageUrls,
      });

      if (count > 0) {
        productSchema.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: score,
          reviewCount: count,
        };
        productSchema.review = reviewsList.map((r) => ({
          "@type": "Review",
          author: {
            "@type": "Person",
            name: r.content?.title || "Kunde",
          },
          datePublished: r._createdDate,
          reviewBody: r.content?.body || "",
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.content?.rating || 5,
          },
        }));
      }

      const breadcrumbSchema = {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Hjem",
            item: "https://hiskingdomdesigns.no/",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: product.category || "Produkter",
            item: `https://hiskingdomdesigns.no/category/${getSlugByCategoryName ? getSlugByCategoryName(product.category) : "kristne-klaer"}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
            item: window.location.href,
          },
        ],
      };

      const graphSchema = {
        "@context": "https://schema.org",
        "@graph": [productSchema, breadcrumbSchema],
      };

      const scriptId = "jsonld-product-schema";
      let script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.innerHTML = JSON.stringify(graphSchema);

      return () => {
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [product, reviewsList, averageRating, activePrice, getSlugByCategoryName]);

  // Auto-fill email if member is logged in
  useEffect(() => {
    async function checkLoggedInMember() {
      if (wixClient.auth.loggedIn()) {
        try {
          const res = await wixClient.members.getCurrentMember({
            fieldsets: ["FULL"],
          });
          const member = res?.member;
          if (member) {
            const email =
              member.loginEmail ||
              (member.contactDetails?.emails?.[0] &&
                (typeof member.contactDetails.emails[0] === "object"
                  ? member.contactDetails.emails[0].email
                  : member.contactDetails.emails[0])) ||
              (member.contact?.emails?.[0] &&
                (typeof member.contact.emails[0] === "object"
                  ? member.contact.emails[0].email
                  : member.contact.emails[0])) ||
              member.contact?.email ||
              member.contactDetails?.email;
            if (email) {
              setBackInStockEmail(email);
            }
          }
        } catch (err) {
          console.warn(
            "Could not auto-fill member email for back-in-stock request:",
            err,
          );
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
          const res = await wixClient.members.getCurrentMember({
            fieldsets: ["FULL"],
          });
          const member = res?.member;
          if (member) {
            const contact = member.contactDetails || member.contact;
            if (contact?.firstName) {
              setReviewName(
                `${contact.firstName} ${contact.lastName || ""}`.trim(),
              );
            } else if (member.profile?.nickname) {
              setReviewName(member.profile.nickname);
            }
          }
        } catch (err) {
          console.warn("Could not pre-fill review name:", err);
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
        setSelectedSize(product.sizes.includes("M") ? "M" : product.sizes[0]);
      }
      if (product.colorNames && product.colorNames.length > 0) {
        setSelectedColor(
          product.colorNames.includes("Hvit") ? "Hvit" : product.colorNames[0],
        );
      }
      setQty(1);
    }
  }, [product?.id]);

  // Ensure selected quantity is not higher than available stock
  useEffect(() => {
    if (stockStatus.trackQuantity && qty > stockStatus.quantity) {
      setQty(Math.max(1, stockStatus.quantity));
    }
  }, [stockStatus, qty]);

  const isCurrentlyLoading =
    isLoadingProducts || (isFetchingProduct && !fetchedProduct);

  if (isCurrentlyLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-56">
        <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-secondary font-semibold font-body-md">
          {t("product.loading")}
        </p>
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
        <span className="material-symbols-outlined text-5xl text-terracotta/40 mb-4">
          error
        </span>
        <h2 className="font-headline-md text-headline-md text-onyx mb-2">
          Produktet finnes ikke
        </h2>
        <p className="text-secondary font-body-md mb-8">
          Vi beklager, men produktet du leter etter er enten slettet eller
          midlertidig utilgjengelig.
        </p>
        <button
          onClick={() => navigate(localizedPath("/products"))}
          className="inline-flex items-center gap-2 bg-terracotta text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Gå til alle produkter</span>
        </button>
      </motion.div>
    );
  }

  const handleAddToCart = () => {
    const isGiftCard =
      product.name?.toLowerCase().includes("gavekort") ||
      product.name?.toLowerCase().includes("gift card") ||
      product.category === "Gavekort";

    // Validate mandatory custom text fields
    const errors = {};
    if (product.customTextFields && product.customTextFields.length > 0) {
      product.customTextFields.forEach((field) => {
        if (field.mandatory) {
          const val = customTextFieldValues[field.title];
          const mode = customTextModes[field.title];
          const lowerTitle = field.title.toLowerCase();

          // Motif fields are only required if they are in 'custom' mode
          const isMotifField =
            !isGiftCard &&
            (lowerTitle.includes("tekst") ||
              lowerTitle.includes("vers") ||
              lowerTitle.includes("motiv") ||
              lowerTitle.includes("skriftsted") ||
              lowerTitle.includes("bibel"));
          const isRequired = isMotifField ? mode === "custom" : true;

          if (isRequired && (!val || !val.trim() || val === "Tilfeldig")) {
            if (language === "es") {
              errors[field.title] = `${field.title} es obligatorio`;
            } else if (language === "en") {
              errors[field.title] = `${field.title} is required`;
            } else {
              errors[field.title] = `${field.title} er obligatorisk`;
            }
          }
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstErrorKey = Object.keys(errors)[0];
      const errEl = document.getElementById(`field-err-${firstErrorKey}`);
      if (errEl) {
        errEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setValidationErrors({});

    // Construct custom text fields payload as [{ title, value }]
    const customTextFieldsPayload = Object.entries(customTextFieldValues).map(
      ([title, value]) => {
        const lowerTitle = title.toLowerCase();
        const isMotifField =
          !isGiftCard &&
          (lowerTitle.includes("tekst") ||
            lowerTitle.includes("vers") ||
            lowerTitle.includes("motiv") ||
            lowerTitle.includes("skriftsted") ||
            lowerTitle.includes("bibel"));
        const cleanVal =
          (typeof value === "string" ? value.trim() : value) || "";
        return {
          title,
          value: cleanVal || (isMotifField ? "Tilfeldig" : ""),
        };
      },
    );

    // Extract exact variant ID and SKU from selectedVariant
    const variantId = selectedVariant?._id || selectedVariant?.id || null;
    const sku =
      selectedVariant?.variant?.sku ||
      selectedVariant?.sku ||
      product.sku ||
      null;

    // Override product image, price, variantId and sku with active variant-specific choices
    const productWithActiveImage = {
      ...product,
      variantId,
      selectedVariantId: variantId,
      sku,
      image: activeImage || product.image,
      price: activePrice,
      originalPrice: activeOriginalPrice,
    };

    addToCart(
      productWithActiveImage,
      selectedSize,
      selectedColor,
      qty,
      selectedOptions,
      customTextFieldsPayload,
      variantId,
      sku,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBackInStockSubmit = async (e) => {
    e.preventDefault();
    if (!backInStockEmail) return;
    setBackInStockLoading(true);
    setBackInStockError("");
    try {
      const variantId = selectedVariant?._id || product.variants?.[0]?._id;
      const requestPayload = {
        email: backInStockEmail,
        catalogReference: {
          appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e",
          catalogItemId: product.id,
          ...(variantId ? { options: { variantId } } : {}),
        },
      };

      console.log("Sending Back in Stock Request to Wix:", requestPayload);
      await wixClient.backInStockNotifications.createBackInStockNotificationRequest(
        requestPayload,
      );
      setBackInStockSuccess(true);
      setBackInStockError("");
    } catch (err) {
      console.error("Error creating back in stock request:", err);
      setBackInStockError(
        "Kunne ikke opprette varsling. Vennligst prøv igjen.",
      );
    } finally {
      setBackInStockLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewName || !reviewTitle || !reviewBody) return;
    setIsSubmittingReview(true);
    setReviewSubmitError("");
    setReviewSubmitSuccess(false);

    const newReviewItem = {
      _id: `local-${Date.now()}`,
      author: { authorName: reviewName },
      content: {
        title: reviewTitle,
        body: reviewBody,
        rating: reviewRating,
      },
      _createdDate: new Date().toISOString(),
    };

    try {
      await wixClient.reviews.createReview({
        review: {
          namespace: "stores",
          entityId: productId,
          content: {
            title: reviewTitle,
            body: reviewBody,
            rating: reviewRating,
          },
          author: {
            authorName: reviewName,
          },
        },
      });

      try {
        const saved = localStorage.getItem(`hkd-reviews-${productId}`);
        const list = saved ? JSON.parse(saved) : [];
        list.unshift(newReviewItem);
        localStorage.setItem(`hkd-reviews-${productId}`, JSON.stringify(list));
      } catch (err) {
        console.error("Failed to save review to localStorage:", err);
      }

      setReviewSubmitSuccess(true);
      setReviewTitle("");
      setReviewBody("");
      setShowReviewForm(false);
      loadReviews();
    } catch (err) {
      console.error("Wix Reviews API submit failed:", err);
      setReviewSubmitError(
        err?.message || "Kunne ikke sende inn omtalen. Vennligst prøv igjen.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const currentImageIndex = imagesList.indexOf(activeImage || product.image);

  const handlePrevImage = (e) => {
    e.stopPropagation();
    if (imagesList.length <= 1) return;
    const newIndex =
      (currentImageIndex - 1 + imagesList.length) % imagesList.length;
    setActiveImage(imagesList[newIndex]);
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (imagesList.length <= 1) return;
    const newIndex = (currentImageIndex + 1) % imagesList.length;
    setActiveImage(imagesList[newIndex]);
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
        <Link to="/" className="hover:text-terracotta transition-colors">
          Hjem
        </Link>
        <ChevronRight size={14} className="text-secondary/60" />
        <Link
          to={localizedPath("/products")}
          className="hover:text-terracotta transition-colors"
        >
          Produkter
        </Link>
        <ChevronRight size={14} className="text-secondary/60" />
        <Link
          to={`/category/${getSlugByCategoryName(product.category)}`}
          className="hover:text-terracotta transition-colors"
        >
          {product.category}
        </Link>
        <ChevronRight size={14} className="text-secondary/60" />
        <span className="text-onyx font-bold line-clamp-1">{product.name}</span>
      </nav>

      <ProductPurchase
        {...{
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
        }}
      />

      {/* Section: Kundeomtaler & Vurderinger */}
      <ProductReviews
        {...{
          averageRating,
          handleReviewSubmit,
          isLoadingReviews,
          isSubmittingReview,
          language,
          product,
          ratingDistribution,
          reviewBody,
          reviewName,
          reviewRating,
          reviewSubmitError,
          reviewSubmitSuccess,
          reviewTitle,
          reviewsList,
          setReviewBody,
          setReviewName,
          setReviewRating,
          setReviewTitle,
          setShowReviewForm,
          showReviewForm,
          t,
        }}
      />

      {/* Section: Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-section-gap border-t border-outline-variant/30 pt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-2">
            <h2 className="font-headline-lg text-2xl md:text-headline-lg font-bold text-onyx">
              {language === "es"
                ? "Productos relacionados"
                : language === "en"
                  ? "Related products"
                  : "Relaterte produkter"}
            </h2>
            <Link
              to={`/category/${getSlugByCategoryName(product.category)}`}
              className="text-terracotta font-label-md hover:underline underline-offset-4 font-bold"
            >
              {language === "es"
                ? "Ver todos en"
                : language === "en"
                  ? "View all in"
                  : "Se alle"}{" "}
              {product.category.toLowerCase()}
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
                  <h3 className="font-bold text-sm text-onyx">
                    {t("product.sizeGuide")}
                  </h3>
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
                  (product?.category?.toLowerCase() || "").includes("hat") ||
                  (product?.category?.toLowerCase() || "").includes("caps")
                    ? "caps"
                    : (product?.category?.toLowerCase() || "").includes(
                          "bilder",
                        ) ||
                        (product?.category?.toLowerCase() || "").includes(
                          "plakat",
                        )
                      ? "posters"
                      : "clothing"
                }
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import ProductCard from '@/components/ProductCard';
import { motion } from 'framer-motion';
import useMeta from '@/hooks/useMeta';

export default function Category() {
  const { products, isLoadingProducts, categoryTaxonomy, getCategoryNameBySlug, getSlugByCategoryName } = useApp();
  const { categoryName: categorySlug } = useParams();
  const categoryName = getCategoryNameBySlug(categorySlug);
  
  useMeta(
    categoryName || 'Kategorier',
    `Utforsk vårt utvalg av produkter i kategorien ${categoryName || 'kategorier'} hos His Kingdom Designs. Finn bibelvers på klær, plakater og tilbehør.`
  );

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read search URL param
  const urlSearch = searchParams.get('search') || '';

  // Local state for filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [priceRange, setPriceRange] = useState(1500);
  const [sortBy, setSortBy] = useState('Nyeste');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Collapsible category groups state
  const [expandedGroups, setExpandedGroups] = useState({
    'Klær': true,
    'Bilder & Kunst': false,
    'Tilbehør & Hjem': false,
    'Barn & Familie': false,
    'Temaer & Budskap': false,
    'Kampanjer & Formater': false
  });

  // Sync category route param to state
  useEffect(() => {
    if (categoryName) {
      if (categoryName === 'Salg') {
        setSelectedCategories([]); // Managed by custom sale filtering
      } else {
        setSelectedCategories([categoryName]);
      }
    } else {
      setSelectedCategories([]);
    }
  }, [categoryName]);

  // Handle Collapsible toggle
  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  // Handle Category Checkbox Toggles
  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Handle Size Toggle
  const handleSizeToggle = (size) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        return prev.filter(s => s !== size);
      } else {
        return [...prev, size];
      }
    });
  };

  // Handle Color Toggle
  const handleColorToggle = (colorName) => {
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(c => c !== colorName);
      } else {
        return [...prev, colorName];
      }
    });
  };

  // Clear All Filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange(1500);
    setSortBy('Nyeste');
    setSearchParams({});
  };

  // Get products belonging to current category context (before applying size/color/price filters)
  const categoryProducts = useMemo(() => {
    let result = [...products];

    // Filter by category parameter or selection
    if (categoryName === 'Salg') {
      result = result.filter(p => p.isSale);
    } else if (categoryName) {
      const targetSlug = getSlugByCategoryName(categoryName);
      result = result.filter(p => {
        const pCatSlug = getSlugByCategoryName(p.category);
        const hasMatchingSub = p.subcategories && p.subcategories.some(sub => getSlugByCategoryName(sub) === targetSlug);
        return pCatSlug === targetSlug || hasMatchingSub;
      });
    } else if (selectedCategories.length > 0) {
      const targetSlugs = selectedCategories.map(c => getSlugByCategoryName(c));
      result = result.filter(p => {
        const pCatSlug = getSlugByCategoryName(p.category);
        const hasMatchingSub = p.subcategories && p.subcategories.some(sub => targetSlugs.includes(getSlugByCategoryName(sub)));
        return targetSlugs.includes(pCatSlug) || hasMatchingSub;
      });
    }

    // Filter by search query
    if (urlSearch) {
      const query = urlSearch.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        (p.subcategories && p.subcategories.some(s => s.toLowerCase().includes(query))) ||
        (p.description && p.description.toLowerCase().includes(query))
      );
    }

    return result;
  }, [products, categoryName, selectedCategories, urlSearch]);

  const availableSizes = useMemo(() => {
    const sizesSet = new Set();
    categoryProducts.forEach(p => {
      if (p.sizes) {
        p.sizes.forEach(s => sizesSet.add(s));
      }
    });
    const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
    return Array.from(sizesSet).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA > -1 && idxB > -1) return idxA - idxB;
      if (idxA > -1) return -1;
      if (idxB > -1) return 1;
      return a.localeCompare(b);
    });
  }, [categoryProducts]);

  const availableColors = useMemo(() => {
    const colorMap = {};
    categoryProducts.forEach(p => {
      if (p.colorNames && p.colors) {
        p.colorNames.forEach((name, idx) => {
          const hex = p.colors[idx] || '#888888';
          if (!colorMap[name]) {
            colorMap[name] = hex;
          }
        });
      }
    });
    
    return Object.entries(colorMap).map(([name, hex]) => {
      let border = 'border-slate-200';
      if (hex === '#FFFFFF') border = 'border-outline-variant';
      else if (hex === '#151A21') border = 'border-onyx';
      else if (hex === '#CC712B') border = 'border-terracotta';
      return { name, hex, border };
    });
  }, [categoryProducts]);

  // Filter and Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...categoryProducts];

    // Filter by size
    if (selectedSizes.length > 0) {
      result = result.filter(p => 
        p.sizes && p.sizes.some(s => selectedSizes.includes(s))
      );
    }

    // 4. Filter by color
    if (selectedColors.length > 0) {
      result = result.filter(p => 
        p.colorNames && p.colorNames.some(c => selectedColors.includes(c))
      );
    }

    // 5. Filter by price
    result = result.filter(p => p.price <= priceRange);

    // 6. Sort
    if (sortBy === 'LavHøy') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'HøyLav') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'MestPopulær') {
      result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }

    return result;
  }, [products, categoryName, selectedCategories, urlSearch, selectedSizes, selectedColors, priceRange, sortBy]);

  // Set page title for breadcrumb
  const displayTitle = categoryName === 'Salg' ? 'Salgskampanje' : (categoryName || 'Alle produkter');

  const filterSidebar = (
    <div className="space-y-8">
      {/* Category Filter - only show if not inside a specific category route */}
      {!categoryName && (
        <div>
          <h3 className="font-label-md text-label-md text-onyx mb-4 tracking-wider uppercase">Kategorier</h3>
          <div className="space-y-3">
            {Object.entries(categoryTaxonomy).map(([group, cats]) => {
              const isExpanded = expandedGroups[group];
              const selectedInGroup = cats.filter(c => selectedCategories.includes(c));
              return (
                <div key={group} className="border border-outline-variant/30 rounded-lg overflow-hidden bg-white/40">
                  <button
                    onClick={() => toggleGroup(group)}
                    className="w-full flex items-center justify-between p-3 font-label-md text-label-md text-onyx bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {group}
                      {selectedInGroup.length > 0 && (
                        <span className="bg-terracotta text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {selectedInGroup.length}
                        </span>
                      )}
                    </span>
                    <ChevronDown 
                      size={16} 
                      className={`text-onyx/60 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      }`} 
                    />
                  </button>
                  {isExpanded && (
                    <ul className="p-3 space-y-2 border-t border-outline-variant/30 bg-white/10 max-h-48 overflow-y-auto custom-scrollbar">
                      {cats.map(cat => (
                        <li key={cat}>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox"
                              checked={selectedCategories.includes(cat)}
                              onChange={() => handleCategoryToggle(cat)}
                              className="rounded border-outline-variant text-terracotta focus:ring-terracotta"
                            />
                            <span className={`font-body-md text-body-md group-hover:text-terracotta transition-colors ${
                              selectedCategories.includes(cat) ? 'text-terracotta font-bold' : 'text-onyx'
                            }`}>
                              {cat}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-onyx mb-4 tracking-wider uppercase">Størrelse</h3>
        <div className="grid grid-cols-4 gap-2">
          {availableSizes.map(size => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`min-h-10 py-2 px-1 border rounded flex items-center justify-center text-center transition-all ${
                  size.length > 3 ? 'text-[10px] leading-tight font-medium' : 'font-label-sm text-label-sm'
                } ${
                  isSelected 
                    ? 'border-terracotta bg-terracotta/5 text-terracotta font-bold' 
                    : 'border-outline-variant text-onyx hover:border-terracotta hover:text-terracotta'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-onyx mb-4 tracking-wider uppercase">Farge</h3>
        <div className="flex flex-wrap gap-3">
          {availableColors.map(color => {
            const isSelected = selectedColors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => handleColorToggle(color.name)}
                className={`w-8 h-8 rounded-full border ring-offset-2 transition-all ${color.border} ${
                  isSelected ? 'ring-2 ring-terracotta scale-110 shadow-md' : 'hover:ring-1 hover:ring-terracotta'
                }`}
                style={{ background: color.hex }}
                title={color.name}
              />
            );
          })}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="font-label-md text-label-md text-onyx mb-4 tracking-wider uppercase">Maks Pris</h3>
        <input 
          type="range"
          min="50"
          max="1500"
          step="50"
          value={priceRange}
          onChange={(e) => setPriceRange(parseInt(e.target.value))}
          className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-terracotta"
        />
        <div className="flex justify-between mt-2 font-label-sm text-label-sm text-secondary">
          <span>50 kr</span>
          <span className="font-bold text-terracotta">{priceRange} kr</span>
          <span>1 500 kr</span>
        </div>
      </div>

      {/* Reset button */}
      <button 
        onClick={handleClearFilters}
        className="w-full bg-parchment border border-outline hover:border-terracotta hover:text-terracotta text-onyx py-3 rounded-lg font-label-md text-label-md transition-all active:scale-[0.98]"
      >
        Nullstill filtre
      </button>
    </div>
  );

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-28"
    >
      {/* Breadcrumbs */}
      <div className="mb-12">
        <nav className="flex items-center gap-2 text-label-sm font-label-sm text-secondary mb-4">
          <Link to="/" className="hover:text-terracotta transition-colors">Hjem</Link>
          <ChevronRight size={14} className="text-secondary/60" />
          <span className="text-onyx font-bold">{displayTitle}</span>
        </nav>
        <h1 className="font-headline-xl text-3xl md:text-[48px] text-onyx mb-2 capitalize">{displayTitle}</h1>
        <p className="text-body-lg font-body-lg text-secondary w-full">
          Utforsk vår kolleksjon av trosbaserte produkter designet for å inspirere og spre Guds ord i hverdagen.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-gutter items-start w-full">
        {isLoadingProducts ? (
          <div className="flex flex-col items-center justify-center py-32 w-full">
            <div className="w-12 h-12 border-4 border-terracotta border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-secondary font-semibold font-body-md">Henter produkter fra Wix...</p>
          </div>
        ) : (
          <>
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-28">
              {filterSidebar}
            </aside>

            {/* Mobile Filter Trigger Button */}
            <div className="lg:hidden w-full flex items-center justify-between gap-4 mb-6 border-b border-outline-variant/30 pb-4">
              <button 
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 bg-white border border-outline-variant px-4 py-2.5 rounded-lg text-sm font-semibold text-onyx hover:border-terracotta"
              >
                <SlidersHorizontal size={16} />
                <span>Filtrer produkter</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-secondary">Sorter:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-xs text-terracotta font-bold focus:ring-0 p-0 pr-6 cursor-pointer"
                >
                  <option value="Nyeste">Nyeste først</option>
                  <option value="LavHøy">Pris: Lav til Høy</option>
                  <option value="HøyLav">Pris: Høy til Lav</option>
                  <option value="MestPopulær">Mest populære</option>
                </select>
              </div>
            </div>

            {/* Product Grid Container */}
            <div className="flex-1 w-full">
              {/* Desktop Toolbar */}
              <div className="hidden lg:flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/30">
                <span className="font-label-sm text-label-sm text-secondary">
                  Viser {filteredProducts.length} av {products.length} produkter
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-label-sm text-label-sm text-secondary">Sorter etter:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none font-label-md text-label-md text-terracotta focus:ring-0 cursor-pointer"
                  >
                    <option value="Nyeste">Nyeste først</option>
                    <option value="LavHøy">Pris: Lav til Høy</option>
                    <option value="HøyLav">Pris: Høy til Lav</option>
                    <option value="MestPopulær">Mest populære</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-gutter">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-outline-variant/50 p-16 text-center max-w-xl mx-auto mt-12">
                  <span className="material-symbols-outlined text-5xl text-terracotta/40 mb-4">info</span>
                  <h3 className="font-headline-md text-headline-md text-onyx mb-2">Ingen treff</h3>
                  <p className="text-secondary font-body-md mb-8">
                    Vi fant ingen produkter som matcher dine filtervalg eller søk. Prøv å nullstille filtrene eller søke etter noe annet.
                  </p>
                  <button 
                    onClick={handleClearFilters}
                    className="bg-terracotta text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 active:scale-95 transition-all"
                  >
                    Vis alle produkter
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-onyx/40 backdrop-blur-xs" 
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer Panel */}
          <div className="fixed top-0 bottom-0 left-0 w-80 max-w-[85vw] bg-parchment shadow-2xl p-6 flex flex-col z-10 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-onyx">Filtre</h3>
              <button 
                onClick={() => setMobileFiltersOpen(false)}
                className="text-onyx hover:text-terracotta"
              >
                <X size={24} />
              </button>
            </div>
            {filterSidebar}
          </div>
        </div>
      )}
    </motion.main>
  );
}

import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, Tag, Check, RotateCcw, Search } from 'lucide-react';
import type { Product, Category } from '../types/index.js';
import { ProductCard } from './ProductCard.js';

interface CatalogSectionProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenProductDetail: (p: Product) => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onOpenProductDetail
}) => {
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating' | 'discount'>('newest');
  const [selectedMerchant, setSelectedMerchant] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [activeTag, setActiveTag] = useState<string>('all');

  // Extract unique merchants
  const merchants = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.affiliateNetwork) set.add(p.affiliateNetwork);
    });
    return Array.from(set);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Merchant filter
      if (selectedMerchant !== 'all' && p.affiliateNetwork !== selectedMerchant) {
        return false;
      }
      // Price range
      const price = p.salePrice ?? p.price;
      if (selectedPriceRange === 'under_50' && price >= 50) return false;
      if (selectedPriceRange === '50_150' && (price < 50 || price > 150)) return false;
      if (selectedPriceRange === '150_300' && (price < 150 || price > 300)) return false;
      if (selectedPriceRange === 'over_300' && price <= 300) return false;

      // Special tags
      if (activeTag === 'featured' && !p.isFeatured) return false;
      if (activeTag === 'bestseller' && !p.isBestSeller) return false;
      if (activeTag === 'sale' && (!p.salePrice || p.salePrice >= p.price)) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brand.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchTags = p.tags.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchBrand && !matchCat && !matchDesc && !matchTags) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePrice ?? a.price;
      const priceB = b.salePrice ?? b.price;

      if (sortBy === 'price_asc') return priceA - priceB;
      if (sortBy === 'price_desc') return priceB - priceA;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') {
        const discA = a.salePrice ? (a.price - a.salePrice) / a.price : 0;
        const discB = b.salePrice ? (b.price - b.salePrice) / b.price : 0;
        return discB - discA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [products, selectedCategory, selectedMerchant, selectedPriceRange, activeTag, searchQuery, sortBy]);

  const resetFilters = () => {
    onSelectCategory('all');
    setSelectedMerchant('all');
    setSelectedPriceRange('all');
    setActiveTag('all');
    onSearchChange('');
    setSortBy('newest');
  };

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedMerchant !== 'all' || 
    selectedPriceRange !== 'all' || 
    activeTag !== 'all' || 
    Boolean(searchQuery);

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
            Independent Editorial Selection
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
            Explore Verified Catalog
          </h2>
          <p className="text-sm text-neutral-600 mt-1 max-w-xl">
            Compare specs and pricing directly with authorized third-party merchants.
          </p>
        </div>

        {/* Sort & Stats Bar */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-neutral-500 tabular-nums">
            Showing {filteredProducts.length} items
          </span>
          <div className="flex items-center gap-1.5 border border-neutral-300 rounded-lg px-2.5 py-1.5 bg-white text-xs font-medium text-neutral-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Interactive Category Segmented Tabs (Functional Buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        <button
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-neutral-900 text-white shadow-sm'
              : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/80'
          }`}
        >
          All Items ({products.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.name)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              selectedCategory.toLowerCase() === cat.name.toLowerCase()
                ? 'bg-neutral-900 text-white shadow-sm'
                : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/80'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter Row: Price, Merchant, Quick Tags */}
      <div className="bg-neutral-50/80 border border-neutral-200/90 rounded-xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Price Range Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-neutral-500 font-medium">Price:</span>
            <select
              value={selectedPriceRange}
              onChange={e => setSelectedPriceRange(e.target.value)}
              className="bg-white border border-neutral-200 rounded-md px-2 py-1 text-xs font-medium text-neutral-800 focus:outline-none"
            >
              <option value="all">Any Price</option>
              <option value="under_50">Under $50</option>
              <option value="50_150">$50 – $150</option>
              <option value="150_300">$150 – $300</option>
              <option value="over_300">$300 and above</option>
            </select>
          </div>

          {/* Merchant Filter */}
          {merchants.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-500 font-medium">Merchant:</span>
              <select
                value={selectedMerchant}
                onChange={e => setSelectedMerchant(e.target.value)}
                className="bg-white border border-neutral-200 rounded-md px-2 py-1 text-xs font-medium text-neutral-800 focus:outline-none"
              >
                <option value="all">All Merchants</option>
                {merchants.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Selection Tags */}
          <div className="hidden sm:flex items-center gap-1 pl-2 border-l border-neutral-200 text-xs">
            <button
              onClick={() => setActiveTag(activeTag === 'featured' ? 'all' : 'featured')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                activeTag === 'featured' ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Featured Only
            </button>
            <button
              onClick={() => setActiveTag(activeTag === 'bestseller' ? 'all' : 'bestseller')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                activeTag === 'bestseller' ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              Best Sellers
            </button>
            <button
              onClick={() => setActiveTag(activeTag === 'sale' ? 'all' : 'sale')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                activeTag === 'sale' ? 'bg-amber-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              On Sale
            </button>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-xs font-medium text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Active Search Indicator */}
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between bg-amber-50 border border-amber-200/80 px-4 py-2.5 rounded-lg text-xs text-amber-900">
          <span>
            Search results for "<strong>{searchQuery}</strong>" ({filteredProducts.length} items)
          </span>
          <button
            onClick={() => onSearchChange('')}
            className="font-semibold underline hover:text-amber-700 cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* Product Grid: 3-Column Desktop, 2-Column Tablet, 1-Column Mobile with generous gap */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenProductDetail}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-neutral-200">
          <Search className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900">No products match your criteria</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, price filter, or merchant selection.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </section>
  );
};

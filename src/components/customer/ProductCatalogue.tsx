import React, { useState, useMemo } from 'react';
import { Product, ProductCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { ProductCard } from './ProductCard';
import { Search, Filter, ArrowUpDown, Check, ShieldAlert } from 'lucide-react';

interface ProductCatalogueProps {
  onSelectProduct: (product: Product) => void;
  searchFilter?: string;
}

export const ProductCatalogue: React.FC<ProductCatalogueProps> = ({
  onSelectProduct,
  searchFilter = '',
}) => {
  const { products, selectedStore } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-low' | 'price-high' | 'discount'>('relevance');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchFilter);

  const categories: (ProductCategory | 'All')[] = [
    'All',
    'Vegetables & Fruits',
    'Dairy & Bread',
    'Atta, Rice & Dals',
    'Oils & Ghee',
    'Masalas & Spices',
    'Meat & Eggs',
  ];

  const filteredAndSorted = useMemo(() => {
    let result = products.filter((p) => {
      const query = (localSearch || searchFilter).toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(query)));

      if (!matchesSearch) return false;
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (inStockOnly && (!p.isAvailable || p.stock === 0)) return false;
      return true;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    }

    return result;
  }, [products, localSearch, searchFilter, selectedCategory, inStockOnly, sortBy]);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Fresh Grocery Aisle
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fulfill your recipe needs from <span className="font-bold text-slate-700">{selectedStore.name}</span>
          </p>
        </div>

        {/* Local Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search groceries..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full rounded-full bg-white pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 border border-slate-200 focus:border-[#08B968] focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Filter and Sort Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
        {/* Category selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort and In-stock toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded text-[#08B968] focus:ring-[#08B968]"
            />
            <span>In-stock only</span>
          </label>

          <div className="flex items-center gap-1.5 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredAndSorted.length === 0 ? (
        <div className="py-24 text-center rounded-3xl bg-white border border-slate-100">
          <ShieldAlert className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No products match your criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or uncheck filters to see all available items.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredAndSorted.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onSelectProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
};

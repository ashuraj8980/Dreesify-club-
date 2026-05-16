import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, X, Star, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & Sort State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('recent');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const allProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        
        const filtered = allProducts.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(filtered);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [query]);

  const categories = useMemo(() => {
    return Array.from(new Set(searchResults.map(p => p.category)));
  }, [searchResults]);

  const filteredProducts = useMemo(() => {
    let result = [...searchResults];

    // Filter by Category
    if (selectedCategories.length > 0) {
      result = result.filter(p => selectedCategories.includes(p.category));
    }

    // Filter by Price
    result = result.filter(p => p.salePrice >= priceRange[0] && p.salePrice <= priceRange[1]);

    // Filter by Rating
    if (minRating > 0) {
      result = result.filter(p => p.rating >= minRating);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.salePrice - b.salePrice;
        case 'price-high':
          return b.salePrice - a.salePrice;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
        default:
          return b.createdAt - a.createdAt;
      }
    });

    return result;
  }, [searchResults, selectedCategories, priceRange, minRating, sortBy]);

  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setMinRating(0);
    setSortBy('recent');
  };

  return (
    <div className="bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-4 lg:px-12 py-24 md:py-32">
        <div className="text-center mb-24">
          <div className="inline-flex items-center space-x-4 mb-4 text-brand-black/20">
            <Search className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Query Results</span>
          </div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-display font-medium uppercase tracking-tight"
          >
            " {query} "
          </motion.h1>
          <div className="flex items-center justify-center space-x-6 mt-8">
            <p className="text-brand-black/40 font-serif italic text-sm">
              {filteredProducts.length} archival pieces documented
            </p>
            <div className="w-8 h-px bg-brand-black/10" />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest hover:text-brand-gold transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{showFilters ? 'Hide Parameters' : 'Adjust Parameters'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside 
                initial={{ opacity: 0, x: -20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 'auto' }}
                exit={{ opacity: 0, x: -20, width: 0 }}
                className="lg:w-1/4 space-y-12 shrink-0 overflow-hidden"
              >
                <div className="sticky top-32 space-y-12">
                  <div className="flex items-center justify-between border-b border-brand-black/5 pb-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em]">Refinement</h3>
                    <button onClick={resetFilters} className="text-[8px] font-black uppercase tracking-widest text-brand-black/40 hover:text-red-500">Reset</button>
                  </div>

                  {/* Categories */}
                  <div className="space-y-6">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-black/30">Category Archive</p>
                    <div className="space-y-3">
                      {categories.map(cat => (
                        <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={selectedCategories.includes(cat)}
                            onChange={() => {
                              setSelectedCategories(prev => 
                                prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
                              );
                            }}
                            className="hidden"
                          />
                          <div className={`w-3 h-3 border border-brand-black/20 flex items-center justify-center transition-all ${selectedCategories.includes(cat) ? 'bg-brand-black border-brand-black' : 'group-hover:border-brand-black'}`}>
                            {selectedCategories.includes(cat) && <div className="w-1 h-1 bg-white" />}
                          </div>
                          <span className={`text-[11px] uppercase tracking-widest ${selectedCategories.includes(cat) ? 'font-black' : 'text-brand-black/60'} group-hover:text-brand-black transition-colors`}>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-6">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-black/30">Valuation Range</p>
                    <div className="space-y-4">
                      <div className="flex items-center bg-white border border-brand-black/5 p-4 rounded-sm">
                        <span className="text-[9px] font-bold text-brand-black/40 mr-2">Max.</span>
                        <input 
                          type="range"
                          min="0"
                          max="100000"
                          step="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full accent-brand-black"
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
                        <span>Under ₹{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Minimum Rating */}
                  <div className="space-y-6">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-black/30">Registry Merit</p>
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          key={star}
                          onClick={() => setMinRating(prev => prev === star ? 0 : star)}
                          className={`p-2 border border-brand-black/5 transition-all ${minRating >= star ? 'bg-brand-black text-brand-gold border-brand-black' : 'bg-white text-brand-black/20'}`}
                        >
                          <Star className={`w-3 h-3 ${minRating >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-6">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-black/30">Temporal Order</p>
                    <select 
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white border border-brand-black/5 p-4 text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer"
                    >
                      <option value="recent">Newest Archive</option>
                      <option value="price-low">Price: Ascending</option>
                      <option value="price-high">Price: Descending</option>
                      <option value="rating">Registry Rating</option>
                    </select>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse space-y-6">
                    <div className="aspect-[3/4] bg-brand-black/5" />
                    <div className="h-4 bg-brand-black/5 w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {filteredProducts.length > 0 ? (
                  <div className={`grid grid-cols-2 ${showFilters ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'} gap-x-8 gap-y-20 transition-all duration-700`}>
                    {filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="py-40 text-center border border-dashed border-brand-black/10 bg-white/50 backdrop-blur-sm">
                    <Search className="w-16 h-16 text-brand-black/5 mx-auto mb-8" />
                    <p className="text-brand-black/40 font-serif italic text-lg mb-4">No archival matches found.</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/20">Try adjusting your refinement parameters.</p>
                    <button 
                      onClick={resetFilters} 
                      className="mt-12 text-[10px] font-black uppercase tracking-widest border-b border-brand-black pb-1 hover:text-brand-gold hover:border-brand-gold transition-all"
                    >
                      Reset All Parameters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


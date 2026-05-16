import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function CategoryProducts() {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'products'),
          where('category', '==', category?.charAt(0).toUpperCase() + category!.slice(1))
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
      } catch (error) {
        console.error('Error fetching category products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === 'price-low') return a.salePrice - b.salePrice;
    if (sortBy === 'price-high') return b.salePrice - a.salePrice;
    return b.createdAt - a.createdAt;
  });

  return (
    <div className="bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-4 lg:px-12 py-24 md:py-32">
        <div className="flex flex-col items-center text-center lg:flex-row lg:items-end lg:justify-between lg:text-left mb-24 gap-12 border-b border-brand-black/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start space-x-4">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/20">Category</span>
               <div className="w-12 h-px bg-brand-black/10" />
            </div>
            <h1 className="text-6xl md:text-9xl font-display font-medium uppercase tracking-tight leading-none">{category}</h1>
            <p className="text-brand-black/40 font-serif italic text-lg max-w-lg mx-auto lg:mx-0">
              "Exploring the intersection of architectural geometry and the visceral experience of textile."
            </p>
          </div>
          
          <div className="flex items-center space-x-12">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <SlidersHorizontal className="w-3 h-3 text-brand-black group-hover:text-brand-gold transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-brand-gold transition-colors">Parameters</span>
            </div>
            
            <div className="relative group">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-transparent pr-10 py-2 text-[10px] font-black uppercase tracking-[0.3em] outline-none cursor-pointer border-none text-brand-black"
              >
                <option value="newest">Recent Additions</option>
                <option value="price-low">Valuation: Low</option>
                <option value="price-high">Valuation: High</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-brand-black/40" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse space-y-6">
                <div className="aspect-[3/4] bg-brand-black/5" />
                <div className="h-4 bg-brand-black/5 w-2/3" />
                <div className="h-4 bg-brand-black/5 w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
                {sortedProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-60 text-center border border-dashed border-brand-black/10 bg-white/50 backdrop-blur-sm">
                 <div className="max-w-md mx-auto space-y-8">
                    <p className="text-brand-black/40 font-serif italic text-2xl uppercase tracking-widest">The {category} archive is currently void.</p>
                    <Link to="/" className="luxury-button inline-block">Return to Foundation</Link>
                 </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { Product } from '../types';
import { db } from '../lib/firebase';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, 'products'),
          orderBy('createdAt', 'desc'),
          limit(12)
        );
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        
        // Final client-side safety filter for requested categories
        setProducts(productsData.filter(p => p.category === 'Women' || p.category === 'Accessories'));
      } catch (error) {
        console.error('Error fetching archive:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-32 md:space-y-48 pb-32 md:pb-48">
      {/* Hero Section - Fashion Editorial Style */}
      <section className="relative h-[90vh] md:h-screen overflow-hidden flex items-center bg-brand-black">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: [0.19, 1, 0.22, 1] }}
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop" 
            alt="Editorial" 
            className="w-full h-full object-cover grayscale brightness-75"
          />
        </div>
        
        <div className="container mx-auto px-4 lg:px-12 relative z-10 text-white">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="space-y-8 md:space-y-12"
            >
              <div className="overflow-hidden">
                <span className="font-display uppercase tracking-[0.6em] text-[10px] md:text-xs block text-brand-gold">
                   Volume One // The Archive Edition
                </span>
              </div>
              
              <h1 className="text-7xl md:text-[12rem] font-display font-medium leading-[0.85] tracking-tighter uppercase">
                 Ethereal <br />
                 <span className="italic font-serif lowercase text-brand-beige ml-12 md:ml-32">Form.</span>
              </h1>
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-12 mt-12">
                 <p className="text-lg md:text-xl text-brand-beige/60 font-serif italic max-w-md leading-relaxed">
                   "A curation of architectural silhouettes and visceral textiles, defined by the poetry of the self."
                 </p>
                 <Link to="/category/women" className="luxury-button !px-16 py-6 group">
                   The Collection <ArrowRight className="inline-block ml-4 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                 </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-center space-y-6">
          <div className="w-px h-32 bg-gradient-to-b from-transparent via-brand-gold to-transparent" />
          <span className="text-[8px] uppercase tracking-[0.5em] font-black text-brand-gold vertical-text rotate-180">Curated Series</span>
        </div>
      </section>

      {/* Product Display Section */}
      <section className="container mx-auto px-4 lg:px-12">
        <header className="flex flex-col items-center text-center space-y-10 mb-24 md:mb-40">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.8em] font-black text-brand-gold block">New Acquisitions</span>
            <h2 className="text-5xl md:text-8xl font-display font-medium uppercase tracking-tight">The Registry</h2>
          </div>
          <p className="text-brand-black/40 font-serif italic text-xl max-w-2xl leading-relaxed">
            Discover pieces distilled to their absolute necessity, representing the intersection of modern geometry and ethical craftsmanship.
          </p>
        </header>
        
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-24">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="animate-pulse space-y-8">
                <div className="aspect-[3/4] bg-brand-beige/10" />
                <div className="h-4 bg-brand-beige/20 w-3/4" />
                <div className="h-3 bg-brand-beige/10 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-24 md:gap-y-32">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-48 text-center border-y border-brand-black/5 flex flex-col items-center justify-center space-y-8">
                <div className="w-20 h-px bg-brand-gold" />
                <p className="font-serif italic text-3xl text-brand-black/20 uppercase tracking-[0.2em]">Collection Under Curation</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/40">The archive is being updated with new acquisitions.</p>
                <div className="w-20 h-px bg-brand-gold" />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Brand Ethos Footer Callout */}
      <section className="container mx-auto px-4 lg:px-24">
        <div className="bg-brand-black text-white p-12 md:p-32 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-12">
            <h3 className="text-4xl md:text-7xl font-display uppercase tracking-tight leading-tight">
              Crafted for the <br />
              <span className="italic font-serif lowercase text-brand-gold">Conscious</span> individual.
            </h3>
            <p className="text-brand-beige/60 text-lg md:text-xl font-serif italic leading-relaxed">
              Every piece in our collection is a testament to the beauty of restraint, collaborating with heritage mills to ensure your wardrobe is a permanent archive of exceptional design.
            </p>
            <Link to="/search" className="inline-block text-[10px] font-black uppercase tracking-[0.4em] border-b border-brand-gold pb-2 text-brand-gold hover:text-white hover:border-white transition-all">
              Explore All Objects
            </Link>
          </div>
          <span className="absolute -right-20 -bottom-20 text-[25rem] font-display font-black text-white/5 select-none pointer-events-none">D.</span>
        </div>
      </section>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { Product } from '../types';
import { db } from '../lib/firebase';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Product));
        
        setProducts(productsData.filter(p => p.category === 'Women' || p.category === 'Accessories'));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-24 md:space-y-40 pb-24 md:pb-40">
      {/* Trending Pieces */}
      <section className="container mx-auto px-4 lg:px-12">
        <header className="flex flex-col items-center text-center space-y-8 mb-32 border-b border-brand-black/10 pb-20">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.6em] font-black text-brand-gold block">New Season</span>
            <h2 className="fluid-display-lg font-display font-medium uppercase">Trending Now</h2>
          </div>
          <p className="text-brand-black/40 font-serif italic text-lg max-w-lg">Selected pieces from our latest collection, curated for quality and timeless style.</p>
          <Link to="/search" className="nav-link !text-[12px] underline underline-offset-8">Browse All Products</Link>
        </header>
        
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse space-y-8">
                <div className="aspect-[3/4] bg-brand-beige/20" />
                <div className="h-6 bg-brand-beige/20 w-3/4" />
                <div className="h-4 bg-brand-beige/10 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-60 text-center border-y border-brand-black/5">
                <p className="font-serif italic text-3xl text-brand-black/20 mb-12 uppercase tracking-widest">The archive is currently void.</p>
                <InitializeButton />
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function InitializeButton() {
  const [seeding, setSeeding] = useState(false);
  const { isAdmin } = useAuth();

  const seedData = async () => {
    setSeeding(true);
    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const products = [
        {
          name: "Architectural Wool Overcoat",
          description: "A masterclass in minimalism. Structured silhouette crafted from 100% fine double-faced Merino wool. Designed for a razor-sharp yet relaxed archival fit.",
          price: 45000,
          salePrice: 45000,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1539109136881-3be0610931c3?q=80&w=2000&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Outerwear",
          sizes: ["XS", "S", "M", "L"],
          colors: ["Oatmeal", "Obsidian"],
          stock: 12,
          rating: 4.9,
          reviewCount: 24,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Fluid Silk Bias-Cut Slip",
          description: "Effortless identity. Cut on the bias to drape with liquid grace, crafted from 30 momme mulberry silk. The ultimate evening archive piece.",
          price: 18500,
          salePrice: 18500,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Dresses",
          sizes: ["S", "M", "L"],
          colors: ["Midnight", "Champagne"],
          stock: 25,
          rating: 4.8,
          reviewCount: 56,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Geometric Nappa Leather Tote",
          description: "Minimalist geometry in vegetable-tanned Italian Nappa leather. Seamless construction for a clean aesthetic. An object of pure utility.",
          price: 22000,
          salePrice: 22000,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1584917469274-96ce157ad5ef?q=80&w=2000&auto=format&fit=crop"],
          category: "Accessories",
          subcategory: "Bags",
          sizes: ["One Size"],
          colors: ["Tan", "Black"],
          stock: 8,
          rating: 5.0,
          reviewCount: 12,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Heavyweight Sculpted Midi Dress",
          description: "Architectural silhouette in heavyweight matte ponte knit. A study in modern geometry and restraint. Designed for presence.",
          price: 15980,
          salePrice: 7990,
          discountPercentage: 50,
          images: ["https://images.unsplash.com/photo-1539109132374-34fa4563a86b?q=80&w=1974&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Dresses",
          sizes: ["S", "M", "L"],
          stock: 25,
          rating: 4.9,
          reviewCount: 231,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Satin Asymmetrical Top",
          description: "High-shine satin with a unique architectural drape. Perfect for layering within the modern archive.",
          price: 8900,
          salePrice: 8900,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1920&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Tops",
          sizes: ["XS", "S", "M", "L"],
          colors: ["Ivory", "Midnight"],
          stock: 30,
          rating: 4.8,
          reviewCount: 42,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        },
        {
          name: "Fine Knit Mohair Cardigan",
          description: "Ethereal weight with exceptional warmth. A study in texture and transparency.",
          price: 14500,
          salePrice: 14500,
          discountPercentage: 0,
          images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=2005&auto=format&fit=crop"],
          category: "Women",
          subcategory: "Knitwear",
          sizes: ["S", "M", "L"],
          colors: ["Cloud", "Soot"],
          stock: 18,
          rating: 4.9,
          reviewCount: 29,
          isTrending: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      ];

      for (const p of products) {
        await addDoc(collection(db, 'products'), p);
      }
      toast.success('Archive initialized successfully!');
      window.location.reload();
    } catch (err) {
      toast.error('Seeding failed');
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/20">System Administration</p>
      <button 
        onClick={seedData} 
        disabled={seeding}
        className="luxury-button !bg-brand-gold !text-brand-black hover:!bg-brand-black hover:!text-white"
      >
        {seeding ? 'Syncing Archive...' : 'Initialize Foundation Data'}
      </button>
    </div>
  );
}

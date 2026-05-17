import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Wishlist() {
  const { user, customer } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user || !customer?.wishlist?.length) {
        setLoading(false);
        setProducts([]);
        return;
      }

      try {
        const q = query(
          collection(db, 'products'),
          where(documentId(), 'in', customer.wishlist)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
      } catch (error) {
        console.error('Error fetching wishlist products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, customer?.wishlist]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-32 text-center flex flex-col items-center justify-center">
        <Heart className="w-16 h-16 text-gray-200 mb-8" />
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Your Wishlist</h1>
        <p className="text-gray-500 mb-12 max-w-xs font-medium">Please login to save and view your favorite styles.</p>
        <button 
          onClick={() => window.location.reload()} // Auth context will handle login
          className="bg-red-600 text-white px-10 py-4 font-bold uppercase tracking-widest text-xs"
        >
          Login Now
        </button>
      </div>
    );
  }

  if (loading) return (
    <div className="container mx-auto px-4 py-32 flex justify-center">
      <div className="w-10 h-10 border-4 border-gray-100 border-t-pink-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 md:py-24">
      <div className="flex items-end justify-between mb-16">
        <div>
          <span className="text-sm font-bold uppercase tracking-[0.3em] text-pink-600 block mb-2">My Favorites</span>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Wishlist</h1>
        </div>
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">{products.length} Items</p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-gray-50 rounded-sm flex flex-col items-center justify-center space-y-8">
          <Heart className="w-12 h-12 text-gray-200" />
          <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">Your wishlist is empty.</p>
          <Link to="/" className="text-black font-black uppercase tracking-widest text-[10px] flex items-center border-b border-black pb-1 hover:text-pink-600 hover:border-pink-600 transition-all">
            Start Exploring <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

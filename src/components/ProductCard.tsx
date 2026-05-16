import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Star, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user, customer } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = customer?.wishlist?.includes(product.id);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to wishlist products');
      return;
    }

    const customerRef = doc(db, 'customers', user.uid);
    try {
      if (isWishlisted) {
        await updateDoc(customerRef, {
          wishlist: arrayRemove(product.id)
        });
        toast.success('Removed from wishlist');
      } else {
        await updateDoc(customerRef, {
          wishlist: arrayUnion(product.id)
        });
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Failed to update wishlist');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Default to the first size for quick add
    addToCart(product, product.sizes?.[0] || 'O/S');
    toast.success('Archive updated');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-transparent"
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-beige/20">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-[2s] ease-out grayscale-[0.2] group-hover:grayscale-0"
          />
          
          {/* Wishlist Button - Minimal */}
          <button 
            onClick={toggleWishlist}
            className={`absolute top-6 right-6 p-2 transition-all duration-300 active:scale-90 z-20
              ${isWishlisted ? 'text-brand-black opacity-100' : 'text-brand-black/20 hover:text-brand-black opacity-0 group-hover:opacity-100'}`}
          >
            <Heart className={`w-[18px] h-[18px] ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
          </button>

          {/* Luxury Hover Quick Add */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out bg-white/10 backdrop-blur-xl border-t border-white/20 hidden lg:block z-10">
            <button 
              onClick={handleAddToCart}
              className="w-full py-4 bg-brand-black text-white text-[9px] font-semibold tracking-[0.2em] uppercase transition-all duration-500 hover:bg-brand-gold active:scale-[0.98]"
            >
              Add to archive
            </button>
          </div>
        </div>

        {/* Info - Elevated Typography */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between overflow-hidden">
             <motion.h3 
              className="text-[9px] uppercase tracking-[0.3em] text-brand-black/30 font-bold"
              initial={{ x: -10, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
             >
               {product.category}
             </motion.h3>
            {product.discountPercentage > 0 && (
              <span className="text-[10px] font-medium text-brand-gold italic font-serif tracking-widest">Seasonal Sale</span>
            )}
          </div>
          <h2 className="text-lg font-display font-medium tracking-tight text-brand-black leading-tight line-clamp-1">{product.name}</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-base font-semibold text-brand-black tracking-tight">{formatCurrency(product.salePrice)}</span>
              {product.salePrice < product.price && (
                <span className="text-xs text-brand-black/20 line-through tracking-tight font-mono">{formatCurrency(product.price)}</span>
              )}
            </div>
            {product.discountPercentage > 0 && (
              <span className="text-[9px] font-black text-white bg-brand-gold px-2 py-1 uppercase tracking-tighter">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Mobile Actions - Simplified */}
      <div className="flex lg:hidden mt-6 border-t border-brand-black/5 pt-4">
        <button 
          onClick={handleAddToCart}
          className="w-full text-[9px] font-bold tracking-[0.3em] uppercase text-brand-black flex items-center justify-center space-x-3 group/mobile"
        >
          <span>Quick Archive</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover/mobile:translate-x-1" />
        </button>
      </div>
    </motion.div>
  );
}

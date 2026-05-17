import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Plus, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/utils';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user, isInWishlist, toggleWishlist } = useAuth();

  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }
    await toggleWishlist(product.id);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1, product.sizes?.[0] || 'O/S');
    toast.success('Added to Archive');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Display */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[1.5s] ease-out"
          />
          
          {/* Discount Badge */}
          {product.discountPercentage > 0 && (
            <div className="absolute top-0 left-0 bg-brand-black text-white px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.2em] z-10">
              -{product.discountPercentage}%
            </div>
          )}

          {/* Luxury Overlay UI */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Wishlist Button */}
          <button 
            onClick={handleToggleWishlist}
            className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0 z-20"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-brand-black'}`} />
          </button>

          {/* Quick Add Button */}
          <button 
            onClick={handleQuickAdd}
            className="absolute bottom-6 inset-x-6 py-4 bg-white/95 backdrop-blur-sm text-brand-black text-[10px] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-[20px] group-hover:translate-y-0 flex items-center justify-center space-x-3 hover:bg-brand-black hover:text-white z-20"
          >
            <Plus className="w-3 h-3" />
            <span>Quick Archive</span>
          </button>
        </div>

        {/* Product Metadata */}
        <div className="mt-8 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-gold">
              {product.category}
            </span>
            <div className="h-[1px] flex-grow mx-4 bg-gray-100" />
          </div>
          
          <h3 className="text-sm font-display font-medium uppercase tracking-tight text-brand-black group-hover:italic transition-all">
            {product.name}
          </h3>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-black text-brand-black tracking-tight">
              {formatCurrency(product.salePrice)}
            </span>
            {product.price > product.salePrice && (
              <span className="text-xs text-brand-black/30 line-through font-light tracking-tight">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
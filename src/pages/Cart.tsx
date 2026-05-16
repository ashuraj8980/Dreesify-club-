import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../lib/utils';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ChevronRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-40 text-center flex flex-col items-center justify-center bg-brand-offwhite min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12 max-w-md"
        >
          <div className="relative inline-block">
            <ShoppingBag className="w-24 h-24 text-brand-black/5" />
            <div className="absolute inset-0 flex items-center justify-center">
               <span className="text-[10px] uppercase tracking-widest font-black opacity-20">Empty</span>
            </div>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-display uppercase tracking-tight">The archive is vacant</h1>
            <p className="text-brand-black/50 font-serif italic text-xl leading-relaxed">
              Your personal curation is currently empty. Discover our latest seasonal drops to begin your archive.
            </p>
          </div>
          <Link 
            to="/" 
            className="luxury-button inline-flex items-center space-x-4"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-brand-offwhite min-h-screen pb-32">
      <div className="container mx-auto px-4 lg:px-12 py-12 md:py-24">
        <div className="mb-20">
          <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-black/40 block mb-2">Curated Selection</span>
          <h1 className="text-6xl font-display font-medium uppercase tracking-tight">Your Private Archive <span className="font-serif italic lowercase tracking-tight">({cartCount})</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-12">
            {cart.map((item) => (
              <motion.div 
                layout
                key={`${item.id}-${item.selectedSize}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col md:flex-row gap-10 pb-12 border-b border-brand-black/5 group"
              >
                <div className="w-full md:w-48 aspect-[3/4] bg-brand-beige/20 overflow-hidden shrink-0">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-105" />
                </div>

                <div className="flex-grow flex flex-col py-2">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <h3 className="font-display text-2xl uppercase tracking-tight">{item.name}</h3>
                      <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest text-brand-black/40">
                        <span>Size: {item.selectedSize}</span>
                        <span>•</span>
                        <span>Color: {item.selectedColor || 'Archive'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id, item.selectedSize)}
                      className="p-2 text-brand-black/20 hover:text-brand-black transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xl font-semibold text-brand-black tracking-tight mb-8 font-serif italic">
                    {formatCurrency(item.salePrice)} <span className="text-[10px] not-italic font-sans uppercase text-brand-black/30 font-bold ml-2">per unit</span>
                  </p>

                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex flex-col space-y-4">
                      <span className="text-[9px] uppercase tracking-widest font-black text-brand-black/30">Quantity</span>
                      <div className="inline-flex items-center border border-brand-black/10 p-0.5 bg-white/50 backdrop-blur-sm">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="p-4 md:p-3 hover:bg-brand-black hover:text-white transition-all duration-300"
                        >
                          <Minus className="w-4 h-4 md:w-3 md:h-3" />
                        </button>
                        <span className="w-12 text-center text-[13px] md:text-xs font-bold font-mono">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="p-4 md:p-3 hover:bg-brand-black hover:text-white transition-all duration-300"
                        >
                          <Plus className="w-4 h-4 md:w-3 md:h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                       <span className="block text-[9px] uppercase tracking-widest font-black text-brand-black/30 mb-2">Extended Total</span>
                       <p className="text-2xl font-semibold text-brand-black tracking-tight">
                         {formatCurrency(item.salePrice * item.quantity)}
                       </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-12">
              <div className="space-y-8 border-b border-brand-black/5 pb-12">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/40">Summary</h2>
                
                <div className="space-y-6">
                  <div className="flex justify-between text-xs uppercase tracking-widest font-semibold text-brand-black/60">
                    <span>Valuation</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs uppercase tracking-widest font-semibold text-brand-black/60">
                    <span>Logistics</span>
                    <span className={cartTotal > 10000 ? 'text-brand-gold italic' : ''}>
                      {cartTotal >= 10000 ? 'Complimentary' : formatCurrency(250)}
                    </span>
                  </div>
                  <div className="pt-8 flex justify-between items-end border-t border-brand-black/5">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Total Commitment</span>
                    <span className="text-4xl font-display font-medium">{formatCurrency(cartTotal >= 10000 ? cartTotal : cartTotal + 250)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <p className="text-[10px] text-brand-black/40 font-medium leading-relaxed uppercase tracking-widest text-center">
                  Final taxation and global transit fees <br /> will be finalized at secure checkout.
                </p>

                <button 
                  onClick={() => navigate('/checkout')}
                  className="luxury-button w-full !py-6 flex items-center justify-center group"
                >
                  <span>Begin Procurement</span>
                  <ChevronRight className="ml-4 w-4 h-4 transition-transform group-hover:translate-x-2" />
                </button>
                
                <div className="pt-8 grid grid-cols-2 gap-4">
                   <div className="p-4 bg-brand-beige/20 flex flex-col items-center justify-center space-y-2">
                       <ShieldCheck className="w-5 h-5 text-brand-black/40" />
                       <span className="text-[8px] font-bold uppercase tracking-widest">Secure Commerce</span>
                   </div>
                   <div className="p-4 bg-brand-beige/20 flex flex-col items-center justify-center space-y-2">
                       <RefreshCw className="w-5 h-5 text-brand-black/40" />
                       <span className="text-[8px] font-bold uppercase tracking-widest">Global Returns</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

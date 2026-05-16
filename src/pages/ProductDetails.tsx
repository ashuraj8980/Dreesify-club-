import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Truck, RefreshCw, ChevronRight, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          if (data.sizes?.length) setSelectedSize(data.sizes[0]);
          if (data.colors?.length) setSelectedColor(data.colors[0]);
        } else {
          toast.error('Product not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-brand-offwhite">
      <div className="w-12 h-12 border-2 border-brand-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize);
    toast.success('Added to archive');
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  return (
    <div className="bg-brand-offwhite min-h-screen pb-32">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 lg:px-12 py-8">
        <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-brand-black/40 font-semibold">
          <Link to="/" className="hover:text-brand-black transition-colors underline-offset-4 hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-brand-black transition-colors underline-offset-4 hover:underline">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-brand-black">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Gallery - Editorial Layout */}
          <div className="lg:col-span-7 space-y-12">
            <div className="flex flex-col space-y-12">
              {product.images.map((img, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                  className="aspect-[3/4] bg-brand-beige/20 overflow-hidden"
                >
                  <img 
                    src={img} 
                    alt={`${product.name} ${idx + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
            <div className="space-y-16">
              {/* Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-black/40">{product.subcategory || product.category}</span>
                  <div className="flex items-center space-x-6">
                     <button onClick={shareProduct} className="p-2 text-brand-black/40 hover:text-brand-black transition-colors">
                       <Share2 className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => toggleWishlist(product.id)} 
                       className={`p-2 transition-colors ${isInWishlist(product.id) ? 'text-brand-black' : 'text-brand-black/40 hover:text-brand-black'}`}
                     >
                       <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                     </button>
                  </div>
                </div>
                <h1 className="text-5xl md:text-6xl font-display font-medium tracking-tight leading-[0.9] uppercase">{product.name}</h1>
                <div className="flex items-baseline space-x-6 pt-2">
                  <p className="text-2xl font-semibold tracking-tight">{formatCurrency(product.salePrice)}</p>
                  {product.salePrice < product.price && (
                    <p className="text-lg text-brand-black/30 line-through tracking-tight font-medium">{formatCurrency(product.price)}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-6 border-t border-brand-black/5 pt-12">
                 <p className="font-serif italic text-2xl text-brand-black/80 leading-relaxed">
                   {product.description}
                 </p>
              </div>

              {/* Selection */}
              <div className="space-y-12 border-t border-brand-black/5 pt-12">
                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] uppercase tracking-[0.2em] font-bold">Dimension</label>
                      <button className="text-[9px] uppercase tracking-widest font-semibold text-brand-black/40 border-b border-brand-black/10 hover:border-brand-black transition-all">Size Guide</button>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`h-14 flex items-center justify-center text-[11px] font-bold transition-all border
                            ${selectedSize === size 
                              ? 'bg-brand-black text-white border-brand-black' 
                              : 'bg-transparent text-brand-black border-brand-black/10 hover:border-brand-black'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection - Minimal */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-6">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-bold">Palette: <span className="text-brand-black/40">{selectedColor || product.colors[0]}</span></label>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full border-2 transition-all p-0.5
                            ${selectedColor === color ? 'border-brand-black' : 'border-transparent hover:border-brand-black/20'}`}
                        >
                           <div className="w-full h-full rounded-full bg-brand-beige border border-brand-black/5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="space-y-6 pt-12">
                <button 
                  onClick={handleAddToCart}
                  className="luxury-button w-full !py-8 flex items-center justify-center space-x-6 group"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-sm">Acquire for archive</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 gap-12 pt-16 border-t border-brand-black/5">
                <div className="space-y-4">
                  <div className="text-brand-black/60">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-2">Global Shipping</h4>
                    <p className="text-[10px] text-brand-black/40 leading-relaxed uppercase tracking-wide">Complimentary transit on all curated orders.</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="text-brand-black/60">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-2">Returns Window</h4>
                    <p className="text-[10px] text-brand-black/40 leading-relaxed uppercase tracking-wide">30-day window for seamless archival exchange.</p>
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

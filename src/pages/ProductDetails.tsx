import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Heart, ShoppingBag, Truck, RefreshCw, ChevronRight, Share2, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    async function fetchProductData() {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(data);
          if (data.sizes?.length) setSelectedSize(data.sizes[0]);
          if (data.colors?.length) setSelectedColor(data.colors[0]);

          // Fetch similar products
          const q = query(
            collection(db, 'products'),
            where('category', '==', data.category),
            limit(4)
          );
          const similarSnap = await getDocs(q);
          const similar = similarSnap.docs
            .map(d => ({ id: d.id, ...d.data() } as Product))
            .filter(p => p.id !== id);
          setSimilarProducts(similar);
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
    fetchProductData();
  }, [id, navigate]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize);
    toast.success('Added to bag');
  };

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes?.length) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, selectedSize);
    navigate('/checkout');
  };

  return (
    <div className="bg-white min-h-screen selection:bg-black selection:text-white">
      {/* Editorial Navigation */}
      <div className="container mx-auto px-4 lg:px-12 py-6 border-b border-gray-50">
        <nav className="flex items-center space-x-3 text-[9px] uppercase tracking-[0.3em] font-bold text-gray-400">
          <Link to="/" className="hover:text-black transition-colors">Archive</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-black transition-colors">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-black">{product.name}</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 lg:px-12 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          
          {/* Gallery Section */}
          <div className="lg:col-span-7 space-y-8">
            <div className="grid grid-cols-1 gap-8">
              {product.images.map((img, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="aspect-[3/4] bg-gray-50 overflow-hidden group"
                >
                  <img 
                    src={img} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Product Info Section */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32 space-y-12">
              {/* Product Header */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">{product.category}</span>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={`p-3 rounded-full border transition-all ${isInWishlist(product.id) ? 'bg-black border-black text-white' : 'border-gray-100 hover:border-black'}`}
                    >
                      <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                    </button>
                    <button className="p-3 rounded-full border border-gray-100 hover:border-black transition-all">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-display font-medium uppercase tracking-tight leading-[1.1]">
                  {product.name}
                </h1>
                
                <div className="flex items-center space-x-6">
                  <span className="text-2xl font-bold tracking-tighter">{formatCurrency(product.salePrice)}</span>
                  {product.price > product.salePrice && (
                    <span className="text-lg text-gray-300 line-through tracking-tighter">{formatCurrency(product.price)}</span>
                  )}
                  {product.discountPercentage > 0 && (
                    <span className="bg-black text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest">
                      -{product.discountPercentage}%
                    </span>
                  )}
                </div>
              </div>

              {/* Product Bio */}
              <div className="space-y-4 text-gray-600">
                <p className="text-lg font-serif italic leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Selections */}
              <div className="space-y-10 pt-10 border-t border-gray-100">
                {/* Size Selection */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em]">Select Size</label>
                      <button className="text-[10px] uppercase font-bold text-gray-400 border-b border-gray-100 hover:border-black transition-all">Size Guide</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-16 h-16 flex items-center justify-center text-[11px] font-bold transition-all border
                            ${selectedSize === size 
                              ? 'bg-black text-white border-black' 
                              : 'bg-white text-black border-gray-100 hover:border-black'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-[0.3em]">Palette</label>
                    <div className="flex gap-4">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`w-8 h-8 rounded-full border-2 p-0.5 transition-all
                            ${selectedColor === color ? 'border-black' : 'border-transparent hover:border-gray-200'}`}
                        >
                          <div className="w-full h-full rounded-full bg-gray-100 border border-gray-200" title={color} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4 pt-10">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-white text-black border-2 border-black py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all flex items-center justify-center space-x-4"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-black text-white py-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-gray-900 transition-all flex items-center justify-center group"
                  >
                    <span>Instant Checkout</span>
                    <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Luxury Details */}
              <div className="grid grid-cols-2 gap-8 pt-16 border-t border-gray-100">
                <div className="flex items-start space-x-4">
                  <Truck className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Premium Care</h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tight">Insured global transit</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Shield className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="space-y-1">
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Archive Policy</h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-tight">30-day verified exchange</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-40 border-t border-gray-100 pt-20">
            <div className="flex items-end justify-between mb-16">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Recommendations</span>
                <h2 className="text-4xl font-display font-medium uppercase tracking-tight">Refined Similitude</h2>
              </div>
              <Link to={`/category/${product.category.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-widest border-b border-black pb-1">View Collection</Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {similarProducts.map(similar => (
                <ProductCard key={similar.id} product={similar} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
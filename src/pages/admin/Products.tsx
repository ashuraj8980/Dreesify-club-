import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  X,
  Link as LinkIcon,
  Check,
  AlertCircle,
  CloudUpload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    salePrice: 0,
    category: 'Women',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [''],
    stock: 100,
    isTrending: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedProducts = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Product));
      setProducts(fetchedProducts);
    } catch (error: any) {
      console.error('Fetch error:', error);
      toast.error(`Sync Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Format must be an image');
      return;
    }

    setUploadingImageIndex(index);
    
    try {
      if (!storage) throw new Error('Cloud Storage unavailable.');
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `products/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      const newImgs = [...(formData.images || [])];
      newImgs[index] = downloadURL;
      setFormData({ ...formData, images: newImgs });
      toast.success('Asset uploaded successfully');
    } catch (error: any) {
      toast.error(`Upload Failed: ${error.message}`);
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isSuccess) return;

    if (!formData.name?.trim()) return toast.error('Designation is required');
    const validImages = (formData.images || []).filter(img => img && img.trim() !== '');
    if (validImages.length === 0) return toast.error('At least one visual asset link is required');

    setIsSubmitting(true);
    
    const price = Number(formData.price) || 0;
    const salePrice = Number(formData.salePrice) || price;
    const discountPercentage = price > salePrice 
      ? Math.round(((price - salePrice) / price) * 100) 
      : 0;

    const productPayload = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      price,
      salePrice,
      discountPercentage,
      category: formData.category || 'Women',
      sizes: formData.sizes || [],
      images: validImages,
      stock: Number(formData.stock) || 0,
      isTrending: !!formData.isTrending,
      updatedAt: Date.now()
    };

    try {
      // Extended timeout for mobile reliability (30 seconds)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Database operation timed out. Please check your connection.")), 30000)
      );

      const dbOperation = editingId 
        ? updateDoc(doc(db, 'products', editingId), productPayload)
        : addDoc(collection(db, 'products'), {
            ...productPayload,
            rating: 4.5,
            reviewCount: 0,
            createdAt: Date.now(),
          });

      await Promise.race([dbOperation, timeoutPromise]);
      
      setIsSuccess(true);
      toast.success('COLLECTION PIECE LIVE ON STOREFRONT', {
        style: {
          background: '#000',
          color: '#C5A059',
          fontWeight: '900',
          fontSize: '10px',
          letterSpacing: '0.2em'
        }
      });

      setTimeout(async () => {
        setIsSuccess(false);
        setIsModalOpen(false);
        resetForm();
        await fetchProducts();
      }, 2000);

    } catch (error: any) {
      console.error('Save error:', error);
      let msg = error.message;
      if (msg.includes('permission-denied')) {
        msg = "Permission Denied. Verify Admin status.";
      }
      toast.error(msg, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      salePrice: 0,
      category: 'Women',
      sizes: ['S', 'M', 'L', 'XL'],
      images: [''],
      stock: 100,
      isTrending: false,
    });
    setEditingId(null);
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      ...product,
      images: product.images?.length ? product.images : ['']
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Permanent deletion from archive?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Item Purged');
        await fetchProducts();
      } catch (error: any) {
        toast.error(`Purge Failed: ${error.message}`);
      }
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-center">
      <div className="w-12 h-12 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-white min-h-screen pb-20 text-center">
      <header className="bg-black py-16 md:py-24 text-center">
        <div className="container mx-auto px-6 text-center">
          <div className="flex flex-col items-center space-y-8 text-center">
            <Link to="/admin" className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-[#C5A059] transition-colors flex items-center justify-center">
              <ChevronLeft className="w-3 h-3 mr-2" /> Back to Nexus
            </Link>
            <h1 className="text-5xl md:text-7xl font-display font-medium uppercase tracking-tighter text-white text-center">Archive</h1>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#C5A059] text-center">{products.length} Styles Live</p>
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-16 py-6 bg-[#C5A059] text-black text-[11px] font-black uppercase tracking-[0.4em] hover:bg-white transition-all duration-500 shadow-2xl text-center"
            >
              Add New Piece
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20 max-w-7xl text-center">
        <div className="max-w-3xl mx-auto mb-20 relative text-center">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20" />
          <input 
            type="text" 
            placeholder="SEARCH COLLECTION..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-black/5 pl-16 pr-6 py-6 text-center text-[11px] font-black uppercase tracking-widest focus:border-[#C5A059] outline-none transition-all"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-[3/4] bg-black/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 text-center">
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
              <motion.div 
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={product.id} 
                className="group bg-white border border-black/5 hover:border-[#C5A059] transition-all duration-700 p-4 text-center"
              >
                <div className="aspect-[3/4] overflow-hidden bg-black/5 grayscale group-hover:grayscale-0 transition-all duration-1000 text-center">
                  <img src={product.images?.[0] || ''} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
                </div>
                <div className="pt-8 pb-4 space-y-4 text-center">
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-black/30 block text-center uppercase">{product.category}</span>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-black leading-tight truncate text-center uppercase">{product.name}</h3>
                  <p className="font-black text-[11px] tracking-widest text-black text-center">{formatCurrency(product.salePrice)}</p>
                  <div className="flex justify-center space-x-4 pt-4 text-center">
                    <button onClick={() => handleEdit(product)} className="p-3 bg-black text-white hover:bg-[#C5A059] hover:text-black transition-colors"><Edit2 className="w-3 h-3" /></button>
                    <button onClick={() => handleDelete(product.id)} className="p-3 border-2 border-black/10 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl text-center">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col text-center"
            >
              <div className="px-10 py-10 border-b border-black/5 flex items-center justify-between text-center relative">
                <div className="w-full text-center">
                  <h2 className="text-3xl font-display font-medium uppercase tracking-tighter text-black text-center uppercase">
                    {editingId ? 'Modify Style' : 'New Entry'}
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#C5A059] mt-2 text-center uppercase">Permanent Cloud Sync</p>
                </div>
                <button onClick={() => { if(!isSubmitting) setIsModalOpen(false); }} className="absolute right-10 p-3 hover:rotate-90 transition-transform"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 md:p-16 overflow-y-auto space-y-16 text-center">
                <div className="space-y-12 text-center">
                  <div className="space-y-6 text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 block text-center uppercase">Piece Designation</label>
                    <input 
                      type="text" 
                      required
                      placeholder="NAME OF THE OBJECT"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border-b-2 border-black/10 py-4 font-display text-2xl text-center outline-none focus:border-[#C5A059] transition-all uppercase"
                    />
                  </div>
                  
                  <div className="space-y-6 text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 block text-center uppercase">Description</label>
                    <textarea 
                      rows={3}
                      placeholder="NARRATIVE OF THE STYLE"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full border-2 border-black/5 p-6 text-center text-sm font-medium outline-none focus:border-[#C5A059] transition-all resize-none bg-black/5 uppercase tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-12 text-center">
                    <div className="space-y-6 text-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 block text-center uppercase">Retail (₹)</label>
                      <input 
                        type="number" 
                        required
                        value={formData.price || ''}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full border-b-2 border-black/10 py-4 font-black text-center text-xl outline-none focus:border-black transition-all"
                      />
                    </div>
                    <div className="space-y-6 text-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#C5A059] block text-center uppercase">Exclusive (₹)</label>
                      <input 
                        type="number" 
                        required
                        value={formData.salePrice || ''}
                        onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                        className="w-full border-b-2 border-[#C5A059]/30 py-4 font-black text-center text-xl outline-none focus:border-[#C5A059] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-12 text-center">
                    <div className="space-y-6 text-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 block text-center uppercase">Sector</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full border-b-2 border-black/10 py-4 font-black text-center text-[10px] outline-none focus:border-[#C5A059] transition-all bg-white uppercase tracking-widest"
                      >
                        <option value="Women">Women</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                    <div className="space-y-6 text-center">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 block text-center uppercase">Stock Units</label>
                      <input 
                        type="number" 
                        value={formData.stock || ''}
                        onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                        className="w-full border-b-2 border-black/10 py-4 font-black text-center text-xl outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-12 pt-10 border-t border-black/5 text-center">
                    <label className="text-[10px] font-black uppercase tracking-[0.5em] text-black/30 block text-center uppercase">Visual Identity</label>
                    <div className="space-y-12 text-center max-w-lg mx-auto">
                      {formData.images?.map((img, idx) => (
                        <div key={idx} className="space-y-8 p-8 border-2 border-black/5 bg-black/5 text-center">
                          <div className="space-y-4 text-center">
                            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C5A059] block text-center uppercase">Direct Image Link (Recommended)</label>
                            <div className="relative">
                              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-black/20" />
                              <input 
                                type="text" 
                                placeholder="HTTPS://IMAGE-HOST.COM/PHOTO.JPG"
                                value={img}
                                onChange={e => {
                                  const newImgs = [...(formData.images || [])];
                                  newImgs[idx] = e.target.value;
                                  setFormData({...formData, images: newImgs});
                                }}
                                className="w-full bg-white border border-black/10 py-5 pl-12 pr-6 text-center text-[10px] font-black tracking-widest outline-none focus:border-[#C5A059] transition-all uppercase"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center space-y-6 text-center">
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-black/20 text-center uppercase">OR UPLOAD FROM MOBILE</span>
                            <div className="relative text-center">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, idx)}
                                className="hidden"
                                id={`file-${idx}`}
                              />
                              <label 
                                htmlFor={`file-${idx}`}
                                className={`flex items-center justify-center px-10 py-4 border-2 border-black text-[9px] font-black uppercase tracking-[0.3em] cursor-pointer hover:bg-black hover:text-white transition-all ${uploadingImageIndex === idx ? 'opacity-50' : ''}`}
                              >
                                {uploadingImageIndex === idx ? 'Uploading...' : 'Choose File'}
                              </label>
                            </div>
                          </div>

                          {img && (
                            <div className="flex flex-col items-center space-y-4 pt-4 text-center">
                              <div className="w-24 aspect-[3/4] overflow-hidden border-2 border-white shadow-2xl">
                                <img src={img} className="w-full h-full object-cover grayscale" alt="Preview" />
                              </div>
                              <div className="flex items-center space-x-2 text-[#C5A059] justify-center">
                                <Check className="w-3 h-3" />
                                <span className="text-[8px] font-black uppercase tracking-widest uppercase">Asset Ready</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-12 pt-16 border-t border-black/5 text-center">
                    <div className="flex items-center justify-center space-x-4">
                      <input 
                        type="checkbox" 
                        id="trending"
                        checked={formData.isTrending}
                        onChange={e => setFormData({...formData, isTrending: e.target.checked})}
                        className="w-5 h-5 accent-[#C5A059]"
                      />
                      <label htmlFor="trending" className="text-[10px] font-black uppercase tracking-[0.4em] cursor-pointer uppercase">Highlight in Trending</label>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSubmitting || isSuccess}
                      className={`w-full py-8 text-[12px] font-black uppercase tracking-[0.5em] transition-all duration-700 shadow-2xl disabled:opacity-80 flex items-center justify-center ${isSuccess ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-[#C5A059] hover:text-black'}`}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-4">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="uppercase">Establishing Cloud Sync...</span>
                        </div>
                      ) : isSuccess ? (
                        <div className="flex items-center justify-center space-x-4 text-center">
                          <Check className="w-5 h-5" />
                          <span className="uppercase">SUCCESSFULLY LIVE</span>
                        </div>
                      ) : (
                        <span className="uppercase">{editingId ? 'Push Final Updates' : 'Publish to Storefront'}</span>
                      )}
                    </button>
                    {isSubmitting && (
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C5A059] animate-pulse uppercase">Waiting for Server Confirmation...</p>
                    )}
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
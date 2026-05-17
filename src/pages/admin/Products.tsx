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
  Filter, 
  Edit2, 
  Trash2, 
  ChevronLeft,
  X,
  Upload,
  ExternalLink,
  Package,
  AlertCircle
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
  
  // Form State
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
      if (!db) throw new Error("Firestore instance is not ready.");
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
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const storageRef = ref(storage, `products/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => {
        const newImgs = [...(prev.images || [])];
        newImgs[index] = downloadURL;
        return { ...prev, images: newImgs };
      });
      toast.success('Asset uploaded');
    } catch (error: any) {
      console.error('Upload Error:', error);
      toast.error(`Upload Failed: ${error.message}`);
    } finally {
      setUploadingImageIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validImages = (formData.images || []).filter(img => img && img.trim() !== '');
    
    if (!formData.name?.trim()) return toast.error('Name is mandatory');
    if (validImages.length === 0) return toast.error('At least one image is required');

    setIsSubmitting(true);
    
    const price = Number(formData.price) || 0;
    const salePrice = Number(formData.salePrice) || 0;
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
      updatedAt: serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productPayload);
        toast.success('Archive Updated');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productPayload,
          rating: 4.5,
          reviewCount: 0,
          createdAt: serverTimestamp(),
        });
        toast.success('Style Published');
      }
      setIsModalOpen(false);
      resetForm();
      await fetchProducts();
    } catch (error: any) {
      console.error('Submission Error:', error);
      toast.error(`Database Error: ${error.message}`);
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
    if (window.confirm('Permanent deletion? This cannot be undone.')) {
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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-[#FAFAFA] min-h-screen pb-20">
      <header className="bg-white border-b border-black/5 py-12 md:py-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center md:text-left">
              <Link to="/admin" className="text-[10px] font-black uppercase tracking-[0.4em] text-black/30 flex items-center justify-center md:justify-start hover:text-black transition-colors group">
                <ChevronLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Nexus
              </Link>
              <h1 className="text-5xl md:text-7xl font-display font-medium uppercase tracking-tighter">Inventory</h1>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-gold">{products.length} Styles active in collection</p>
            </div>
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="px-12 py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.3em] hover:bg-brand-gold hover:text-black transition-all duration-500 shadow-xl"
            >
              Add New Piece
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 md:px-12 py-16 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6 mb-16">
          <div className="flex-grow relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-black/20 group-focus-within:text-brand-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by name, ID or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-black/5 pl-16 pr-6 py-6 text-[11px] font-black uppercase tracking-widest focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-all shadow-sm"
            />
          </div>
          <button className="bg-white border border-black/5 px-10 py-6 flex items-center space-x-4 hover:border-black transition-all group shadow-sm">
            <Filter className="w-4 h-4 text-black/40 group-hover:text-black transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sort Collection</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-[3/4] bg-white border border-black/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
            {products.length === 0 ? (
              <div className="col-span-full py-40 text-center space-y-6">
                <Package className="w-12 h-12 text-black/10 mx-auto" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-black/30">The archive is currently empty</p>
              </div>
            ) : (
              products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={product.id} 
                  className="group bg-white border border-black/5 hover:border-black transition-all duration-700 relative"
                >
                  <div className="aspect-[3/4] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
                    <img src={product.images?.[0] || ''} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]" />
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-[0.3em] text-black/30">{product.category}</span>
                      <span className={`text-[8px] font-black uppercase px-2 py-1 ${product.stock < 10 ? 'text-red-500 bg-red-50' : 'text-brand-gold bg-brand-gold/5'}`}>
                        Qty: {product.stock}
                      </span>
                    </div>
                    <h3 className="text-[12px] font-black uppercase tracking-tight text-black leading-tight truncate">{product.name}</h3>
                    <div className="flex items-center justify-between pt-2">
                       <p className="font-black text-[12px] text-black tracking-widest">{formatCurrency(product.salePrice)}</p>
                       <div className="flex space-x-2">
                          <button onClick={() => handleEdit(product)} className="p-2.5 hover:bg-black hover:text-white transition-colors border border-black/5"><Edit2 className="w-3 h-3" /></button>
                          <button onClick={() => handleDelete(product.id)} className="p-2.5 hover:bg-red-500 hover:text-white transition-colors border border-black/5"><Trash2 className="w-3 h-3" /></button>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="px-10 py-8 border-b border-black/5 flex items-center justify-between bg-white z-10">
                <div className="space-y-1">
                  <h2 className="text-2xl font-display font-medium uppercase tracking-tighter">
                    {editingId ? 'Modify Archival Entry' : 'New Collection Piece'}
                  </h2>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-gold">
                    All updates are synced in real-time to the storefront
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-50 transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 md:p-16 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-widest text-black/40 flex items-center">
                      Designation <span className="ml-2 text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="E.G. SCULPTED MIDI DRESS"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border-b-2 border-black/10 py-4 font-display font-medium text-xl outline-none focus:border-brand-gold transition-all"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-widest text-black/40">Narrative</label>
                    <textarea 
                      rows={4}
                      placeholder="The structural nuances of this piece..."
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full border border-black/5 p-6 font-medium text-sm outline-none focus:border-brand-gold transition-all resize-none bg-gray-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-widest text-black/40">Market Value (₹)</label>
                      <input 
                        type="number" 
                        required
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                        className="w-full border-b-2 border-black/10 py-4 font-black text-lg outline-none focus:border-black transition-all"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-widest text-brand-gold">Exclusive Price (₹)</label>
                      <input 
                        type="number" 
                        required
                        value={formData.salePrice}
                        onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                        className="w-full border-b-2 border-brand-gold/30 py-4 font-black text-lg outline-none focus:border-brand-gold transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-widest text-black/40">Archive Sector</label>
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value})}
                        className="w-full border-b-2 border-black/10 py-4 font-black text-[11px] outline-none focus:border-black transition-all bg-white uppercase tracking-widest"
                      >
                        <option value="Women">Women</option>
                        <option value="Accessories">Accessories</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase tracking-widest text-black/40">Stock Status</label>
                      <input 
                        type="number" 
                        value={formData.stock}
                        onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                        className="w-full border-b-2 border-black/10 py-4 font-black text-[11px] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[11px] font-black uppercase tracking-widest text-black/40">Visual Assets</label>
                    <div className="space-y-6">
                      {formData.images?.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <div className="flex gap-4">
                            <div className="flex-grow">
                              <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, idx)}
                                className="hidden"
                                id={`file-${idx}`}
                              />
                              <label 
                                htmlFor={`file-${idx}`}
                                className={`w-full flex items-center justify-between px-6 py-5 border border-dashed ${uploadingImageIndex === idx ? 'border-brand-gold' : 'border-black/10 hover:border-black'} cursor-pointer transition-all`}
                              >
                                <div className="flex items-center space-x-4">
                                  {uploadingImageIndex === idx ? (
                                    <div className="w-3 h-3 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                                  ) : <Upload className="w-3 h-3" />}
                                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                                    {img ? 'Update Asset' : 'Upload From Storage'}
                                  </span>
                                </div>
                                {img && <Package className="w-3 h-3 text-brand-gold" />}
                              </label>
                            </div>
                            {idx > 0 && (
                              <button type="button" onClick={() => {
                                setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }));
                              }} className="p-4 border border-black/5 hover:bg-red-500 hover:text-white transition-all text-black/20">
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          {img && (
                            <div className="mt-4 flex items-center space-x-6 p-4 bg-gray-50 border border-black/5">
                              <img src={img} className="w-16 aspect-[3/4] object-cover grayscale shadow-lg" alt="" />
                              <div className="space-y-1">
                                <p className="text-[8px] font-black uppercase text-black/30">CDN Reference</p>
                                <p className="text-[9px] font-medium truncate max-w-[200px] text-brand-gold italic">Active Path Established</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ''] }))}
                        className="w-full py-4 text-[9px] font-black uppercase tracking-[0.3em] text-black/30 hover:text-black transition-colors"
                      >
                        + Add Perspective
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-10 border-t border-black/5">
                    <div className="flex items-center space-x-4">
                      <input 
                        type="checkbox" 
                        id="trending"
                        checked={formData.isTrending}
                        onChange={e => setFormData({...formData, isTrending: e.target.checked})}
                        className="w-4 h-4 accent-black"
                      />
                      <label htmlFor="trending" className="text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer">Highlight in Trending</label>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className={`px-16 py-6 bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] hover:bg-brand-gold hover:text-black transition-all duration-700 shadow-2xl flex items-center space-x-4 ${isSubmitting ? 'opacity-50' : ''}`}
                    >
                      {isSubmitting ? 'Synchronizing...' : (editingId ? 'Push Updates' : 'Publish to Store')}
                    </button>
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
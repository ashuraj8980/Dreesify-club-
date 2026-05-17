import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
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
  Upload
} from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    salePrice: 0,
    discountPercentage: 0,
    category: 'Women',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [''],
    stock: 100,
    isTrending: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingImageIndex, setUploadingImageIndex] = useState<number | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImageIndex(index);
    
    try {
      if (!storage) {
        throw new Error('Storage service is not initialized.');
      }
      
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setFormData(prev => {
        const newImgs = [...(prev.images || [])];
        newImgs[index] = downloadURL;
        return { ...prev, images: newImgs };
      });
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploadingImageIndex(null);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading, navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch product list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchProducts();
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validImages = formData.images?.filter(img => img.trim() !== '') || [];
    
    if (!formData.name?.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (formData.price === undefined || formData.price < 0) {
      toast.error('Valid regular price is required');
      return;
    }
    if (formData.salePrice === undefined || formData.salePrice < 0) {
      toast.error('Valid sale price is required');
      return;
    }
    if (validImages.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    const price = Number(formData.price);
    const salePrice = Number(formData.salePrice);
    const discountPercentage = price > salePrice 
      ? Math.round(((price - salePrice) / price) * 100) 
      : 0;

    const productData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || '',
      price,
      salePrice,
      discountPercentage,
      category: formData.category || 'Women',
      subcategory: formData.subcategory || '',
      sizes: formData.sizes || [],
      colors: formData.colors || [],
      images: validImages,
      stock: Number(formData.stock) || 0,
      isTrending: !!formData.isTrending,
      updatedAt: Date.now()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          rating: 4.5,
          reviewCount: Math.floor(Math.random() * 20) + 5,
          createdAt: Date.now(),
        });
        toast.success('Product added successfully');
      }
      setIsModalOpen(false);
      resetForm();
      await fetchProducts();
    } catch (error: any) {
      console.error('Submit error details:', error);
      toast.error(`Operation failed: ${error.message || 'Unknown database error'}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      salePrice: 0,
      discountPercentage: 0,
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
      images: product.images.length > 0 ? product.images : ['']
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this style?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        toast.success('Style removed');
        await fetchProducts();
      } catch (error: any) {
        toast.error(`Deletion failed: ${error.message}`);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-brand-black/5 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-12 flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 text-center md:text-left">
          <div>
            <Link to="/admin" className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/20 flex items-center justify-center md:justify-start mb-6 hover:text-brand-black transition-colors">
              <ChevronLeft className="w-3 h-3 mr-2" /> Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-display font-medium uppercase tracking-tight">Products</h1>
            <p className="text-brand-black/30 font-serif italic text-xs md:text-sm mt-3">{products.length} Products currently in the catalog.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="luxury-button w-full md:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> New Product
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-12 py-20 space-y-16 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-grow relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-black/20" />
            <input 
              type="text" 
              placeholder="Search products by name or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-brand-black/5 pl-16 pr-6 py-5 text-xs font-black uppercase tracking-widest focus:border-brand-gold outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-6">
            <button className="bg-white border border-brand-black/5 px-8 py-5 flex items-center space-x-3 hover:bg-brand-black hover:text-white transition-all shadow-sm">
              <Filter className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Filter</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                <div className="aspect-[3/4] overflow-hidden bg-gray-50">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-brand-black/30">{product.category}</span>
                    <span className="text-[8px] font-black uppercase text-brand-gold bg-brand-gold/5 px-3 py-1 border border-brand-gold/10">{product.stock} IN STOCK</span>
                  </div>
                  <h3 className="font-display font-medium text-sm truncate uppercase tracking-tight text-brand-black leading-tight">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <p className="font-black text-xs text-brand-black tracking-widest">{formatCurrency(product.salePrice)}</p>
                       {product.price > product.salePrice && (
                         <p className="text-[9px] text-brand-black/20 line-through font-mono tracking-tighter">{formatCurrency(product.price)}</p>
                       )}
                    </div>
                    {product.discountPercentage > 0 && (
                      <span className="text-[8px] font-black text-brand-gold italic tracking-[0.2em]">-{product.discountPercentage}%</span>
                    )}
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex flex-col space-y-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                  <button onClick={() => handleEdit(product)} className="p-3 bg-white text-brand-black shadow-2xl hover:bg-brand-black hover:text-white transition-colors border border-brand-black/5"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(product.id)} className="p-3 bg-white text-red-500 shadow-2xl hover:bg-red-500 hover:text-white transition-colors border border-brand-black/5"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl rounded-sm"
          >
            <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {editingId ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 transition-colors"><X /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-widest text-brand-black">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border-2 border-brand-black p-4 font-black text-sm outline-none focus:bg-brand-yellow/5 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-black uppercase tracking-widest text-brand-black">Description</label>
                  <textarea 
                    rows={4}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full border-2 border-brand-black p-4 font-bold text-sm outline-none focus:bg-brand-yellow/5 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-brand-black">Regular Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                      className="w-full border-2 border-brand-black p-4 font-black text-sm outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-black uppercase tracking-widest text-brand-black">Sale Price (₹)</label>
                    <input 
                      type="number" 
                      required
                      value={formData.salePrice}
                      onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})}
                      className="w-full border-2 border-brand-black p-4 font-black text-sm outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Stock Units</label>
                  <input 
                    type="number" 
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: Number(e.target.value)})}
                    className="w-full border-2 border-gray-100 p-4 font-bold text-sm outline-none focus:border-black transition-all"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Collection / Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full border-2 border-gray-100 p-4 font-bold text-sm outline-none focus:border-black transition-all bg-white"
                  >
                    <option value="Women">Women</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Available Sizes (Comma separated)</label>
                  <input 
                    type="text" 
                    value={formData.sizes?.join(', ')}
                    onChange={e => setFormData({...formData, sizes: e.target.value.split(',').map(s => s.trim())})}
                    placeholder="e.g. S, M, L, XL"
                    className="w-full border-2 border-gray-100 p-4 font-bold text-sm outline-none focus:border-black transition-all"
                  />
                  <p className="text-[9px] text-gray-400 italic">Example: S, M, L, XL, Universal</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Product Images (Upload or URL)</label>
                  <div className="space-y-6">
                    {formData.images?.map((img, idx) => (
                      <div key={idx} className="space-y-4 p-4 border-2 border-gray-100 bg-gray-50/30 rounded-sm">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-grow space-y-4">
                            <div className="space-y-2">
                              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Option 1: Upload from Gallery</p>
                              <div className="relative">
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, idx)}
                                  className="hidden"
                                  id={`file-upload-${idx}`}
                                />
                                <label 
                                  htmlFor={`file-upload-${idx}`}
                                  className={`w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-dashed ${uploadingImageIndex === idx ? 'border-brand-gold bg-brand-gold/5' : 'border-gray-200 hover:border-black'} transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest`}
                                >
                                  {uploadingImageIndex === idx ? (
                                    <>
                                      <div className="w-3 h-3 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                                      Uploading Image...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-3 h-3" />
                                      {img ? 'Replace Image' : 'Select Image'}
                                    </>
                                  )}
                                </label>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Option 2: Direct Asset URL</p>
                              <input 
                                type="text" 
                                value={img}
                                placeholder="https://external-archive.com/..."
                                onChange={e => {
                                  setFormData(prev => {
                                    const newImgs = [...(prev.images || [])];
                                    newImgs[idx] = e.target.value;
                                    return { ...prev, images: newImgs };
                                  });
                                }}
                                className="w-full border-2 border-gray-100 p-3 font-medium text-[10px] outline-none focus:border-black transition-all bg-white"
                              />
                            </div>
                          </div>

                          {idx > 0 && (
                            <button type="button" onClick={() => {
                              setFormData(prev => {
                                const newImgs = prev.images?.filter((_, i) => i !== idx);
                                return { ...prev, images: newImgs };
                              });
                            }} className="p-2 bg-white hover:bg-red-50 text-red-500 border border-gray-100 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {img && (
                          <div className="relative group w-32 aspect-[3/4] border-2 border-gray-100 p-1 bg-white">
                            <img src={img} alt="Preview" className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
                            <div className="absolute top-2 right-2 bg-black text-white text-[8px] px-2 py-1 font-black uppercase">Active</div>
                          </div>
                        )}
                      </div>
                    ))}
                    {(formData.images?.length || 0) < 6 && (
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ''] }))}
                        className="w-full border-2 border-dashed border-gray-100 p-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:border-black hover:text-black transition-all flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3 mr-2" /> Add Additional Image
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <input 
                    type="checkbox" 
                    id="isTrending"
                    checked={formData.isTrending}
                    onChange={e => setFormData({...formData, isTrending: e.target.checked})}
                    className="w-5 h-5 accent-pink-600"
                  />
                  <label htmlFor="isTrending" className="text-[10px] font-black uppercase tracking-widest cursor-pointer">Set as Trending</label>
                </div>

                <div className="pt-8">
                  <button 
                    type="submit" 
                    className="luxury-button w-full py-6 flex items-center justify-center text-[11px]"
                  >
                    {editingId ? 'Save Changes' : 'Add to Catalog'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
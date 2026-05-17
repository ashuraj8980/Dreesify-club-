import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

function AdminProductList({ products, onDelete }) {
    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Manage Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                    <div key={product.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
                        <div className="flex items-start space-x-4">
                            <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded"/>
                            <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-gray-500">{product.color}, {product.size}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-red-500 font-bold text-lg">${product.price}</p>
                                    <p className="text-sm text-gray-500 line-through">${product.originalPrice}</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => onDelete(product.id, product.imageName)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm mt-4 self-end">
                            Delete
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [price, setPrice] = useState(''); // This will be the selling price
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    useEffect(() => {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProducts(prods);
            setProductsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!image) {
            setError('Product image is required.');
            return;
        }
        if (!name || !description || !originalPrice || !price || !size || !color) {
            setError('Please fill out all fields.');
            return;
        }
        setLoading(true);
        setError('');

        const imageName = `${Date.now()}_${image.name}`;
        const storageRef = ref(storage, `products/${imageName}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                setError('Failed to upload image. Please try again.');
                console.error(error);
                setLoading(false);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    await addDoc(collection(db, 'products'), {
                        name,
                        description,
                        originalPrice: parseFloat(originalPrice),
                        price: parseFloat(price),
                        size,
                        color,
                        imageUrl: downloadURL,
                        imageName: imageName,
                        createdAt: serverTimestamp(),
                    });
                    
                    // Reset form
                    setName('');
                    setDescription('');
                    setOriginalPrice('');
                    setPrice('');
                    setSize('');
                    setColor('');
                    setImage(null);
                    setUploadProgress(0);

                } catch (dbError) {
                    setError('Failed to save product details. Please try again.');
                    console.error(dbError);
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    const handleDelete = async (productId, imageName) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                // Delete from Firestore
                await deleteDoc(doc(db, 'products', productId));
                
                // Delete image from Storage
                const imageRef = ref(storage, `products/${imageName}`);
                await deleteObject(imageRef);

            } catch (err) {
                console.error("Error removing document: ", err);
                alert("Error deleting product. Please check the console.");
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-6 p-4">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Product Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" rows="3"></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="originalPrice" className="block text-gray-700 font-bold mb-2">Original Price ($)</label>
                            <input type="number" id="originalPrice" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" />
                        </div>
                        <div>
                           <label htmlFor="price" className="block text-gray-700 font-bold mb-2">Selling Price ($)</label>
                            <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label htmlFor="size" className="block text-gray-700 font-bold mb-2">Size (e.g., S, M, L, XL)</label>
                            <input type="text" id="size" value={size} onChange={e => setSize(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" />
                        </div>
                        <div>
                           <label htmlFor="color" className="block text-gray-700 font-bold mb-2">Color</label>
                            <input type="text" id="color" value={color} onChange={e => setColor(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label htmlFor="image" className="block text-gray-700 font-bold mb-2">Product Image</label>
                        <input type="file" id="image" onChange={handleImageChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                    </div>
                    
                    {loading && <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4"><div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${uploadProgress}%`}}></div></div>}
                    
                    <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full disabled:bg-blue-300">
                        {loading ? 'Uploading...' : 'Add Product'}
                    </button>
                </form>
            </div>
             {productsLoading ? <p>Loading products...</p> : <AdminProductList products={products} onDelete={handleDelete} />}
        </div>
    );
}

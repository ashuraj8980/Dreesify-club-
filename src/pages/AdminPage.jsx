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
            <div className="space-y-4">
                {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
                        <div className="flex items-center space-x-4">
                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded"/>
                            <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-gray-500">${product.price}</p>
                            </div>
                        </div>
                        <button onClick={() => onDelete(product.id, product.imageName)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
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
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    // Fetch products
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
        setError('');
        setLoading(true);

        const imageName = `${Date.now()}_${image.name}`;
        const storageRef = ref(storage, `products/${imageName}`);
        const uploadTask = uploadBytesResumable(storageRef, image);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (err) => {
                console.error(err);
                setError('Failed to upload image. Please try again.');
                setLoading(false);
            },
            async () => {
                // Upload complete, get download URL
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    // Save product to Firestore
                    await addDoc(collection(db, 'products'), {
                        name,
                        description,
                        price: parseFloat(price),
                        imageUrl: downloadURL,
                        imageName, // Store image name for deletion
                        createdAt: serverTimestamp()
                    });
                    // Reset form
                    setName('');
                    setDescription('');
                    setPrice('');
                    setImage(null);
                    e.target.reset(); // Reset file input
                } catch (dbError) {
                    console.error(dbError);
                    setError('Failed to save product details.');
                } finally {
                    setLoading(false);
                    setUploadProgress(0);
                }
            }
        );
    };
    
    const handleDelete = async (productId, imageName) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            // Delete from Firestore
            await deleteDoc(doc(db, 'products', productId));
            // Delete image from Storage
            if(imageName){
                 const imageRef = ref(storage, `products/${imageName}`);
                 // You might want to add error handling for deletion as well
                 await deleteDoc(imageRef);
            } else{
                 console.log('No image name found for this product, skipping storage deletion.')
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product.');
        }
    };

    if (!currentUser) {
        return <p>Loading...</p>; // Or a spinner
    }

    return (
        <div className="max-w-4xl mx-auto mt-6">
            <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    {/* Form fields ... */}
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Product Name</label>
                        <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="price" className="block text-gray-700 font-bold mb-2">Price</label>
                        <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} className="shadow appearance-none border rounded w-full py-2 px-3" required />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="image" className="block text-gray-700 font-bold mb-2">Product Image</label>
                        <input type="file" id="image" onChange={handleImageChange} className="w-full" required />
                    </div>
                    {loading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                    )}
                    <button type="submit" disabled={loading} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 w-full disabled:bg-gray-400">
                        {loading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Add Product'}
                    </button>
                </form>
            </div>

            {productsLoading ? <p className="mt-8">Loading products list...</p> : <AdminProductList products={products} onDelete={handleDelete} />}
        </div>
    );
}

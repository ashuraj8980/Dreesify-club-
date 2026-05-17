import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../firebase/config';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const db = getFirestore(app);
      const productsCollection = collection(db, 'products');
      const productSnapshot = await getDocs(productsCollection);
      const productList = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
      setLoading(false);
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-center text-text-primary mb-12">All Products</h1>
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-text-primary mb-12">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product) => (
          <div key={product.id} className="bg-secondary rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition duration-300 border-2 border-accent">
            <img src={product.image} alt={product.name} className="w-full h-80 object-cover" />
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-text-primary mb-2">{product.name}</h2>
              <p className="text-accent text-xl mb-4">${product.price}</p>
              <Link to={`/products/${product.id}`} className="bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition duration-300">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;

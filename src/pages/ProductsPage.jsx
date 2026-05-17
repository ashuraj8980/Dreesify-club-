import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from '../firebase/config';
import { Link } from 'react-router-dom';

const db = getFirestore(app);

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading products...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <Link to={`/products/${product.id}`}>
              <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600 mt-2">${product.price.toFixed(2)}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsPage;

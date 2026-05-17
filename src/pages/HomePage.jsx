import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

function ProductCard({ product }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg">{product.name}</h3>
        <p className="text-gray-600 mt-2">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-xl text-indigo-600">${product.price}</span>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Add to Cart</button>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData = [];
      querySnapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching products:', err);
      setError('Failed to load products.');
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Loading products...</p>;
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">{error}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      {products.length === 0 ? (
        <p>No products available yet. Check back soon!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
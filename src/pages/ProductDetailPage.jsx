import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from '../firebase/config';
import { useCart } from '../context/CartContext';

const db = getFirestore(app);

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      alert('Product added to cart!');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading product details...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8 text-center">Product not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-lg shadow-md" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-700 mb-4">{product.description}</p>
          <p className="text-2xl font-semibold text-gray-800 mb-6">${product.price.toFixed(2)}</p>
          <button 
            onClick={handleAddToCart}
            className="bg-blue-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

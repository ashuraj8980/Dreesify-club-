import React from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center">Loading...</div>;
  }

  const product = products.find(p => p.id === id);

  if (!product) {
    return <div className="container mx-auto px-4 py-20 text-center">Product not found.</div>;
  }

  const handleAddToCart = () => {
    if (selectedSize) {
      addToCart(product, selectedSize);
    } else {
      // In a real app, you would show a toast notification or some other feedback.
      alert('Please select a size.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <img src={product.images[0]} alt={product.name} className="w-full rounded-lg shadow-lg" />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl text-gray-800 mb-6">
            ₹{product.salePrice} <span className="line-through text-gray-500">₹{product.regularPrice}</span>
          </p>
          <p className="text-gray-600 mb-6">{product.description}</p>

          {/* Size Selector */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Select Size</h3>
            <div className="flex space-x-2">
              {product.sizes.map(size => (
                <button 
                  key={size} 
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border rounded-md ${selectedSize === size ? 'bg-black text-white' : 'hover:bg-gray-100'}`}>
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors duration-300">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

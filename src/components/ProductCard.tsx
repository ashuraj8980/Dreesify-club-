import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  // Default size selection for simplicity. In a real app, you'd have a size selector.
  const defaultSize = product.sizes[0] || 'M';

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
      <Link to={`/product/${product.id}`} className="block">
        <img src={product.images[0]} alt={product.name} className="w-full h-64 object-cover" />
      </Link>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{product.name}</h3>
        <p className="text-gray-600 mt-1">₹{product.salePrice} <span className="line-through text-sm">₹{product.regularPrice}</span></p>
        <button 
          onClick={() => addToCart(product, defaultSize)}
          className="mt-4 w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition-colors duration-300">
          Add to Cart
        </button>
      </div>
    </div>
  );
}

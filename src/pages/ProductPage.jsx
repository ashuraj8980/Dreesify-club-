import React from 'react';
import { Link } from 'react-router-dom';

const products = [
  { id: 1, name: 'Classic T-Shirt', price: '$20', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60' },
  { id: 2, name: 'Denim Jeans', price: '$50', image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60' },
  { id: 3, name: 'Leather Jacket', price: '$120', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60' },
  { id: 4, name: 'Running Shoes', price: '$80', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60' },
  { id: 5, name: 'Stylish Watch', price: '$200', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf32?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60' },
  { id: 6, name: 'Designer Sunglasses', price: '$150', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60' },
];

const ProductPage = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-text-primary mb-12">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {products.map((product) => (
          <div key={product.id} className="bg-secondary rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition duration-300 border-2 border-accent">
            <img src={product.image} alt={product.name} className="w-full h-80 object-cover" />
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-text-primary mb-2">{product.name}</h2>
              <p className="text-accent text-xl mb-4">{product.price}</p>
              <Link to={`/products/${product.id}`} className="bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition duration-300">View Details</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductPage;

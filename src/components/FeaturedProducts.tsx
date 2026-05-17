import React from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const { products, loading } = useProducts();

  if (loading) {
    return <div>Loading...</div>;
  }

  // For now, let's just take the first 8 products as featured
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">Featured Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {featuredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

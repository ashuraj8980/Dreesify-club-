import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

// Product Card Component
function ProductCard({ product }) {
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    return (
        <div className="group relative border rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="w-full h-64 bg-gray-200 overflow-hidden">
                <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            </div>
            {discount > 0 && (
                 <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    {discount}% OFF
                </div>
            )}
            <div className="p-4 bg-white">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{product.color}</p>
                <div className="flex items-baseline justify-between mt-3">
                    <div className="flex items-center space-x-2">
                        <p className="text-xl font-bold text-gray-900">${product.price}</p>
                        {product.originalPrice > product.price && (
                            <p className="text-sm text-gray-500 line-through">${product.originalPrice}</p>
                        )}
                    </div>
                     <button className="bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">Add to Cart</button>
                </div>
            </div>
        </div>
    );
}

// Hero Section Component
function HeroSection() {
    return (
        <div className="bg-gradient-to-r from-pink-100 to-blue-100 mb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between py-12 md:py-24">
                    <div className="text-center md:text-left md:w-1/2">
                        <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                            <span className="block">Style That Fits,</span>
                            <span className="block text-indigo-600">Prices That Don't Pinch.</span>
                        </h1>
                        <p className="mt-4 text-lg lg:text-xl text-gray-600">
                            Welcome to Dressify, your one-stop shop for the latest trends and timeless classics. Discover fashion that tells your story.
                        </p>
                        <div className="mt-8">
                            <Link to="#featured" className="inline-block bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors duration-300">
                                Shop Now
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:block md:w-1/2 mt-10 md:mt-0">
                         <img src="https://i.imgur.com/9iL1sC6.png" alt="Fashion Models" className="w-full h-auto object-contain"/>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Newsletter Section Component
function Newsletter() {
    return (
      <div className="bg-gray-100 py-16 my-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800">Join Our Newsletter</h2>
          <p className="text-gray-600 mt-2">Stay in the loop with the latest trends, new arrivals, and exclusive offers.</p>
          <form className="mt-6 flex flex-col sm:flex-row justify-center max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="flex-grow p-3 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
            <button type="submit" className="bg-indigo-600 text-white font-bold p-3 rounded-r-md mt-2 sm:mt-0 sm:rounded-l-none hover:bg-indigo-700 transition-colors">Subscribe</button>
          </form>
        </div>
      </div>
    );
}

// Main HomePage Component
export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));

        const unsubscribe = onSnapshot(q, 
            (querySnapshot) => {
                const productsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProducts(productsData);
                setLoading(false);
            }, 
            (err) => {
                console.error('Error fetching products:', err);
                setError('Failed to load products.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return (
        <div className="bg-white">
            <HeroSection />
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <section id="featured" className="py-12">
                    <h2 className="text-3xl font-extrabold text-center text-gray-900">Featured Products</h2>
                    
                    {loading && <p className="text-center mt-8">Loading products...</p>}
                    {error && <p className="text-center mt-8 text-red-500">{error}</p>}

                    {!loading && !error && (
                         products.length === 0 ? (
                            <p className="text-center mt-8">No products available yet. Check back soon!</p>
                        ) : (
                            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )
                    )}
                </section>
            </main>
            
            <Newsletter />
        </div>
    );
}

import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="bg-primary">
      {/* Hero Section */}
      <div className="relative h-screen">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1470&q=80)' }}
        ></div>
        <div className="relative z-10 flex flex-col justify-center items-center h-full text-center text-white bg-black bg-opacity-50">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4">Discover Your Style</h1>
          <p className="text-xl md:text-2xl text-text-primary mb-8">The best trends, the best prices.</p>
          <Link to="/products" className="bg-accent text-primary font-bold py-3 px-8 rounded-full hover:bg-opacity-80 transition duration-300">Shop Now</Link>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center text-text-primary mb-12">Featured Collection</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Sample Product 1 */}
          <div className="bg-secondary rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition duration-300">
            <img src="https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60" alt="Product 1" className="w-full h-80 object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2 text-text-primary">Summer T-Shirt</h3>
              <p className="text-text-secondary mb-4">Lightweight and stylish</p>
              <Link to="/products/1" className="text-accent hover:underline">Explore</Link>
            </div>
          </div>
          {/* Sample Product 2 */}
          <div className="bg-secondary rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition duration-300">
            <img src="https://images.unsplash.com/photo-1603252109360-c361993445c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60" alt="Product 2" className="w-full h-80 object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2 text-text-primary">Urban Denim</h3>
              <p className="text-text-secondary mb-4">Perfect for any occasion</p>
              <Link to="/products/2" className="text-accent hover:underline">Discover</Link>
            </div>
          </div>
          {/* Sample Product 3 */}
          <div className="bg-secondary rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition duration-300">
            <img src="https://images.unsplash.com/photo-1598554743454-32d2075a332f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=60" alt="Product 3" className="w-full h-80 object-cover" />
            <div className="p-6">
              <h3 className="text-2xl font-semibold mb-2 text-text-primary">Streetwear Hoodie</h3>
              <p className="text-text-secondary mb-4">Comfort and style combined</p>
              <Link to="/products/3" className="text-accent hover:underline">View Item</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

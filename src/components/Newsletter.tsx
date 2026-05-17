import React from 'react';

export default function Newsletter() {
  return (
    <div className="bg-gray-100 py-20">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Subscribe to our Newsletter</h2>
        <p className="text-gray-600 mb-8">Get the latest updates on new products and upcoming sales.</p>
        <form className="max-w-md mx-auto">
          <div className="flex items-center">
            <input type="email" placeholder="Enter your email" className="w-full px-4 py-3 rounded-l-md focus:outline-none" />
            <button type="submit" className="bg-black text-white px-8 py-3 rounded-r-md hover:bg-gray-800 transition-colors duration-300">
              Subscribe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <div className="bg-cover bg-center h-screen" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1020&q=80')" }}>
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-start text-white">
        <h1 className="text-5xl font-extrabold leading-tight">Dressify Your Wardrobe</h1>
        <p className="text-xl mt-4 mb-8">Discover the latest trends in fashion.</p>
        <Link to="/products" className="bg-white text-gray-900 font-bold py-3 px-8 rounded-full hover:bg-gray-200 transition duration-300">
          Shop Now
        </Link>
      </div>
    </div>
  );
}

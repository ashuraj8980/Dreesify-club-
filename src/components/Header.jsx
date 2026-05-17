import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-secondary shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-3xl font-bold text-accent">Dressify</Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-text-secondary hover:text-accent transition duration-300">Home</Link>
          <Link to="/products" className="text-text-secondary hover:text-accent transition duration-300">Products</Link>
          <Link to="/cart" className="text-text-secondary hover:text-accent transition duration-300">Cart</Link>
          {user ? (
            <>
              <Link to="/admin" className="text-text-secondary hover:text-accent transition duration-300">Admin</Link>
              <button onClick={logout} className="text-text-secondary hover:text-accent transition duration-300">Logout</button>
            </>
          ) : (
            <Link to="/login" className="bg-accent text-primary font-bold py-2 px-4 rounded-md hover:bg-opacity-80 transition duration-300">Login</Link>
          )}
        </nav>
        <div className="md:hidden">
          {/* Mobile Menu Button */}
          <button className="text-text-primary focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
      alert('Failed to log out');
    }
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors">Home</Link>
      <Link to="/products" className="text-gray-600 hover:text-indigo-600 transition-colors">All Products</Link>
      <Link to="/about" className="text-gray-600 hover:text-indigo-600 transition-colors">About Us</Link>
      {currentUser && (
        <Link to="/admin" className="text-gray-600 hover:text-indigo-600 transition-colors">Admin Panel</Link>
      )}
    </>
  );

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-3xl font-extrabold text-indigo-600 tracking-tight">Dressify</Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 font-medium">
            <NavLinks />
          </nav>

          {/* Icons and Auth */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-indigo-600">
                <Search size={20} />
            </button>
            <button className="text-gray-500 hover:text-indigo-600">
                <ShoppingCart size={20} />
            </button>
            {currentUser ? (
              <div className="relative group">
                 <button className="text-gray-500 hover:text-indigo-600">
                    <User size={20} />
                 </button>
                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                    <p className="px-4 py-2 text-sm text-gray-700 truncate">{currentUser.email}</p>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Logout
                    </button>
                 </div>
              </div>
            ) : (
              <Link to="/login" className="hidden md:inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                Login
              </Link>
            )}
            {/* Mobile Menu Button */}
            <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X/> : <Menu />}
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
               <NavLinks />
                 {!currentUser && (
                    <Link to="/login" className="w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                        Login
                    </Link>
                )}
            </div>
        </div>
      )}
    </header>
  );
}

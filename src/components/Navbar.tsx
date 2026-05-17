import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, login, logout, isAdmin, customer, loading } = useAuth();
  const { cartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Women', href: '/category/women' },
    { name: 'Accessories', href: '/category/accessories' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-brand-black/10">
        <nav className="mx-auto px-4 lg:px-12 h-20 md:h-24 flex items-center justify-between relative">
          {/* Left: Mobile Menu Toggle */}
          <div className="flex items-center lg:hidden flex-1">
            <button 
              className="p-2 -ml-2" 
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-brand-black" />
            </button>
          </div>

          {/* Left: Desktop Nav Links */}
          <div className="hidden lg:flex items-center space-x-12 flex-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                className="text-[11px] uppercase tracking-[0.4em] font-black hover:text-[#C5A059] transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center flex-1">
            <Link to="/" className="text-2xl md:text-3xl font-display font-black tracking-[-0.05em] uppercase text-center">
              Dressify
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end space-x-2 md:space-x-4 flex-1">
            <Link to="/wishlist" className="p-2 transition-colors relative group">
              <Heart className="w-[18px] h-[18px] text-brand-black group-hover:scale-110 transition-transform" />
            </Link>

            <Link to="/cart" className="p-2 transition-colors relative group">
              <ShoppingBag className="w-[18px] h-[18px] text-brand-black group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-black text-white text-[7px] font-black w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-brand-offwhite">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="flex items-center ml-1 md:ml-2 pl-2 md:pl-4">
              {loading ? (
                <div className="w-8 h-8 rounded-full bg-gray-50 animate-pulse" />
              ) : user ? (
                <button 
                  onClick={() => navigate('/profile')} 
                  className="flex items-center space-x-2 md:space-x-3 group"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full border border-brand-black/10 group-hover:border-[#C5A059] transition-colors" />
                  ) : (
                    <User className="w-[18px] h-[18px] text-brand-black group-hover:scale-110 transition-transform" />
                  )}
                  <span className="hidden md:block text-[9px] font-black uppercase tracking-[0.2em]">{customer?.displayName?.split(' ')[0] || 'Partner'}</span>
                </button>
              ) : (
                <button 
                  onClick={login} 
                  className="flex items-center space-x-2 md:space-x-3 group bg-black text-[#C5A059] px-4 md:px-6 py-2.5 hover:bg-[#C5A059] hover:text-black transition-all duration-500 rounded-sm border border-[#C5A059]/30"
                >
                  <User className="w-[14px] h-[14px] group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Login</span>
                </button>
              )}
            </div>
            
            {isAdmin && !loading && (
              <Link 
                to="/admin" 
                className="hidden lg:flex items-center space-x-2 px-6 py-2.5 bg-black text-[#C5A059] text-[9px] font-black uppercase tracking-[0.3em] hover:bg-[#C5A059] hover:text-black transition-all duration-700 border border-[#C5A059]/30"
              >
                <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-pulse" />
                <span>Admin</span>
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-[60] backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] p-10 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-16">
                <span className="text-2xl font-display font-black tracking-tight uppercase">Dressify</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 border border-brand-black/5 rounded-full"
                >
                  <X className="w-5 h-5 text-brand-black" />
                </button>
              </div>

              <div className="flex flex-col space-y-6 text-center">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.href} 
                    className="text-xl font-display uppercase tracking-widest hover:text-[#C5A059] transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-10 border-t border-brand-black/5 space-y-8">
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-6 text-brand-black/40 group">
                  <User className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-brand-black transition-colors">My Profile</span>
                </Link>
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-6 text-brand-black/40 group">
                  <Heart className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-brand-black transition-colors">My Wishlist</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex items-center justify-between p-5 bg-black text-[#C5A059] hover:bg-[#C5A059] hover:text-black transition-all duration-700"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Admin Panel</span>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }} 
                  className="flex items-center space-x-6 text-red-500 group pt-4"
                >
                  <LogOut className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-red-700 transition-colors">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
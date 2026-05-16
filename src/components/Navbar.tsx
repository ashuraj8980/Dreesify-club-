import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar() {
  const { user, login, isAdmin, customer } = useAuth();
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
    { name: 'Women', href: '/category/women' },
    { name: 'Men', href: '/category/men' },
    { name: 'Kids', href: '/category/kids' },
    { name: 'Accessories', href: '/category/accessories' },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-brand-offwhite/90 backdrop-blur-md border-b border-brand-black/5">
        <nav className="mx-auto px-4 lg:px-12 h-16 md:h-20 flex items-center justify-between relative">
          {/* Mobile Menu Toggle & Logo Container */}
          <div className="flex items-center lg:hidden">
            <button 
              className="p-2 -ml-2 mr-2 md:mr-4" 
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-brand-black" />
            </button>
            <Link to="/" className="text-xl font-display font-medium tracking-tight uppercase">
              Dressify
            </Link>
          </div>

          {/* Desktop Logo */}
          <Link to="/" className="hidden lg:block">
            <span className="text-3xl font-display font-medium tracking-[-0.05em] uppercase">
              Dressify
            </span>
          </Link>

          {/* Desktop Nav Links - Right aligned */}
          <div className="hidden lg:flex items-center space-x-12 ml-auto mr-12">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href}
                className="nav-link"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search, Wishlist, Cart, Profile */}
          <div className="flex items-center space-x-2 md:space-x-4">
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

            <div className="flex items-center border-l border-brand-black/5 ml-1 md:ml-2 pl-2 md:pl-4">
              {user ? (
                <button 
                  onClick={() => navigate('/profile')} 
                  className="flex items-center space-x-2 md:space-x-3 group"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || ''} className="w-6 h-6 rounded-full border border-brand-black/10 group-hover:border-brand-gold transition-colors" />
                  ) : (
                    <User className="w-[18px] h-[18px] text-brand-black group-hover:scale-110 transition-transform" />
                  )}
                  <span className="hidden md:block text-[9px] font-black uppercase tracking-[0.2em]">{customer?.displayName?.split(' ')[0] || 'Partner'}</span>
                </button>
              ) : (
                <button 
                  onClick={login} 
                  className="flex items-center space-x-2 md:space-x-3 group bg-brand-black text-white px-3 md:px-4 py-2 hover:bg-brand-gold hover:text-brand-black transition-all duration-500 rounded-sm"
                >
                  <User className="w-[16px] h-[16px] group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em]">Login</span>
                </button>
              )}
            </div>
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className="hidden lg:flex items-center space-x-3 px-6 py-2.5 bg-brand-black text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-brand-gold hover:text-brand-black transition-all duration-700"
              >
                <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                <span>Admin Panel</span>
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
              className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-brand-offwhite z-[70] p-10 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-16">
                <span className="text-3xl font-display font-medium tracking-tight uppercase">Dressify</span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 border border-brand-black/5 rounded-full"
                >
                  <X className="w-5 h-5 text-brand-black" />
                </button>
              </div>

              <div className="flex flex-col space-y-6 md:space-y-8">
                <Link 
                  to="/search" 
                  className="text-2xl md:text-3xl font-display uppercase tracking-tight hover:italic transition-all"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop All
                </Link>
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.href} 
                    className="text-2xl md:text-3xl font-display uppercase tracking-tight hover:italic transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-10 border-t border-brand-black/5 space-y-8">
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-6 text-brand-black/40 group">
                  <User className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] group-hover:text-brand-black transition-colors">My Profile</span>
                </Link>
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-6 text-brand-black/40 group">
                  <Heart className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] group-hover:text-brand-black transition-colors">My Wishlist</span>
                </Link>
                {isAdmin && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)} 
                    className="flex items-center justify-between p-6 bg-brand-black text-white hover:bg-brand-gold hover:text-brand-black transition-all duration-700"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Admin Panel</span>
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

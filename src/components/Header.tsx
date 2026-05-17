import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { cart } = useCart();
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800">
          Dressify
        </Link>
        <nav className="hidden md:flex space-x-8">
          <Link to="/" className="text-gray-600 hover:text-gray-800">Home</Link>
          <Link to="/products" className="text-gray-600 hover:text-gray-800">All Products</Link>
          <Link to="/categories" className="text-gray-600 hover:text-gray-800">Categories</Link>
          <Link to="/about" className="text-gray-600 hover:text-gray-800">About</Link>
        </nav>
        <Link to="/cart" className="relative">
          <ShoppingBag className="text-gray-600 hover:text-gray-800" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

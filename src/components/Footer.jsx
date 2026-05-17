import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Dressify & Slogan */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-800">Dressify</h2>
            <p className="mt-2 text-sm text-gray-500">Style That Fits, Prices That Don't Pinch.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/" className="text-base text-gray-600 hover:text-gray-900">Home</Link></li>
              <li><Link to="/products" className="text-base text-gray-600 hover:text-gray-900">All Products</Link></li>
              <li><Link to="/about" className="text-base text-gray-600 hover:text-gray-900">About Us</Link></li>
              <li><Link to="/contact" className="text-base text-gray-600 hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>

          {/* Help & Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Help & Info</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/faq" className="text-base text-gray-600 hover:text-gray-900">FAQs</Link></li>
              <li><Link to="/shipping" className="text-base text-gray-600 hover:text-gray-900">Shipping</Link></li>
              <li><Link to="/returns" className="text-base text-gray-600 hover:text-gray-900">Returns & Exchanges</Link></li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Follow Us</h3>
            <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900">Facebook</a></li>
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900">Instagram</a></li>
                <li><a href="#" className="text-base text-gray-600 hover:text-gray-900">Twitter</a></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">&copy; 2024 Dressify-Club. All Rights Reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link>
            <Link to="/terms-of-service" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

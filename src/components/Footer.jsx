import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* About Section */}
                <div className="col-span-2 md:col-span-1">
                    <h3 className="text-xl font-bold mb-4">Dressify</h3>
                    <p className="text-gray-400 text-sm">
                        Style That Fits, Prices That Don't Pinch. Your one-stop shop for the latest trends and timeless classics.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-semibold mb-4">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                        <li><Link to="/products" className="text-gray-400 hover:text-white">Shop</Link></li>
                        <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                        <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQs</Link></li>
                    </ul>
                </div>

                {/* Help & Info */}
                 <div>
                    <h3 className="font-semibold mb-4">Help & Info</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/shipping" className="text-gray-400 hover:text-white">Shipping</Link></li>
                        <li><Link to="/returns" className="text-gray-400 hover:text-white">Returns & Exchanges</Link></li>
                        <li><Link to="/privacy" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                        <li><Link to="/terms" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                    </ul>
                </div>

                 {/* Social Media */}
                 <div className="col-span-2 md:col-span-1">
                    <h3 className="font-semibold mb-4">Follow Us</h3>
                    <div className="flex space-x-4">
                        <a href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Instagram size={20} /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Linkedin size={20} /></a>
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} Dressify. All Rights Reserved.</p>
            </div>
        </div>
    </footer>
  );
}
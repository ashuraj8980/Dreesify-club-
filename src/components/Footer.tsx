import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-offwhite border-t border-brand-black/5 pt-32 pb-16">
      <div className="container mx-auto px-4 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-24">
          <div className="lg:col-span-2 space-y-10">
            <Link to="/" className="text-4xl font-display font-medium tracking-tight uppercase">
              Dressify
            </Link>
            <p className="text-brand-black/50 text-sm leading-relaxed max-w-sm font-serif italic">
              Architectural simplicity. Ethical craftsmanship. A permanent archive for the conscious individual.
            </p>
            <div className="flex items-center space-x-8">
              {/* Instagram link */}
              <a href="#" className="text-brand-black/40 hover:text-brand-black transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-brand-black/40 hover:text-brand-black transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-brand-black/40 hover:text-brand-black transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[10px] uppercase tracking-[0.2em] mb-10">Collections</h4>
            <ul className="space-y-4">
              {['Women', 'Men', 'Kids', 'Accessories', 'New Arrivals'].map((item) => (
                <li key={item}>
                  <Link 
                    to={`/category/${item.toLowerCase()}`} 
                    className="text-brand-black/60 text-xs uppercase tracking-widest hover:text-brand-black transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[10px] uppercase tracking-[0.2em] mb-10">Client Care</h4>
            <ul className="space-y-4">
              {['Contact Us', 'Shipping Policy', 'Returns', 'Track Order', 'FAQs'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-brand-black/60 text-xs uppercase tracking-widest hover:text-brand-black transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[10px] uppercase tracking-[0.2em] mb-10">Contact</h4>
            <div className="space-y-8">
              <div className="group">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-black/20 block mb-2">Customer Support</span>
                <span className="text-brand-black text-[10px] uppercase tracking-[0.4em] font-black underline underline-offset-8 decoration-brand-black/10">
                  support@dressify.in
                </span>
              </div>
              
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-brand-black/20 block mb-2">Location</span>
                <span className="text-brand-black/60 text-[10px] uppercase tracking-[0.4em] leading-relaxed block">
                  India <br />
                  Global Distribution
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-brand-black/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-brand-black/30 text-[9px] uppercase tracking-[0.4em] font-black text-center md:text-left">
            © {new Date().getFullYear()} DRESSIFY — Ashu Kumar Archive.
          </p>
          <div className="flex items-center space-x-10 opacity-30 grayscale contrast-150">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-2" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="MasterCard" className="h-3" />
          </div>
        </div>
      </div>
    </footer>
  );
}

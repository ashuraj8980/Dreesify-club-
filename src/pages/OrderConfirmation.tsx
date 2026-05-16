import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { formatCurrency } from '../lib/utils';
import { CheckCircle2, Package, Truck, Calendar, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return (
    <div className="container mx-auto px-4 py-40 flex justify-center bg-brand-offwhite min-h-screen">
      <div className="w-12 h-12 border-2 border-brand-black/5 border-t-brand-black rounded-full animate-spin"></div>
    </div>
  );

  if (!order) return (
    <div className="container mx-auto px-4 py-40 text-center bg-brand-offwhite min-h-screen space-y-10">
       <div className="space-y-4">
        <h1 className="text-4xl font-display uppercase tracking-tight">Sequence Not Found</h1>
        <p className="text-brand-black/50 font-serif italic text-lg">The requested procurement archive could not be located.</p>
       </div>
      <Link to="/" className="luxury-button inline-flex items-center space-x-4">
        <span>Back to Home</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );

  return (
    <div className="bg-brand-offwhite min-h-screen pb-32">
      <div className="container mx-auto px-4 lg:px-12 py-12 md:py-24 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24 space-y-8"
        >
          <div className="flex justify-center mb-12">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-full border border-brand-black/5 flex items-center justify-center">
                 <CheckCircle2 className="w-10 h-10 text-brand-black" />
              </div>
              <div className="absolute -inset-4 border border-brand-black/5 rounded-full animate-ping opacity-20" />
            </motion.div>
          </div>
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.6em] font-black text-brand-black/40 block">Procurement Finalized</span>
            <h1 className="text-5xl md:text-7xl font-display font-medium uppercase tracking-tight">Gratitude for <br /> Your Patronage</h1>
            <p className="text-xl text-brand-black/50 font-serif italic">Your archival request <span className="text-brand-black not-italic font-mono font-bold text-sm bg-brand-black/5 px-3 py-1 ml-2">#{order.id.slice(-8).toUpperCase()}</span> is now active.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          {/* Order Details */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-12 border-y border-brand-black/5 py-16">
            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/40">Temporal Data</h2>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-brand-black opacity-30 italic">Registration Date</p>
                <p className="text-lg font-medium font-display uppercase tracking-tight">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/40">Settlement</h2>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-brand-black opacity-30 italic">Protocol</p>
                <p className="text-lg font-medium font-display uppercase tracking-tight">{order.paymentMethod === 'online' ? 'Electronic Archive Transit' : 'Physical Settlement Upon Delivery'}</p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/40">Archive Status</h2>
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest text-brand-black opacity-30 italic">Current State</p>
                <div className="inline-flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-brand-black animate-pulse" />
                  <p className="text-lg font-medium font-display uppercase tracking-tight">{order.status}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-7 space-y-16">
            <section className="space-y-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/40">Logistics Destination</h2>
              <div className="p-10 border border-brand-black/5 bg-white/50 space-y-6 backdrop-blur-sm">
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/20">Consignee</p>
                   <p className="text-2xl font-display font-medium uppercase tracking-tight">{order.shippingAddress.fullName}</p>
                </div>
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/20">Coordinates</p>
                   <p className="text-sm font-medium leading-relaxed font-serif italic text-brand-black/60">
                     {order.shippingAddress.address}<br />
                     {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                   </p>
                </div>
                <div className="space-y-2 pt-4 border-t border-brand-black/5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-black/20">Encrypted Communication</p>
                   <p className="text-sm font-mono font-bold tracking-widest">{order.shippingAddress.mobile}</p>
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-6">
              <Link 
                to="/" 
                className="luxury-button flex items-center justify-center space-x-4 flex-grow"
              >
                <span>Continue Procurement</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link 
                to="/profile" 
                className="border border-brand-black py-5 px-10 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-brand-black hover:text-white transition-all duration-500 flex items-center justify-center flex-grow"
              >
                Archival History
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 space-y-8">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/40">Archival Manifest</h2>
            <div className="bg-white border border-brand-black/5 p-10 lg:p-12 space-y-12">
              <div className="space-y-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {order.items.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}`} className="flex justify-between items-end pb-8 border-b border-brand-black/5">
                    <div className="flex space-x-6">
                      <div className="w-16 aspect-[3/4] bg-brand-beige/20 overflow-hidden shrink-0">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover grayscale-[0.2]" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-tight line-clamp-1">{item.name}</h4>
                        <p className="text-[8px] text-brand-black/40 font-bold uppercase tracking-widest">{item.selectedSize} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono">{formatCurrency(item.salePrice * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-black/40">
                  <span>Valuation</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-gold italic">
                    <span>Archival Savings</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-black/40">
                  <span>Logistics Protocol</span>
                  <span>{order.shipping === 0 ? 'Gratis' : formatCurrency(order.shipping)}</span>
                </div>
                <div className="pt-10 border-t-2 border-brand-black flex justify-between items-end">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">Final Balance Paid</span>
                  <span className="text-3xl font-display font-medium">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="p-8 border border-brand-gold/20 bg-brand-gold/[0.02] flex items-start space-x-6">
               <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-brand-gold" />
               </div>
               <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold">Anticipated Transit</p>
                  <p className="text-sm font-medium font-serif italic text-brand-black/60">
                    The collection is expected to reach its destination by <span className="text-brand-black not-italic font-bold">{new Date(order.createdAt + 1000 * 60 * 60 * 24 * 5).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

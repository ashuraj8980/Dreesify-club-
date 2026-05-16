import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order } from '../types';
import { formatCurrency } from '../lib/utils';
import { Package, Truck, CheckCircle, Clock, ChevronRight, User as UserIcon, LogOut, ArrowUpRight, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Profile() {
  const { user, customer, logout, isAdmin, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(data);
      } catch (error) {
        console.error('Error fetching user orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-offwhite flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-4 lg:px-12 py-24 md:py-32">
        <div className="flex flex-col lg:flex-row gap-24">
          {/* Sidebar */}
          <aside className="lg:w-1/3 xl:w-1/4 space-y-16">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border border-brand-black/5 p-1">
                  <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center grayscale-[0.5]">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-8 h-8 text-brand-black/20" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-brand-black text-white p-2 rounded-full border-4 border-brand-offwhite scale-90">
                  <UserIcon className="w-3 h-3" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-medium uppercase tracking-tight">{user.displayName || customer?.displayName || 'Member'}</h2>
                <div className="flex items-center space-x-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
                   <p className="text-[10px] text-brand-black font-black uppercase tracking-[0.3em]">{isAdmin ? 'EXCLUSIVE OWNER' : (customer?.role || 'Verified Member')}</p>
                </div>
              </div>
            </motion.div>

            <nav className="space-y-4">
              <button className="w-full text-left p-6 bg-white border border-brand-black/10 text-brand-black font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-between group">
                <span className="group-hover:translate-x-1 transition-transform">My Orders</span>
                <ChevronRight className="w-3 h-3 text-brand-black/20" />
              </button>
              <button className="w-full text-left p-6 hover:bg-white text-brand-black/40 hover:text-brand-black border border-transparent hover:border-brand-black/10 transition-all font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-between group">
                <span className="group-hover:translate-x-1 transition-transform">Rewards Points</span>
                <ChevronRight className="w-3 h-3 text-brand-black/20" />
              </button>
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="w-full text-left p-6 bg-brand-gold text-brand-black border border-brand-black/5 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-between mt-12 shadow-xl shadow-brand-gold/10 hover:bg-brand-black hover:text-white transition-all duration-700"
                >
                  <div className="flex items-center space-x-4">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Manage Archive</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}

              <button 
                onClick={logout}
                className="w-full text-left p-6 text-red-800/40 hover:text-red-800 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-between pt-12"
              >
                <span>Logout</span>
                <LogOut className="w-3 h-3" />
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="lg:w-2/3 xl:w-3/4">
            <header className="mb-16">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/20 mb-4 italic">Account activity</p>
              <h3 className="text-5xl font-display font-medium uppercase tracking-tight">Recent <br /> Orders</h3>
            </header>
            
            {loading ? (
              <div className="grid gap-12">
                {[1, 2].map(i => <div key={i} className="h-64 bg-brand-black/5 animate-pulse" />)}
              </div>
            ) : (
              <>
                {orders.length > 0 ? (
                  <div className="grid gap-12">
                    {orders.map((order) => (
                      <motion.div 
                        key={order.id} 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-brand-black/5 overflow-hidden hover:shadow-2xl transition-all duration-700 group"
                      >
                        <div className="p-10 flex flex-wrap items-center justify-between gap-12 border-b border-brand-black/5">
                          <div className="space-y-2">
                             <p className="text-[8px] font-black uppercase tracking-widest text-brand-black/20">Order ID</p>
                             <p className="text-sm font-mono font-bold">#{order.id.slice(-12).toUpperCase()}</p>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[8px] font-black uppercase tracking-widest text-brand-black/20">Order Date</p>
                             <p className="text-sm font-display uppercase tracking-tight">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[8px] font-black uppercase tracking-widest text-brand-black/20">Total Paid</p>
                             <p className="text-sm font-black tracking-tight">{formatCurrency(order.total)}</p>
                          </div>
                          <div className="space-y-2">
                             <p className="text-[8px] font-black uppercase tracking-widest text-brand-black/20">Status</p>
                             <div className="flex items-center space-x-3">
                               <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-brand-gold animate-pulse'}`} />
                               <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                             </div>
                          </div>
                          <Link 
                            to={`/order-confirmation/${order.id}`} 
                            className="bg-brand-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-brand-gold hover:text-brand-black transition-all duration-500"
                          >
                            Track
                          </Link>
                        </div>
                        
                        <div className="p-10 flex items-center space-x-8 overflow-x-auto custom-scrollbar">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="w-20 aspect-[3/4] bg-brand-beige/20 shrink-0 relative grayscale-[0.2] hover:grayscale-0 transition-all duration-700">
                              <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                              {item.quantity > 1 && (
                                <span className="absolute -top-2 -right-2 bg-brand-black text-white text-[8px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-40 text-center border border-dashed border-brand-black/10 bg-white/50 backdrop-blur-sm">
                    <Package className="w-16 h-16 text-brand-black/5 mx-auto mb-8" />
                    <p className="text-brand-black/40 font-serif italic text-lg mb-12">The archive for your transactions is currently void.</p>
                    <Link to="/" className="luxury-button inline-block">Initialize Shopping</Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

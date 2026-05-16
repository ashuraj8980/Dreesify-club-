import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../types';
import { formatCurrency, cn } from '../../lib/utils';
import { 
  ChevronLeft, 
  Search, 
  Filter, 
  Eye, 
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle,
  Truck,
  Box,
  XCircle,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate('/');
  }, [isAdmin, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchOrders();
  }, [isAdmin]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order set to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed': return <ShoppingBag className="w-4 h-4 text-blue-500" />;
      case 'packed': return <Box className="w-4 h-4 text-purple-500" />;
      case 'shipped': return <Truck className="w-4 h-4 text-indigo-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.shippingAddress.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return null;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      <header className="bg-white border-b border-gray-100 py-10">
        <div className="container mx-auto px-4 md:px-12">
          <Link to="/admin" className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center mb-4 hover:text-black transition-colors">
            <ChevronLeft className="w-3 h-3 mr-1" /> Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Fulfillment</h1>
              <p className="text-gray-400 font-medium text-sm mt-2 uppercase tracking-widest">{orders.length} Total Shipments</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-12 py-16 space-y-12 max-w-7xl">
        {/* Search & Filter */}
        <div className="bg-white p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 pl-12 pr-4 py-4 text-xs font-bold outline-none focus:bg-white focus:border-black transition-all"
            />
          </div>
          <button className="bg-gray-50 border border-gray-100 px-8 py-4 flex items-center space-x-3 hover:bg-black hover:text-white transition-all">
            <Filter className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Global Status Filter</span>
          </button>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 group">
                  <div className="flex items-center space-x-6">
                    <div className="p-4 bg-gray-50 rounded-full group-hover:bg-pink-50 transition-colors">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="font-black text-sm uppercase tracking-tight mb-1">#{order.id.slice(-8).toUpperCase()}</h3>
                      <div className="flex items-center space-x-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {new Date(order.createdAt).toLocaleDateString()}</span>
                        <span>{order.items.length} Items</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 w-full lg:w-48">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Customer</p>
                    <p className="text-xs font-bold truncate">{order.shippingAddress.fullName}</p>
                    <p className="text-[10px] text-gray-500 font-medium">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total</p>
                    <p className="text-sm font-black">{formatCurrency(order.total)}</p>
                    <p className="text-[8px] font-bold uppercase tracking-tighter text-pink-600 bg-pink-50 px-1 inline-block">{order.paymentMethod}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled'].map((status) => (
                      <button 
                        key={status}
                        onClick={() => updateStatus(order.id, status as OrderStatus)}
                        className={cn(
                          "px-3 py-1.5 text-[8px] font-black uppercase tracking-widest border transition-all rounded-full",
                          order.status === status 
                            ? "bg-black text-white border-black" 
                            : "bg-white text-gray-400 border-gray-200 hover:border-black hover:text-black"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <Link 
                    to={`/order-confirmation/${order.id}`}
                    className="p-3 bg-gray-50 hover:bg-black hover:text-white transition-all rounded-full"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-24 text-center bg-white border border-dashed border-gray-200 rounded-sm">
                <p className="text-gray-400 font-medium uppercase tracking-widest text-xs">No orders match your current search.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

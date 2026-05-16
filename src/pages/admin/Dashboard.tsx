import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  ArrowUpRight,
  Settings
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersSnap, productsSnap, customersSnap] = await Promise.all([
          getDocs(collection(db, 'orders')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'customers'))
        ]);

        const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

        setStats({
          totalRevenue,
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          totalCustomers: customersSnap.size
        });

        // Recent Orders
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
        const recentSnap = await getDocs(q);
        setRecentOrders(recentSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));

      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isAdmin) fetchStats();
  }, [isAdmin]);

  if (authLoading || loading) return (
    <div className="container mx-auto px-4 py-32 flex justify-center">
      <div className="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
    </div>
  );

  const chartData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  return (
    <div className="flex bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-brand-black/5 p-8 hidden lg:block">
        <nav className="space-y-4">
          <Link to="/admin" className="flex items-center space-x-3 p-4 bg-brand-black text-white rounded-sm font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/products" className="flex items-center space-x-3 p-4 hover:bg-brand-beige text-brand-black/40 hover:text-brand-black transition-all font-black text-[10px] uppercase tracking-[0.2em]">
            <Package className="w-4 h-4" />
            <span>Products</span>
          </Link>
          <Link to="/admin/orders" className="flex items-center space-x-3 p-4 hover:bg-brand-beige text-brand-black/40 hover:text-brand-black transition-all font-black text-[10px] uppercase tracking-[0.2em]">
            <ShoppingBag className="w-4 h-4" />
            <span>Orders</span>
          </Link>
        </nav>
      </aside>

      <main className="flex-grow p-8 lg:p-16 space-y-16 max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-12 border-b border-brand-black/5 pb-12">
          <div>
            <h1 className="text-5xl font-display font-medium tracking-tight uppercase">Archive Center</h1>
            <p className="text-brand-black/30 font-serif italic text-sm mt-3 leading-relaxed">System-wide overview of the current collection strata.</p>
          </div>
          <div className="flex gap-6">
            <Link to="/admin/products" className="luxury-button !bg-brand-gold !text-brand-black hover:!bg-brand-black hover:!text-white flex items-center">
              <Plus className="w-4 h-4 mr-3" /> New Standard
            </Link>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <DollarSign />, color: 'bg-brand-black' },
            { label: 'Net Orders', value: stats.totalOrders.toString(), icon: <ShoppingBag />, color: 'bg-brand-gold' },
            { label: 'Active Catalog', value: stats.totalProducts.toString(), icon: <Package />, color: 'bg-brand-black' },
            { label: 'Customers', value: stats.totalCustomers.toString(), icon: <Users />, color: 'bg-brand-gold' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-10 border border-brand-black/5 shadow-sm group hover:shadow-2xl transition-all duration-700">
              <div className="flex items-center justify-between mb-8">
                <div className={`${stat.color} p-3 text-white rounded-sm shadow-xl`}>
                  {React.cloneElement(stat.icon as React.ReactElement, { className: 'w-5 h-5' })}
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-black/20 mb-2">{stat.label}</p>
              <h3 className="text-3xl font-display font-medium tracking-tight">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 border border-gray-100 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest">Revenue Analytics</h3>
              <select className="text-[10px] font-bold uppercase border-none bg-gray-50 px-3 py-1 outline-none">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: 0, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="revenue" fill="#000" radius={[2, 2, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-brand-black text-white p-12 shadow-2xl space-y-12 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Package className="w-32 h-32" />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-8">Collection Momentum</h3>
              <p className="text-3xl font-display font-medium tracking-tight leading-tight">Archetype performance is up 12.4% vs previous cycle.</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.4em] text-white/40">
                <span>Direct Access</span>
                <span>65%</span>
              </div>
              <div className="w-full bg-white/10 h-[2px]">
                <div className="bg-brand-gold h-full w-[65%]" />
              </div>
              <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.4em] text-white/40">
                <span>External Referral</span>
                <span>35%</span>
              </div>
              <div className="w-full bg-white/10 h-[2px]">
                <div className="bg-white h-full w-[35%]" />
              </div>
            </div>
            <button className="luxury-button !bg-transparent !border !border-white/20 hover:!bg-white hover:!text-brand-black">Deep Archive Report</button>
          </div>
        </div>

        {/* Recent Orders Table */}
        <section className="bg-white border border-brand-black/5 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-brand-black/5 flex items-center justify-between bg-brand-beige/20">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Historical Log</h3>
            <Link to="/admin/orders" className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold flex items-center">
              Full Archive <ArrowUpRight className="w-3 h-3 ml-2" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-offwhite text-[9px] font-black uppercase tracking-[0.3em] text-brand-black/40">
                <tr>
                  <th className="px-10 py-6">Identity</th>
                  <th className="px-10 py-6">Curator</th>
                  <th className="px-10 py-6">Statement</th>
                  <th className="px-10 py-6">Condition</th>
                  <th className="px-10 py-6 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-black/5">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-beige/40 transition-colors">
                    <td className="px-10 py-8 font-black text-[11px] tracking-widest text-brand-black">#{order.id.slice(-8).toUpperCase()}</td>
                    <td className="px-10 py-8 font-serif italic text-sm text-brand-black/60">{order.shippingAddress.fullName}</td>
                    <td className="px-10 py-8 font-black text-[11px] text-brand-black">{formatCurrency(order.total)}</td>
                    <td className="px-10 py-8">
                      <span className="text-[8px] font-black px-3 py-1.5 uppercase tracking-tighter text-brand-black bg-brand-gold/10 border border-brand-gold/20">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <Link to={`/order-confirmation/${order.id}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold hover:text-brand-black transition-colors underline underline-offset-4">Manage</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

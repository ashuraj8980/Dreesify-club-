import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, cn } from '../lib/utils';
import { CreditCard, Truck, ChevronRight, Lock, Ticket, ShieldCheck, ArrowLeft } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Order, OrderStatus, Address } from '../types';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, customer } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullName: customer?.displayName || '',
    mobile: '',
    email: customer?.email || '',
    address: '',
    state: '',
    city: '',
    pincode: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('online');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Constants
  const shippingCharge = cartTotal >= 10000 ? 0 : 250;
  const onlinePaymentDiscount = paymentMethod === 'online' ? (cartTotal * 0.3) : 0;
  
  const finalTotal = cartTotal + shippingCharge - onlinePaymentDiscount - couponDiscount;

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'ARCHIVE10') {
      const discount = cartTotal * 0.1;
      setCouponDiscount(discount);
      toast.success('Archival discount applied');
    } else {
      toast.error('Invalid archival sequence');
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    // Validation
    const requiredFields = ['fullName', 'mobile', 'email', 'address', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof Address]) {
        toast.error(`Please finalize your ${field}`);
        return;
      }
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === 'online') {
        const res = await loadRazorpay();
        if (!res) {
          toast.error('Razorpay failed to initialize');
          setIsProcessing(false);
          return;
        }

        const options = {
          key: 'rzp_test_dummy', 
          amount: Math.round(finalTotal * 100),
          currency: 'INR',
          name: 'Dressify',
          description: 'Secure Archive Procurement',
          image: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=100&auto=format&fit=crop',
          handler: async (response: any) => {
            await createOrder(response.razorpay_payment_id);
          },
          prefill: {
            name: shippingAddress.fullName,
            email: shippingAddress.email,
            contact: shippingAddress.mobile,
          },
          theme: {
            color: '#0a0a0a',
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setIsProcessing(false);
      } else {
        await createOrder();
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Procurement failed');
      setIsProcessing(false);
    }
  };

  const createOrder = async (paymentId?: string) => {
    setIsProcessing(true);
    try {
      const orderData: Omit<Order, 'id'> = {
        userId: user?.uid || 'guest',
        items: cart,
        subtotal: cartTotal,
        discount: onlinePaymentDiscount + couponDiscount,
        shipping: shippingCharge,
        total: finalTotal,
        status: 'pending' as OrderStatus,
        paymentMethod,
        paymentId,
        shippingAddress,
        createdAt: Date.now(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      confetti({
        particleCount: 200,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0a0a0a', '#ffffff', '#e2dfd2']
      });

      toast.success('Procurement completed successfully');
      clearCart();
      navigate(`/order-confirmation/${docRef.id}`);
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error('Critical failure in order persistence');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-brand-offwhite min-h-screen">
      <div className="container mx-auto px-4 lg:px-12 py-12 md:py-24">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 md:mb-20 gap-8 text-center md:text-left">
          <div className="w-full">
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-brand-black/40 block mb-2">Checkout</span>
            <h1 className="text-4xl md:text-6xl font-display font-medium uppercase tracking-tight">Secure Payment</h1>
          </div>
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center justify-center w-full md:w-auto space-x-4 text-[10px] uppercase tracking-widest font-bold group border border-brand-black/5 py-4 md:border-0 md:py-0"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
            <span>Return to Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          {/* Left: Forms */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* Step 1: Destination */}
            <section className="space-y-12">
              <div className="flex items-center space-x-8">
                <span className="w-10 h-10 rounded-full border border-brand-black flex items-center justify-center text-xs font-bold">01</span>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/40 underline-offset-8 decoration-1 underline decoration-brand-black/10">Shipping Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                  { name: 'fullName', label: 'Full Name', type: 'text' },
                  { name: 'email', label: 'Email Address', type: 'email' },
                  { name: 'mobile', label: 'Phone Number', type: 'tel' },
                  { name: 'pincode', label: 'Pincode', type: 'text' },
                ].map((field) => (
                  <div key={field.name} className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-black opacity-40">{field.label}</label>
                    <input 
                      type={field.type}
                      name={field.name}
                      value={String(shippingAddress[field.name as keyof Address] || '')}
                      onChange={handleInputChange}
                      placeholder={`Enter your ${field.label.toLowerCase()}...`}
                      className="w-full bg-white md:bg-transparent border border-brand-black/5 md:border-t-0 md:border-x-0 md:border-b md:border-brand-black/10 focus:border-brand-black p-4 md:px-0 md:py-4 text-sm font-medium outline-none transition-all duration-500 placeholder:text-brand-black/20"
                    />
                  </div>
                ))}
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black opacity-40">Street Address & Landmark</label>
                  <textarea 
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Enter your street address..."
                    className="w-full bg-white md:bg-transparent border border-brand-black/5 md:border-t-0 md:border-x-0 md:border-b md:border-brand-black/10 focus:border-brand-black p-4 md:px-0 md:py-4 text-sm font-medium outline-none transition-all duration-500 resize-none placeholder:text-brand-black/20"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black opacity-40">City</label>
                  <input 
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full bg-white md:bg-transparent border border-brand-black/5 md:border-t-0 md:border-x-0 md:border-b md:border-brand-black/10 focus:border-brand-black p-4 md:px-0 md:py-4 text-sm font-medium outline-none transition-all duration-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-brand-black opacity-40">State / Province</label>
                  <input 
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full bg-white md:bg-transparent border border-brand-black/5 md:border-t-0 md:border-x-0 md:border-b md:border-brand-black/10 focus:border-brand-black p-4 md:px-0 md:py-4 text-sm font-medium outline-none transition-all duration-500"
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Protocol */}
            <section className="space-y-12 pb-32 md:pb-0">
              <div className="flex items-center space-x-8">
                <span className="w-10 h-10 rounded-full border border-brand-black flex items-center justify-center text-xs font-bold">02</span>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/40 underline-offset-8 decoration-1 underline decoration-brand-black/10">Payment Method</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <button 
                  onClick={() => setPaymentMethod('online')}
                  className={cn(
                    "flex flex-col items-start p-6 md:p-10 space-y-4 md:space-y-6 border transition-all duration-500 relative text-left",
                    paymentMethod === 'online' ? "border-brand-black bg-brand-black text-white" : "border-brand-black/5 hover:border-brand-black/20"
                  )}
                >
                  <CreditCard className="w-6 h-6" />
                  <div className="space-y-2">
                    <span className="text-sm font-display uppercase tracking-widest block">Pay Online</span>
                    <span className={cn("text-[8px] font-bold uppercase tracking-widest leading-relaxed", paymentMethod === 'online' ? 'text-brand-gold' : 'text-brand-black/30')}>
                      30% INSTANT DISCOUNT
                    </span>
                  </div>
                  {paymentMethod === 'online' && (
                    <motion.div layoutId="payment-active" className="absolute top-4 right-4 w-2 h-2 rounded-full bg-brand-gold" />
                  )}
                </button>

                <button 
                  onClick={() => setPaymentMethod('cod')}
                  className={cn(
                    "flex flex-col items-start p-6 md:p-10 space-y-4 md:space-y-6 border transition-all duration-500 relative text-left",
                    paymentMethod === 'cod' ? "border-brand-black bg-brand-black text-white" : "border-brand-black/5 hover:border-brand-black/20"
                  )}
                >
                  <Truck className="w-6 h-6" />
                  <div className="space-y-2">
                    <span className="text-sm font-display uppercase tracking-widest block">Cash on Delivery</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest opacity-30">
                      Standard delivery
                    </span>
                  </div>
                  {paymentMethod === 'cod' && (
                    <motion.div layoutId="payment-active" className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white" />
                  )}
                </button>
              </div>

              <div className="fixed md:static bottom-0 left-0 right-0 p-4 bg-white md:bg-transparent border-t md:border-0 border-brand-black/5 z-50 md:p-0">
                 <button 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="luxury-button w-full !py-6 md:!py-10 flex items-center justify-center space-x-6 disabled:opacity-50 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-brand-gold/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-[1.5s]" />
                  {isProcessing ? (
                     <div className="flex items-center space-x-4">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs uppercase tracking-[0.4em]">Processing...</span>
                     </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-[0.1em] md:tracking-[0.4em]">Complete Purchase</span>
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>

          {/* Right: Summary Box */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-brand-black/5 p-10 lg:p-12 sticky top-32 space-y-16 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-black/40">Order Summary</h2>
                <div className="space-y-8 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                  {cart.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex space-x-6 py-2">
                      <div className="w-16 aspect-[3/4] bg-brand-beige/20 overflow-hidden shrink-0">
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover grayscale-[0.2]" />
                      </div>
                      <div className="flex-grow space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-tight line-clamp-1">{item.name}</h4>
                        <p className="text-[9px] text-brand-black/40 font-bold uppercase tracking-widest">{item.selectedSize} × {item.quantity}</p>
                        <p className="text-[10px] font-bold">{formatCurrency(item.salePrice * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8 border-t border-brand-black/5 pt-12">
                <div className="flex space-x-4">
                  <div className="flex-grow relative">
                    <Ticket className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-black/20" />
                    <input 
                      type="text" 
                      placeholder="ARCHIVAL CODE" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full bg-transparent border-b border-brand-black/10 pl-8 pr-4 py-3 text-[10px] uppercase tracking-widest font-bold outline-none focus:border-brand-black transition-all placeholder:text-brand-black/10"
                    />
                  </div>
                  <button 
                    onClick={applyCoupon}
                    className="text-[9px] font-black uppercase tracking-widest border-b border-brand-black hover:pb-2 transition-all"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[8px] text-brand-black/30 font-bold uppercase tracking-[0.2em] italic">Sequence Hint: ARCHIVE10</p>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-black/40">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                {onlinePaymentDiscount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-gold italic">
                    <span>Online Discount (30%)</span>
                    <span>-{formatCurrency(onlinePaymentDiscount)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-black">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-brand-black/40">
                  <span>Shipping</span>
                  <span className={shippingCharge === 0 ? 'text-brand-gold underline' : ''}>
                    {shippingCharge === 0 ? 'Free' : formatCurrency(shippingCharge)}
                  </span>
                </div>
                <div className="pt-10 border-t-2 border-brand-black flex justify-between items-end">
                  <span className="text-[11px] font-black uppercase tracking-[0.4em]">Total Amount</span>
                  <span className="text-3xl font-display font-medium tracking-tight">{formatCurrency(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

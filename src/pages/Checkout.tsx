import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cart, subtotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">You can't proceed to checkout with an empty cart.</p>
        <Link to="/" className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors duration-300">
          Start Shopping
        </Link>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle payment processing here.
    alert('Order placed successfully! (This is a demo)');
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold text-center mb-12">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-16">
        {/* Shipping Information */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="text" placeholder="Full Name" className="w-full p-3 border rounded-md" required />
            <input type="text" placeholder="Address" className="w-full p-3 border rounded-md" required />
            <div className="grid md:grid-cols-2 gap-6">
              <input type="text" placeholder="City" className="w-full p-3 border rounded-md" required />
              <input type="text" placeholder="State / Province" className="w-full p-3 border rounded-md" required />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <input type="text" placeholder="Postal Code" className="w-full p-3 border rounded-md" required />
              <input type="text" placeholder="Country" className="w-full p-3 border rounded-md" required />
            </div>
            <input type="email" placeholder="Email Address" className="w-full p-3 border rounded-md" required />
            <button type="submit" className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors duration-300">
              Place Order
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                  <div>
                    <p className="font-bold">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Size: {item.size} x {item.quantity}</p>
                  </div>
                </div>
                <p>₹{(item.product.salePrice * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <p>Subtotal</p>
              <p>₹{subtotal.toFixed(2)}</p>
            </div>
            <div className="flex justify-between mb-4">
              <p>Shipping</p>
              <p>Free</p>
            </div>
            <div className="flex justify-between font-bold text-xl">
              <p>Total</p>
              <p>₹{subtotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

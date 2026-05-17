import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, subtotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/" className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors duration-300">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {cart.map(item => (
            <div key={item.id} className="flex items-center border-b py-4">
              <img src={item.product.images[0]} alt={item.product.name} className="w-24 h-24 object-cover rounded-md" />
              <div className="flex-grow ml-4">
                <h2 className="font-bold text-lg">{item.product.name}</h2>
                <p className="text-gray-600">Size: {item.size}</p>
                <p className="text-gray-800 font-bold mt-1">₹{item.product.salePrice}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border rounded-md">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 disabled:opacity-50" disabled={item.quantity <= 1}>-</button>
                  <span className="px-4 py-1">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-100 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-2">
            <p>Subtotal</p>
            <p>₹{subtotal.toFixed(2)}</p>
          </div>
          <div className="flex justify-between mb-6">
            <p>Shipping</p>
            <p>Free</p>
          </div>
          <div className="flex justify-between font-bold text-xl mb-6">
            <p>Total</p>
            <p>₹{subtotal.toFixed(2)}</p>
          </div>
          <Link to="/checkout" className="block w-full text-center bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors duration-300">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

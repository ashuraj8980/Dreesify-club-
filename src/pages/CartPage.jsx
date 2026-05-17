import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const initialCartItems = [
  { id: 1, name: 'Classic T-Shirt', price: 20, quantity: 2, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=60' },
  { id: 2, name: 'Denim Jeans', price: 50, quantity: 1, image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=60' },
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1) {
      setCartItems(cartItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
    }
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-text-primary mb-12">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p className="text-center text-text-secondary text-lg">Your cart is empty. <Link to="/products" className="text-accent hover:underline">Continue shopping</Link></p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-2/3">
            <div className="bg-secondary shadow-xl rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Quantity</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Total</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {cartItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            <img className="h-16 w-16 rounded-md object-cover" src={item.image} alt={item.name} />
                          </div>
                          <div className="ml-4">
                            <div className="text-lg font-medium text-text-primary">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg text-text-secondary">${item.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                          className="w-20 text-center bg-primary text-text-primary border border-gray-600 rounded-md focus:ring-accent focus:border-accent"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-lg text-text-primary">${(item.price * item.quantity).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-400 transition duration-300">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-secondary shadow-xl rounded-lg p-8">
              <h2 className="text-2xl font-bold text-text-primary mb-6">Order Summary</h2>
              <div className="flex justify-between mb-4">
                <span className="text-text-secondary">Subtotal</span>
                <span className="text-text-primary text-lg">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-text-secondary">Shipping</span>
                <span className="text-text-primary text-lg">$5.00</span>
              </div>
              <div className="border-t border-gray-700 pt-6 flex justify-between font-bold text-xl">
                <span className="text-text-primary">Total</span>
                <span className="text-accent">${(subtotal + 5).toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="block text-center bg-accent text-primary font-bold py-3 px-4 rounded-md mt-8 hover:bg-opacity-80 transition duration-300">Proceed to Checkout</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;

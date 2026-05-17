import React from 'react';

const CheckoutPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>
      <div className="max-w-lg mx-auto">
        <form className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Shipping Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">First Name</label>
              <input type="text" id="firstName" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="mb-4">
              <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">Last Name</label>
              <input type="text" id="lastName" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700 font-medium mb-2">Address</label>
            <input type="text" id="address" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="mb-4">
              <label htmlFor="city" className="block text-gray-700 font-medium mb-2">City</label>
              <input type="text" id="city" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="mb-4">
              <label htmlFor="state" className="block text-gray-700 font-medium mb-2">State</label>
              <input type="text" id="state" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="mb-4">
              <label htmlFor="zip" className="block text-gray-700 font-medium mb-2">ZIP Code</label>
              <input type="text" id="zip" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="mt-8">
            <button type="submit" className="w-full bg-green-500 text-white font-semibold py-3 rounded-md hover:bg-green-600">
              Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

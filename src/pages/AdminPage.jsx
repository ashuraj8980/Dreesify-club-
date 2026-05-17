import React from 'react';

const AdminPage = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-center text-text-primary mb-12">Admin Dashboard</h1>
      <div className="bg-secondary p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-text-primary">Welcome, Admin!</h2>
        <p className="text-text-secondary text-lg">This is a protected area for managing store content. You can add, edit, or remove products, view customer orders, and manage site settings.</p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="bg-primary p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-accent mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-text-primary">125</p>
          </div>
          <div className="bg-primary p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-accent mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-text-primary">452</p>
          </div>
          <div className="bg-primary p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-accent mb-2">New Customers</h3>
            <p className="text-3xl font-bold text-text-primary">32</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-text-primary mb-6">Admin Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button className="bg-accent text-primary font-bold py-3 px-6 rounded-md hover:bg-opacity-80 transition duration-300">Manage Products</button>
            <button className="bg-accent text-primary font-bold py-3 px-6 rounded-md hover:bg-opacity-80 transition duration-300">View Orders</button>
            <button className="bg-accent text-primary font-bold py-3 px-6 rounded-md hover:bg-opacity-80 transition duration-300">Manage Users</button>
            <button className="bg-gray-600 text-text-primary font-bold py-3 px-6 rounded-md hover:bg-gray-500 transition duration-300">Site Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

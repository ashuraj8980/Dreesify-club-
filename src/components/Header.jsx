import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
      alert('Failed to log out');
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">Dressify</Link>
        <nav className="space-x-6">
          <Link to="/" className="text-gray-600 hover:text-indigo-600">Home</Link>
          {currentUser && (
            <Link to="/admin" className="text-gray-600 hover:text-indigo-600">Admin</Link>
          )}
        </nav>
        <div>
          {currentUser ? (
            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Logout
            </button>
          ) : (
            <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
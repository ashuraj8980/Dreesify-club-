import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Failed to log in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="bg-secondary p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-text-primary">Login</h2>
        {error && <p className="bg-red-500 text-white text-center p-3 rounded-md mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 leading-tight text-text-primary bg-primary border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-text-secondary text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 leading-tight text-text-primary bg-primary border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-accent text-primary font-bold py-3 px-4 rounded-md hover:bg-opacity-80 transition duration-300 focus:outline-none focus:shadow-outline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

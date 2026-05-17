import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <div className="bg-primary font-sans">
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <AdminPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;

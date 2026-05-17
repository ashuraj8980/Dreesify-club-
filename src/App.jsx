import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer'; // Import Footer
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';

// Placeholder for pages that are not yet created
const ComingSoon = ({ pageName }) => (
  <div className='flex-grow flex flex-col justify-center items-center'>
    <h1 className='text-4xl font-bold'>{pageName}</h1>
    <p className='text-xl text-gray-600 mt-4'>This page is under construction. Coming soon!</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminPage />} />
              
              {/* Placeholder Routes from Header & Footer */}
              <Route path="/products" element={<ComingSoon pageName="All Products" />} />
              <Route path="/about" element={<ComingSoon pageName="About Us" />} />
              <Route path="/contact" element={<ComingSoon pageName="Contact" />} />
              <Route path="/faq" element={<ComingSoon pageName="FAQs" />} />
              <Route path="/profile" element={<ComingSoon pageName="My Profile" />} />
              <Route path="/shipping" element={<ComingSoon pageName="Shipping Info" />} />
              <Route path="/returns" element={<ComingSoon pageName="Returns & Exchanges" />} />
              <Route path="/privacy" element={<ComingSoon pageName="Privacy Policy" />} />
              <Route path="/terms" element={<ComingSoon pageName="Terms of Service" />} />

            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

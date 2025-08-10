
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Import all your components and pages...
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Confirmation from './pages/Confirmation';
import AuthPage from './pages/AuthPage';
import FloatingCartButton from './components/FloatingCartButton';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
      <Router>
          <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <Toaster
                position="top-center"
                toastOptions={{
                  success: {
                    style: {
                      background: '#2c3e50',
                      color: 'white',
                    },
                  },
                }}
            />
            <Header />
            <FloatingCartButton />
            <main className="container">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/confirmation" element={<Confirmation />} />
                <Route path="/login" element={<AuthPage />} />
              </Routes>
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </Router>
  );
}

export default App;
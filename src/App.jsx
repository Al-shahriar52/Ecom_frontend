
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

import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import Orders from './pages/dashboard/Orders';
import Address from './pages/dashboard/Address';
import AccountDetails from './pages/dashboard/AccountDetails';
import OrderDetail from './pages/dashboard/OrderDetail';

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
                  <Route path="/dashboard" element={<DashboardLayout />}>
                      <Route index element={<DashboardHome />} />
                      <Route path="orders" element={<Orders />} />
                      <Route path="orders/:orderId" element={<OrderDetail />} />
                      <Route path="address" element={<Address />} />
                      <Route path="account-details" element={<AccountDetails />} />
                  </Route>

              </Routes>
            </main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </Router>
  );
}

export default App;
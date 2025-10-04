
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Core Components ---
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ShopPage from './pages/ShopPage';
import AllProductsPage from './pages/AllProductsPage';

// --- Context Providers ---
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// --- Main Pages (Default imports) ---
import Home from './pages/Home';
import Cart from './pages/Cart';
import AuthPage from './pages/AuthPage';
import FloatingCartButton from './components/FloatingCartButton';

// --- User Dashboard Pages (Default imports) ---
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import Orders from './pages/dashboard/Orders';
import OrderDetail from './pages/dashboard/OrderDetail';
import Address from './pages/dashboard/Address';
import AccountDetails from './pages/dashboard/AccountDetails';

// --- Admin Dashboard Pages (Default imports) ---
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import AdminHome from './pages/admin/AdminHome';
import ProductManagement from './pages/admin/ProductManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminOrders from './pages/admin/AdminOrders';
import Accounting from './pages/admin/Accounting';
import CouponManagement from './pages/admin/CouponManagement';
import AddProduct from './pages/admin/AddProduct';


function App() {
    return (
        <Router>
            <ScrollToTop />
            <AuthProvider>
                <CartProvider>
                    <Toaster position="top-center" reverseOrder={false} />
                    <Header />
                    <FloatingCartButton />
                    <main>
                        <Routes>
                            {/* --- Public Routes --- */}
                            <Route path="/" element={<Home />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/login" element={<AuthPage />} />
                            <Route path="/brand/:slug" element={<ShopPage />} />
                            <Route path="/category/:slug" element={<ShopPage />} />
                            <Route path="/subcategory/:slug" element={<ShopPage />} />
                            <Route path="/products" element={<AllProductsPage />} />

                            {/* --- User Dashboard Routes --- */}
                            <Route path="/dashboard" element={<DashboardLayout />}>
                                <Route index element={<DashboardHome />} />
                                <Route path="orders" element={<Orders />} />
                                <Route path="orders/:orderId" element={<OrderDetail />} />
                                <Route path="address" element={<Address />} />
                                <Route path="account-details" element={<AccountDetails />} />
                            </Route>

                            {/* --- Protected Admin Routes --- */}
                            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                                <Route path="/admin" element={<AdminDashboardLayout />}>
                                    <Route index element={<AdminHome />} />
                                    <Route path="products" element={<ProductManagement />} />
                                    <Route path="users" element={<UserManagement />} />
                                    <Route path="coupons" element={<CouponManagement />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                    <Route path="accounting" element={<Accounting />} />
                                    <Route path="products/add" element={<AddProduct />} />
                                </Route>
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
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// --- Core Components ---
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import FbtManagementPage from './pages/admin/FbtManagementPage';
import FloatingCartButton from './components/FloatingCartButton';
import Contact from './pages/Contact';
import Shipping from './pages/ShippingDeliveryFooter';
import RefundPolicy from './pages/RefundPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Shop from './pages/ShopPage'
import AboutUs from './pages/AboutUs';

// --- Context Providers ---
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Toaster } from 'react-hot-toast';

// --- Main Pages ---
import Home from './pages/Home';
import Cart from './pages/Cart';
import AuthPage from './pages/AuthPage';
import Checkout from './pages/Checkout';

// --- User Dashboard Pages ---
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import Orders from './pages/dashboard/Orders';
import OrderDetail from './pages/dashboard/OrderDetail';
import Address from './pages/dashboard/Address';
import AccountDetails from './pages/dashboard/AccountDetails';

// --- Admin Dashboard Pages ---
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import AdminHome from './pages/admin/AdminHome';
import ProductManagement from './pages/admin/ProductManagement';
import UserManagement from './pages/admin/UserManagement';
import AdminOrders from './pages/admin/orders/AdminOrders';
import AdminOrderDetails from "./pages/admin/orders/AdminOrderDetails";
import Accounting from './pages/admin/Accounting';
import CouponManagement from './pages/admin/CouponManagement';
import AddProduct from './pages/admin/AddProduct';
import EditProductPage from './pages/admin/EditProductPage';
import Wishlist from './pages/Wishlist';
import OrderSuccess from './pages/OrderSuccess';

// --- Helper Component to Hide Cart on Specific Routes ---
const ConditionalFloatingCart = () => {
    const location = useLocation();

    // Add any other routes where you want to hide the cart here
    const hideOnRoutes = ['/checkout'];

    // If the current path is in the hidden list, return nothing
    if (hideOnRoutes.includes(location.pathname)) {
        return null;
    }

    return <FloatingCartButton />;
};
function App() {
    return (
        <HelmetProvider>
        <Router>
            <ScrollToTop />
            <AuthProvider>
                <CartProvider>
                    <WishlistProvider>
                    <Toaster position="top-center" reverseOrder={false} />
                    <Header />
                        <ConditionalFloatingCart />
                    <main>
                        <Routes>
                            {/* --- Public Routes --- */}
                            <Route path="/" element={<Home />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/shipping-delivery" element={<Shipping />} />
                            <Route path="/refund-policy" element={<RefundPolicy />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/about" element={<AboutUs />} />
                            <Route path="/cart" element={<Cart />} />
                            <Route path="/login" element={<AuthPage />} />
                            <Route path="/brand/:slug" element={<ShopPage />} />
                            <Route path="/category/:slug" element={<ShopPage />} />
                            <Route path="/subcategory/:slug" element={<ShopPage />} />
                            <Route path="/product/:productId" element={<ProductDetailPage />} />
                            <Route path="/checkout" element={<ProtectedRoute allowedRoles={['GUEST', 'USER', 'ADMIN', 'ROLE_GUEST', 'ROLE_USER', 'ROLE_ADMIN']}><Checkout /></ProtectedRoute>}/>
                            <Route path="/wishlist" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'ROLE_USER', 'ROLE_ADMIN']}><Wishlist /></ProtectedRoute>}/>
                            <Route path="/order-success/:orderId" element={<ProtectedRoute allowedRoles={['GUEST', 'USER', 'ADMIN', 'ROLE_GUEST', 'ROLE_USER', 'ROLE_ADMIN']}><OrderSuccess /></ProtectedRoute>} />

                            {/* --- User Dashboard Routes --- */}
                            {/* Wrap the entire dashboard layout to block guests. Only logged-in users/admins allowed. */}
                            <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'ROLE_USER', 'ROLE_ADMIN']} />}>
                                <Route path="/dashboard" element={<DashboardLayout />}>
                                    <Route index element={<DashboardHome />} />
                                    <Route path="orders" element={<Orders />} />
                                    <Route path="orders/:orderId" element={<OrderDetail />} />
                                    <Route path="address" element={<Address />} />
                                    <Route path="account-details" element={<AccountDetails />} />
                                </Route>
                            </Route>

                            {/* --- Protected Admin Routes --- */}
                            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                                <Route path="/admin" element={<AdminDashboardLayout />}>
                                    <Route index element={<AdminHome />} />
                                    <Route path="products" element={<ProductManagement />} />
                                    <Route path="users" element={<UserManagement />} />
                                    <Route path="coupons" element={<CouponManagement />} />
                                    <Route path="orders" element={<AdminOrders />} />
                                    <Route path="orders/:orderId" element={<AdminOrderDetails />} />
                                    <Route path="accounting" element={<Accounting />} />
                                    <Route path="products/add" element={<AddProduct />} />
                                    <Route path="/admin/products/edit/:id" element={<EditProductPage />} />
                                    <Route path="frequently-bought-together" element={<FbtManagementPage />} />
                                </Route>
                            </Route>

                        </Routes>
                    </main>
                    <Footer />
                    </WishlistProvider>
                </CartProvider>
            </AuthProvider>
        </Router>
        </HelmetProvider>
    );
}

export default App;
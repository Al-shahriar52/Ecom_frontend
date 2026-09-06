import React, { useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet, Navigate } from 'react-router-dom';
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
import Shop from './pages/ShopPage';
import AboutUs from './pages/AboutUs';

// --- Context Providers ---
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { Toaster } from 'react-hot-toast';
import { PermissionProvider } from "./context/PermissionContext";

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
import CouponManagement from './pages/admin/coupons/CouponManagement';
import AddProduct from './pages/admin/AddProduct';
import EditProductPage from './pages/admin/EditProductPage';
import Wishlist from './pages/Wishlist';
import OrderSuccess from './pages/OrderSuccess';
import RoleManagement from './components/admin/user/RolesPanel';

// --- Helper Component to Handle Meta Pixel Tracking ---
const PixelTracker = () => {
    const location = useLocation();

    useEffect(() => {
        if (window.fbq) {
            window.fbq('track', 'PageView');
        }
    }, [location]);

    return null;
};

// --- Helper Component to Hide Cart on Specific Routes ---
const ConditionalFloatingCart = () => {
    const location = useLocation();
    const hideOnRoutes = ['/checkout'];

    if (hideOnRoutes.includes(location.pathname)) {
        return null;
    }

    return <FloatingCartButton />;
};

// --- STAFF DASHBOARD REDIRECT INTERCEPTOR ---
const StaffDashboardRedirect = () => {
    const { user } = useContext(AuthContext);

    // Extract roles safely whether backend sends an array, Set, or single string
    let userRoles = [];
    if (user) {
        if (Array.isArray(user.roles)) {
            userRoles = user.roles;
        } else if (user.roles instanceof Set) {
            userRoles = Array.from(user.roles);
        } else if (user.role) {
            userRoles = [user.role];
        }
    }

    const normalizedRoles = userRoles.map(r => {
        const roleStr = typeof r === 'string' ? r : r.name || '';
        return roleStr.replace(/^ROLE_/, '').toUpperCase();
    });

    // If user is Admin, Manager, or Staff, bounce them to /admin panel
    if (normalizedRoles.includes('ADMIN') || normalizedRoles.includes('MANAGER') || normalizedRoles.includes('STAFF')) {
        return <Navigate to="/admin" replace />;
    }

    // Otherwise, render standard user dashboard layout
    return <DashboardLayout />;
};

// --- Layout for Public & User Dashboard Pages ---
const PublicLayout = () => {
    return (
        <>
            <Header />
            <ConditionalFloatingCart />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

function App() {
    return (
        <HelmetProvider>
            <Router>
                <PixelTracker />
                <ScrollToTop />
                <AuthProvider>
                    <PermissionProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <Toaster position="top-center" reverseOrder={false} />

                                <Routes>
                                    {/* ========================================== */}
                                    {/* --- PUBLIC & USER ROUTES (Has Header) --- */}
                                    {/* ========================================== */}
                                    <Route element={<PublicLayout />}>

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
                                        <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN', 'MANAGER', 'STAFF', 'ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_STAFF']} />}>
                                            <Route path="/dashboard" element={<StaffDashboardRedirect />}>
                                                <Route index element={<DashboardHome />} />
                                                <Route path="orders" element={<Orders />} />
                                                <Route path="orders/:orderId" element={<OrderDetail />} />
                                                <Route path="address" element={<Address />} />
                                                <Route path="account-details" element={<AccountDetails />} />
                                            </Route>
                                        </Route>

                                    </Route> {/* End of PublicLayout */}


                                    {/* ========================================== */}
                                    {/* --- ADMIN, MANAGER & STAFF ROUTES --- */}
                                    {/* ========================================== */}
                                    <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN', 'MANAGER', 'ROLE_MANAGER', 'STAFF', 'ROLE_STAFF']} />}>
                                        <Route path="/admin" element={<AdminDashboardLayout />}>

                                            {/* === Pages Admin, Manager & Staff can access based on matrix permissions === */}
                                            <Route index element={<AdminHome />} />
                                            <Route path="products" element={<ProductManagement />} />
                                            <Route path="users" element={<UserManagement />} />
                                            <Route path="orders" element={<AdminOrders />} />
                                            <Route path="orders/:orderId" element={<OrderDetail />} />
                                            <Route path="products/add" element={<AddProduct />} />
                                            <Route path="/admin/products/edit/:id" element={<EditProductPage />} />
                                            <Route path="frequently-bought-together" element={<FbtManagementPage />} />

                                            {/* === Pages ONLY Admin can see === */}
                                            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']} />}>
                                                <Route path="roles" element={<RoleManagement />} />
                                                <Route path="coupons" element={<CouponManagement />} />
                                                <Route path="accounting" element={<Accounting />} />
                                            </Route>

                                        </Route>
                                    </Route>

                                </Routes>
                            </WishlistProvider>
                        </CartProvider>
                    </PermissionProvider>
                </AuthProvider>
            </Router>
        </HelmetProvider>
    );
}

export default App;
import React, { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
    // 1. EXTRACT isGuest FROM YOUR AUTH CONTEXT
    const { user, isAuthenticated, loading, isGuest } = useContext(AuthContext);
    const location = useLocation();

    // 1. Loading State: Wait for Auth check to finish
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    // 2. Not Authenticated & Not a Guest: Redirect to Login
    // This allows guest users to bypass the login screen wall
    if (!isAuthenticated && !isGuest) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Role Authorization
    // If allowedRoles is defined, ensure the user has permission
    if (allowedRoles) {
        const userRole = user?.role || (isGuest ? 'GUEST' : '');

        // Guests are allowed to access routes designated for 'CUSTOMER' (like Checkout)
        const hasAccess = allowedRoles.includes(userRole) || (isGuest && allowedRoles.includes('CUSTOMER'));

        if (!hasAccess) {
            console.warn(`Access Denied: User role '${userRole}' is not authorized.`);
            return <Navigate to="/" replace />;
        }
    }

    // 4. Render the Component
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
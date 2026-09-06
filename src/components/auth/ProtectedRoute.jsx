import React, { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, isAuthenticated, loading, isGuest } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    if (!isAuthenticated && !isGuest) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles) {
        // Extract raw role or default guest
        const rawRole = user?.role || (isGuest ? 'GUEST' : '');

        // Strip 'ROLE_' prefix if present (e.g. ROLE_MANAGER -> MANAGER)
        const userRole = rawRole.replace(/^ROLE_/, '');

        // Normalize allowedRoles list
        const normalizedAllowedRoles = allowedRoles.map(r => r.replace(/^ROLE_/, ''));

        const hasAccess = normalizedAllowedRoles.includes(userRole) ||
            (isGuest && normalizedAllowedRoles.includes('CUSTOMER'));

        if (!hasAccess) {
            console.warn(`Access Denied: User role '${userRole}' is not authorized for allowed roles:`, allowedRoles);
            return <Navigate to="/" replace />;
        }
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
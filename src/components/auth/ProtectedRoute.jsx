
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
        // Extract user roles safely, supporting arrays, Sets, or single string fields from backend
        let userRoles = [];
        if (user) {
            if (Array.isArray(user.roles)) {
                userRoles = user.roles;
            } else if (user.roles instanceof Set) {
                userRoles = Array.from(user.roles);
            } else if (user.role) {
                userRoles = [user.role];
            }
        } else if (isGuest) {
            userRoles = ['GUEST'];
        }

        // Normalize user roles (strip 'ROLE_' prefix and uppercase)
        const normalizedUserRoles = userRoles.map(r => {
            const roleStr = typeof r === 'string' ? r : r.name || '';
            return roleStr.replace(/^ROLE_/, '').toUpperCase();
        });

        // Normalize allowed roles list
        const normalizedAllowedRoles = allowedRoles.map(r => r.replace(/^ROLE_/, '').toUpperCase());

        const hasAccess = normalizedUserRoles.some(r => normalizedAllowedRoles.includes(r)) ||
            (isGuest && normalizedAllowedRoles.includes('CUSTOMER'));

        if (!hasAccess) {
            console.warn(`Access Denied: User roles '${normalizedUserRoles.join(', ')}' are not authorized for allowed roles:`, allowedRoles);
            return <Navigate to="/" replace />;
        }
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
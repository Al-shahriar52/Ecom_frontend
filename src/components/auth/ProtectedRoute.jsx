import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useContext(AuthContext);

    // 1. Check if the user is authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Check if the user has one of the allowed roles
    const hasRequiredRole = user && allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
        // Redirect to home page if role is not authorized
        return <Navigate to="/" replace />;
    }

    // 3. If authenticated and authorized, show the page
    return <Outlet />;
};

export default ProtectedRoute;
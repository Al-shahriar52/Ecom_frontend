import React, { useContext } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, isAuthenticated, loading } = useContext(AuthContext);
    const location = useLocation();

    // 1. Loading State: Wait for Auth check to finish
    // If we don't wait, it might redirect to login before knowing you are actually logged in.
    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading...</div>;
    }

    // 2. Not Authenticated: Redirect to Login
    if (!isAuthenticated || !user) {
        // 'state' saves the current location so we can send them back after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Debugging Role Mismatch (Check console if it fails!)
    // console.log("User Role:", user.role);
    // console.log("Allowed:", allowedRoles);

    // 4. Role Authorization
    // We check if the user's role exists in the allowed list
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.warn(`Access Denied: User role '${user.role}' is not in [${allowedRoles.join(', ')}]`);
        return <Navigate to="/" replace />;
    }

    // 5. Render the Component
    // If 'children' are passed (like in your App.js), render them.
    // Otherwise, render <Outlet /> for nested routes.
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
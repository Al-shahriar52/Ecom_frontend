import React from 'react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const DashboardHome = () => {
    const { user } = useContext(AuthContext);
    return (
        <div>
            <h2>Dashboard</h2>
            <p>Hello, <strong>{user?.name || user?.emailOrPhone}</strong>!</p>
            <p>From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.</p>
        </div>
    );
};
export default DashboardHome;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import '../../pages/dashboard/Dashboard.css'; // We can reuse the same CSS

const AdminSidebar = () => {
    const { logout } = useContext(AuthContext);

    return (
        <nav className="dashboard-sidebar">
            <NavLink to="/admin" end className="sidebar-link"><span>📊</span> Dashboard</NavLink>
            <NavLink to="/admin/products" className="sidebar-link"><span>📦</span> Product Management</NavLink>
            <NavLink to="/admin/frequently-bought-together" className="sidebar-link"><span>🔗</span> FBT Management</NavLink>
            <NavLink to="/admin/users" className="sidebar-link"><span>👥</span> User Management</NavLink>
            <NavLink to="/admin/coupons" className="sidebar-link"><span>🎟️</span> Coupon Management</NavLink>
            <NavLink to="/admin/orders" className="sidebar-link"><span>📋</span> Orders</NavLink>
            <NavLink to="/admin/accounting" className="sidebar-link"><span>💰</span> Accounting</NavLink>
            <button onClick={logout} className="sidebar-link logout-btn"><span>↪️</span> Logout</button>
        </nav>
    );
};

export default AdminSidebar;
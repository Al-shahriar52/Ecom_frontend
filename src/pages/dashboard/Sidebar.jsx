import React from 'react';
import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Dashboard.css';

const Sidebar = () => {
    const { logout } = useContext(AuthContext);

    return (
        <nav className="dashboard-sidebar">
            <NavLink to="/dashboard" end className="sidebar-link"><span>🎛️</span> Dashboard</NavLink>
            <NavLink to="/dashboard/orders" className="sidebar-link"><span>🛒</span> Orders</NavLink>
            <NavLink to="/dashboard/address" className="sidebar-link"><span>🏠</span> Address</NavLink>
            <NavLink to="/dashboard/account-details" className="sidebar-link"><span>👤</span> Account Details</NavLink>
            <NavLink to="/dashboard/change-password" className="sidebar-link"><span>🔒</span> Change Password</NavLink>
            {/* Add other links like Loyalty Program, etc. here */}
            <button onClick={logout} className="sidebar-link logout-btn"><span>↪️</span> Logout</button>
        </nav>
    );
};

export default Sidebar;
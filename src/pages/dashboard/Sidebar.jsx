import React from 'react';
import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './Dashboard.css';

// Same line-icon style as the admin sidebar (AdminSidebar.jsx): 20px, stroke follows the text colour
const svgProps = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};

const Icons = {
    Dashboard: () => <svg {...svgProps}><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
    Orders: () => <svg {...svgProps}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
    Address: () => <svg {...svgProps}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    Account: () => <svg {...svgProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    Password: () => <svg {...svgProps}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
    Logout: () => <svg {...svgProps}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
};

const Sidebar = () => {
    const { logout } = useContext(AuthContext);

    return (
        <nav className="dashboard-sidebar">
            <NavLink to="/dashboard" end className="sidebar-link"><span className="sidebar-icon"><Icons.Dashboard /></span> Dashboard</NavLink>
            <NavLink to="/dashboard/orders" className="sidebar-link"><span className="sidebar-icon"><Icons.Orders /></span> Orders</NavLink>
            <NavLink to="/dashboard/address" className="sidebar-link"><span className="sidebar-icon"><Icons.Address /></span> Address</NavLink>
            <NavLink to="/dashboard/account-details" className="sidebar-link"><span className="sidebar-icon"><Icons.Account /></span> Account Details</NavLink>
            <NavLink to="/dashboard/change-password" className="sidebar-link"><span className="sidebar-icon"><Icons.Password /></span> Password</NavLink>
            {/* Add other links like Loyalty Program, etc. here */}
            <button onClick={logout} className="sidebar-link logout-btn"><span className="sidebar-icon"><Icons.Logout /></span> Logout</button>
        </nav>
    );
};

export default Sidebar;

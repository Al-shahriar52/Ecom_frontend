
import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './AdminDashboard.css';

const AdminSidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const Icons = {
        MenuToggle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>,
        Dashboard: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
        Products: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>,
        Users: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        FBT: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>,
        Coupons: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>,
        Orders: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>,
        Accounting: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><line x1="12" y1="18" x2="12" y2="22"></line><line x1="12" y1="2" x2="12" y2="6"></line></svg>,
        Logout: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
        ChevronDown: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
        ChevronUp: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
    };

    return (
        <nav className={`modern-sidebar ${isCollapsed ? 'collapsed' : ''}`}>

            <div className="sidebar-header">
                {!isCollapsed && <span className="brand-text">Admin Panel</span>}
                <button className="collapse-toggle" onClick={() => setIsCollapsed(!isCollapsed)}>
                    <Icons.MenuToggle />
                </button>
            </div>

            <div className="sidebar-profile">
                <img
                    src={user?.avatar || "https://i.pravatar.cc/150?img=11"}
                    alt="Admin"
                    className="profile-avatar"
                />
                {!isCollapsed && (
                    <div className="profile-info">
                        <span className="profile-role">PRODUCT MANAGER</span>
                        <span className="profile-name" title={user?.name || "Andrew Smith"}>
                            {user?.name || "Andrew Smith"}
                        </span>
                    </div>
                )}
            </div>

            <div className="sidebar-section-title">
                {!isCollapsed ? "MAIN MENU" : "•••"}
            </div>

            <div className="sidebar-links">
                <NavLink to="/admin" end className="sidebar-link" data-tooltip="Dashboard">
                    <span className="icon"><Icons.Dashboard /></span>
                    <span className="text">Dashboard</span>
                </NavLink>

                <NavLink to="/admin/products" className="sidebar-link" data-tooltip="Products">
                    <span className="icon"><Icons.Products /></span>
                    <span className="text">Products</span>
                </NavLink>

                <div className={`sidebar-item-group ${isUserMenuOpen ? 'open' : ''}`}>
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="sidebar-link dropdown-toggle"
                        data-tooltip="User Management"
                    >
                        {/* DOM Structure flattened for perfect flexbox alignment */}
                        <span className="icon"><Icons.Users /></span>
                        <span className="text">User Management</span>

                        {!isCollapsed && (
                            <span className="arrow">
                                {isUserMenuOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                            </span>
                        )}
                    </button>

                    {isUserMenuOpen && !isCollapsed && (
                        <ul className="sidebar-submenu-tree">
                            <li>
                                <NavLink to="/admin/users" end className="tree-link">
                                    Users
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/admin/roles" className="tree-link">
                                    Roles & Permissions
                                </NavLink>
                            </li>
                        </ul>
                    )}
                </div>

                <NavLink to="/admin/frequently-bought-together" className="sidebar-link" data-tooltip="FBT Management">
                    <span className="icon"><Icons.FBT /></span>
                    <span className="text">FBT Management</span>
                </NavLink>

                <NavLink to="/admin/coupons" className="sidebar-link" data-tooltip="Coupons">
                    <span className="icon"><Icons.Coupons /></span>
                    <span className="text">Coupons</span>
                </NavLink>

                <NavLink to="/admin/orders" className="sidebar-link" data-tooltip="Orders">
                    <span className="icon"><Icons.Orders /></span>
                    <span className="text">Orders</span>
                </NavLink>
            </div>

            <div className="sidebar-section-title" style={{ marginTop: '30px' }}>
                {!isCollapsed ? "SETTINGS" : "•••"}
            </div>

            <div className="sidebar-links">
                <NavLink to="/admin/accounting" className="sidebar-link" data-tooltip="Accounting">
                    <span className="icon"><Icons.Accounting /></span>
                    <span className="text">Accounting</span>
                </NavLink>

                <button onClick={logout} className="sidebar-link logout-btn" data-tooltip="Logout">
                    <span className="icon"><Icons.Logout /></span>
                    <span className="text">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default AdminSidebar;
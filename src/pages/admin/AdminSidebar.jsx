
import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';
import './AdminDashboard.css';

const AdminSidebar = () => {
    const { logout, user } = useContext(AuthContext);
    const { hasPermission, loading } = usePermissions();
    const [isCollapsed, setIsCollapsed] = useState(() =>
        typeof window !== 'undefined' && window.innerWidth <= 992
    );
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAccountingMenuOpen, setIsAccountingMenuOpen] = useState(false);

    const userRoles = user?.roles ? (Array.isArray(user.roles) ? user.roles : Array.from(user.roles)) : (user?.role ? [user.role] : []);
    const isAdmin = userRoles.some(r => String(r).replace(/^ROLE_/, '').toUpperCase() === 'ADMIN');
    const primaryRoleDisplay = userRoles.length > 0 ? String(userRoles[0]).replace(/^ROLE_/, '') : 'USER';

    // Permission matrix index mapping (11-permission schema):
    // 0 = View dashboard
    // 1 = Manage users
    // 2 = Create users
    // 3 = Edit permissions
    // 4 = View orders
    // 5 = Refund orders
    // 6 = Export data
    // 7 = Manage settings
    // 8 = Manage Coupons
    // 9 = Manage Accounting
    // 10 = Manage FBT
    const canViewDashboard = !loading && hasPermission(user, 0);
    const canManageUsers = !loading && (hasPermission(user, 1) || hasPermission(user, 2));
    const canManageOrders = !loading && hasPermission(user, 4);
    const canManageCoupons = !loading && hasPermission(user, 8);
    const canManageAccounting = !loading && hasPermission(user, 9);
    const canManageFbt = !loading && hasPermission(user, 10);
    const canManageProducts = !loading && hasPermission(user, 11);

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
        ChevronUp: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>,
        Grid: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
        TrendUp: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>,
        Swap: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>,
        Landmark: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"></line><line x1="6" y1="18" x2="6" y2="11"></line><line x1="10" y1="18" x2="10" y2="11"></line><line x1="14" y1="18" x2="14" y2="11"></line><line x1="18" y1="18" x2="18" y2="11"></line><polygon points="12 2 20 7 4 7"></polygon></svg>,
        Truck: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>,
        Undo: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>,
        Plus: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>,
        Receipt: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2h16v20l-3-2-3 2-3-2-3 2-3-2-1 2z"></path><line x1="8" y1="7" x2="16" y2="7"></line><line x1="8" y1="11" x2="16" y2="11"></line></svg>,
        UserGroup: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
        FileChart: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="17" x2="9" y2="13"></line><line x1="12" y1="17" x2="12" y2="11"></line><line x1="15" y1="17" x2="15" y2="15"></line></svg>,
        Percent: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="5" x2="5" y2="19"></line><circle cx="6.5" cy="6.5" r="2.5"></circle><circle cx="17.5" cy="17.5" r="2.5"></circle></svg>,
        Sliders: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>,
        UserSingle: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        Shield: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
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
                        <span className="profile-role">{primaryRoleDisplay}</span>
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
                {canViewDashboard && (
                    <NavLink to="/admin" end className="sidebar-link" data-tooltip="Dashboard">
                        <span className="icon"><Icons.Dashboard /></span>
                        <span className="text">Dashboard</span>
                    </NavLink>
                )}

                {canManageUsers && (
                    <div className={`sidebar-item-group ${isUserMenuOpen ? 'open' : ''}`}>
                        <button
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="sidebar-link dropdown-toggle"
                            data-tooltip="User Management"
                        >
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
                                        <span className="tree-icon"><Icons.UserSingle /></span>
                                        Users
                                    </NavLink>
                                </li>
                                {isAdmin && (
                                    <li>
                                        <NavLink to="/admin/roles" className="tree-link">
                                            <span className="tree-icon"><Icons.Shield /></span>
                                            Roles &amp; Permissions
                                        </NavLink>
                                    </li>
                                )}
                            </ul>
                        )}
                    </div>
                )}

                {canManageFbt && (
                    <NavLink to="/admin/frequently-bought-together" className="sidebar-link" data-tooltip="FBT Management">
                        <span className="icon"><Icons.FBT /></span>
                        <span className="text">FBT Management</span>
                    </NavLink>
                )}

                {canManageProducts && (
                    <NavLink to="/admin/products" className="sidebar-link" data-tooltip="Products">
                        <span className="icon"><Icons.Products /></span>
                        <span className="text">Products</span>
                    </NavLink>
                )}

                {canManageCoupons && (
                    <NavLink to="/admin/coupons" className="sidebar-link" data-tooltip="Coupons">
                        <span className="icon"><Icons.Coupons /></span>
                        <span className="text">Coupons</span>
                    </NavLink>
                )}

                {canManageOrders && (
                    <NavLink to="/admin/orders" className="sidebar-link" data-tooltip="Orders">
                        <span className="icon"><Icons.Orders /></span>
                        <span className="text">Orders</span>
                    </NavLink>
                )}
            </div>

            <div className="sidebar-section-title" style={{ marginTop: '30px' }}>
                {!isCollapsed ? "SETTINGS" : "•••"}
            </div>

            <div className="sidebar-links">
                {canManageAccounting && (
                    <div className={`sidebar-item-group ${isAccountingMenuOpen ? 'open' : ''}`}>
                        <button
                            onClick={() => setIsAccountingMenuOpen(!isAccountingMenuOpen)}
                            className="sidebar-link dropdown-toggle"
                            data-tooltip="Accounting"
                        >
                            <span className="icon"><Icons.Accounting /></span>
                            <span className="text">Accounting</span>

                            {!isCollapsed && (
                                <span className="arrow">
                                    {isAccountingMenuOpen ? <Icons.ChevronUp /> : <Icons.ChevronDown />}
                                </span>
                            )}
                        </button>

                        {isAccountingMenuOpen && !isCollapsed && (
                            <ul className="sidebar-submenu-tree">
                                <li className="tree-group-label">Overview</li>
                                <li><NavLink to="/admin/accounting" end className="tree-link"><span className="tree-icon"><Icons.Grid /></span>Dashboard</NavLink></li>
                                <li><NavLink to="/admin/accounting/report" className="tree-link"><span className="tree-icon"><Icons.TrendUp /></span>Earnings report</NavLink></li>

                                <li className="tree-group-label">Money in</li>
                                <li><NavLink to="/admin/accounting/transactions" className="tree-link"><span className="tree-icon"><Icons.Swap /></span>Transactions</NavLink></li>
                                <li><NavLink to="/admin/accounting/settlements" className="tree-link"><span className="tree-icon"><Icons.Landmark /></span>Settlements</NavLink></li>
                                <li><NavLink to="/admin/accounting/cod" className="tree-link"><span className="tree-icon"><Icons.Truck /></span>Cash on delivery</NavLink></li>
                                <li><NavLink to="/admin/accounting/refunds" className="tree-link"><span className="tree-icon"><Icons.Undo /></span>Refunds</NavLink></li>

                                <li className="tree-group-label">Money out</li>
                                <li><NavLink to="/admin/accounting/expenses/new" className="tree-link"><span className="tree-icon"><Icons.Plus /></span>Record a cost</NavLink></li>
                                <li><NavLink to="/admin/accounting/expenses" end className="tree-link"><span className="tree-icon"><Icons.Receipt /></span>All expenses</NavLink></li>
                                <li><NavLink to="/admin/accounting/payroll" className="tree-link"><span className="tree-icon"><Icons.UserGroup /></span>Payroll</NavLink></li>

                                <li className="tree-group-label">Books</li>
                                <li><NavLink to="/admin/accounting/profit-loss" className="tree-link"><span className="tree-icon"><Icons.FileChart /></span>Profit &amp; loss</NavLink></li>
                                <li><NavLink to="/admin/accounting/vat-ait" className="tree-link"><span className="tree-icon"><Icons.Percent /></span>VAT &amp; AIT</NavLink></li>
                                <li><NavLink to="/admin/accounting/gateways" className="tree-link"><span className="tree-icon"><Icons.Sliders /></span>Payment gateways</NavLink></li>
                            </ul>
                        )}
                    </div>
                )}

                <button onClick={logout} className="sidebar-link logout-btn" data-tooltip="Logout">
                    <span className="icon"><Icons.Logout /></span>
                    <span className="text">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default AdminSidebar;
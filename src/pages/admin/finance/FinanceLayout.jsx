import React, { useContext } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import {
    LayoutDashboard, TrendingUp, ArrowLeftRight, Landmark, Truck, Undo2,
    PlusCircle, Receipt, Users, FileBarChart, Percent, Settings2,
    Search, Bell, HelpCircle, Download,
} from './financeIcons';
import './FinanceLayout.css';

const NAV = [
    { to: '', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: 'report', label: 'Earnings report', icon: TrendingUp },
    { to: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: 'settlements', label: 'Settlements', icon: Landmark },
    { to: 'cod', label: 'Cash on delivery', icon: Truck },
    { to: 'refunds', label: 'Refunds', icon: Undo2 },
    { to: 'expenses/new', label: 'Record a cost', icon: PlusCircle },
    { to: 'expenses', label: 'All expenses', icon: Receipt, end: true },
    { to: 'payroll', label: 'Payroll', icon: Users },
    { to: 'profit-loss', label: 'Profit & loss', icon: FileBarChart },
    { to: 'vat-ait', label: 'VAT & AIT', icon: Percent },
    { to: 'gateways', label: 'Payment gateways', icon: Settings2 },
];

const FinanceLayout = () => {
    const location = useLocation();

    // Work out the current crumb label from the matching nav link, longest
    // match first so 'expenses/new' doesn't get shadowed by 'expenses'.
    const base = '/admin/accounting';
    const relative = location.pathname.replace(base, '').replace(/^\//, '');
    const active = [...NAV].sort((a, b) => b.to.length - a.to.length)
        .find((l) => (l.to === '' ? relative === '' : relative.startsWith(l.to)));
    const crumbLabel = active ? active.label : 'Dashboard';

    return (
        <div className="fin-shell">
            <div className="fin-main">
                <header className="fin-top">
                    <div className="fin-crumb">Finance <span style={{ opacity: 0.5 }}>/</span> <b>{crumbLabel}</b></div>
                    <div className="fin-sp" />
                    <div className="fin-search">
                        <Search size={14} style={{ color: 'var(--fin-tx3)' }} />
                        <input placeholder="Search orders, TrxID" aria-label="Search finance records" />
                        <kbd>⌘K</kbd>
                    </div>
                    <button className="fin-ibtn" aria-label="Notifications"><Bell size={16} /><span className="fin-dot" /></button>
                    <button className="fin-ibtn" aria-label="Help"><HelpCircle size={16} /></button>
                    <button className="fin-btn" style={{ height: 32 }}><Download size={14} />Export</button>
                </header>

                <div id="fin-views">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default FinanceLayout;
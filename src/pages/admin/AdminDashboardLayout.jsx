import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './AdminDashboard.css';

const AdminDashboardLayout = () => {
    return (
        <div className="admin-dashboard-layout">
            <AdminSidebar />
            <main className="admin-dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminDashboardLayout;
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import '../../pages/dashboard/Dashboard.css'; // Reusing the user dashboard CSS

const AdminDashboardLayout = () => {
    return (
        <div className="dashboard-layout">
            <AdminSidebar />
            <main className="dashboard-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminDashboardLayout;
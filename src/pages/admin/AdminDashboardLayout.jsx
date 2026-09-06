import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { usePermissions } from '../../context/PermissionContext';
import './AdminDashboard.css';

const AdminDashboardLayout = () => {
    const { loading } = usePermissions();

    // While fetching permissions from backend on fresh login/reload, display a smooth loader
    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
                <div style={{ textAlign: 'center', fontFamily: 'sans-serif', color: '#555' }}>
                    <div className="spinner" style={{ marginBottom: '10px', fontSize: '1.2rem', fontWeight: 600 }}>Loading Admin Panel...</div>
                </div>
            </div>
        );
    }

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
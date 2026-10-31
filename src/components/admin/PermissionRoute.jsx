import React, { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import { usePermissions } from '../../context/PermissionContext';

/**
 * Route guard driven by the Roles & Permissions matrix.
 *   <Route element={<PermissionRoute perm={13} />}> ... </Route>
 *   <Route element={<PermissionRoute any={[1, 2]} />}> ... </Route>
 * Admin always passes (hasPermission already returns true for admin).
 */
export default function PermissionRoute({ perm, any }) {
    const { user } = useContext(AuthContext);
    const { hasPermission, loading } = usePermissions();

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>;

    const list = any || [perm];
    if (list.some((p) => hasPermission(user, p))) return <Outlet />;

    return (
        <div style={{ maxWidth: 440, margin: '80px auto', padding: 32, textAlign: 'center', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Lock size={26} style={{ display: 'block', stroke: 'currentColor', fill: 'none' }} />
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: 20 }}>You don't have access to this page</h2>
            <p style={{ margin: '0 0 18px', color: '#6b7280', fontSize: 14 }}>Your role is not allowed to open it. Ask an administrator to turn it on in Roles &amp; Permissions.</p>
            <Link to="/admin" style={{ display: 'inline-block', padding: '10px 20px', borderRadius: 10, background: '#1f2937', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Back to dashboard</Link>
        </div>
    );
}

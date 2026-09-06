import React, { useState } from 'react';

const RoleManagement = () => {
    // Mock data for roles and permissions - replace with your actual API fetch later
    const [roles, setRoles] = useState([
        {
            id: 1,
            name: 'Admin',
            description: 'Full access to all system features and settings.',
            permissions: {
                viewProducts: true,
                editProducts: true,
                manageUsers: true,
                manageRoles: true,
                manageOrders: true,
                manageCoupons: true,
            }
        },
        {
            id: 2,
            name: 'Editor',
            description: 'Can manage products and view orders, but cannot manage users.',
            permissions: {
                viewProducts: true,
                editProducts: true,
                manageUsers: false,
                manageRoles: false,
                manageOrders: true,
                manageCoupons: false,
            }
        },
        {
            id: 3,
            name: 'User',
            description: 'Standard customer account. No admin access.',
            permissions: {
                viewProducts: false,
                editProducts: false,
                manageUsers: false,
                manageRoles: false,
                manageOrders: false,
                manageCoupons: false,
            }
        }
    ]);

    // Handle toggling individual permissions
    const handlePermissionChange = (roleId, permissionKey) => {
        setRoles(roles.map(role => {
            if (role.id === roleId) {
                return {
                    ...role,
                    permissions: {
                        ...role.permissions,
                        [permissionKey]: !role.permissions[permissionKey]
                    }
                };
            }
            return role;
        }));
    };

    return (
        <div className="admin-page-content">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-title-container">
                    <h2>Roles & Permissions</h2>
                    <div className="header-actions">
                        <button className="btn-add-product">+ Create New Role</button>
                    </div>
                </div>
            </div>

            {/* Roles Grid Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '25px',
                marginTop: '20px'
            }}>
                {roles.map(role => (
                    <div key={role.id} className="content-card" style={{ display: 'flex', flexDirection: 'column' }}>

                        {/* Role Title & Description */}
                        <div style={{ borderBottom: '1px solid #dfe0eb', paddingBottom: '15px', marginBottom: '15px' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#252733', fontSize: '18px' }}>
                                {role.name}
                            </h3>
                            <p style={{ margin: 0, fontSize: '13px', color: '#9fa2b4', lineHeight: '1.4' }}>
                                {role.description}
                            </p>
                        </div>

                        {/* Permissions List */}
                        <div className="permissions-list" style={{ flexGrow: 1 }}>
                            <h4 style={{ fontSize: '14px', marginBottom: '15px', color: '#252733', fontWeight: '600' }}>
                                Permissions Structure
                            </h4>

                            {Object.entries(role.permissions).map(([key, value]) => (
                                <div key={key} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '12px'
                                }}>
                                    <span style={{ fontSize: '14px', color: '#4a4a4a', textTransform: 'capitalize' }}>
                                        {/* Automatically adds spaces to camelCase keys for readability */}
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={() => handlePermissionChange(role.id, key)}
                                            disabled={role.name === 'Admin'} // Lock Admin permissions
                                            style={{
                                                cursor: role.name === 'Admin' ? 'not-allowed' : 'pointer',
                                                width: '16px',
                                                height: '16px',
                                                accentColor: '#E91E63' // Brand pink color
                                            }}
                                        />
                                    </label>
                                </div>
                            ))}
                        </div>

                        {/* Card Actions */}
                        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #dfe0eb', textAlign: 'right' }}>
                            <button
                                style={{
                                    backgroundColor: 'transparent',
                                    color: role.name === 'Admin' ? '#9fa2b4' : '#E91E63',
                                    border: `1px solid ${role.name === 'Admin' ? '#dfe0eb' : '#E91E63'}`,
                                    padding: '8px 20px',
                                    borderRadius: '6px',
                                    cursor: role.name === 'Admin' ? 'not-allowed' : 'pointer',
                                    fontWeight: '600',
                                    transition: 'all 0.2s ease'
                                }}
                                disabled={role.name === 'Admin'}
                                onMouseOver={(e) => {
                                    if (role.name !== 'Admin') {
                                        e.target.style.backgroundColor = '#E91E63';
                                        e.target.style.color = 'white';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (role.name !== 'Admin') {
                                        e.target.style.backgroundColor = 'transparent';
                                        e.target.style.color = '#E91E63';
                                    }
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoleManagement;
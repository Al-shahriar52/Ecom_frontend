import React, { createContext, useContext, useState } from "react";
import { ROLE_PERMISSION_MATRIX as INITIAL_MATRIX, ROLE_META as INITIAL_META, PERMISSIONS } from "../data/constants";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [matrix, setMatrix] = useState(INITIAL_MATRIX);
    const [roleMeta, setRoleMeta] = useState(INITIAL_META);

    // Toggle a specific permission for a role
    const togglePermission = (roleIndexKey, permIndex) => {
        setMatrix(prev => ({
            ...prev,
            [roleIndexKey]: prev[roleIndexKey].map((val, idx) =>
                idx === permIndex ? (val === 1 ? 0 : 1) : val
            )
        }));
    };

    // Add a new dynamic role
    const addNewRole = (roleKey, roleName, variant) => {
        // 1. Add to Meta (for badges, colors, and dropdowns)
        setRoleMeta(prev => ({
            ...prev,
            [roleKey]: { label: roleName, variant: variant }
        }));

        // 2. Add to Matrix (Initialize with all 0s / No permissions)
        const emptyPermissions = Array(PERMISSIONS.length).fill(0);
        setMatrix(prev => ({
            ...prev,
            [roleKey]: emptyPermissions
        }));
    };

    const hasPermission = (role, permIndex) => matrix[role]?.[permIndex] === 1;

    return (
        <PermissionContext.Provider value={{ matrix, roleMeta, togglePermission, hasPermission, addNewRole }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => useContext(PermissionContext);
import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/AxiosInstance";
import { toast } from "react-hot-toast";
import { AuthContext } from "./AuthContext"; // Now works because it's inside AuthProvider

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [matrix, setMatrix] = useState(null);
    const [roleMeta, setRoleMeta] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/v1/admin/roles');
            setRoleMeta(response.data.roleMeta);
            setPermissions(response.data.permissions);
            setMatrix(response.data.matrix);
        } catch (error) {
            console.error("Failed to load permissions from backend", error);
        } finally {
            setLoading(false);
        }
    };

    // Automatically calls the backend API the moment authentication succeeds or changes
    useEffect(() => {
        if (isAuthenticated) {
            fetchPermissions();
        } else {
            setMatrix(null);
            setRoleMeta(null);
            setLoading(false);
        }
    }, [isAuthenticated]);

    const togglePermission = async (roleKey, permIndex) => {
        if (!matrix) return;

        const currentValue = matrix[roleKey][permIndex];
        const newValue = currentValue === 1 ? 0 : 1;

        setMatrix(prev => ({
            ...prev,
            [roleKey]: prev[roleKey].map((val, idx) => idx === permIndex ? newValue : val)
        }));

        try {
            await axiosInstance.put('/api/v1/admin/roles/matrix', {
                role: roleKey,
                permIndex: permIndex,
                value: newValue
            });
            toast.success("Permissions updated successfully");
        } catch (error) {
            setMatrix(prev => ({
                ...prev,
                [roleKey]: prev[roleKey].map((val, idx) => idx === permIndex ? currentValue : val)
            }));
            toast.error("Failed to update permissions");
        }
    };

    const addNewRole = async (roleKey, roleName, variant) => {
        setRoleMeta(prev => ({
            ...prev,
            [roleKey]: { label: roleName, variant: variant }
        }));
        const emptyPermissions = Array(permissions.length).fill(0);
        setMatrix(prev => ({
            ...prev,
            [roleKey]: emptyPermissions
        }));
    };

    const hasPermission = (userOrRole, permIndex) => {
        if (!matrix) return false;

        let rolesArray = [];
        if (typeof userOrRole === 'object' && userOrRole !== null) {
            if (Array.isArray(userOrRole.roles)) {
                rolesArray = userOrRole.roles;
            } else if (userOrRole.roles instanceof Set) {
                rolesArray = Array.from(userOrRole.roles);
            } else if (userOrRole.role) {
                rolesArray = [userOrRole.role];
            }
        } else if (typeof userOrRole === 'string') {
            rolesArray = [userOrRole];
        }

        if (rolesArray.length === 0) return false;

        for (const r of rolesArray) {
            const roleStr = typeof r === 'string' ? r : r.name || '';
            const cleanRole = roleStr.replace(/^ROLE_/, '').toLowerCase();
            if (cleanRole === 'admin') return true;
            if (matrix[cleanRole]?.[permIndex] === 1) return true;
        }

        return false;
    };

    return (
        <PermissionContext.Provider value={{ matrix, roleMeta, permissions, togglePermission, hasPermission, addNewRole, loading, fetchPermissions }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => useContext(PermissionContext);
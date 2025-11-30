import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- CHECK SESSION ON LOAD ---
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // We check if the cookie is valid by calling the /me endpoint
                // (Ensure you added the /me endpoint to AuthController as discussed)
                const response = await axiosInstance.get('/api/v1/auth/me');

                // If successful, update user state
                const userData = {
                    name: response.data.data.name,
                    role: response.data.data.role
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
                // If 401, cookies are invalid/missing
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // --- LOGIN ---
    const login = async (emailOrPhone, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/login', { emailOrPhone, password });

            // Note: response.data.data NO LONGER has the token string.
            // It only has { name: "...", role: "..." }
            const { name, role } = response.data.data;

            const userData = { name, role };

            // Update UI State
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            toast.success("Login successful!");
            return { success: true, role: role };

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Login failed.');
            return { success: false };
        }
    };

    // --- REGISTER ---
    const register = async (name, emailOrPhone, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/register', { name, emailOrPhone, password });
            toast.success(response.data.message);
            return await login(emailOrPhone, password);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed.');
            return { success: false };
        }
    };

    // --- LOGOUT ---
    const logout = async () => {
        try {
            // Call backend to clear cookies
            await axiosInstance.post('/api/v1/user/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            // Clear UI state
            localStorage.removeItem('user');
            setUser(null);
            window.location.href = '/login';
        }
    };

    const value = {
        user,
        setUser,
        login,
        logout,
        register,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
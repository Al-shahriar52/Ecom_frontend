/*

import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (emailOrPhone, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/login', {
                emailOrPhone,
                password
            });
            if (response.data?.data?.accessToken) {
                const { accessToken, refreshToken } = response.data.data;

                const decodedToken = jwtDecode(accessToken);
                const userRole = decodedToken.roles && decodedToken.roles.length > 0
                    ? decodedToken.roles[0].authority
                    : 'USER';

                const userData = {
                    name: response.data.data.name || emailOrPhone,
                    emailOrPhone,
                    role: userRole
                };

                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                setUser(userData);
                toast.success(response.data.message || "Login successful!");
                navigate('/');
                return { success: true };
            }
        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Login failed. Please try again.');
            }
            return { success: false };
        }
    };

    const register = async (name, emailOrPhone, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/register', {
                name,
                emailOrPhone,
                password
            });
            toast.success(response.data.message);

            // After successful registration, immediately call the login function
            await login(emailOrPhone, password);

        } catch (error) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Registration failed. Please try again.');
            }
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/api/v1/user/logout', {});
            toast.success("Successfully logged out.");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.clear();
            setUser(null);
            window.location.href = '/login';
        }
    };

    const value = {
        user,
        login,
        logout,
        register,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};*/


import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Start as true to prevent premature rendering
    const navigate = useNavigate();

    // This effect runs once on app load to re-authenticate from localStorage
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');

            if (storedUser && accessToken) {
                // If user and token exist, set the user state and axios headers
                setUser(JSON.parse(storedUser));
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }
        } catch (error) {
            console.error("Failed to initialize auth state from localStorage", error);
            // Clear corrupted storage if parsing fails
            localStorage.clear();
        } finally {
            // Always set loading to false after the check is complete
            setLoading(false);
        }
    }, []);

    const login = async (emailOrPhone, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/login', { emailOrPhone, password });

            if (response.data?.data?.accessToken) {
                const { accessToken, refreshToken, name } = response.data.data;

                // Decode token to get user roles/authorities
                const decodedToken = jwtDecode(accessToken);
                const userRole = decodedToken.roles && decodedToken.roles.length > 0
                    ? decodedToken.roles[0].authority
                    : 'USER'; // Default to USER if no roles found

                const userData = {
                    name: name || emailOrPhone, // Use name from response if available
                    role: userRole
                };

                // Store everything needed for session persistence
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Set default authorization header for all subsequent requests
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                setUser(userData);
                toast.success(response.data.message || "Login successful!");

                // Restore role-based navigation
                if (userRole === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }

                return { success: true };
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please try again.');
            return { success: false };
        }
    };

    const register = async (name, emailOrPhone, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/register', { name, emailOrPhone, password });
            toast.success(response.data.message);
            // After successful registration, automatically log the user in
            await login(emailOrPhone, password);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/api/v1/user/logout', {});
        } catch (error) {
            // Don't show an error to the user, just log it. The main goal is to clear the session.
            console.error("Logout API call failed:", error);
        } finally {
            // Clear everything regardless of API call success
            localStorage.clear();
            setUser(null);
            delete axiosInstance.defaults.headers.common['Authorization']; // Clean up axios instance
            window.location.href = '/login'; // Force a clean reload to the login page
        }
    };

    const value = {
        user,
        setUser, // Provide setUser for profile updates
        login,
        logout,
        register,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Don't render children until the initial auth check is complete */}
            {!loading && children}
        </AuthContext.Provider>
    );
};
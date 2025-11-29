
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('accessToken'));
    const [loading, setLoading] = useState(true);

    // Initialize state
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');

            if (storedUser && accessToken) {
                setUser(JSON.parse(storedUser));
                setToken(accessToken);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            }
        } catch (error) {
            console.error("Auth init error", error);
            localStorage.clear();
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (emailOrPhone, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/login', { emailOrPhone, password });

            if (response.data?.data?.accessToken) {
                const { accessToken, refreshToken, name } = response.data.data;

                // Decode token
                const decodedToken = jwtDecode(accessToken);
                const userRole = decodedToken.roles && decodedToken.roles.length > 0
                    ? decodedToken.roles[0].authority
                    : 'USER';

                const userData = {
                    name: name || emailOrPhone,
                    role: userRole
                };

                // Store Data
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Set Axios Header
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

                // Update State
                setUser(userData);
                setToken(accessToken);
                toast.success(response.data.message || "Login successful!");

                // --- CHANGED: DO NOT NAVIGATE HERE ---
                // We return the role so the UI (AuthPage) can decide where to go.
                return { success: true, role: userRole };
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
            // Auto-login after register
            return await login(emailOrPhone, password);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
            return { success: false };
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/api/v1/user/logout', {});
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            localStorage.clear();
            setUser(null);
            setToken(null);
            delete axiosInstance.defaults.headers.common['Authorization'];
            window.location.href = '/login';
        }
    };

    const value = {
        user,
        token,
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
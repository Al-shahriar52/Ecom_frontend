
import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/auth/me');
                const userData = {
                    name: response.data.data.name,
                    role: response.data.data.role
                };
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
            } catch (error) {
                setUser(null);
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (emailOrPhone, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/login', { emailOrPhone, password });
            const { name, role } = response.data.data ? response.data.data : response.data;
            const userData = { name, role };

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));

            toast.success("Login successful!");
            return { success: true, role: role };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed.');
            return { success: false };
        }
    };

    // --- STEP 1: CREATE UNVERIFIED USER & SEND OTP ---
    const register = async (name, emailOrPhone, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/register', { name, emailOrPhone, password });
            toast.success("OTP sent! Please check your email/phone.");
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed.');
            return { success: false };
        }
    };

    // --- STEP 2: VERIFY OTP & AUTO-LOGIN ---
    const verifyRegistrationOtp = async (emailOrPhone, otp, password) => {
        try {
            // Hit the new Spring Boot endpoint we just created
            await axiosInstance.post('/api/v1/auth/verify-otp', { emailOrPhone, otp });
            toast.success("Account verified successfully!");

            // Auto-login using the password they registered with
            return await login(emailOrPhone, password);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP.');
            return { success: false };
        }
    };

    const logout = async () => {
        try {
            await axiosInstance.post('/api/v1/user/logout');
        } catch (error) {
            console.error("Logout error", error);
        } finally {
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
        verifyRegistrationOtp, // Export the new function
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
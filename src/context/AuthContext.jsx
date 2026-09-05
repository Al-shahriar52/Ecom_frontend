
import React, { createContext, useState, useEffect, useRef } from 'react';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ensures loginAsGuest() only ever has one call in flight at a time,
    // even if multiple things (initial load + a fast add-to-cart click)
    // try to trigger it around the same moment.
    const guestProvisionRef = useRef(null);

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
                // No real session (401/403) — silently provision a guest
                // right away instead of leaving user === null. By the time
                // the person clicks "Add to Cart" on any page, the guest
                // session + cookie already exist, so there's no longer a
                // race between "create guest" and "add item".
                localStorage.removeItem('user');
                await loginAsGuest();
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            if (error.response && error.response.status === 403 && error.response.data.message === "Account is not verified. Please complete OTP verification.") {
                // Passing password back so RegisterForm can auto-login after OTP
                return { success: false, unverified: true, emailOrPhone, password };
            }

            toast.error(error.response?.data?.message || 'Login failed.');
            return { success: false };
        }
    };

    const register = async (name, emailOrPhone, password) => {
        try {
            await axiosInstance.post('/api/v1/auth/register', { name, emailOrPhone, password });
            toast.success("OTP sent! Please check your email/phone.", { duration: 4000 });
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed.');
            return { success: false };
        }
    };

    const verifyRegistrationOtp = async (emailOrPhone, otp, password) => {
        try {
            await axiosInstance.post('/api/v1/auth/verify-otp', { emailOrPhone, otp });
            toast.success("Account verified successfully!");
            return await login(emailOrPhone, password);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP.');
            return { success: false };
        }
    };

    const forgotPassword = async (emailOrPhone) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/forgot-password', { emailOrPhone });
            toast.success(response.data.message || "OTP Sent!");
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP.");
            return { success: false };
        }
    };

    const resetPassword = async (emailOrPhone, otp, password) => {
        try {
            const response = await axiosInstance.post('/api/v1/auth/reset-password', { emailOrPhone, otp, password });
            toast.success(response.data.message || "Password reset successfully!");
            return { success: true };
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password.");
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

    // Single-flight guest provisioning. Safe to call from anywhere
    // (initial load, or as a fallback inside CartContext) — if a guest
    // session is already being created, callers just await the same
    // in-flight promise instead of creating a second one.
    const loginAsGuest = async () => {
        if (guestProvisionRef.current) {
            return guestProvisionRef.current;
        }

        const provisionPromise = (async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.post('/api/v1/auth/guest');

                const { name, role } = response.data.data ? response.data.data : response.data;
                const userData = { name, role };

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));

                return { success: true, role };
            } catch (error) {
                console.error("Failed to initialize guest session:", error);
                return { success: false };
            } finally {
                setLoading(false);
                guestProvisionRef.current = null;
            }
        })();

        guestProvisionRef.current = provisionPromise;
        return provisionPromise;
    };

    const value = {
        user, setUser, login, logout, register, loginAsGuest,
        verifyRegistrationOtp, forgotPassword, resetPassword,
        isAuthenticated: user && user.role !== 'GUEST',
        isGuest: user?.role === 'GUEST',
        loading

    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
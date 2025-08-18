
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
            navigate('/login');
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
};
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // On app start, check localStorage for a logged-in user
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Login function (simulation)
    const login = (email, password) => {
        // In a real app, you'd send a request to your backend API
        // Here, we'll just simulate it.
        console.log("Attempting to log in with", email, password);

        // For simulation, we'll retrieve a registered user from localStorage
        const registeredUser = JSON.parse(localStorage.getItem('registered_user'));

        if (registeredUser && registeredUser.email === email && registeredUser.password === password) {
            const userData = { name: registeredUser.name, email: registeredUser.email };
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            navigate('/'); // Redirect to homepage after login
            return { success: true };
        } else {
            return { success: false, message: "Invalid email or password" };
        }
    };

    // Registration function (simulation)
    const register = (name, email, password) => {
        // In a real app, this would be an API call to create a new user
        // Here, we just store the new user's details for our login simulation
        console.log("Registering user:", name, email);
        localStorage.setItem('registered_user', JSON.stringify({ name, email, password }));

        // For a better user experience, automatically log them in after registration
        const userData = { name, email };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/'); // Redirect to homepage
        return { success: true };
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/login'); // Redirect to login page after logout
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
/*

import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [updatingItemIds, setUpdatingItemIds] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useContext(AuthContext);

    // --- FETCH CART ---
    const fetchCart = async (isBackground = false) => {
        if (!user) {
            setCart([]);
            setCartTotal(0);
            return;
        }

        if (!isBackground) setLoading(true);

        try {
            const response = await axiosInstance.get('/api/v1/cart/getCart');
            const data = response.data.data;
            setCart(data.items || []);
            setCartTotal(data.totalPrice || 0);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    // --- ADD TO CART (UPDATED) ---
    const addToCart = async (product, quantity = 1) => {
        // 1. If not logged in, Redirect and Return FALSE
        if (!user) {
            navigate('/login', { state: { from: location } });
            return false; // <--- Indicates failure/redirect
        }

        try {
            await axiosInstance.post('/api/v1/cart/addToCart', {
                productId: product.productId || product.id,
                quantity: quantity
            });

            // Optional: Remove this generic toast if you prefer the specific one in ProductInfo
            // toast.success("Item added!");

            await fetchCart(true);
            return true; // <--- Indicates Success
        } catch (error) {
            toast.error("Failed to add item.");
            return false; // <--- Indicates Failure
        }
    };

    // --- UPDATE QUANTITY ---
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (!user) return;
        setUpdatingItemIds(prev => [...prev, cartItemId]);

        try {
            await axiosInstance.put('/api/v1/cart/update', {
                cartItemId,
                quantity: newQuantity
            });
            await fetchCart(true);
        } catch (error) {
            toast.error("Could not update quantity");
        } finally {
            setUpdatingItemIds(prev => prev.filter(id => id !== cartItemId));
        }
    };

    // --- REMOVE ITEM ---
    const removeFromCart = async (cartItemId) => {
        if (!user) return;
        setUpdatingItemIds(prev => [...prev, cartItemId]);

        try {
            await axiosInstance.delete(`/api/v1/cart/delete/${cartItemId}`);
            toast.success("Item removed");
            await fetchCart(true);
        } catch (error) {
            toast.error("Could not remove item");
        } finally {
            setUpdatingItemIds(prev => prev.filter(id => id !== cartItemId));
        }
    };

    const addAllToCart = async (products) => {
        // 1. Check Login
        if (!user) {
            navigate('/login', { state: { from: location } });
            return false;
        }

        try {
            // 2. Format data for Backend: List of { productId, quantity }
            const payload = products.map(p => ({
                productId: p.productId || p.id,
                quantity: 1 // Default to 1 for FBT items
            }));

            // 3. Call the new endpoint
            await axiosInstance.post('/api/v1/cart/add-multiple', payload);

            // 4. Refresh Cart
            await fetchCart(true);
            return true;

        } catch (error) {
            console.error(error);
            toast.error("Failed to add bundle to cart");
            return false;
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            cartTotal,
            loading,
            updatingItemIds,
            addToCart,
            addAllToCart,
            removeFromCart,
            updateQuantity,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};*/


import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [updatingItemIds, setUpdatingItemIds] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    // 1. EXTRACT loginAsGuest FROM YOUR AUTHCONTEXT
    const { user, loginAsGuest } = useContext(AuthContext);

    // --- FETCH CART ---
    const fetchCart = async (isBackground = false) => {
        if (!user) {
            setCart([]);
            setCartTotal(0);
            return;
        }

        if (!isBackground) setLoading(true);

        try {
            const response = await axiosInstance.get('/api/v1/cart/getCart');
            const data = response.data.data;
            setCart(data.items || []);
            setCartTotal(data.totalPrice || 0);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    // --- ADD TO CART (UPDATED FOR GUEST CHECKOUT) ---
    const addToCart = async (product, quantity = 1) => {
        // 2. SILENT GUEST PROVISIONING
        // Instead of redirecting to login, create a guest token on the fly
        if (!user) {
            const guestSession = await loginAsGuest();
            if (!guestSession || !guestSession.success) {
                toast.error("Could not initialize a shopping session.");
                return false;
            }
        }

        try {
            await axiosInstance.post('/api/v1/cart/addToCart', {
                productId: product.productId || product.id,
                quantity: quantity
            });

            await fetchCart(true);
            return true;
        } catch (error) {
            toast.error("Failed to add item.");
            return false;
        }
    };

    // --- UPDATE QUANTITY ---
    const updateQuantity = async (cartItemId, newQuantity) => {
        if (!user) return;
        setUpdatingItemIds(prev => [...prev, cartItemId]);

        try {
            await axiosInstance.put('/api/v1/cart/update', {
                cartItemId,
                quantity: newQuantity
            });
            await fetchCart(true);
        } catch (error) {
            toast.error("Could not update quantity");
        } finally {
            setUpdatingItemIds(prev => prev.filter(id => id !== cartItemId));
        }
    };

    // --- REMOVE ITEM ---
    const removeFromCart = async (cartItemId) => {
        if (!user) return;
        setUpdatingItemIds(prev => [...prev, cartItemId]);

        try {
            await axiosInstance.delete(`/api/v1/cart/delete/${cartItemId}`);
            toast.success("Item removed");
            await fetchCart(true);
        } catch (error) {
            toast.error("Could not remove item");
        } finally {
            setUpdatingItemIds(prev => prev.filter(id => id !== cartItemId));
        }
    };

    // --- ADD BUNDLE TO CART (UPDATED FOR GUEST CHECKOUT) ---
    const addAllToCart = async (products) => {
        // 3. SILENT GUEST PROVISIONING FOR BUNDLES
        if (!user) {
            const guestSession = await loginAsGuest();
            if (!guestSession || !guestSession.success) {
                toast.error("Could not initialize a shopping session.");
                return false;
            }
        }

        try {
            const payload = products.map(p => ({
                productId: p.productId || p.id,
                quantity: 1
            }));

            await axiosInstance.post('/api/v1/cart/add-multiple', payload);

            await fetchCart(true);
            return true;

        } catch (error) {
            console.error(error);
            toast.error("Failed to add bundle to cart");
            return false;
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            cartTotal,
            loading,
            updatingItemIds,
            addToCart,
            addAllToCart,
            removeFromCart,
            updateQuantity,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
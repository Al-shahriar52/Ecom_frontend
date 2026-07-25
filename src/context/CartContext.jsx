
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
    const { user, loginAsGuest } = useContext(AuthContext);

    // --- FETCH CART ---
    const fetchCart = async (isBackground = false) => {
        // REMOVED the `if (!user)` check entirely.
        // We let the backend decide if the user (or guest cookie) is valid.

        if (!isBackground) setLoading(true);

        try {
            const response = await axiosInstance.get('/api/v1/cart/getCart');
            const data = response.data.data;
            setCart(data?.items || []);
            setCartTotal(data?.totalPrice || 0);
        } catch (error) {
            // If the backend rejects the request (e.g., no cookie exists), clear the cart state
            setCart([]);
            setCartTotal(0);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    // Run once on mount to check for existing cookies, and run when user state changes
    useEffect(() => {
        fetchCart();
    }, [user]);

    // --- ADD TO CART ---
    const addToCart = async (product, quantity = 1) => {
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
        // REMOVED `if (!user) return;` so guests can update items
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
        // REMOVED `if (!user) return;` so guests can delete items
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

    // --- ADD BUNDLE TO CART ---
    const addAllToCart = async (products) => {
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
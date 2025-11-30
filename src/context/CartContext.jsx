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

    // We only need 'user' to know IF we should try fetching
    const { user } = useContext(AuthContext);

    // --- FETCH CART ---
    const fetchCart = async (isBackground = false) => {
        // If not logged in, clear cart and return
        if (!user) {
            setCart([]);
            setCartTotal(0);
            return;
        }

        if (!isBackground) setLoading(true);

        try {
            // NO HEADERS NEEDED! Cookies are sent automatically.
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
    }, [user]); // Re-fetch when user logs in/out

    // --- ADD TO CART ---
    const addToCart = async (product, quantity = 1) => {
        if (!user) {
            navigate('/login', { state: { from: location } });
            return;
        }

        try {
            await axiosInstance.post('/api/v1/cart/addToCart', {
                productId: product.productId || product.id,
                quantity: quantity
            });
            toast.success("Item added!");
            await fetchCart(true);
        } catch (error) {
            toast.error("Failed to add item.");
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

    return (
        <CartContext.Provider value={{
            cart,
            cartTotal,
            loading,
            updatingItemIds,
            addToCart,
            removeFromCart,
            updateQuantity,
            fetchCart
        }}>
            {children}
        </CartContext.Provider>
    );
};
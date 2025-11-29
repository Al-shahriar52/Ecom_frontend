
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

    // Tracks items currently being updated or deleted
    const [updatingItemIds, setUpdatingItemIds] = useState([]);

    const navigate = useNavigate();
    const location = useLocation(); // <--- This gets your current page (Product Page)
    const { token } = useContext(AuthContext);

    const getActiveToken = () => token || localStorage.getItem('accessToken');

    // --- FETCH CART ---
    const fetchCart = async (isBackground = false) => {
        const activeToken = getActiveToken();
        if (!activeToken) {
            setCart([]);
            setCartTotal(0);
            return;
        }

        if (!isBackground) setLoading(true);

        try {
            const response = await axiosInstance.get('/api/v1/cart/getCart', {
                headers: { 'Authorization': `Bearer ${activeToken}` }
            });
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
    }, [token]);

    // --- ADD TO CART (FIXED REDIRECT) ---
    const addToCart = async (product, quantity = 1) => {
        const activeToken = getActiveToken();

        if (!activeToken) {
            // ERROR WAS HERE: We must pass the current location to the login page
            navigate('/login', { state: { from: location } });
            return;
        }

        try {
            await axiosInstance.post('/api/v1/cart/addToCart',
                { productId: product.productId || product.id, quantity },
                { headers: { 'Authorization': `Bearer ${activeToken}` } }
            );
            toast.success("Item added!");
            await fetchCart(true);
        } catch (error) {
            toast.error("Failed to add item.");
        }
    };

    // --- UPDATE QUANTITY ---
    const updateQuantity = async (cartItemId, newQuantity) => {
        const activeToken = getActiveToken();
        if (!activeToken) return;

        setUpdatingItemIds(prev => [...prev, cartItemId]);

        try {
            await axiosInstance.put('/api/v1/cart/update',
                { cartItemId, quantity: newQuantity },
                { headers: { 'Authorization': `Bearer ${activeToken}` } }
            );
            await fetchCart(true);
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Could not update quantity");
        } finally {
            setUpdatingItemIds(prev => prev.filter(id => id !== cartItemId));
        }
    };

    // --- REMOVE ITEM ---
    const removeFromCart = async (cartItemId) => {
        const activeToken = getActiveToken();
        if (!activeToken) return;

        setUpdatingItemIds(prev => [...prev, cartItemId]);

        try {
            await axiosInstance.delete(`/api/v1/cart/delete/${cartItemId}`, {
                headers: { 'Authorization': `Bearer ${activeToken}` }
            });
            toast.success("Item removed");
            await fetchCart(true);
        } catch (error) {
            console.error("Delete error:", error);
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
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
    const [isLoadingCart, setIsLoadingCart] = useState(true); // Tracks initial/active cart fetch
    const [updatingItemIds, setUpdatingItemIds] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();

    const { user, loginAsGuest } = useContext(AuthContext);

    const fetchSeqRef = React.useRef(0);
    const appliedSeqRef = React.useRef(0);
    const guestLoginPromiseRef = React.useRef(null);

    const ensureGuestSession = async () => {
        if (user) return { success: true };

        if (!guestLoginPromiseRef.current) {
            guestLoginPromiseRef.current = loginAsGuest().finally(() => {
                guestLoginPromiseRef.current = null;
            });
        }

        return guestLoginPromiseRef.current;
    };

    // --- FETCH CART ---
    const fetchCart = async (isBackground = false, force = false) => {
        if (!user && !force) {
            setCart([]);
            setCartTotal(0);
            setIsLoadingCart(false); // Make sure to clear loading state here too
            return;
        }

        const seq = ++fetchSeqRef.current;

        if (!isBackground) setLoading(true);

        try {
            const response = await axiosInstance.get('/api/v1/cart/getCart');

            if (seq < appliedSeqRef.current) return;
            appliedSeqRef.current = seq;

            const data = response.data.data;
            setCart(data.items || []);
            setCartTotal(data.totalPrice || 0);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            if (!isBackground) setLoading(false);
            setIsLoadingCart(false); // Finished fetching, turn off loader
        }
    };

    useEffect(() => {
        fetchCart();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // --- ADD TO CART (GUEST CHECKOUT SAFE) ---
    const addToCart = async (product, quantity = 1) => {
        let justProvisioned = false;

        if (!user) {
            const guestSession = await ensureGuestSession();
            if (!guestSession || !guestSession.success) {
                toast.error("Could not initialize a shopping session.");
                return false;
            }
            justProvisioned = true;
        }

        try {
            await axiosInstance.post('/api/v1/cart/addToCart', {
                productId: product.productId || product.id,
                quantity: quantity
            });

            await fetchCart(true, justProvisioned);

            // --- META PIXEL: ADD TO CART EVENT ---
            if (window.fbq) {
                window.fbq('track', 'AddToCart', {
                    content_ids: [product.productId || product.id],
                    content_name: product.name || product.title || 'Product',
                    value: product.price ? (product.price * quantity) : 0,
                    currency: 'BDT'
                });
            }

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

    // --- ADD BUNDLE TO CART (GUEST CHECKOUT SAFE) ---
    const addAllToCart = async (products) => {
        let justProvisioned = false;

        if (!user) {
            const guestSession = await ensureGuestSession();
            if (!guestSession || !guestSession.success) {
                toast.error("Could not initialize a shopping session.");
                return false;
            }
            justProvisioned = true;
        }

        try {
            const payload = products.map(p => ({
                productId: p.productId || p.id,
                quantity: 1
            }));

            await axiosInstance.post('/api/v1/cart/add-multiple', payload);
            await fetchCart(true, justProvisioned);

            // --- META PIXEL: ADD TO CART EVENT (BUNDLE) ---
            if (window.fbq) {
                const bundleValue = products.reduce((total, p) => total + (p.price || 0), 0);
                const productIds = products.map(p => p.productId || p.id);

                window.fbq('track', 'AddToCart', {
                    content_ids: productIds,
                    content_type: 'product_group',
                    value: bundleValue,
                    currency: 'BDT'
                });
            }

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
            isLoadingCart, // Exposed to components
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
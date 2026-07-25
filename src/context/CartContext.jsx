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

    // Guards against out-of-order responses. `fetchSeqRef` tags each call
    // as it's issued; `appliedSeqRef` tracks the seq of the last response
    // that actually wrote to state. We only compare against appliedSeqRef,
    // NOT fetchSeqRef — a request that fails (e.g. a racing getCart that
    // fires before the cart exists yet, 404/500s, and never touches state)
    // must not be able to invalidate a correct response that resolves later.
    const fetchSeqRef = React.useRef(0);
    const appliedSeqRef = React.useRef(0);

    // Ensures loginAsGuest() is only ever in flight once, even if
    // addToCart/addAllToCart are triggered multiple times before the
    // first guest session finishes provisioning (e.g. double-click).
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
    // `force` lets callers bypass the `user` guard right after a guest
    // session was just provisioned, since the backend already trusts the
    // guest cookie (withCredentials: true) even though the local `user`
    // state hasn't re-rendered yet in this closure.
    const fetchCart = async (isBackground = false, force = false) => {
        if (!user && !force) {
            setCart([]);
            setCartTotal(0);
            return;
        }

        const seq = ++fetchSeqRef.current;

        if (!isBackground) setLoading(true);

        try {
            const response = await axiosInstance.get('/api/v1/cart/getCart');

            // A LATER response has already been applied to state — discard
            // this one so it can't clobber fresher data. A failed/racing
            // request never reaches this line, so it can never block us.
            if (seq < appliedSeqRef.current) return;
            appliedSeqRef.current = seq;

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

            // force=true when we just created the guest session, so this
            // fetch doesn't get skipped by a stale `user === null` closure
            await fetchCart(true, justProvisioned);
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
import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    // --- FETCH WISHLIST ---
    const fetchWishlist = async () => {
        if (!user) {
            setWishlist([]);
            return;
        }
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/v1/wishlist');
            // API returns: { data: { items: [ ... ] } }
            const items = response.data.data?.items || [];
            setWishlist(items);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [user]);

    // --- ADD TO WISHLIST ---
    const addToWishlist = async (product) => {
        if (!user) {
            toast.error("Please login first");
            return;
        }

        const prodId = product.productId || product.id;

        // Check if already exists locally to prevent API spam
        if (isInWishlist(prodId)) {
            toast.error("Item already in Wishlist");
            return;
        }

        try {
            // POST /api/v1/wishlist/add/{productId}
            await axiosInstance.post(`/api/v1/wishlist/add/${prodId}`);
            toast.success("Added to Wishlist");
            await fetchWishlist(); // Refresh list
        } catch (error) {
            console.error(error);
            toast.error("Failed to add to wishlist");
        }
    };

    // --- REMOVE FROM WISHLIST ---
    const removeFromWishlist = async (productId) => {
        try {
            // DELETE /api/v1/wishlist/remove/{productId}
            await axiosInstance.delete(`/api/v1/wishlist/remove/${productId}`);
            toast.success("Removed from Wishlist");

            // Optimistic Update (Remove locally immediately)
            setWishlist(prev => prev.filter(item => item.productId !== productId));
        } catch (error) {
            console.error(error);
            toast.error("Failed to remove");
        }
    };

    // --- HELPER: CHECK IF ITEM EXISTS ---
    const isInWishlist = (productId) => {
        // Checks if the productId exists in the current wishlist array
        return wishlist.some(item => item.productId === productId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlist,
            loading,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            fetchWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
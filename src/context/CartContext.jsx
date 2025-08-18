import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [shippingDetails, setShippingDetails] = useState(null);

    // Add to cart or increment quantity
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
        toast.success(`${product.title} added to cart!`);
    };

    // Update item quantity
    const updateQuantity = (productId, quantity) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        );
    };

    // Remove from cart
    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
        setSelectedItems((prevSelected) => prevSelected.filter(id => id !== productId));
    };

    // Toggle item selection
    const toggleItemSelection = (productId) => {
        setSelectedItems((prevSelected) =>
            prevSelected.includes(productId)
                ? prevSelected.filter((id) => id !== productId)
                : [...prevSelected, productId]
        );
    };

    // Clear cart after successful payment
    const clearCart = () => {
        setCart([]);
        setSelectedItems([]);
    }

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        selectedItems,
        toggleItemSelection,
        shippingDetails,
        setShippingDetails,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, selectedItems, toggleItemSelection } = useContext(CartContext);
    const navigate = useNavigate();

    const handleProceedToCheckout = () => {
        if (selectedItems.length > 0) {
            navigate('/checkout');
        } else {
            alert("Please select items to proceed.");
        }
    };

    const selectedCartItems = cart.filter(item => selectedItems.includes(item.id));

    const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.1; // Example 10% tax
    const total = subtotal + tax;

    if (cart.length === 0) {
        return <div className="cart-empty"><h2>Your Cart is Empty 😟</h2></div>;
    }

    return (
        <div className="cart-page">
            <h1>Shopping Cart</h1>
            <div className="cart-layout">
                <div className="cart-items">
                    {cart.map((item) => (
                        <div key={item.id} className={`cart-item ${selectedItems.includes(item.id) ? 'selected' : ''}`}>
                            <input
                                type="checkbox"
                                className="item-checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => toggleItemSelection(item.id)}
                            />
                            <img src={item.image} alt={item.title} className="cart-item-image" />
                            <div className="cart-item-details">
                                <h3>{item.title}</h3>
                                <p>${item.price.toFixed(2)}</p>
                            </div>
                            <div className="cart-item-quantity">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                            </div>
                            <div className="cart-item-total">
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button className="btn-danger remove-btn" onClick={() => removeFromCart(item.id)}>
                                &times;
                            </button>
                        </div>
                    ))}
                </div>

                <div className="order-summary">
                    <h2>Order Summary</h2>
                    <p>Selected Items ({selectedItems.length})</p>
                    <div className="price-breakup">
                        <div><span>Subtotal</span> <span>${subtotal.toFixed(2)}</span></div>
                        <div><span>Tax (10%)</span> <span>${tax.toFixed(2)}</span></div>
                        <hr />
                        <div className="total"><span>Total</span> <span>${total.toFixed(2)}</span></div>
                    </div>
                    <button className="btn checkout-btn" onClick={handleProceedToCheckout} disabled={selectedItems.length === 0}>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
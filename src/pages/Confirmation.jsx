import React, { useContext, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './Confirmation.css';

const Confirmation = () => {
    const location = useLocation();
    const { success } = location.state || { success: false };
    const { shippingDetails, cart, selectedItems, clearCart } = useContext(CartContext);

    const orderedItems = cart.filter(item => selectedItems.includes(item.id));
    const orderTotal = orderedItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 1.1;

    // Clear the cart on successful confirmation
    useEffect(() => {
        if (success) {
            clearCart();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [success]);

    if (success) {
        return (
            <div className="confirmation-page success">
                <h2>✅ Booking Confirmed!</h2>
                <p>Thank you for your order. A confirmation has been sent to {shippingDetails?.email}.</p>
                <h3>Order Summary</h3>
                <div className="order-details">
                    {orderedItems.map(item => (
                        <div key={item.id} className="ordered-item">
                            <img src={item.image} alt={item.title} />
                            <span>{item.title} (x{item.quantity})</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="ordered-total">
                        <strong>Total: ${orderTotal.toFixed(2)}</strong>
                    </div>
                </div>
                <Link to="/" className="btn">Continue Shopping</Link>
            </div>
        );
    } else {
        return (
            <div className="confirmation-page failed">
                <h2>❌ Payment Failed</h2>
                <p>There was an issue with your payment. Please try again or use a different payment method.</p>
                <div className="failed-actions">
                    <Link to="/payment" className="btn">Try Again</Link>
                    <Link to="/cart" className="btn-danger">Back to Cart</Link>
                </div>
            </div>
        );
    }
};

export default Confirmation;
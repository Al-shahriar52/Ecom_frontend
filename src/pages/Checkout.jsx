import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import './Checkout.css';

const Checkout = () => {
    const { cart, cartTotal } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // --- STATE MANAGEMENT ---
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: '',
        city: '',
        area: '',
        address: '',
        email: user?.email || '',
        note: ''
    });

    // Shipping Costs (Based on your image: 66 Inside, 99 Outside)
    const [shippingMethod, setShippingMethod] = useState('inside'); // 'inside' or 'outside'
    const shippingCost = shippingMethod === 'inside' ? 66 : 99;

    const [paymentMethod, setPaymentMethod] = useState('COD');

    // Calculate Grand Total
    const grandTotal = cartTotal + shippingCost;

    // --- HANDLERS ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePlaceOrder = async () => {
        // 1. Basic Validation
        if (!formData.name || !formData.phone || !formData.address || !formData.city) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // 2. Prepare Payload
        const orderPayload = {
            shippingAddress: formData.address,
            city: formData.city,
            area: formData.area,
            phone: formData.phone,
            email: formData.email,
            orderNote: formData.note,
            shippingMethod: shippingMethod === 'inside' ? "Inside Dhaka" : "Outside Dhaka",
            shippingCost: shippingCost,
            paymentMethod: paymentMethod,
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            }))
        };

        // 3. Call API
        try {
            // Replace with your actual endpoint
            const response = await axiosInstance.post('/api/v1/orders/place', orderPayload);
            toast.success("Order placed successfully!");

            // Redirect to Order Success or Dashboard
            // navigate(`/order-success/${response.data.orderId}`);
            navigate('/dashboard/orders');

        } catch (error) {
            console.error("Order failed:", error);
            toast.error(error.response?.data?.message || "Failed to place order.");
        }
    };

    if (cart.length === 0) {
        return <div className="checkout-empty">Your cart is empty. <button onClick={() => navigate('/')}>Shop Now</button></div>;
    }

    return (
        <div className="checkout-container">
            <div className="checkout-wrapper">

                {/* --- LEFT SIDE: BILLING FORM --- */}
                <div className="checkout-left">
                    <h2 className="section-title">BILLING & SHIPPING</h2>

                    <div className="form-row">
                        <input
                            type="text" name="name" placeholder="Name"
                            value={formData.name} onChange={handleInputChange} className="form-input"
                        />
                        <input
                            type="text" name="phone" placeholder="Phone"
                            value={formData.phone} onChange={handleInputChange} className="form-input"
                        />
                    </div>

                    <div className="form-row">
                        <select name="city" value={formData.city} onChange={handleInputChange} className="form-input">
                            <option value="">Select City</option>
                            <option value="Dhaka">Dhaka</option>
                            <option value="Chittagong">Chittagong</option>
                            <option value="Sylhet">Sylhet</option>
                            {/* Add more cities */}
                        </select>

                        <select name="area" value={formData.area} onChange={handleInputChange} className="form-input">
                            <option value="">Select Area</option>
                            <option value="Dhanmondi">Dhanmondi</option>
                            <option value="Gulshan">Gulshan</option>
                            <option value="Mirpur">Mirpur</option>
                            {/* Add logic to populate areas based on city if needed */}
                        </select>
                    </div>

                    <div className="form-row">
                        <input
                            type="text" name="address" placeholder="Address"
                            value={formData.address} onChange={handleInputChange} className="form-input full-width"
                        />
                    </div>

                    <div className="form-row">
                        <input
                            type="email" name="email" placeholder="Email (optional)"
                            value={formData.email} onChange={handleInputChange} className="form-input full-width"
                        />
                    </div>

                    <div className="form-row">
                        <textarea
                            name="note" placeholder="Order Note (optional)"
                            value={formData.note} onChange={handleInputChange} className="form-input textarea"
                        ></textarea>
                    </div>
                </div>

                {/* --- RIGHT SIDE: ORDER SUMMARY --- */}
                <div className="checkout-right">
                    <div className="coupon-link">
                        Have Coupon / Voucher?
                    </div>

                    <div className="summary-section">
                        <h3>Choose Shipping Method</h3>

                        <label className={`radio-option ${shippingMethod === 'outside' ? 'selected' : ''}`}>
                            <div className="radio-label">
                                <input
                                    type="radio" name="shipping"
                                    checked={shippingMethod === 'outside'}
                                    onChange={() => setShippingMethod('outside')}
                                />
                                <span>Delivery Outside Dhaka</span>
                            </div>
                            <span className="price">৳ 99.00</span>
                        </label>

                        <label className={`radio-option ${shippingMethod === 'inside' ? 'selected' : ''}`}>
                            <div className="radio-label">
                                <input
                                    type="radio" name="shipping"
                                    checked={shippingMethod === 'inside'}
                                    onChange={() => setShippingMethod('inside')}
                                />
                                <span>Delivery Inside Dhaka</span>
                            </div>
                            <span className="price">৳ 66.00</span>
                        </label>
                    </div>

                    <div className="price-breakdown">
                        <div className="price-row">
                            <span>Total MRP</span>
                            <span>৳ {cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="price-row total-row">
                            <span>Total Amount</span>
                            <span className="grand-total">৳ {grandTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="summary-section">
                        <h3>Choose Payment Method</h3>

                        <label className="radio-option simple">
                            <input
                                type="radio" name="payment"
                                checked={paymentMethod === 'COD'}
                                onChange={() => setPaymentMethod('COD')}
                            />
                            <span>Cash on delivery</span>
                        </label>

                        <label className="radio-option simple">
                            <input
                                type="radio" name="payment"
                                checked={paymentMethod === 'Bkash'}
                                onChange={() => setPaymentMethod('Bkash')}
                            />
                            <span>Bkash</span>
                        </label>

                        <label className="radio-option simple">
                            <input
                                type="radio" name="payment"
                                checked={paymentMethod === 'Card'}
                                onChange={() => setPaymentMethod('Card')}
                            />
                            <span>Pay with Card/Mobile Wallet</span>
                        </label>
                    </div>

                    <button className="place-order-btn" onClick={handlePlaceOrder}>
                        PLACE ORDER
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
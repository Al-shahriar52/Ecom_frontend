import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './Checkout.css';

const Checkout = () => {
    const { setShippingDetails } = useContext(CartContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zip: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setShippingDetails(formData);
        navigate('/payment');
    };

    return (
        <div className="checkout-page">
            <h1>Shipping Details</h1>
            <form className="checkout-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input type="text" id="fullName" name="fullName" required onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Booking Email</label>
                    <input type="email" id="email" name="email" required onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" required onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input type="text" id="address" name="address" required onChange={handleChange} />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input type="text" id="city" name="city" required onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="zip">ZIP Code</label>
                        <input type="text" id="zip" name="zip" required onChange={handleChange} />
                    </div>
                </div>
                <button type="submit" className="btn">Proceed to Payment</button>
            </form>
        </div>
    );
};

export default Checkout;
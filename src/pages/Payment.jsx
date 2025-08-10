import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

const Payment = () => {
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);

    const handlePayment = () => {
        if (!selectedMethod) {
            alert("Please select a payment method.");
            return;
        }

        setProcessing(true);
        // Simulate API call to payment gateway
        setTimeout(() => {
            const isSuccess = Math.random() > 0.2; // 80% success rate
            setProcessing(false);
            navigate('/confirmation', { state: { success: isSuccess } });
        }, 2000); // 2-second delay
    };

    return (
        <div className="payment-page">
            <h1>Select Payment Method</h1>
            <div className="payment-methods">
                <div
                    className={`payment-option ${selectedMethod === 'paypal' ? 'selected' : ''}`}
                    onClick={() => setSelectedMethod('paypal')}
                >
                    <img src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_SbyPP_mc_vs_dc_ae.jpg" alt="PayPal" />
                    <span>PayPal</span>
                </div>
                <div
                    className={`payment-option ${selectedMethod === 'ssl' ? 'selected' : ''}`}
                    onClick={() => setSelectedMethod('ssl')}
                >
                    <img src="https://securepay.sslcommerz.com/public/image/SSLCommerz-Pay-With-logo-All-Size-03.png" alt="SSL Commerz" />
                    <span>SSL Commerz</span>
                </div>
            </div>
            <button className="btn" onClick={handlePayment} disabled={processing || !selectedMethod}>
                {processing ? 'Processing...' : 'Pay Now'}
            </button>
        </div>
    );
};

export default Payment;
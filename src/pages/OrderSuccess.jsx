
import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance';
import { AuthContext } from '../context/AuthContext'; // Check this path matches your folder structure
import './OrderSuccess.css';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Track download status
    const [isDownloading, setIsDownloading] = useState(false);

    // Consume the AuthContext
    const { isAuthenticated, loading: authLoading } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axiosInstance.get(`/api/v1/order/${orderId}`);
                setOrder(response.data.data);
            } catch (err) {
                console.error("Failed to load order", err);
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    // Invoice Download Handler
    const handleDownloadInvoice = async () => {
        if (!orderId) return;

        try {
            setIsDownloading(true);

            const response = await axiosInstance.get(`/api/v1/order/${orderId}/invoice/download`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `BeautyHaat_Invoice_INV-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Error downloading invoice:', error);
            alert("Could not download the invoice at this time.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Wait for BOTH the order details and the auth context to finish loading
    if (loading || authLoading) return <div className="order-loader">Loading Order Details...</div>;
    if (error || !order) return <div className="order-error">{error || "Order not found"}</div>;

    // --- HELPER: FORMAT DATE FROM ARRAY ---
    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray)) return { date: 'N/A', time: 'N/A' };

        const date = new Date(
            dateArray[0],      // Year
            dateArray[1] - 1,  // Month (0-indexed)
            dateArray[2],      // Day
            dateArray[3],      // Hour
            dateArray[4],      // Minute
            dateArray[5]       // Second
        );

        return {
            date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const { date, time } = formatDate(order.createdAt);
    const subTotal = order.totalAmount - order.shippingCost;

    // --- DETERMINE GUEST STATUS ---
    const isGuest = !isAuthenticated;

    return (
        <div className="order-success-page">
            <div className="order-success-container">

                {/* 1. GREEN SUCCESS BANNER */}
                <div className="success-banner">
                    Your Order has placed Successfully.
                </div>

                {/* 2. ORDER ID & STATUS */}
                <div className="order-header-row">
                    <h2 className="header-title">
                        Order Number :
                        {isGuest ? (
                            <span className="highlight-pink" style={{ marginLeft: '8px' }}>#{order.id}</span>
                        ) : (
                            <Link to={`/dashboard/orders/${order.id}`} className="order-id-link" style={{ marginLeft: '8px' }}>
                                <span className="highlight-pink">#{order.id}</span>
                            </Link>
                        )}
                    </h2>
                    <h2 className="header-status">
                        Status : <span className="highlight-pink status-text">{order.orderStatus}</span>
                    </h2>
                </div>

                {/* --- GUEST NOTICE MESSAGE --- */}
                {isGuest && (
                    <div className="guest-login-notice" style={{
                        backgroundColor: '#f9f9f9',
                        borderLeft: '4px solid #ff69b4',
                        padding: '12px 20px',
                        margin: '15px 0 25px 0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#555',
                        lineHeight: '1.5'
                    }}>
                        💡 <strong>Want to track this order?</strong> To view your full purchase history and manage this order online, please <Link to="/login" style={{ color: '#ff69b4', fontWeight: 'bold', textDecoration: 'underline' }}>Log In</Link> or create an account using the email address provided above.
                    </div>
                )}

                {/* 3. ITEMS TABLE */}
                <div className="order-section items-section">
                    <table className="order-items-table">
                        <thead>
                        <tr>
                            <th style={{width: '80px'}}>IMAGE</th>
                            <th style={{textAlign: 'left'}}>ITEMS</th>
                            <th>QTY</th>
                            <th>PRICE</th>
                            <th>TOTAL PRICE</th>
                        </tr>
                        </thead>
                        <tbody>
                        {order.orderItems.map((item, index) => (
                            <tr key={index}>
                                <td className="col-image">
                                    <Link to={`/product/${item.productId}`}>
                                        <img
                                            src={item.productImageUrl || 'https://via.placeholder.com/60'}
                                            alt={item.productName}
                                        />
                                    </Link>
                                </td>
                                <td className="col-name">
                                    <Link to={`/product/${item.productId}`} className="product-name-link">
                                        {item.productName}
                                    </Link>
                                </td>
                                <td className="col-qty">x {item.quantity}</td>
                                <td className="col-price">৳ {item.price.toFixed(2)}</td>
                                <td className="col-total">৳ {item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* 4. CUSTOMER & ORDER DETAILS */}
                <div className="order-section details-section">
                    <h3 className="section-title">CUSTOMER & ORDER DETAILS</h3>

                    <div className="detail-row">
                        <span className="label">Customer Name</span>
                        <span className="value">{order.user?.name || "Guest"}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Phone Number</span>
                        <span className="value">{order.phoneNumber}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Email Address</span>
                        <span className="value">{order.email || "N/A"}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Delivery Type</span>
                        <span className="value">
                            {order.shippingCost > 60 ? "Outside Dhaka" : "Inside Dhaka"}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Payment Method</span>
                        <span className="value">
                            {order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}
                        </span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Note</span>
                        <span className="value">{order.orderNote || "N/A"}</span>
                    </div>
                </div>

                {/* 5. SPLIT SECTION: ADDRESS & SUMMARY */}
                <div className="bottom-split-container">
                    <div className="order-section address-box">
                        <h3 className="section-title">DELIVERY ADDRESS</h3>
                        <div className="detail-row">
                            <span className="label">ADDRESS</span>
                            <span className="value">{order.shippingAddress}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Area</span>
                            <span className="value">{order.area}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">City</span>
                            <span className="value">{order.city}</span>
                        </div>
                    </div>

                    <div className="order-section summary-box">
                        <h3 className="section-title">ORDER SUMMARY</h3>
                        <div className="detail-row">
                            <span className="label">Order Date</span>
                            <span className="value">{date}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Order Time</span>
                            <span className="value">{time}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Sub Total</span>
                            <span className="value">৳ {subTotal.toFixed(2)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="label">Delivery Fee</span>
                            <span className="value">৳ {order.shippingCost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* 6. GRAND TOTAL */}
                <div className="grand-total-bar">
                    <span className="total-label">TOTAL</span>
                    <span className="total-value">৳ {order.totalAmount.toFixed(2)}</span>
                </div>

                {/* 7. Action Buttons */}
                <div className="floating-action" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' }}>
                    <button
                        onClick={handleDownloadInvoice}
                        disabled={isDownloading}
                        className="download-invoice-btn"
                    >
                        {isDownloading ? 'Downloading...' : 'Download Invoice'}
                    </button>
                    <Link to="/" className="continue-btn">Continue Shopping</Link>
                </div>

            </div>
        </div>
    );
};

export default OrderSuccess;
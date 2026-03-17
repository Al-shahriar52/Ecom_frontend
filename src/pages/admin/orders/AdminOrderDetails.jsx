import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../../../api/AxiosInstance';
import '../../dashboard/Dashboard.css';

const OrderDetail = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await axiosInstance.get(`/api/v1/order/${orderId}`);
                setOrder(response.data.data);
            } catch (err) {
                console.error("Failed to load order:", err);
                setError("Failed to load order details.");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    // --- HELPER: Format Date/Time from Array ---
    const formatDate = (dateArray) => {
        if (!Array.isArray(dateArray)) return { date: 'N/A', time: 'N/A' };
        // Java arrays are [Year, Month(1-12), Day, Hour, Min, Sec]
        // JS Date month is 0-11, so we subtract 1
        const date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2], dateArray[3], dateArray[4]);

        return {
            date: date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
    };

    // --- HELPER: Status Color Class ---
    const getStatusClass = (status) => {
        if (!status) return '';
        const s = status.toUpperCase();
        switch (s) {
            case 'DELIVERED': return 'status-completed';
            case 'SHIPPED': return 'status-completed';
            case 'PENDING': return 'status-pending';
            case 'CANCELLED': return 'status-pending'; // Or specific danger class
            default: return 'status-pending';
        }
    };

    if (loading) return <div className="dashboard-content">Loading order details...</div>;
    if (error || !order) return <div className="dashboard-content error-text">{error || "Order not found."}</div>;

    const { date, time } = formatDate(order.createdAt);
    const subTotal = order.totalAmount - order.shippingCost;

    return (
        <div className="order-detail-page">
            <Link to="/admin/orders" className="back-link">← Back to Orders</Link>

            {/* HEADER SECTION */}
            <header className="order-detail-header">
                <h2>Order Number : <span className="id-number">#{order.id}</span></h2>
                <div className="header-actions">
                    <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                        {order.orderStatus}
                    </span>

                    {/* Show Pay Button only if Pending & NOT Cash on Delivery */}
                    {order.orderStatus === 'PENDING' && order.paymentMethod !== 'COD' && (
                        <button className="btn-make-payment">Make Payment</button>
                    )}
                </div>
            </header>

            {/* PRODUCT LIST SECTION */}
            <section className="order-product-list">
                <div className="product-list-header">
                    <h4>IMAGE</h4>
                    <h4>ITEMS</h4>
                    <h4>QTY</h4>
                    <h4>PRICE</h4>
                    <h4>TOTAL PRICE</h4>
                </div>
                {order.orderItems && order.orderItems.map((item, index) => (
                    <div key={index} className="product-item">
                        <img
                            src={item.productImageUrl || 'https://via.placeholder.com/60'}
                            alt={item.productName}
                        />
                        <p>{item.productName}</p>
                        <span>x {item.quantity}</span>
                        <span>৳{item.price.toFixed(2)}</span>
                        <span>৳{item.total.toFixed(2)}</span>
                    </div>
                ))}
            </section>

            {/* CUSTOMER DETAILS CARD */}
            <section className="info-card customer-details-card">
                <h3>CUSTOMER & ORDER DETAILS</h3>
                <div className="detail-item">
                    <span>Customer Name</span>
                    {/* Safe check for user object in case of Guest checkout (if allowed) */}
                    <span>{order.user?.name || "Guest User"}</span>
                </div>
                <div className="detail-item">
                    <span>Phone Number</span>
                    <span>{order.phoneNumber}</span>
                </div>
                <div className="detail-item">
                    <span>Email Address</span>
                    <span>{order.email || "N/A"}</span>
                </div>
                <div className="detail-item">
                    <span>Delivery Type</span>
                    <span>{order.shippingCost > 60 ? "Outside Dhaka" : "Inside Dhaka"}</span>
                </div>
                <div className="detail-item">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod === 'COD' ? 'Cash on Delivery' : order.paymentMethod}</span>
                </div>
            </section>

            {/* BOTTOM GRID: ADDRESS & SUMMARY */}
            <section className="order-info-cards">
                <div className="info-card">
                    <h3>DELIVERY ADDRESS</h3>
                    <p><strong>Address:</strong> {order.shippingAddress}</p>
                    <p><strong>Area:</strong> {order.area}</p>
                    <p><strong>City:</strong> {order.city}</p>
                </div>
                <div className="info-card">
                    <h3>ORDER SUMMARY</h3>
                    <p><strong>Order Date:</strong> {date}</p>
                    <p><strong>Order Time:</strong> {time}</p>
                    <p><strong>Sub Total:</strong> ৳{subTotal.toFixed(2)}</p>
                    <p><strong>Delivery Fee:</strong> ৳{order.shippingCost.toFixed(2)}</p>
                    <hr/>
                    <p className="total">
                        <strong>TOTAL</strong> <span>৳{order.totalAmount.toFixed(2)}</span>
                    </p>
                </div>
            </section>
        </div>
    );
};

export default OrderDetail;
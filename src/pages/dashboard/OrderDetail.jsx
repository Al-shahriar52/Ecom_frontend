// src/pages/dashboard/OrderDetail.jsx

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockOrders } from '../../mockData';
import './Dashboard.css';

const OrderDetail = () => {
    const { orderId } = useParams();
    const order = mockOrders.find(o => o.id === orderId);

    if (!order) {
        return <div className="order-detail-page"><h2>Order not found.</h2></div>;
    }

    return (
        <div className="order-detail-page">
            <Link to="/dashboard/orders" className="back-link">← Back to Orders</Link>

            <header className="order-detail-header">
                <h2>Order Number : <span className="id-number">#{order.id}</span></h2>
                <div className="header-actions">
                    <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span>
                    {order.status === 'Pending' && <button className="btn-make-payment">Make Payment</button>}
                </div>
            </header>

            <section className="order-product-list">
                <div className="product-list-header">
                    <h4>IMAGE</h4>
                    <h4>ITEMS</h4>
                    <h4>QTY</h4>
                    <h4>PRICE</h4>
                    <h4>TOTAL PRICE</h4>
                </div>
                {order.products.map((product, index) => (
                    <div key={index} className="product-item">
                        <img src={product.image} alt={product.name} />
                        <p>{product.name}</p>
                        <span>x {product.quantity}</span>
                        <span>৳{product.price.toFixed(2)}</span>
                        <span>৳{(product.price * product.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </section>

            <section className="info-card customer-details-card">
                <h3>CUSTOMER & ORDER DETAILS</h3>
                <div className="detail-item">
                    <span>Customer Name</span>
                    <span>{order.customer.name}</span>
                </div>
                <div className="detail-item">
                    <span>Phone Number</span>
                    <span>{order.customer.phone}</span>
                </div>
                <div className="detail-item">
                    <span>Email Address</span>
                    <span>{order.customer.email}</span>
                </div>
                <div className="detail-item">
                    <span>Delivery Type</span>
                    <span>{order.deliveryType}</span>
                </div>
                <div className="detail-item">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod}</span>
                </div>
            </section>

            <section className="order-info-cards">
                <div className="info-card">
                    <h3>DELIVERY ADDRESS</h3>
                    <p><strong>Address:</strong> {order.address.details}</p>
                    <p><strong>Area:</strong> {order.address.area}</p>
                    <p><strong>City:</strong> {order.address.city}</p>
                </div>
                <div className="info-card">
                    <h3>ORDER SUMMARY</h3>
                    <p><strong>Order Date:</strong> {order.date}</p>
                    <p><strong>Order Time:</strong> {order.time}</p>
                    <p><strong>Sub Total:</strong> ৳{order.subTotal.toFixed(2)}</p>
                    <p><strong>Delivery Fee:</strong> ৳{order.deliveryFee.toFixed(2)}</p>
                    <hr/>
                    <p className="total"><strong>TOTAL</strong> <span>৳{order.total.toFixed(2)}</span></p>
                </div>
            </section>
        </div>
    );
};

export default OrderDetail;
// src/pages/dashboard/Orders.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { mockOrders } from '../../mockData'; // Import data from the new file
import './Dashboard.css';

const Orders = () => {
    return (
        <div className="orders-page">
            <h2>My Orders</h2>
            {mockOrders.length > 0 ? (
                <div className="orders-list">
                    {mockOrders.map((order) => (
                        <article key={order.id} className="order-card">
                            <header className="order-card-header">
                                <div className="order-id">
                                    ORDER ID <span className="id-number">#{order.id}</span>
                                </div>
                                {/* Change the button to a Link */}
                                <Link to={`/dashboard/orders/${order.id}`} className="view-button">View</Link>
                            </header>
                            <section className="order-card-body">
                                <div className="shipping-address">
                                    <h4>Shipping Address</h4>
                                    <p>{order.address.details}, {order.address.area}, {order.address.city}</p>
                                </div>
                                <div className="order-details">
                                    <p><strong>Order Date:</strong> {order.date}</p>
                                    <p><strong>Status:</strong> <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span></p>
                                    <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                                    <p><strong>Total:</strong> ৳{order.total.toFixed(2)}</p>
                                </div>
                            </section>
                        </article>
                    ))}
                </div>
            ) : (
                <div className="no-orders-message">
                    <p>You don't have any previous orders.</p>
                </div>
            )}
        </div>
    );
};

export default Orders;
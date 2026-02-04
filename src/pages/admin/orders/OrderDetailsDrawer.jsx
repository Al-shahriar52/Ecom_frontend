import React from 'react';

const OrderDetailsDrawer = ({ order, onClose }) => {
    return (
        <div className="order-drawer-overlay">
            <div className="order-drawer">
                <div className="drawer-header">
                    <h3>Order Details - {order.invoice}</h3>
                    <button className="drawer-close" onClick={onClose}>×</button>
                </div>

                <div className="drawer-section">
                    <h4>Customer Info</h4>
                    <p><strong>Name:</strong> {order.customerName}</p>
                    <p><strong>Phone:</strong> {order.phone}</p>
                    <p><strong>Address:</strong> {order.address}</p>
                </div>

                <div className="drawer-section">
                    <h4>Payment</h4>
                    <p><strong>COD Amount:</strong> ৳ {order.codAmount}</p>
                    <p><strong>Status:</strong>
                        <span className={`status-badge ${order.status || 'pending'}`}>
                        {(order.status || 'pending').replace('_', ' ')}
                        </span>
                    </p>
                </div>

                <div className="drawer-section">
                    <h4>Shipment Timeline</h4>
                    <ul className="tracking-timeline">
                        {order.timeline?.map((step, index) => (
                            <li key={index}>
                                <div className="timeline-dot"></div>
                                <div className="timeline-content">
                                    <span className="timeline-status">{step.status}</span>
                                    <span className="timeline-time">{step.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="drawer-footer">
                    {order.trackingCode ? (
                        <button className="btn-track-full">Track in Courier</button>
                    ) : (
                        <button className="btn-pickup-full">Create Pickup</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsDrawer;

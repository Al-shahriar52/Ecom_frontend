import React, { useState } from 'react';
import './AdminShipment.css';

const AdminShipment = () => {
    const [view, setView] = useState('list');
    const [showCourierModal, setShowCourierModal] = useState(false);

    // Mock Data
    const orders = [
        { id: '12567', customer: 'Bagus Fikri', total: '৳8092', status: 'PAID', fulfillment: 'Unfulfilled' },
        { id: '12566', customer: 'Raihan Fikri', total: '৳2056', status: 'PAID', fulfillment: 'Unfulfilled' },
        { id: '12565', customer: 'Paroji Dwi', total: '৳0.00', status: 'PAID', fulfillment: 'Fulfilled' },
    ];

    const couriers = [
        { id: 1, name: 'Steadfast Courier', logo: '🚚', rate: '৳60', time: '1-2 Days' },
        { id: 2, name: 'Pathao Courier', logo: '🚲', rate: '৳70', time: '1-3 Days' },
        { id: 3, name: 'RedX', logo: '🔴', rate: '৳55', time: '2-4 Days' },
    ];

    return (
        <div className="admin-container">
            <div className="admin-header-card">
                <div className="header-left">
                    <h2>{view === 'list' ? 'Shipments' : 'Tracking Details'}</h2>
                    <p className="subtitle">Manage and track your customer orders</p>
                </div>
                <div className="header-actions">
                    {view === 'list' && (
                        <button className="btn-create-shipment" onClick={() => setShowCourierModal(true)}>
                            + Create Shipment
                        </button>
                    )}
                    {view === 'track' && (
                        <button className="btn-back" onClick={() => setView('list')}>
                            ← Back to List
                        </button>
                    )}
                </div>
            </div>

            <div className="admin-content-card">
                {/* --- LIST VIEW --- */}
                {view === 'list' && (
                    <table className="modern-table">
                        <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Payment</th>
                            <th>Fulfillment</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map(order => (
                            <tr key={order.id}>
                                <td className="fw-bold">#{order.id}</td>
                                <td className="text-muted">Feb 14, 2026</td>
                                <td className="fw-bold">{order.customer}</td>
                                <td><span className="badge badge-success">{order.status}</span></td>
                                <td>
                                        <span className={`badge ${order.fulfillment === 'Fulfilled' ? 'badge-blue' : 'badge-orange'}`}>
                                            {order.fulfillment}
                                        </span>
                                </td>
                                <td>
                                    <button className="btn-track-action" onClick={() => setView('track')}>
                                        📍 Track
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {/* --- TRACKING VIEW --- */}
                {view === 'track' && (
                    <div className="tracking-wrapper">
                        <div className="tracking-sidebar">
                            <div className="shipment-id-box">
                                <h3>SHP-5567</h3>
                                <span className="badge badge-blue">In Progress</span>
                            </div>
                            <div className="courier-display">
                                <div className="c-icon">🚚</div>
                                <div>
                                    <h5>Steadfast Courier</h5>
                                    <small>Tracking: <strong>15BAEB8A</strong></small>
                                </div>
                            </div>

                            <ul className="timeline-list">
                                <li className="completed">
                                    <div className="dot"></div>
                                    <div className="info">
                                        <strong>Order Placed</strong>
                                        <span>14 Feb, 10:00 AM</span>
                                    </div>
                                </li>
                                <li className="active">
                                    <div className="dot pulse"></div>
                                    <div className="info">
                                        <strong>In Transit</strong>
                                        <span>Expected: 16 Feb</span>
                                    </div>
                                </li>
                                <li>
                                    <div className="dot"></div>
                                    <div className="info">
                                        <strong>Delivered</strong>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="map-view">
                            <div className="map-placeholder-content">
                                <span style={{fontSize: '40px'}}>🗺️</span>
                                <p>Map View Integration Here</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MODAL --- */}
            {showCourierModal && (
                <div className="modal-backdrop">
                    <div className="modal-box">
                        <div className="modal-header">
                            <h3>Select Courier</h3>
                            <button className="close-btn" onClick={() => setShowCourierModal(false)}>×</button>
                        </div>
                        <div className="courier-options">
                            {couriers.map(c => (
                                <div className="courier-item" key={c.id}>
                                    <div className="ci-left">
                                        <span className="ci-logo">{c.logo}</span>
                                        <div>
                                            <h4>{c.name}</h4>
                                            <small>{c.time}</small>
                                        </div>
                                    </div>
                                    <div className="ci-right">
                                        <span className="ci-price">{c.rate}</span>
                                        <button className="btn-select">Select</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminShipment;
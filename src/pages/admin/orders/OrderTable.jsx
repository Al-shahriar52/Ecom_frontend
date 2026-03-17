import React, { useState } from 'react';
import TrackingModal from './TrackingModal';
import PickupModal from './PickupModal';

const OrderTable = ({ orders }) => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showTracking, setShowTracking] = useState(false);
    const [showPickup, setShowPickup] = useState(false);

    return (
        <>
            <div className="order-table-wrapper">
                <table className="order-table">
                    <thead>
                    <tr>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Phone</th>
                        <th>Courier</th>
                        <th>COD</th>
                        <th>Status</th>
                        <th>Tracking</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.map(order => (
                        <tr key={order.invoice}>
                            <td>{order.invoice}</td>
                            <td>{order.customer}</td>
                            <td>{order.phone}</td>
                            <td>{order.courier}</td>
                            <td>৳{order.cod}</td>
                            <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                            </td>
                            <td>{order.trackingCode}</td>
                            <td>
                                <button
                                    className="btn-track"
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setShowTracking(true);
                                    }}
                                >
                                    Track
                                </button>
                                <button
                                    className="btn-pickup"
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setShowPickup(true);
                                    }}
                                >
                                    Pickup
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {showTracking && (
                <TrackingModal
                    order={selectedOrder}
                    onClose={() => setShowTracking(false)}
                />
            )}

            {showPickup && (
                <PickupModal
                    order={selectedOrder}
                    onClose={() => setShowPickup(false)}
                />
            )}
        </>
    );
};

export default OrderTable;

import React from 'react';
import ReactDOM from 'react-dom';
import OrderTrackingPanel from '../../../components/order/OrderTrackingPanel';
import '../../../components/order/TrackingTimeline.css';

/** Order journey popup. Used by the admin order list and the customer dashboard (admin=false there). */
const TrackingModal = ({ order, onClose, admin = true }) => {
    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content tracking-card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>Track order {order.invoice ? `· ${order.invoice}` : `#${order.id}`}</h4>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>
                <div className="modal-body" style={{ overflowY: 'auto' }}>
                    <OrderTrackingPanel orderId={order.id} admin={admin} />
                </div>
            </div>
        </div>,
        document.body
    );
};

export default TrackingModal;

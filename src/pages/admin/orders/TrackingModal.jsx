import React from 'react';
import TrackingStepper from '../../../components/order/TrackingStepper';
import '../../../components/order/TrackingTimeline.css'; // Add CSS provided below

const TrackingModal = ({ order, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content tracking-card">
                <div className="modal-header">
                    <h4>Order Journey (Live Tracking)</h4>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div className="modal-body">
                    {/* General Summary Card */}
                    <div className="tracking-summary">
                        <p><strong>Invoice ID:</strong> {order.invoice}</p>
                        <p><strong>Courier Tracking ID:</strong> {order.cid || 'Not Assigned Yet'}</p>
                    </div>

                    <TrackingStepper order={order} />
                </div>
            </div>
        </div>
    );
};

export default TrackingModal;
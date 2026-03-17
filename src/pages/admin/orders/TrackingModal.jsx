import React from 'react';

const TrackingModal = ({ order, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <h3>Tracking - {order.invoice}</h3>
                    <button onClick={onClose}>✖</button>
                </div>

                <div className="tracking-timeline">
                    <div className="timeline-step active">In Review</div>
                    <div className="timeline-step">Pending</div>
                    <div className="timeline-step">In Transit</div>
                    <div className="timeline-step">Delivered</div>
                </div>

                <div className="tracking-info">
                    <p><strong>Tracking Code:</strong> {order.trackingCode}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                </div>

                <div className="json-view">
                    <h4>API Response (Mock)</h4>
                    <pre>{JSON.stringify(order, null, 2)}</pre>
                </div>
            </div>
        </div>
    );
};

export default TrackingModal;

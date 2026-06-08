/*
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
*/

import React from 'react';
import { getTrackingMilestones } from '../../../utils/trackingUtils';
import '../../../components/order/TrackingTimeline.css'; // Add CSS provided below

const TrackingModal = ({ order, onClose }) => {
    // Pass internal order status, steadfast delivery status, and courier id
    const tracker = getTrackingMilestones(order.orderStatus, order.deliveryStatus, order.cid);

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

                    {/* Progress Stepper Line */}
                    <div className="stepper-container">
                        {tracker.steps.map((step, index) => {
                            const stepNumber = index + 1;
                            let stepClass = 'step-pending';

                            if (tracker.isCancelled) {
                                stepClass = index === 0 ? 'step-completed' : 'step-failed';
                            } else {
                                if (stepNumber < tracker.currentStep) stepClass = 'step-completed';
                                else if (stepNumber === tracker.currentStep) stepClass = 'step-active';
                            }

                            return (
                                <div key={index} className={`stepper-item ${stepClass}`}>
                                    <div className="step-counter">
                                        {tracker.isCancelled && index === 1 ? '✕' : stepNumber < tracker.currentStep ? '✓' : stepNumber}
                                    </div>
                                    <div className="step-info">
                                        <div className="step-title">{step.title}</div>
                                        <div className="step-desc">{step.desc}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrackingModal;

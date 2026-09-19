import React from 'react';
import { getTrackingMilestones } from '../../utils/trackingUtils';
import './TrackingTimeline.css';

/**
 * Renders the order-journey stepper for a given order's status fields.
 * Pure presentational - derives everything from orderStatus/deliveryStatus/cid,
 * so it never needs its own API call.
 */
const TrackingStepper = ({ order }) => {
    const tracker = getTrackingMilestones(order.orderStatus, order.deliveryStatus, order.cid);

    return (
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
    );
};

export default TrackingStepper;

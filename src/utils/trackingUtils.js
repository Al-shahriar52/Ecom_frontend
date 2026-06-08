
export const getTrackingMilestones = (orderStatus, deliveryStatus, cid) => {
    // 1. Check for Cancellation immediately
    const isCancelled =
        orderStatus === 'CANCELLED' ||
        ['cancelled', 'cancelled_approval_pending'].includes(deliveryStatus?.toLowerCase());

    if (isCancelled) {
        return {
            currentStep: -1,
            isCancelled: true,
            steps: [
                { title: 'Order Confirmed', status: 'completed', desc: 'Order was accepted' },
                { title: 'Cancelled', status: 'failed', desc: 'Order was cancelled' }
            ]
        };
    }

    // Default configuration for a healthy delivery lifeline
    let currentStep = 1; // Default to step 1 (Confirmed)
    let step1Desc = 'We have received your order';
    let step2Desc = 'Preparing items in our warehouse';
    let step3Desc = 'Waiting for courier confirmation';
    let step4Desc = 'Package is on the way';
    let step5Desc = 'Package handed over';

    const cleanDeliveryStatus = deliveryStatus?.toLowerCase() || '';

    // Determine current step based on combination of internal flags and Steadfast statuses
    if (cid) {
        // If courier ID exists, we are at least at Step 3 (Handed Over)
        currentStep = 3;

        if (cleanDeliveryStatus === 'in_review') {
            currentStep = 3;
            step3Desc = 'Order created on Steadfast. Awaiting pickup approval.';
        }
        else if (['pending', 'hold'].includes(cleanDeliveryStatus)) {
            currentStep = 4;
            step3Desc = 'Picked up by courier';
            step4Desc = cleanDeliveryStatus === 'hold' ? 'Delivery temporarily on hold' : 'Out for delivery';
        }
        else if (['delivered', 'delivered_approval_pending', 'partial_delivered', 'partial_delivered_approval_pending'].includes(cleanDeliveryStatus)) {
            currentStep = 5;
            step3Desc = 'Picked up by courier';
            step4Desc = 'Delivery completed';
            step5Desc = cleanDeliveryStatus.includes('approval') ? 'Delivered (Awaiting System Clearance)' : 'Successfully Delivered';
        }
    } else {
        // No CID yet means it's still internal
        if (orderStatus === 'CONFIRMED') {
            currentStep = 2; // Move visually to Packing state
            step1Desc = 'Order approved';
        }
    }

    return {
        currentStep,
        isCancelled: false,
        steps: [
            { title: 'Confirmed', desc: step1Desc },
            { title: 'Packing', desc: step2Desc },
            { title: 'Courier Assigned', desc: step3Desc },
            { title: 'Out For Delivery', desc: step4Desc },
            { title: 'Delivered', desc: step5Desc }
        ]
    };
};
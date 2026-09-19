// Maps the backend's real OrderStatus / DeliveryStatus enum values
// (ecommerce.enums.OrderStatus, ecommerce.enums.DeliveryStatus) to a 5-step
// visual tracker. These are clean internal enums the backend controls
// directly - NOT raw Steadfast courier webhook strings - so this logic
// must be kept in sync with those two enums if they change.
export const getTrackingMilestones = (orderStatus, deliveryStatus, cid) => {
    const isCancelled = orderStatus === 'CANCELLED' || deliveryStatus === 'CANCELLED';
    const isReturned = orderStatus === 'RETURNED' || deliveryStatus === 'RETURNED';

    if (isCancelled) {
        return {
            currentStep: -1,
            isCancelled: true,
            steps: [
                { title: 'Order Confirmed', desc: 'Order was accepted' },
                { title: 'Cancelled', desc: 'This order was cancelled' }
            ]
        };
    }

    if (isReturned) {
        return {
            currentStep: -1,
            isCancelled: true, // reuses the same completed/failed rendering
            steps: [
                { title: 'Shipped', desc: 'Package was handed to the courier' },
                { title: 'Returned', desc: 'Package was returned to sender' }
            ]
        };
    }

    let currentStep = 1; // Default: order received, awaiting confirmation
    let step1Desc = 'We have received your order';
    let step2Desc = 'Preparing items in our warehouse';
    let step3Desc = 'Waiting for courier confirmation';
    let step4Desc = 'Package is on the way';
    let step5Desc = 'Package handed over';

    // --- Internal order workflow (before a courier is involved) ---
    if (orderStatus === 'CONFIRMED') {
        currentStep = Math.max(currentStep, 1);
        step1Desc = 'Order approved';
    }
    if (orderStatus === 'PACKAGED') {
        currentStep = Math.max(currentStep, 2);
        step1Desc = 'Order approved';
        step2Desc = 'Items packed and ready to ship';
    }
    if (orderStatus === 'SHIPPED') {
        currentStep = Math.max(currentStep, 3);
        step2Desc = 'Items packed and ready to ship';
        step3Desc = 'Handed over to courier';
    }
    if (orderStatus === 'DELIVERED') {
        currentStep = 5;
    }

    // --- Courier/delivery workflow (once a pickup has been requested) ---
    if (cid) {
        currentStep = Math.max(currentStep, 3);
        step3Desc = 'Handed over to courier';

        switch (deliveryStatus) {
            case 'READY_FOR_PICKUP':
                currentStep = Math.max(currentStep, 3);
                step3Desc = 'Courier notified, awaiting rider pickup';
                break;
            case 'IN_TRANSIT':
                currentStep = Math.max(currentStep, 4);
                step3Desc = 'Picked up by courier';
                step4Desc = 'Out for delivery';
                break;
            case 'DELIVERED':
                currentStep = 5;
                step3Desc = 'Picked up by courier';
                step4Desc = 'Delivery completed';
                step5Desc = 'Successfully delivered';
                break;
            default:
                break; // PENDING - stays at "handed over to courier"
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
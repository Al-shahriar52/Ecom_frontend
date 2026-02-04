import React from "react";
import "./AdminOrders.css";

const statusMap = {
    IN_REVIEW: { label: "In Review", className: "badge-review" },
    PICKED_UP: { label: "Picked Up", className: "badge-picked" },
    DELIVERED: { label: "Delivered", className: "badge-delivered" },
    CANCELLED: { label: "Cancelled", className: "badge-cancelled" },
    ON_HOLD: { label: "On Hold", className: "badge-hold" }
};

const StatusBadge = ({ status }) => {
    const item = statusMap[status] || { label: "Unknown", className: "badge-default" };
    return <span className={`status-badge ${item.className}`}>{item.label}</span>;
};

export default StatusBadge;

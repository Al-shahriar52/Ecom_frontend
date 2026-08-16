import React, { useState } from "react";
import { X, Mail, Phone, ShoppingBag, Clock, ShieldCheck, MapPin, Home, Briefcase, ChevronRight } from "lucide-react";
import { ModalShell, RoleBadge, StatusBadge, Avatar } from "./Shared";
import { useNavigate } from "react-router-dom";

export default function UserDetailsModal({ isOpen, user, onClose }) {
    const [tab, setTab] = useState("overview");
    const navigate = useNavigate();

    if (!isOpen || !user) return null;

    // Helper to render the correct icon based on address type
    const getAddressIcon = (type = "") => {
        const lowerType = type.toLowerCase();
        if (lowerType === "home") return <Home size={14} />;
        if (lowerType === "billing" || lowerType === "office") return <Briefcase size={14} />;
        return <MapPin size={14} />;
    };

    const getOrderStatusType = (status) => {
        switch (status) {
            case "Delivered":
                return "success"; // Or whatever green variant your system uses
            case "Cancelled":
                return "danger";  // Or 'error', 'suspended', etc.
            case "Processing":
            case "Shipped":
                return "info";    // Or 'primary'
            case "Pending":
            default:
                return "warning"; // Or 'unverified'
        }
    };

    return (
        <ModalShell onClose={onClose} size="lg">
            <div className={`um-details-header um-modal-header-gradient--${user.avatarVariant}`}>
                <div className="um-details-top">
                    <div className="um-details-identity">
                        <Avatar name={user.name} variant={user.avatarVariant} size="lg" />
                        <div>
                            <div className="um-details-name-row">
                                <h3 className="um-details-name um-font-display um-text-ink">{user.name}</h3>
                                <RoleBadge role={user.role} />
                                <StatusBadge status={user.status} />
                            </div>
                            <p className="um-details-id um-text-muted um-font-mono">{user.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="um-close-btn"><X size={18} /></button>
                </div>

                <div className="um-contact-row">
                    <div className="um-contact-item um-text-soft">
                        <Mail size={14} className="um-text-muted" /> {user.email}
                    </div>
                    <div className="um-contact-item um-text-soft">
                        <Phone size={14} className="um-text-muted" /> {user.phone}
                    </div>
                </div>

                <div className="um-tabs-row">
                    <button
                        className={`um-tab-btn ${tab === "overview" ? "is-active" : ""}`}
                        onClick={() => setTab("overview")}
                    >
                        Overview
                    </button>
                    <button
                        className={`um-tab-btn ${tab === "orders" ? "is-active" : ""}`}
                        onClick={() => setTab("orders")}
                    >
                        Orders ({user.orders})
                    </button>
                    <button
                        className={`um-tab-btn ${tab === "activity" ? "is-active" : ""}`}
                        onClick={() => setTab("activity")}
                    >
                        Activity Log
                    </button>
                </div>
            </div>

            <div className="um-details-body um-scroll">
                {tab === "overview" && (
                    <div className="um-section-stack">
                        <div>
                            <p className="um-section-title um-text-muted">Order Statistics</p>
                            <div className="um-stat-cards-4">
                                <div className="um-order-stat-card um-order-stat-card--brand">
                                    <p className="um-order-stat-value um-font-display um-text-tint--brand">৳{user.orderStats?.totalSpent || 0}</p>
                                    <p className="um-order-stat-label um-text-tint--brand">Total Spent</p>
                                </div>
                                <div className="um-order-stat-card um-order-stat-card--teal">
                                    <p className="um-order-stat-value um-font-display um-text-tint--teal">{user.orderStats?.delivered || 0}</p>
                                    <p className="um-order-stat-label um-text-tint--teal">Delivered</p>
                                </div>
                                <div className="um-order-stat-card um-order-stat-card--bronze">
                                    <p className="um-order-stat-value um-font-display um-text-tint--bronze">{user.orderStats?.pending || 0}</p>
                                    <p className="um-order-stat-label um-text-tint--bronze">Pending</p>
                                </div>
                                <div className="um-order-stat-card um-order-stat-card--red">
                                    <p className="um-order-stat-value um-font-display um-text-tint--red">{user.orderStats?.cancelled || 0}</p>
                                    <p className="um-order-stat-label um-text-tint--red">Cancelled</p>
                                </div>
                            </div>
                        </div>

                        <div className="um-section">
                            <h3 className="um-section-title um-text-muted">Saved Addresses</h3>
                            <div className="um-address-grid">
                                {user.addresses?.map(addr => (
                                    <div key={addr.id} className="um-address-card">
                                        <div className="um-address-header">
                                            <div className="um-address-type">
                                                {getAddressIcon(addr.addressType)}
                                                <span>{addr.addressType?.toUpperCase() || "ADDRESS"}</span>
                                            </div>
                                            {/* Optional: Add badge conditionally if your data supports it */}
                                            {addr.isDefault && <span className="um-address-badge">Default</span>}
                                        </div>
                                        <div className="um-address-body">
                                            <p className="um-address-line1">{addr.address}</p>
                                            <p className="um-address-line2">{addr.area}, {addr.city}</p>
                                            <p className="um-address-country">Bangladesh</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === "orders" && (
                    <div className="um-order-list">
                        {user.orderHistory?.length > 0 ? (
                            user.orderHistory.map(ord => (
                                <div
                                    key={ord.id}
                                    className="um-order-row um-order-row-clickable"
                                    onClick={() => {
                                        navigate(`/admin/orders/10`, {
                                            state: { fromUserModal: true, userId: user.id }
                                        });
                                    }}
                                >
                                    <div>
                                        <p className="um-order-row-id um-font-display">{ord.id}</p>
                                        <p className="um-order-row-meta um-text-muted">{ord.date} • {ord.items} items</p>
                                    </div>
                                    <div className="um-order-row-right">
                                        <p className="um-order-row-amount um-font-display">৳{ord.amount}</p>
                                        <StatusBadge
                                            status={ord.status}
                                            variant={getOrderStatusType(ord.status)}
                                        />
                                        <ChevronRight size={18} className="um-order-chevron" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="um-empty um-text-muted">No recent orders found.</p>
                        )}
                    </div>
                )}

                {tab === "activity" && (
                    <div className="um-activity-list">
                        {user.activity?.map((act, idx) => (
                            <div key={idx} className="um-activity-row">
                                <div className="um-activity-marker">
                                    <div className="um-timeline-dot" />
                                    {idx !== user.activity.length - 1 && <div className="um-timeline-line" />}
                                </div>
                                <div className="um-activity-content">
                                    <p className="um-activity-text um-text-text">{act.a}</p>
                                    <p className="um-activity-time um-text-muted">{act.t}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="um-modal-footer">
                <button onClick={onClose} className="um-btn-ghost">Close</button>
            </div>
        </ModalShell>
    );
}
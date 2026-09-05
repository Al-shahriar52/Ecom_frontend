
import React, { useState, useEffect } from "react";
import { X, Mail, Phone, ShoppingBag, Clock, ShieldCheck, MapPin, Home, Briefcase, ChevronRight } from "lucide-react";
import { ModalShell, RoleBadge, StatusBadge, Avatar } from "./Shared";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/AxiosInstance";

export default function UserDetailsModal({ isOpen, user, onClose }) {
    const [tab, setTab] = useState("overview");
    const navigate = useNavigate();

    // --- New States for API Integration ---
    const [detailedUser, setDetailedUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Fetch Data Effect ---
    // --- Fetch Data Effect ---
    useEffect(() => {
        // Only fetch if the modal is open and we have a basic user ID
        if (isOpen && user?.id) {
            const fetchUserDetails = async () => {
                setIsLoading(true);
                setError(null);

                try {
                    // Axios automatically throws an error for 4xx and 5xx status codes,
                    // so we don't need to manually check response.ok anymore!
                    const response = await axiosInstance.get(`/api/v1/admin/users/${user.id}`);

                    // Axios automatically parses the JSON.
                    // 'response.data' gives us your GenericResponseDto.
                    // 'response.data.data' gives us the actual UserDetailsResponseDto.
                    setDetailedUser(response.data.data);

                } catch (err) {
                    // Axios puts the backend error response in err.response.data
                    const errorMessage = err.response?.data?.message || err.message || "Failed to fetch user details";
                    setError(errorMessage);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchUserDetails();
        } else {
            // Reset state when the modal closes
            setDetailedUser(null);
            setTab("overview");
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    // Use detailedUser if available, otherwise fallback to the basic user prop
    const displayUser = detailedUser || user;

    // Helper to render the correct icon based on address type
    const getAddressIcon = (type = "") => {
        const lowerType = type.toLowerCase();
        if (lowerType === "home") return <Home size={14} />;
        if (lowerType === "billing" || lowerType === "office") return <Briefcase size={14} />;
        return <MapPin size={14} />;
    };

    const getOrderStatusType = (status) => {
        switch (status) {
            case "DELIVERED":
            case "Delivered":
                return "success";
            case "CANCELLED":
            case "Cancelled":
                return "danger";
            case "PROCESSING":
            case "Processing":
            case "SHIPPED":
            case "Shipped":
                return "info";
            case "PENDING":
            case "Pending":
            default:
                return "warning";
        }
    };

    return (
        <ModalShell onClose={onClose} size="lg">
            <div className={`um-details-header um-modal-header-gradient--${displayUser.avatarVariant || 'default'}`}>
                <div className="um-details-top">
                    <div className="um-details-identity">
                        <Avatar name={displayUser.name} variant={displayUser.avatarVariant} size="lg" />
                        <div>
                            <div className="um-details-name-row">
                                <h3 className="um-details-name um-font-display um-text-ink">{displayUser.name}</h3>
                                <RoleBadge role={displayUser.role} />
                                {/* Handle boolean status mapping back to your UI needs if required */}
                                <StatusBadge status={displayUser.status ? "Active" : "Inactive"} />
                            </div>
                            <p className="um-details-id um-text-muted um-font-mono">{displayUser.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="um-close-btn"><X size={18} /></button>
                </div>

                <div className="um-contact-row">
                    <div className="um-contact-item um-text-soft">
                        <Mail size={14} className="um-text-muted" /> {displayUser.email}
                    </div>
                    {displayUser.phone && (
                        <div className="um-contact-item um-text-soft">
                            <Phone size={14} className="um-text-muted" /> {displayUser.phone}
                        </div>
                    )}
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
                        Orders ({displayUser.orderHistory?.length || 0})
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
                {/* --- API Loading & Error States --- */}
                {isLoading && (
                    <div className="um-empty um-text-muted">
                        <p>Loading user details...</p>
                    </div>
                )}

                {error && !isLoading && (
                    <div className="um-empty um-text-muted" style={{ color: "red" }}>
                        <p>Error: {error}</p>
                        <button onClick={() => setTab("overview")} className="um-btn-ghost">Retry</button>
                    </div>
                )}

                {/* --- Main Content Rendered when NOT loading --- */}
                {!isLoading && !error && detailedUser && (
                    <>
                        {tab === "overview" && (
                            <div className="um-section-stack">
                                <div>
                                    <p className="um-section-title um-text-muted">Order Statistics</p>
                                    <div className="um-stat-cards-4">
                                        <div className="um-order-stat-card um-order-stat-card--brand">
                                            <p className="um-order-stat-value um-font-display um-text-tint--brand">৳{displayUser.orderStats?.totalSpent || 0}</p>
                                            <p className="um-order-stat-label um-text-tint--brand">Total Spent</p>
                                        </div>
                                        <div className="um-order-stat-card um-order-stat-card--teal">
                                            <p className="um-order-stat-value um-font-display um-text-tint--teal">{displayUser.orderStats?.delivered || 0}</p>
                                            <p className="um-order-stat-label um-text-tint--teal">Delivered</p>
                                        </div>
                                        <div className="um-order-stat-card um-order-stat-card--bronze">
                                            <p className="um-order-stat-value um-font-display um-text-tint--bronze">{displayUser.orderStats?.pending || 0}</p>
                                            <p className="um-order-stat-label um-text-tint--bronze">Pending</p>
                                        </div>
                                        <div className="um-order-stat-card um-order-stat-card--red">
                                            <p className="um-order-stat-value um-font-display um-text-tint--red">{displayUser.orderStats?.cancelled || 0}</p>
                                            <p className="um-order-stat-label um-text-tint--red">Cancelled</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="um-section">
                                    <h3 className="um-section-title um-text-muted">Saved Addresses</h3>
                                    <div className="um-address-grid">
                                        {displayUser.addresses?.length > 0 ? (
                                            displayUser.addresses.map(addr => (
                                                <div key={addr.id} className="um-address-card">
                                                    <div className="um-address-header">
                                                        <div className="um-address-type">
                                                            {getAddressIcon(addr.addressType)}
                                                            <span>{addr.addressType?.toUpperCase() || "ADDRESS"}</span>
                                                        </div>
                                                        {addr.isDefault && <span className="um-address-badge">Default</span>}
                                                    </div>
                                                    <div className="um-address-body">
                                                        <p className="um-address-line1">{addr.address}</p>
                                                        <p className="um-address-line2">{addr.area}, {addr.city}</p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="um-text-muted">No saved addresses.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {tab === "orders" && (
                            <div className="um-order-list">
                                {displayUser.orderHistory?.length > 0 ? (
                                    displayUser.orderHistory.map(ord => (
                                        <div
                                            key={ord.id}
                                            className="um-order-row um-order-row-clickable"
                                            onClick={() => {
                                                navigate(`/admin/orders/${ord.id.replace('ORD-', '')}`, {
                                                    state: { fromUserModal: true, userId: displayUser.id }
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
                                {displayUser.activity?.length > 0 ? (
                                    displayUser.activity.map((act, idx) => (
                                        <div key={idx} className="um-activity-row">
                                            <div className="um-activity-marker">
                                                <div className="um-timeline-dot" />
                                                {idx !== displayUser.activity.length - 1 && <div className="um-timeline-line" />}
                                            </div>
                                            <div className="um-activity-content">
                                                <p className="um-activity-text um-text-text">{act.a}</p>
                                                <p className="um-activity-time um-text-muted">{act.t}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="um-empty um-text-muted">No recent activity.</p>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="um-modal-footer">
                <button onClick={onClose} className="um-btn-ghost">Close</button>
            </div>
        </ModalShell>
    );
}
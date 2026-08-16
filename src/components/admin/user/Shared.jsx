import React from "react";
import { ROLE_META, STATUS_META } from "../../../data/constants";

export function RoleBadge({ role }) {
    const m = ROLE_META[role];
    return (
        <span className={`um-badge um-badge--${m.variant}`}>
            <span className={`um-dot um-dot--${m.variant}`} />{m.label}
        </span>
    );
}

export function StatusBadge({ status }) {
    const m = STATUS_META[status] || { variant: "neutral", label: status || "Unknown" };

    return (
        <span className={`um-badge um-badge--${m.variant}`}>
            <span className={`um-dot um-dot--${m.variant}`} />{m.label}
        </span>
    );
}

export function Avatar({ name, variant, size = "md" }) {
    const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("");
    return <div className={`um-avatar um-avatar--${variant} um-avatar--${size}`}>{initials}</div>;
}

export function EmptyState({ text }) {
    return <p className="um-empty um-text-muted">{text}</p>;
}

export function InfoRow({ label, value, icon: Icon }) {
    return (
        <div className="um-info-row">
            <p className="um-info-row-label">{Icon && <Icon size={12} />}{label}</p>
            <p className="um-info-row-value">{value}</p>
        </div>
    );
}

export function ModalShell({ children, onClose, size = "md" }) {
    return (
        <div className="um-modal-overlay" onClick={onClose}>
            <div className={`um-modal-shell um-modal-shell--${size}`} onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
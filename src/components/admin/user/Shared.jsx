/*
import React from "react";
import { ROLE_META, STATUS_META } from "../../../data/constants";

export const RoleBadge = ({ role }) => {
    // 1. Normalize input (remove 'ROLE_' prefix & uppercase)
    const normalizedRole = typeof role === "string"
        ? role.replace(/^ROLE_/, "").toUpperCase()
        : "USER";

    const meta = ROLE_META[normalizedRole] ||
        ROLE_META[role] ||
        { label: role || "User", variant: "gray" };

    return (
        <span className={`um-badge um-badge--${meta.variant}`}>
            {meta.label}
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
}*/


import React from "react";
import { ROLE_META, STATUS_META } from "../../../data/constants";

// --- Date Formatter Helper ---
export function formatDate(dateString) {
    if (!dateString) return "-";
    // Standardize SQL format "2026-04-09 23:58:59.636562" for Date parser
    const isoString = dateString.includes("T") ? dateString : dateString.replace(" ", "T");
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return dateString;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${yyyy}-${mm}-${dd} · ${hours}:${minutes} ${ampm}`;
}

export const RoleBadge = ({ role }) => {
    // 1. Extract string if role is an array or object from backend
    let rawRole = role;
    if (Array.isArray(role)) rawRole = role[0];
    if (typeof rawRole === "object" && rawRole !== null) rawRole = rawRole.name || rawRole.authority;

    const roleStr = typeof rawRole === "string" ? rawRole : "USER";
    const normalizedRole = roleStr.replace(/^ROLE_/, "").toUpperCase();

    // 2. Check exact, uppercase, or lowercase keys in ROLE_META
    const meta = ROLE_META[normalizedRole] ||
        ROLE_META[roleStr] ||
        ROLE_META[roleStr.toLowerCase()] ||
        { label: normalizedRole, variant: "gray" };

    return (
        <span className={`um-badge um-badge--${meta.variant}`}>
            {meta.label}
        </span>
    );
};

export function StatusBadge({ status }) {
    const rawStatus = (status || "active").toString();
    const lowerKey = rawStatus.toLowerCase();
    const upperKey = rawStatus.toUpperCase();

    // Look up lowercase or uppercase key in STATUS_META safely
    const m = STATUS_META[lowerKey] ||
        STATUS_META[upperKey] ||
        STATUS_META[status] ||
        { variant: "neutral", label: rawStatus };

    return (
        <span className={`um-badge um-badge--${m.variant}`}>
            <span className={`um-dot um-dot--${m.variant}`} />{m.label}
        </span>
    );
}

export function Avatar({ name, variant, size = "md" }) {
    const initials = name
        ? name.trim().split(/\s+/).filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    // Normalize variant string and fallback to 'emerald' if undefined
    const safeVariant = (variant || "emerald").toLowerCase();

    return (
        <div className={`um-avatar um-avatar--${safeVariant} um-avatar--${size}`}>
            {initials}
        </div>
    );
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
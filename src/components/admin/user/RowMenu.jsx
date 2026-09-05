import React, { useState } from "react";
import { MoreVertical, ShieldCheck, Pencil, RefreshCcw, PlayCircle, Ban, Trash2, Loader2 } from "lucide-react";
import { usePermissions } from "../../../context/PermissionContext";
import axiosInstance from "../../../api/AxiosInstance";
import { toast } from "react-hot-toast";

export function MenuItem({ icon: Icon, label, onClick, danger, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`um-menu-item ${danger ? "um-menu-item--danger" : ""}`}
            style={{ opacity: disabled ? 0.6 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
        >
            <Icon size={14} /> {label}
        </button>
    );
}

export default function RowMenu({
                                    user,
                                    onView,
                                    onEdit,
                                    onDelete,
                                    onSuccess, // Callback to refresh table/stats in UserManagement.jsx
                                    currentRole = "admin",
                                    isOpen,
                                    onToggle,
                                    closeMenu,
                                    isLastRow
                                }) {
    const { hasPermission } = usePermissions();
    const [isUpdating, setIsUpdating] = useState(false);

    const canManage = hasPermission(currentRole, 1);
    const canDelete = currentRole === "admin";

    // Normalize status checks across string state and boolean status flags
    const isSuspended = user.accountState === "SUSPENDED" || user.accountState === "suspended" || user.status === false;
    const isUnverified = user.accountState === "UNVERIFIED" || user.accountState === "unverified";

    // --- Suspend / Reactivate Handler ---
    const handleToggleSuspend = async () => {
        setIsUpdating(true);
        const shouldSuspend = !isSuspended;

        try {
            // PATCH /api/v1/admin/users/{id}/status?suspend=true|false
            await axiosInstance.patch(`/api/v1/admin/users/${user.id}/status`, null, {
                params: { suspend: shouldSuspend }
            });

            toast.success(shouldSuspend ? "User suspended successfully" : "User reactivated successfully");

            if (onSuccess) {
                onSuccess();
            }
            closeMenu();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to update user status";
            toast.error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    // --- Resend Credentials Handler ---
    const handleResendCredentials = async () => {
        setIsUpdating(true);
        try {
            await axiosInstance.post(`/api/v1/admin/users/${user.id}/resend-credentials`);
            toast.success("Credentials sent to user email");
            closeMenu();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to resend credentials";
            toast.error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="um-row-menu-wrap">
            <button
                onClick={onToggle}
                className="um-row-menu-trigger"
            >
                <MoreVertical size={16} />
            </button>

            {isOpen && (
                <div
                    onClick={e => e.stopPropagation()}
                    className={`um-menu ${isLastRow ? 'um-menu--up' : ''}`}
                >
                    <MenuItem
                        icon={ShieldCheck}
                        label="View details"
                        onClick={onView}
                        disabled={isUpdating}
                    />

                    {canManage && (
                        <>
                            <MenuItem
                                icon={Pencil}
                                label="Edit user"
                                onClick={onEdit}
                                disabled={isUpdating}
                            />

                            {isUnverified && (
                                <MenuItem
                                    icon={isUpdating ? Loader2 : RefreshCcw}
                                    label={isUpdating ? "Sending..." : "Resend credentials"}
                                    onClick={handleResendCredentials}
                                    disabled={isUpdating}
                                />
                            )}

                            {isSuspended ? (
                                <MenuItem
                                    icon={isUpdating ? Loader2 : PlayCircle}
                                    label={isUpdating ? "Updating..." : "Reactivate"}
                                    onClick={handleToggleSuspend}
                                    disabled={isUpdating}
                                />
                            ) : (
                                <MenuItem
                                    icon={isUpdating ? Loader2 : Ban}
                                    label={isUpdating ? "Updating..." : "Suspend user"}
                                    onClick={handleToggleSuspend}
                                    disabled={isUpdating}
                                />
                            )}
                        </>
                    )}

                    {canDelete && (
                        <>
                            <div className="um-menu-divider" />
                            <MenuItem
                                icon={Trash2}
                                label="Delete user"
                                danger
                                onClick={onDelete}
                                disabled={isUpdating}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
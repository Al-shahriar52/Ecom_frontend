import React from "react";
import { MoreVertical, ShieldCheck, Pencil, RefreshCcw, PlayCircle, Ban, Trash2 } from "lucide-react";
import { usePermissions } from "../../../context/PermissionContext";

export function MenuItem({ icon: Icon, label, onClick, danger }) {
    return (
        <button
            onClick={onClick}
            className={`um-menu-item ${danger ? "um-menu-item--danger" : ""}`}
        >
            <Icon size={14} /> {label}
        </button>
    );
}

export default function RowMenu({ user, onView, onEdit, onDelete, currentRole = "admin", isOpen, onToggle, closeMenu, isLastRow }) {
    const { hasPermission } = usePermissions();

    // Check permissions directly from the live Context
    const canManage = hasPermission(currentRole, 1);
    const canDelete = currentRole === "admin";

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
                    /* If it's one of the last rows, add a modifier class to open upwards */
                    className={`um-menu ${isLastRow ? 'um-menu--up' : ''}`}
                >
                    <MenuItem
                        icon={ShieldCheck}
                        label="View details"
                        onClick={onView}
                    />

                    {canManage && (
                        <>
                            <MenuItem
                                icon={Pencil}
                                label="Edit user"
                                onClick={onEdit}
                            />
                            {user.status === "unverified" && (
                                <MenuItem
                                    icon={RefreshCcw}
                                    label="Resend credentials"
                                    onClick={closeMenu}
                                />
                            )}
                            {user.status === "suspended" ? (
                                <MenuItem
                                    icon={PlayCircle}
                                    label="Reactivate"
                                    onClick={closeMenu}
                                />
                            ) : (
                                <MenuItem
                                    icon={Ban}
                                    label="Suspend user"
                                    onClick={closeMenu}
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
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
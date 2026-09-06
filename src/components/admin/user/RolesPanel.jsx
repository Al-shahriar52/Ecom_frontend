import React, { useState } from "react";
import { Lock, Plus } from "lucide-react";
import { PERMISSIONS } from "../../../data/constants";
import { RoleBadge } from "./Shared";
import { usePermissions } from "../../../context/PermissionContext";
import AddRoleModal from "./AddRoleModal";

export default function RolesPanel({ currentRole = "admin" }) {
    const { matrix, roleMeta, togglePermission, hasPermission, addNewRole } = usePermissions();
    const [showAddRole, setShowAddRole] = useState(false);

    // Check if current user can edit permissions
    const canEdit = hasPermission(currentRole, 3);

    // We get dynamic roles from Context instead of static constants
    const dynamicRoles = Object.keys(roleMeta);

    return (
        <div className="um-page">
            <div className="um-page-header">
                <div>
                    <h1 className="um-page-title um-font-display um-text-ink">Roles & Permissions</h1>
                    <p className="um-page-sub um-text-muted">Configure access controls and add custom roles.</p>
                </div>
                <div className="um-header-actions">
                    {canEdit && (
                        <button onClick={() => setShowAddRole(true)} className="um-btn-primary">
                            <Plus size={16} /> Add Role
                        </button>
                    )}
                </div>
            </div>

            <div className="um-card">
                <div className="um-roles-header">
                    <div>
                        <h3 className="um-roles-title um-font-display um-text-ink">Permission Matrix</h3>
                        <p className="um-roles-sub um-text-muted">Toggle capabilities per role.</p>
                    </div>
                    {!canEdit && (
                        <span className="um-pill um-alert--bronze">
                            <Lock size={12} /> View only — Admin required to edit
                        </span>
                    )}
                </div>

                <div className="um-roles-table-wrap">
                    <table className="um-table">
                        <thead>
                        <tr>
                            <th className="um-roles-th um-text-muted">Permission</th>
                            {dynamicRoles.map(r => (
                                <th key={r} className="um-roles-th-center">
                                    <div className="um-center">
                                        {/* Ensure RoleBadge supports dynamic roles if it relies on static meta internally */}
                                        <span className={`um-badge um-badge--${roleMeta[r].variant}`}>
                                                <span className={`um-dot um-dot--${roleMeta[r].variant}`} />
                                            {roleMeta[r].label}
                                            </span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {PERMISSIONS.map((p, i) => (
                            <tr key={p} className="um-roles-row">
                                <td className="um-roles-td um-text-text">{p}</td>
                                {dynamicRoles.map(roleKey => {
                                    const granted = matrix[roleKey][i] === 1;
                                    return (
                                        <td key={roleKey} className="um-roles-td-center">
                                            <div className="um-center">
                                                <button
                                                    disabled={!canEdit}
                                                    onClick={() => togglePermission(roleKey, i)}
                                                    className={`um-toggle ${granted ? "is-on" : ""}`}
                                                >
                                                    <span className="um-toggle-knob" />
                                                </button>
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddRoleModal
                isOpen={showAddRole}
                onClose={() => setShowAddRole(false)}
                onAddRole={addNewRole}
            />
        </div>
    );
}
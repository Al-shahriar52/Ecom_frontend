import React, { useState } from "react";
import { X, ShieldPlus } from "lucide-react";
import { ModalShell } from "./Shared";

export default function AddRoleModal({ isOpen, onClose, onAddRole }) {
    const [roleName, setRoleName] = useState("");
    const [theme, setTheme] = useState("brand");

    if (!isOpen) return null;

    // Auto-generate a safe object key (e.g., "Support Agent" -> "support_agent")
    const roleKey = roleName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!roleName.trim()) return;

        onAddRole(roleKey, roleName, theme);
        onClose();
    };

    return (
        <ModalShell onClose={onClose} size="md">
            <div className="um-modal-header-bordered">
                <div className="um-modal-header-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <ShieldPlus className="um-text-tint--brand" size={24} />
                        <div>
                            <h3 className="um-modal-title um-font-display um-text-ink">Create Custom Role</h3>
                            <p className="um-modal-sub um-text-muted">Define a new role for your system.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="um-close-btn"><X size={18} /></button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="um-modal-body">
                    <div className="um-field">
                        <label className="um-field-label">Role Name</label>
                        <input
                            type="text"
                            className="um-input"
                            placeholder="e.g., Support Agent"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="um-field">
                        <label className="um-field-label">Role ID (Auto-generated)</label>
                        <div className="um-role-locked um-font-mono">
                            {roleKey || "role_id_preview"}
                        </div>
                    </div>

                    <div className="um-field">
                        <label className="um-field-label">Theme Color</label>
                        <select
                            className="um-select"
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                            style={{ marginTop: '4px' }}
                        >
                            <option value="brand">Brand (Blue)</option>
                            <option value="teal">Teal (Green)</option>
                            <option value="bronze">Bronze (Orange)</option>
                            <option value="red">Red</option>
                            <option value="slate">Slate (Gray)</option>
                        </select>
                    </div>

                    <div className="um-note-dashed">
                        <p className="um-note-text">
                            <strong>Note:</strong> By default, new roles are created with no permissions.
                            You can configure their access in the Matrix after creation.
                        </p>
                    </div>
                </div>

                <div className="um-modal-footer">
                    <button type="button" onClick={onClose} className="um-btn-ghost">Cancel</button>
                    <button type="submit" className="um-btn-primary" disabled={!roleName.trim()}>
                        Create Role
                    </button>
                </div>
            </form>
        </ModalShell>
    );
}
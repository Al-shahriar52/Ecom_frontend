import React from "react";
import { AlertTriangle } from "lucide-react";
import { ModalShell } from "./Shared";

export default function DeleteConfirmModal({ user, onClose }) {
    return (
        <ModalShell onClose={onClose} size="sm">
            <div className="um-delete-body">
                <div className="um-icon-circle um-icon-circle--red">
                    <AlertTriangle size={20} />
                </div>
                <h3 className="um-delete-title um-font-display um-text-ink">Delete {user.name}?</h3>
                <p className="um-delete-sub um-text-muted">This permanently removes the account, order history, and activity log. This can't be undone.</p>
            </div>
            <div className="um-modal-footer">
                <button onClick={onClose} className="um-btn-ghost">Cancel</button>
                <button onClick={onClose} className="um-btn-danger">Delete user</button>
            </div>
        </ModalShell>
    );
}
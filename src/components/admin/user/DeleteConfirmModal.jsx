import React, { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { ModalShell } from "./Shared";
import axiosInstance from "../../../api/AxiosInstance";
import { toast } from "react-hot-toast"; // 1. Import toast

export default function DeleteConfirmModal({ user, onClose, onSuccess }) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);

        try {
            // Calls backend DELETE endpoint: /api/v1/admin/users/{id}
            await axiosInstance.delete(`/api/v1/admin/users/${user.id}`);

            // 2. Trigger success toast
            toast.success("User deleted successfully!");

            // Trigger parent refresh to reload user list & stats
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to delete user.";

            // 3. Trigger error toast
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <ModalShell onClose={onClose} size="sm">
            <div className="um-delete-body">
                <div className="um-icon-circle um-icon-circle--red">
                    <AlertTriangle size={20} />
                </div>
                <h3 className="um-delete-title um-font-display um-text-ink">Delete {user.name}?</h3>
                <p className="um-delete-sub um-text-muted">
                    This will scrub all personal profile details and deactivate the account. Order statistics will be preserved for financial records.
                </p>
            </div>

            <div className="um-modal-footer">
                <button
                    onClick={onClose}
                    className="um-btn-ghost"
                    disabled={isDeleting}
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    className="um-btn-danger"
                    disabled={isDeleting}
                    style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                    {isDeleting ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Deleting...
                        </>
                    ) : (
                        "Delete user"
                    )}
                </button>
            </div>
        </ModalShell>
    );
}
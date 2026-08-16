import React, { useState, useEffect } from "react";
import {
    X, UserPlus, UserCog, UploadCloud, FileText, AlertCircle, User, Phone
} from "lucide-react";
import { usePermissions } from "../../../context/PermissionContext";
import { ModalShell } from "./Shared";

export default function UserFormModal({ user, onClose }) {
    const { roleMeta } = usePermissions();
    const isEditMode = !!user;

    // View Mode: 'single' (form) or 'bulk' (csv)
    const [entryMode, setEntryMode] = useState("single");

    // --- Single User State ---
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "user",
        status: "active"
    });

    // --- Validation Error States ---
    const [errors, setErrors] = useState({
        email: "",
        phone: ""
    });

    // --- Bulk Upload State ---
    const [file, setFile] = useState(null);
    const [bulkError, setBulkError] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Populate form if editing
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                role: user.role || "user",
                status: user.status || "active"
            });
        }
    }, [user]);

    // Validation patterns
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone) => {
        // Optional field: if empty, it's valid
        if (!phone) return true;

        // Bangladeshi Phone Regex:
        // Accepts: 01712345678, +8801712345678, 8801712345678
        // Must have valid operator code (013-019) and exactly 11 digits for the main number.
        // We strip spaces and dashes first to allow users to type like "01712-345678" or "+880 1712 345678"
        const sanitizedPhone = phone.replace(/[\s-]/g, '');
        return /^(?:\+?88)?01[3-9]\d{8}$/.test(sanitizedPhone);
    };

    // Handle standard form changes & real-time error clearing
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "email") {
            if (value && !validateEmail(value)) {
                setErrors(prev => ({ ...prev, email: "Please enter a valid email address." }));
            } else {
                setErrors(prev => ({ ...prev, email: "" }));
            }
        }

        if (name === "phone") {
            if (value && !validatePhone(value)) {
                setErrors(prev => ({ ...prev, phone: "Please enter a valid Bangladeshi phone number (e.g. 01712345678)." }));
            } else {
                setErrors(prev => ({ ...prev, phone: "" }));
            }
        }
    };

    // Handle File Selection for CSV
    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        setBulkError("");

        if (selected && selected.type !== "text/csv" && !selected.name.endsWith(".csv")) {
            setBulkError("Please upload a valid CSV file.");
            setFile(null);
            return;
        }
        setFile(selected);
    };

    // Handle Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();

        if (entryMode === "single") {
            // Final safety validation check before submit
            let emailErr = "";
            let phoneErr = "";

            if (!validateEmail(formData.email)) {
                emailErr = "Please enter a valid email address.";
            }
            if (formData.phone && !validatePhone(formData.phone)) {
                phoneErr = "Please enter a valid Bangladeshi phone number.";
            }

            if (emailErr || phoneErr) {
                setErrors({ email: emailErr, phone: phoneErr });
                return;
            }

            if (isEditMode) {
                console.log("Updating user:", formData);
            } else {
                console.log("Creating new user:", formData);
            }
            onClose();
        } else {
            processCSV();
        }
    };

    // Parse CSV File
    const processCSV = () => {
        if (!file) return;
        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const rows = text.split('\n').map(row => row.trim()).filter(row => row);

            if (rows.length < 2) {
                setBulkError("The CSV file appears to be empty or missing data rows.");
                setIsProcessing(false);
                return;
            }

            const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

            const parsedUsers = rows.slice(1).map(row => {
                const values = row.split(',');
                let userObj = {};
                headers.forEach((header, index) => {
                    userObj[header] = values[index] ? values[index].trim() : "";
                });

                return {
                    name: userObj.name || "Unknown User",
                    email: userObj.email || "",
                    phone: userObj.phone || "",
                    role: userObj.role || "user",
                    status: userObj.status || "active"
                };
            }).filter(u => u.email);

            console.log("Bulk users to add:", parsedUsers);
            setIsProcessing(false);
            onClose();
        };

        reader.onerror = () => {
            setBulkError("Failed to read the file. Please try again.");
            setIsProcessing(false);
        };

        reader.readAsText(file);
    };

    return (
        <ModalShell onClose={onClose} size="md">
            <div className="um-modal-header-bordered">
                <div className="um-modal-header-row">
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="um-text-tint--brand">
                            {isEditMode ? <UserCog size={24} /> : (entryMode === 'bulk' ? <UploadCloud size={24} /> : <UserPlus size={24} />)}
                        </div>
                        <div>
                            <h3 className="um-modal-title um-font-display um-text-ink">
                                {isEditMode ? "Edit User" : "Add Users"}
                            </h3>
                            <p className="um-modal-sub um-text-muted">
                                {isEditMode ? "Update user details and access levels." : "Create new users manually or import via CSV."}
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="um-close-btn">
                        <X size={18} />
                    </button>
                </div>

                {!isEditMode && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', padding: '0 20px 16px' }}>
                        <button
                            type="button"
                            onClick={() => { setEntryMode("single"); setBulkError(""); }}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                border: entryMode === "single" ? '1px solid var(--um-brand)' : '1px solid var(--um-border)',
                                background: entryMode === "single" ? 'var(--um-brand-bg)' : 'transparent',
                                color: entryMode === "single" ? 'var(--um-brand-text)' : 'var(--um-text-soft)',
                                cursor: 'pointer'
                            }}
                        >
                            <User size={16} /> Manual Entry
                        </button>
                        <button
                            type="button"
                            onClick={() => setEntryMode("bulk")}
                            style={{
                                flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                border: entryMode === "bulk" ? '1px solid var(--um-brand)' : '1px solid var(--um-border)',
                                background: entryMode === "bulk" ? 'var(--um-brand-bg)' : 'transparent',
                                color: entryMode === "bulk" ? 'var(--um-brand-text)' : 'var(--um-text-soft)',
                                cursor: 'pointer'
                            }}
                        >
                            <FileText size={16} /> CSV Import
                        </button>
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <div className="um-modal-body">
                    {/* --- SINGLE USER FORM --- */}
                    {entryMode === "single" && (
                        <>
                            <div className="um-field">
                                <label className="um-field-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="um-input"
                                    placeholder="e.g., Jane Doe"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="um-field">
                                <label className="um-field-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className={`um-input ${errors.email ? 'um-input-error' : ''}`}
                                    placeholder="jane@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.email && (
                                    <span style={{ color: 'var(--um-red)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {errors.email}
                                    </span>
                                )}
                            </div>

                            <div className="um-field">
                                <label className="um-field-label">Phone Number</label>
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <Phone size={16} style={{ position: 'absolute', left: '12px', color: 'var(--um-muted)' }} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="um-input"
                                        placeholder="01700-000000"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        style={{ paddingLeft: '36px' }}
                                    />
                                </div>
                                {errors.phone && (
                                    <span style={{ color: 'var(--um-red)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                        {errors.phone}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div className="um-field">
                                    <label className="um-field-label">Assign Role</label>
                                    <select
                                        name="role"
                                        className="um-select"
                                        value={formData.role}
                                        onChange={handleChange}
                                    >
                                        {Object.keys(roleMeta).map(roleKey => (
                                            <option key={roleKey} value={roleKey}>
                                                {roleMeta[roleKey].label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="um-field">
                                    <label className="um-field-label">Account Status</label>
                                    <select
                                        name="status"
                                        className="um-select"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="active">Active</option>
                                        <option value="unverified">Unverified</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div>
                            </div>

                            {!isEditMode && (
                                <div className="um-note-dashed">
                                    <p className="um-note-text">
                                        <strong>Note:</strong> The user will receive an email invitation to set up their password.
                                    </p>
                                </div>
                            )}
                        </>
                    )}

                    {/* --- BULK UPLOAD VIEW --- */}
                    {entryMode === "bulk" && (
                        <>
                            <div style={{
                                border: '2px dashed var(--um-border)',
                                borderRadius: '8px',
                                padding: '32px 20px',
                                textAlign: 'center',
                                backgroundColor: 'var(--um-surface)',
                                position: 'relative',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    style={{
                                        opacity: 0,
                                        position: 'absolute',
                                        top: 0, left: 0, right: 0, bottom: 0,
                                        width: '100%', cursor: 'pointer'
                                    }}
                                />

                                {!file ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <UploadCloud size={32} color="var(--um-muted)" />
                                        <p className="um-text-ink" style={{ fontWeight: 500, margin: 0 }}>Click to upload or drag and drop</p>
                                        <p className="um-text-muted" style={{ fontSize: '13px', margin: 0 }}>CSV files only. Format: Name, Email, Phone, Role, Status</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <FileText size={32} color="var(--um-brand)" />
                                        <p className="um-text-ink" style={{ fontWeight: 600, margin: 0 }}>{file.name}</p>
                                        <p className="um-text-muted" style={{ fontSize: '13px', margin: 0 }}>
                                            {(file.size / 1024).toFixed(1)} KB — Ready to upload
                                        </p>
                                    </div>
                                )}
                            </div>

                            {bulkError && (
                                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '6px', backgroundColor: 'var(--um-red-bg)', color: 'var(--um-red-text)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                    <AlertCircle size={16} />
                                    {bulkError}
                                </div>
                            )}

                            <div className="um-note-dashed" style={{ marginTop: '16px' }}>
                                <p className="um-note-text">
                                    <strong>Expected CSV Format:</strong> First row must contain headers: <code>name, email, phone, role, status</code>.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="um-modal-footer">
                    <button type="button" onClick={onClose} className="um-btn-ghost">
                        Cancel
                    </button>

                    {entryMode === "single" ? (
                        <button
                            type="submit"
                            className="um-btn-primary"
                            disabled={!formData.name || !formData.email || !!errors.email || !!errors.phone}
                        >
                            {isEditMode ? "Save Changes" : "Create User"}
                        </button>
                    ) : (
                        <button type="submit" className="um-btn-primary" disabled={!file || isProcessing}>
                            {isProcessing ? "Processing..." : "Import Users"}
                        </button>
                    )}
                </div>
            </form>
        </ModalShell>
    );
}
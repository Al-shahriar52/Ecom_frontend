import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import './Dashboard.css';
import './ChangePassword.css';

const MIN_LENGTH = 8;
const MAX_LENGTH = 72;

const errorMessage = (error, fallback) =>
    error.response?.data?.message || fallback;

const ChangePassword = () => {
    // null = still loading, true = user has their own password, false = Google/Facebook sign-up that
    // still has the system-generated placeholder password and must set one first
    const [hasPassword, setHasPassword] = useState(null);

    // A) Normal change: the user knows their current password
    const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    // B) Set / reset the password with a one-time code sent to the account's email (or phone)
    const [contact, setContact] = useState('');
    const [showCodeFlow, setShowCodeFlow] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [codeForm, setCodeForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
    const [codeBusy, setCodeBusy] = useState(false);

    const loadPasswordStatus = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/user/password-status');
            setHasPassword(response.data?.data?.hasPassword !== false);
        } catch (error) {
            setHasPassword(true); // if unsure, show the normal form (the code option stays available)
        }
    };

    useEffect(() => {
        const loadContact = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/user/get');
                const data = response.data?.data;
                setContact(data?.email || data?.phone || '');
            } catch (error) {
                // the code flow just stays unavailable
            }
        };
        loadContact();
        loadPasswordStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkNewPassword = (newPassword, confirmPassword) => {
        if (newPassword.length < MIN_LENGTH) return `New password must be at least ${MIN_LENGTH} characters.`;
        if (newPassword.length > MAX_LENGTH) return `New password must be at most ${MAX_LENGTH} characters.`;
        if (newPassword !== confirmPassword) return 'New password and confirmation do not match.';
        return null;
    };

    // ---------- A) change with current password ----------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.currentPassword) {
            toast.error('Please enter your current password.');
            return;
        }
        const problem = checkNewPassword(form.newPassword, form.confirmPassword);
        if (problem) {
            toast.error(problem);
            return;
        }
        if (form.newPassword === form.currentPassword) {
            toast.error('New password must be different from your current password.');
            return;
        }

        setSaving(true);
        try {
            const response = await axiosInstance.post('/api/v1/user/change-password', {
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            toast.success(response.data?.message || 'Password changed successfully.');
            setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(errorMessage(error, 'Failed to change password.'));
        } finally {
            setSaving(false);
        }
    };

    // ---------- B) set / reset with a one-time code ----------
    const handleCodeChange = (e) => {
        const { name, value } = e.target;
        setCodeForm((prev) => ({ ...prev, [name]: value }));
    };

    const sendCode = async () => {
        setCodeBusy(true);
        try {
            const response = await axiosInstance.post('/api/v1/auth/forgot-password', { emailOrPhone: contact });
            toast.success(response.data?.message || 'Verification code sent.');
            setCodeSent(true);
        } catch (error) {
            toast.error(errorMessage(error, 'Failed to send the verification code.'));
        } finally {
            setCodeBusy(false);
        }
    };

    const handleCodeSubmit = async (e) => {
        e.preventDefault();
        if (!codeForm.otp.trim()) {
            toast.error('Please enter the verification code.');
            return;
        }
        const problem = checkNewPassword(codeForm.newPassword, codeForm.confirmPassword);
        if (problem) {
            toast.error(problem);
            return;
        }

        setCodeBusy(true);
        try {
            const response = await axiosInstance.post('/api/v1/auth/reset-password', {
                emailOrPhone: contact,
                otp: codeForm.otp.trim(),
                password: codeForm.newPassword,
            });
            toast.success(response.data?.message || 'Password updated successfully.');
            setCodeForm({ otp: '', newPassword: '', confirmPassword: '' });
            setCodeSent(false);
            setShowCodeFlow(false);
            await loadPasswordStatus(); // a first-time "Set password" turns this page into "Change password"
        } catch (error) {
            toast.error(errorMessage(error, 'Failed to update the password.'));
        } finally {
            setCodeBusy(false);
        }
    };

    const inputType = showPasswords ? 'text' : 'password';
    const mustSetFirst = hasPassword === false;

    const renderCodeFlow = () => (
        <form onSubmit={handleCodeSubmit}>
            <h3>{mustSetFirst ? 'Set your password' : 'Set a new password with a verification code'}</h3>
            {!codeSent ? (
                <>
                    <p>We will send a 6-digit code to <strong>{contact}</strong>.</p>
                    <div className="password-alt-actions">
                        <button type="button" className="btn-save" onClick={sendCode} disabled={codeBusy}>
                            {codeBusy ? 'Sending...' : 'Send code'}
                        </button>
                        {!mustSetFirst && (
                            <button type="button" className="password-link-btn" onClick={() => setShowCodeFlow(false)}>
                                Cancel
                            </button>
                        )}
                    </div>
                </>
            ) : (
                <>
                    <p>Enter the code we sent to <strong>{contact}</strong> and choose a {mustSetFirst ? '' : 'new '}password.</p>
                    <div className="form-group">
                        <label htmlFor="otp">Verification Code</label>
                        <input
                            type="text"
                            id="otp"
                            name="otp"
                            inputMode="numeric"
                            value={codeForm.otp}
                            onChange={handleCodeChange}
                            autoComplete="one-time-code"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="codeNewPassword">{mustSetFirst ? 'Password' : 'New Password'}</label>
                        <input
                            type={inputType}
                            id="codeNewPassword"
                            name="newPassword"
                            value={codeForm.newPassword}
                            onChange={handleCodeChange}
                            autoComplete="new-password"
                        />
                        <small className="password-hint">At least {MIN_LENGTH} characters.</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="codeConfirmPassword">Confirm Password</label>
                        <input
                            type={inputType}
                            id="codeConfirmPassword"
                            name="confirmPassword"
                            value={codeForm.confirmPassword}
                            onChange={handleCodeChange}
                            autoComplete="new-password"
                        />
                    </div>
                    <label className="show-passwords">
                        <input
                            type="checkbox"
                            checked={showPasswords}
                            onChange={(e) => setShowPasswords(e.target.checked)}
                        />
                        <span>Show passwords</span>
                    </label>
                    <div className="password-alt-actions">
                        <button type="submit" className="btn-save" disabled={codeBusy}>
                            {codeBusy ? 'Saving...' : (mustSetFirst ? 'Set Password' : 'Update Password')}
                        </button>
                        <button type="button" className="password-link-btn" onClick={sendCode} disabled={codeBusy}>
                            Resend code
                        </button>
                    </div>
                </>
            )}
        </form>
    );

    if (hasPassword === null) {
        return (
            <div className="account-details-page change-password-page">
                <h2>Password</h2>
                <p className="password-hint">Loading...</p>
            </div>
        );
    }

    // Google / Facebook sign-up that has not chosen a password yet: set one first
    if (mustSetFirst) {
        return (
            <div className="account-details-page change-password-page">
                <h2>Set Password</h2>
                <p className="password-intro">
                    You signed in with Google or Facebook, so you don&apos;t have a password yet.
                    Set one to also log in with your email and password. For your security we confirm it with a code.
                </p>
                <div className="password-alt-box">
                    {contact ? renderCodeFlow() : (
                        <p>We couldn&apos;t find an email or phone number on your account. Please contact support.</p>
                    )}
                </div>
            </div>
        );
    }

    // Normal user: change the password
    return (
        <div className="account-details-page change-password-page">
            <h2>Change Password</h2>

            <form className="account-details-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                        type={inputType}
                        id="currentPassword"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                        type={inputType}
                        id="newPassword"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                    <small className="password-hint">At least {MIN_LENGTH} characters.</small>
                </div>
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                        type={inputType}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                </div>

                <label className="show-passwords">
                    <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                    />
                    <span>Show passwords</span>
                </label>

                <div className="form-actions-details">
                    <button type="submit" className="btn-save" disabled={saving}>
                        {saving ? 'Saving...' : 'Change Password'}
                    </button>
                </div>
            </form>

            {contact && (
                <div className="password-alt-box">
                    {!showCodeFlow ? (
                        <p>
                            Don&apos;t remember your current password?{' '}
                            <button type="button" className="password-link-btn" onClick={() => setShowCodeFlow(true)}>
                                Set a new password with a verification code
                            </button>
                        </p>
                    ) : renderCodeFlow()}
                </div>
            )}
        </div>
    );
};

export default ChangePassword;


import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './AuthPage.css';

const validateField = (name, value) => {
    switch (name) {
        case 'name':
            if (!value) return 'Name is required.';
            return '';
        case 'emailOrPhone':
            if (!value) return 'Email or Phone is required.';
            if (value.includes('@')) {
                if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid.';
            } else {
                if (!/^(01[3-9]\d{8})$/.test(value)) return 'Invalid Bangladeshi phone number.';
            }
            return '';
        case 'password':
            if (!value) return 'Password is required.';
            const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
            if (!passwordRegex.test(value)) {
                return 'Password must be 8+ characters and include uppercase, lowercase, number, & special character.';
            }
            return '';
        default:
            return '';
    }
};

const AuthPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [unverifiedData, setUnverifiedData] = useState(null);

    const toggleView = () => {
        setIsLoginView(!isLoginView);
        setShowForgotPassword(false);
        setUnverifiedData(null);
    };

    const handleRedirectToVerify = (data) => {
        setUnverifiedData(data);
        setIsLoginView(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-card-image">
                    <img src="https://res.cloudinary.com/dgxol8iyp/image/upload/v1772944673/authImage_yhdezq.png" alt="Logo" />
                </div>
                <div className="auth-card-form">
                    {showForgotPassword ? (
                        <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
                    ) : isLoginView ? (
                        <LoginForm
                            onForgotClick={() => setShowForgotPassword(true)}
                            onUnverified={handleRedirectToVerify}
                        />
                    ) : (
                        <RegisterForm initialData={unverifiedData} />
                    )}

                    {!showForgotPassword && (
                        <div className="auth-toggle">
                            {isLoginView ? (
                                <p>Don't have an account? <span onClick={toggleView}>Register</span></p>
                            ) : (
                                <p>Already have an account? <span onClick={toggleView}>Login</span></p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const LoginForm = ({ onForgotClick, onUnverified }) => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validateField(name, value) });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (touched[name]) {
            setErrors({ ...errors, [name]: validateField(name, value) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formErrors = {
            emailOrPhone: validateField('emailOrPhone', formData.emailOrPhone),
            password: validateField('password', formData.password)
        };
        setErrors(formErrors);
        setTouched({ emailOrPhone: true, password: true });

        if (!formErrors.emailOrPhone && !formErrors.password) {
            setIsLoading(true);
            const result = await login(formData.emailOrPhone, formData.password);
            setIsLoading(false);

            if (result.success) {
                const from = location.state?.from?.pathname || (result.role === 'ADMIN' ? '/admin' : '/dashboard');
                navigate(from, { replace: true });
            } else if (result.unverified) {
                // Pass both credentials to the redirect handler
                onUnverified({ emailOrPhone: result.emailOrPhone, password: result.password });
            }
        }
    };

    return (
        <div className="auth-form slide-in">
            <h2>Welcome Back!</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="login-emailOrPhone">Email or Phone</label>
                    <input type="text" id="login-emailOrPhone" name="emailOrPhone" value={formData.emailOrPhone} onChange={handleChange} onBlur={handleBlur} className={touched.emailOrPhone ? (errors.emailOrPhone ? 'invalid-field' : 'valid-field') : ''} required />
                    {errors.emailOrPhone && <p className="field-error">{errors.emailOrPhone}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input type="password" id="login-password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} className={touched.password ? (errors.password ? 'invalid-field' : 'valid-field') : ''} required />
                    {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
                <div style={{ textAlign: 'right', marginBottom: '15px' }}>
                    <span className="change-link" onClick={onForgotClick} style={{ fontSize: '13px', marginLeft: 0 }}>Forgot Password?</span>
                </div>
                <button type="submit" className="btn auth-btn" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

const RegisterForm = ({ initialData }) => {
    const { register, verifyRegistrationOtp } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(initialData ? 2 : 1);
    const [formData, setFormData] = useState({
        name: '',
        emailOrPhone: initialData ? initialData.emailOrPhone : '',
        password: initialData ? initialData.password : ''
    });

    const [isVerifying, setIsVerifying] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const hasSentInitialOtp = useRef(false);

    useEffect(() => {
        if (initialData && step === 2 && !hasSentInitialOtp.current) {
            const triggerInitialOtp = async () => {
                hasSentInitialOtp.current = true;
                setIsRegistering(true);
                try {
                    await register('User', initialData.emailOrPhone, initialData.password);
                } catch (err) {
                    console.error("Auto-OTP trigger failed", err);
                    hasSentInitialOtp.current = false;
                } finally {
                    setIsRegistering(false);
                }
            };
            triggerInitialOtp();
        }
    }, [initialData, step, register]);

    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        const formErrors = {
            name: validateField('name', formData.name),
            emailOrPhone: validateField('emailOrPhone', formData.emailOrPhone),
            password: validateField('password', formData.password)
        };
        setErrors(formErrors);
        setTouched({ name: true, emailOrPhone: true, password: true });

        if (!formErrors.name && !formErrors.emailOrPhone && !formErrors.password) {
            setIsRegistering(true);
            const result = await register(formData.name, formData.emailOrPhone, formData.password);
            setIsRegistering(false);
            if (result && result.success) {
                setStep(2);
                setTimer(60);
                setCanResend(false);
            }
        }
    };

    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        // Prevent verification if we are currently sending an OTP
        if (isRegistering) return;

        const finalOtp = otp.join('');
        if (finalOtp.length < 6) {
            toast.error("Please enter all 6 digits.");
            return;
        }
        setIsVerifying(true);
        const result = await verifyRegistrationOtp(formData.emailOrPhone, finalOtp, formData.password);
        setIsVerifying(false);
        if (result && result.success) {
            const from = location.state?.from?.pathname || (result.role === 'ADMIN' ? '/admin' : '/dashboard');
            navigate(from, { replace: true });
        }
    };

    const handleResendOtp = async () => {
        if (!canResend || isRegistering || isVerifying) return;
        setIsRegistering(true);
        const result = await register(formData.name || 'User', formData.emailOrPhone, formData.password);
        setIsRegistering(false);
        if (result && result.success) {
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            if(otpRefs.current[0]) otpRefs.current[0].focus();
        }
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value !== '' && index < 5) otpRefs.current[index + 1].focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1].focus();
    };

    const handleOtpPaste = (index, e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - index);
        if (!pastedData) return;
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) newOtp[index + i] = pastedData[i];
        setOtp(newOtp);
        const focusIndex = Math.min(index + pastedData.length, 5);
        otpRefs.current[focusIndex].focus();
    };

    return (
        <div className="auth-form slide-in">
            {step === 1 && (
                <>
                    <h2>Create Account</h2>
                    <form onSubmit={handleRegisterSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="register-name">Name</label>
                            <input type="text" id="register-name" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-emailOrPhone">Email or Phone</label>
                            <input type="text" id="register-emailOrPhone" name="emailOrPhone" value={formData.emailOrPhone} onChange={(e) => setFormData({...formData, emailOrPhone: e.target.value})} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-password">Password</label>
                            <input type="password" id="register-password" name="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        </div>
                        <button type="submit" className="btn auth-btn" disabled={isRegistering}>
                            {isRegistering ? 'Sending OTP...' : 'Register'}
                        </button>
                    </form>
                </>
            )}

            {step === 2 && (
                <div className="otp-wrapper slide-in">
                    <h2>Verify Your Account</h2>
                    <p className="subtitle" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Code sent to <strong>{formData.emailOrPhone}</strong>
                        <span className="change-link" onClick={() => setStep(1)}>(Change)</span>
                    </p>
                    <form onSubmit={handleVerifySubmit}>
                        <div className="otp-container">
                            {otp.map((digit, index) => (
                                <input key={index} type="text" maxLength="1" className="otp-box" value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} onPaste={(e) => handleOtpPaste(index, e)} ref={(el) => (otpRefs.current[index] = el)} disabled={isVerifying || isRegistering} />
                            ))}
                        </div>
                        <button type="submit" className="btn auth-btn" disabled={isVerifying || isRegistering}>
                            {/* PRIORITY: Show 'Sending OTP...' if background send is active, otherwise 'Verifying...', else default */}
                            {isRegistering ? 'Sending OTP...' : (isVerifying ? 'Verifying...' : 'Verify & Complete')}
                        </button>
                    </form>
                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
                        {timer > 0 ? (
                            <span>Didn't receive code? Resend in <strong>{timer}s</strong></span>
                        ) : (
                            <span>Didn't receive code? <span className="resend-link" onClick={handleResendOtp} style={{ opacity: (isVerifying || isRegistering) ? 0.5 : 1, cursor: 'pointer' }}>
                                {isRegistering ? 'Sending...' : 'Resend Now'}
                            </span></span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const ForgotPasswordForm = ({ onBack }) => {
    const { forgotPassword, resetPassword } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!emailOrPhone) { toast.error("Please enter your email or phone."); return; }
        setIsLoading(true);
        const result = await forgotPassword(emailOrPhone);
        setIsLoading(false);
        if (result.success) setStep(2);
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        if (passwordTouched) setPasswordError(validateField('password', value));
    };

    const handlePasswordBlur = (e) => {
        const value = e.target.value;
        setPasswordTouched(true);
        setPasswordError(validateField('password', value));
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        const finalOtp = otp.join('');
        if (finalOtp.length < 6) { toast.error("Please enter all 6 digits."); return; }
        const pwdError = validateField('password', newPassword);
        setPasswordError(pwdError);
        setPasswordTouched(true);
        if (pwdError) return;
        setIsLoading(true);
        const result = await resetPassword(emailOrPhone, finalOtp, newPassword);
        setIsLoading(false);
        if (result.success) onBack();
    };

    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value !== '' && index < 5) otpRefs.current[index + 1].focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1].focus();
    };

    const handleOtpPaste = (index, e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - index);
        if (!pastedData) return;
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) newOtp[index + i] = pastedData[i];
        setOtp(newOtp);
        const focusIndex = Math.min(index + pastedData.length, 5);
        otpRefs.current[focusIndex].focus();
    };

    return (
        <div className="auth-form slide-in">
            {step === 1 ? (
                <>
                    <h2>Reset Password</h2>
                    <p className="subtitle" style={{ textAlign: 'center', marginBottom: '20px' }}>Enter your details to receive a reset code.</p>
                    <form onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label>Email or Phone</label>
                            <input type="text" value={emailOrPhone} onChange={(e) => setEmailOrPhone(e.target.value)} required />
                        </div>
                        <button type="submit" className="btn auth-btn" disabled={isLoading}>{isLoading ? 'Sending Code...' : 'Send Reset Code'}</button>
                    </form>
                </>
            ) : (
                <div className="otp-wrapper slide-in">
                    <h2>Enter Reset Code</h2>
                    <form onSubmit={handleResetSubmit} noValidate>
                        <div className="otp-container">
                            {otp.map((digit, index) => (
                                <input key={index} type="text" maxLength="1" className="otp-box" value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} onPaste={(e) => handleOtpPaste(index, e)} ref={(el) => (otpRefs.current[index] = el)} disabled={isLoading} />
                            ))}
                        </div>
                        <div className="form-group" style={{ marginTop: '20px' }}>
                            <label>New Password</label>
                            <input type="password" value={newPassword} onChange={handlePasswordChange} onBlur={handlePasswordBlur} className={passwordTouched ? (passwordError ? 'invalid-field' : 'valid-field') : ''} required />
                            {passwordError && <p className="field-error">{passwordError}</p>}
                        </div>
                        <button type="submit" className="btn auth-btn" disabled={isLoading}>{isLoading ? 'Updating...' : 'Update Password'}</button>
                    </form>
                </div>
            )}
            <button type="button" className="btn-back" onClick={onBack} style={{ marginTop: '15px' }} disabled={isLoading}>Back to Login</button>
        </div>
    );
};

export default AuthPage;

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
    const toggleView = () => setIsLoginView(!isLoginView);

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-card-image">
                    <img
                        src="https://res.cloudinary.com/dgxol8iyp/image/upload/v1772944673/authImage_yhdezq.png"
                        alt="BrightnessBeauty Logo"
                    />
                </div>
                <div className="auth-card-form">
                    {isLoginView ? <LoginForm /> : <RegisterForm />}

                    {/* Only show the toggle text if we are in Login view OR Step 1 of Register view */}
                    <div className="auth-toggle">
                        {isLoginView ? (
                            <p>Don't have an account? <span onClick={toggleView}>Register</span></p>
                        ) : (
                            <p>Already have an account? <span onClick={toggleView}>Login</span></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoginForm = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({ emailOrPhone: '', password: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

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
            const result = await login(formData.emailOrPhone, formData.password);

            if (result.success) {
                const from = location.state?.from?.pathname;
                if (from) {
                    navigate(from, { replace: true });
                } else {
                    if (result.role === 'ADMIN') {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                }
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
                <button type="submit" className="btn auth-btn">Login</button>
            </form>
        </div>
    );
};

const RegisterForm = () => {
    const { register, verifyRegistrationOtp } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', emailOrPhone: '', password: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // OTP States
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const otpRefs = useRef([]);

    // Resend Timer States
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Timer Logic
    useEffect(() => {
        let interval;
        if (step === 2 && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

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

    // Step 1: Register Submit
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
            const result = await register(formData.name, formData.emailOrPhone, formData.password);

            if (result && result.success) {
                setStep(2);
                setTimer(60);
                setCanResend(false);
            }
        }
    };

    // Handle Resend OTP
    const handleResendOtp = async () => {
        if (!canResend) return;

        const result = await register(formData.name, formData.emailOrPhone, formData.password);
        if (result && result.success) {
            setTimer(60);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0].focus();
        }
    };

    // Handle OTP Box Input
    const handleOtpChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
            otpRefs.current[index + 1].focus();
        }
    };

    // Handle Backspace
    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1].focus();
        }
    };

    // --- NEW: Handle Pasting OTP ---
    const handleOtpPaste = (index, e) => {
        e.preventDefault();
        // Get pasted data, strip non-numbers, and slice it to fit remaining boxes
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6 - index);

        if (!pastedData) return;

        const newOtp = [...otp];
        // Distribute the pasted characters into the array
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[index + i] = pastedData[i];
        }

        setOtp(newOtp);

        // Move focus to the next empty box, or the last box if it's full
        const focusIndex = Math.min(index + pastedData.length, 5);
        otpRefs.current[focusIndex].focus();
    };

    // Step 2: Verify Submit
    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        const finalOtp = otp.join('');

        if (finalOtp.length < 6) {
            toast.error("Please enter all 6 digits.");
            return;
        }

        const result = await verifyRegistrationOtp(formData.emailOrPhone, finalOtp, formData.password);

        if (result && result.success) {
            const from = location.state?.from?.pathname;
            if (from) {
                navigate(from, { replace: true });
            } else {
                navigate(result.role === 'ADMIN' ? '/admin' : '/dashboard');
            }
        }
    };

    return (
        <div className="auth-form slide-in">
            {step === 1 && (
                <>
                    <h2>Create Account</h2>
                    <form onSubmit={handleRegisterSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="register-name">Name</label>
                            <input type="text" id="register-name" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} className={touched.name ? (errors.name ? 'invalid-field' : 'valid-field') : ''} required />
                            {errors.name && <p className="field-error">{errors.name}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-emailOrPhone">Email or Phone</label>
                            <input type="text" id="register-emailOrPhone" name="emailOrPhone" value={formData.emailOrPhone} onChange={handleChange} onBlur={handleBlur} className={touched.emailOrPhone ? (errors.emailOrPhone ? 'invalid-field' : 'valid-field') : ''} required />
                            {errors.emailOrPhone && <p className="field-error">{errors.emailOrPhone}</p>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="register-password">Password</label>
                            <input type="password" id="register-password" name="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} className={touched.password ? (errors.password ? 'invalid-field' : 'valid-field') : ''} required />
                            {errors.password && <p className="field-error">{errors.password}</p>}
                        </div>
                        <button type="submit" className="btn auth-btn">Register</button>
                    </form>
                </>
            )}

            {step === 2 && (
                <div className="otp-wrapper slide-in">
                    <h2>Verify Your Account</h2>

                    {/* Removed inline styles, added className */}
                    <p className="subtitle" style={{ textAlign: 'center', marginBottom: '20px' }}>
                        Code sent to <strong>{formData.emailOrPhone}</strong>
                        <span className="change-link" onClick={() => setStep(1)}>
                            (Change)
                        </span>
                    </p>

                    <form onSubmit={handleVerifySubmit}>
                        <div className="otp-container">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    className="otp-box"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    onPaste={(e) => handleOtpPaste(index, e)}
                                    ref={(el) => (otpRefs.current[index] = el)}
                                />
                            ))}
                        </div>
                        <button type="submit" className="btn auth-btn">Verify & Complete</button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
                        {timer > 0 ? (
                            <span>Didn't receive code? Resend in <strong>{timer}s</strong></span>
                        ) : (
                            <span>Didn't receive code? <span className="resend-link" onClick={handleResendOtp}>Resend Now</span></span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthPage;
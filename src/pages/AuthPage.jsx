
import React, { useState, useContext } from 'react';
// ADDED: useNavigate and useLocation to handle the redirection logic
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
                        src="https://res.cloudinary.com/dgxol8iyp/image/upload/v1754724593/image_rhqugy.png"
                        alt="BrightnessBeauty Logo"
                    />
                </div>
                <div className="auth-card-form">
                    {isLoginView ? <LoginForm /> : <RegisterForm />}
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

// --- Updated LoginForm Component ---
const LoginForm = () => {
    const { login } = useContext(AuthContext);

    // 1. Hooks for Navigation
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
            // 2. Call Login and wait for result
            const result = await login(formData.emailOrPhone, formData.password);

            if (result.success) {
                // 3. LOGIC: Check if we have a "from" location (e.g. Product Page)
                const from = location.state?.from?.pathname;

                if (from) {
                    // Go back to where user came from
                    navigate(from, { replace: true });
                } else {
                    // Default Logic (No previous page found)
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
        <div className="auth-form">
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

// --- Updated RegisterForm Component ---
const RegisterForm = () => {
    const { register } = useContext(AuthContext);

    // Hooks for Navigation
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({ name: '', emailOrPhone: '', password: '' });
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
            name: validateField('name', formData.name),
            emailOrPhone: validateField('emailOrPhone', formData.emailOrPhone),
            password: validateField('password', formData.password)
        };
        setErrors(formErrors);
        setTouched({ name: true, emailOrPhone: true, password: true });

        if (!formErrors.name && !formErrors.emailOrPhone && !formErrors.password) {
            // Register calls login internally in your AuthContext
            const result = await register(formData.name, formData.emailOrPhone, formData.password);

            if (result && result.success) {
                // Same logic as Login: Check if we have a "from" location
                const from = location.state?.from?.pathname;

                if (from) {
                    navigate(from, { replace: true });
                } else {
                    // Default logic
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
        <div className="auth-form">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} noValidate>
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
        </div>
    );
};

export default AuthPage;
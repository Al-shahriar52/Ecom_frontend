/*

// // src/pages/AuthPage.jsx
//
// import React, { useState, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';
// import './AuthPage.css';
//
// const AuthPage = () => {
//     const [isLoginView, setIsLoginView] = useState(true);
//
//     const toggleView = () => {
//         setIsLoginView(!isLoginView);
//     };
//
//     return (
//         <div className="auth-container">
//             <div className="auth-card">
//                 {/!* --- Left Column inside the card --- *!/}
//                 <div className="auth-card-image">
//                     <img
//                         src="https://res.cloudinary.com/dgxol8iyp/image/upload/v1754724593/image_rhqugy.png"
//                         alt="BrightnessBeauty Logo"
//                     />
//                 </div>
//
//                 {/!* --- Right Column inside the card --- *!/}
//                 <div className="auth-card-form">
//                     {isLoginView ? <LoginForm /> : <RegisterForm />}
//
//                     <div className="auth-toggle">
//                         {isLoginView ? (
//                             <p>Don't have an account? <span onClick={toggleView}>Register</span></p>
//                         ) : (
//                             <p>Already have an account? <span onClick={toggleView}>Login</span></p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// // The LoginForm and RegisterForm components remain the same
// const LoginForm = () => {
//     const { login } = useContext(AuthContext);
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         const result = await login(email, password);
//         if (!result.success) {
//             setError(result.message);
//         }
//     };
//
//     return (
//         <div className="auth-form">
//             <h2>Welcome Back to Brightness Beauty!</h2>
//             <form onSubmit={handleSubmit}>
//                 <div className="form-group">
//                     <label htmlFor="login-email">Email</label>
//                     <input type="email" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="login-password">Password</label>
//                     <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//                 </div>
//                 {error && <p className="error-message">{error}</p>}
//                 <button type="submit" className="btn auth-btn">Login</button>
//             </form>
//         </div>
//     );
// };
//
// const RegisterForm = () => {
//     const { register } = useContext(AuthContext);
//     const [name, setName] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//
//     const handleSubmit = (e) => {
//         e.preventDefault();
//         register(name, email, password);
//     };
//
//     return (
//         <div className="auth-form">
//             <h2>Create Account</h2>
//             <form onSubmit={handleSubmit}>
//                 <div className="form-group">
//                     <label htmlFor="register-name">Name</label>
//                     <input type="text" id="register-name" value={name} onChange={(e) => setName(e.target.value)} required />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="register-email">Email</label>
//                     <input type="email" id="register-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="register-password">Password</label>
//                     <input type="password" id="register-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//                 </div>
//                 <button type="submit" className="btn auth-btn">Register</button>
//             </form>
//         </div>
//     );
// };
//
// export default AuthPage;


import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AuthPage.css';

// --- Reusable Validation Logic ---
const validateField = (name, value) => {
    switch (name) {
        case 'name':
            if (!value) return 'Name is required.';
            return '';
        case 'email':
            if (!value) return 'Email is required.';
            if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid.';
            return '';
        case 'password':
            if (!value) return 'Password is required.';
            if (value.length < 6) return 'Password must be at least 6 characters.';
            return '';
        default:
            return '';
    }
};


const AuthPage = () => {
    // This part remains the same
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
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [submitError, setSubmitError] = useState('');

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
        setSubmitError('');
        const result = await login(formData.email, formData.password);
        if (!result.success) {
            setSubmitError(result.message);
        }
    };

    return (
        <div className="auth-form">
            <h2>Welcome Back!</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="login-email">Email</label>
                    <input
                        type="email"
                        id="login-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.email ? (errors.email ? 'invalid-field' : 'valid-field') : ''}
                        required
                    />
                    {errors.email && <p className="field-error">{errors.email}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input
                        type="password"
                        id="login-password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.password ? (errors.password ? 'invalid-field' : 'valid-field') : ''}
                        required
                    />
                    {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
                {submitError && <p className="error-message">{submitError}</p>}
                <button type="submit" className="btn auth-btn">Login</button>
            </form>
        </div>
    );
};


// --- Updated RegisterForm Component ---
const RegisterForm = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you could add a final check for all fields before submitting
        register(formData.name, formData.email, formData.password);
    };

    return (
        <div className="auth-form">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="register-name">Name</label>
                    <input
                        type="text"
                        id="register-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.name ? (errors.name ? 'invalid-field' : 'valid-field') : ''}
                        required
                    />
                    {errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="register-email">Email</label>
                    <input
                        type="email"
                        id="register-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.email ? (errors.email ? 'invalid-field' : 'valid-field') : ''}
                        required
                    />
                    {errors.email && <p className="field-error">{errors.email}</p>}
                </div>
                <div className="form-group">
                    <label htmlFor="register-password">Password</label>
                    <input
                        type="password"
                        id="register-password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.password ? (errors.password ? 'invalid-field' : 'valid-field') : ''}
                        required
                    />
                    {errors.password && <p className="field-error">{errors.password}</p>}
                </div>
                <button type="submit" className="btn auth-btn">Register</button>
            </form>
        </div>
    );
};

export default AuthPage;*/


// src/pages/AuthPage.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AuthPage.css';

// This validation function is used by both Login and Register
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
            await login(formData.emailOrPhone, formData.password);
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

// --- UPDATED RegisterForm Component ---
const RegisterForm = () => {
    const { register } = useContext(AuthContext);
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

    const handleSubmit = (e) => {
        e.preventDefault();
        const formErrors = {
            name: validateField('name', formData.name),
            emailOrPhone: validateField('emailOrPhone', formData.emailOrPhone),
            password: validateField('password', formData.password)
        };
        setErrors(formErrors);
        setTouched({ name: true, emailOrPhone: true, password: true });

        if (!formErrors.name && !formErrors.emailOrPhone && !formErrors.password) {
            register(formData.name, formData.emailOrPhone, formData.password);
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
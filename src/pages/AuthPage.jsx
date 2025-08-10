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
//                 {isLoginView ? <LoginForm /> : <RegisterForm />}
//                 <div className="auth-toggle">
//                     {isLoginView ? (
//                         <p>Don't have an account? <span onClick={toggleView}>Register</span></p>
//                     ) : (
//                         <p>Already have an account? <span onClick={toggleView}>Login</span></p>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// // Internal component for the Login Form
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
//             <h2>Welcome Back!</h2>
//             <form onSubmit={handleSubmit}>
//                 <div className="form-group">
//                     <label htmlFor="login-email">Email</label>
//                     <input
//                         type="email"
//                         id="login-email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="login-password">Password</label>
//                     <input
//                         type="password"
//                         id="login-password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />
//                 </div>
//                 {error && <p className="error-message">{error}</p>}
//                 <button type="submit" className="btn auth-btn">Login</button>
//             </form>
//         </div>
//     );
// };
//
// // Internal component for the Registration Form
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
//                     <input
//                         type="text"
//                         id="register-name"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="register-email">Email</label>
//                     <input
//                         type="email"
//                         id="register-email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label htmlFor="register-password">Password</label>
//                     <input
//                         type="password"
//                         id="register-password"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <button type="submit" className="btn auth-btn">Register</button>
//             </form>
//         </div>
//     );
// };
//
// export default AuthPage;

// src/pages/AuthPage.jsx

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);

    const toggleView = () => {
        setIsLoginView(!isLoginView);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                {/* --- Left Column inside the card --- */}
                <div className="auth-card-image">
                    <img
                        src="https://res.cloudinary.com/dgxol8iyp/image/upload/v1754724593/image_rhqugy.png"
                        alt="BrightnessBeauty Logo"
                    />
                </div>

                {/* --- Right Column inside the card --- */}
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

// The LoginForm and RegisterForm components remain the same
const LoginForm = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const result = await login(email, password);
        if (!result.success) {
            setError(result.message);
        }
    };

    return (
        <div className="auth-form">
            <h2>Welcome Back to Brightness Beauty!</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="login-email">Email</label>
                    <input type="email" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="login-password">Password</label>
                    <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" className="btn auth-btn">Login</button>
            </form>
        </div>
    );
};

const RegisterForm = () => {
    const { register } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        register(name, email, password);
    };

    return (
        <div className="auth-form">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="register-name">Name</label>
                    <input type="text" id="register-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="register-email">Email</label>
                    <input type="email" id="register-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="register-password">Password</label>
                    <input type="password" id="register-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn auth-btn">Register</button>
            </form>
        </div>
    );
};

export default AuthPage;
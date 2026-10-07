import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebookF } from 'react-icons/fa';
import axiosInstance from '../../api/AxiosInstance';
import './SocialLoginButtons.css';

// Where to send the user after the social login finishes (read by OAuth2Callback)
export const OAUTH_REDIRECT_KEY = 'oauthRedirect';

// Uses the same backend URL as the rest of the app (src/api/AxiosInstance.js)
const apiBase = () => (axiosInstance.defaults.baseURL || '').replace(/\/$/, '');

const SocialLoginButtons = ({ redirectTo }) => {
    const start = (provider) => {
        try {
            if (redirectTo) {
                sessionStorage.setItem(OAUTH_REDIRECT_KEY, redirectTo);
            } else {
                sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
            }
        } catch (e) {
            // sessionStorage unavailable (private mode etc.) - user simply lands on /dashboard
        }
        // Full-page navigation: the backend redirects to Google/Facebook and back
        window.location.assign(`${apiBase()}/oauth2/authorization/${provider}`);
    };

    return (
        <div className="social-login">
            <div className="social-divider"><span>or continue with</span></div>
            <button type="button" className="social-btn" onClick={() => start('google')}>
                <FcGoogle size={20} />
                <span>Google</span>
            </button>
            <button type="button" className="social-btn facebook" onClick={() => start('facebook')}>
                <FaFacebookF size={16} />
                <span>Facebook</span>
            </button>
        </div>
    );
};

export default SocialLoginButtons;

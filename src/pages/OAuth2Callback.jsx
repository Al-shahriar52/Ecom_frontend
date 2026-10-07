import React, { useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { OAUTH_REDIRECT_KEY } from '../components/auth/SocialLoginButtons';

const STAFF_ROLES = ['ADMIN', 'MANAGER', 'STAFF'];

// Only allow internal paths (no "//evil.com", no loops back into login/callback)
const isSafePath = (p) =>
    typeof p === 'string' &&
    p.startsWith('/') &&
    !p.startsWith('//') &&
    !p.startsWith('/login') &&
    !p.startsWith('/oauth2');

/**
 * The backend redirects here after Google/Facebook login. By the time this component renders,
 * AuthProvider has already called /api/v1/auth/me with the new cookies (children only render
 * once loading is false), so we just look at the resulting user and route them.
 */
const OAuth2Callback = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const handled = useRef(false);

    useEffect(() => {
        if (handled.current) return; // React StrictMode runs effects twice in dev
        handled.current = true;

        let target = '';
        try {
            target = sessionStorage.getItem(OAUTH_REDIRECT_KEY) || '';
            sessionStorage.removeItem(OAUTH_REDIRECT_KEY);
        } catch (e) {
            // ignore
        }

        if (!isAuthenticated) {
            toast.error('Social login failed. Please try again.', { id: 'oauth-error' });
            navigate('/login', { replace: true });
            return;
        }

        const role = String(user?.role || '').toUpperCase().replace(/^ROLE_/, '');
        if (STAFF_ROLES.includes(role)) {
            navigate('/admin', { replace: true });
        } else {
            navigate(isSafePath(target) ? target : '/dashboard', { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
            Signing you in...
        </div>
    );
};

export default OAuth2Callback;

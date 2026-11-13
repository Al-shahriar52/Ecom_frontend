import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Pages that must never appear in Google: private, transactional or admin screens.
// Rendered once from App.jsx so no individual page needs to remember to add a robots tag.
const NOINDEX_PREFIXES = [
    '/cart',
    '/checkout',
    '/wishlist',
    '/login',
    '/oauth2',
    '/order-success',
    '/payment',
    '/confirmation',
    '/dashboard',
    '/admin',
];

const RouteSeo = () => {
    const { pathname } = useLocation();
    const isPrivate = NOINDEX_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (!isPrivate) return null;

    return (
        <Helmet>
            <meta name="robots" content="noindex, nofollow" />
        </Helmet>
    );
};

export default RouteSeo;

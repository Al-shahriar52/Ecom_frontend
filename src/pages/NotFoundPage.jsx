import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Shown for any URL that matches no route. Without this, unknown URLs rendered an empty
// page with HTTP 200, which Google reports as "Soft 404" / "Duplicate" pages.
const NotFoundPage = () => (
    <div className="container" style={{ padding: '80px 16px', textAlign: 'center' }}>
        <Helmet>
            <title>Page Not Found | BeautyHaat</title>
            <meta name="robots" content="noindex, follow" />
        </Helmet>
        <h1>Page not found</h1>
        <p>The page you are looking for does not exist or has been moved.</p>
        <p>
            <Link to="/">Go to homepage</Link> &nbsp;|&nbsp; <Link to="/shop">Browse all products</Link>
        </p>
    </div>
);

export default NotFoundPage;

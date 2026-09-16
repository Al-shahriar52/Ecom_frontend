

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from '../components/ProductCard';
import axiosInstance from '../api/AxiosInstance';
import HeroSlider from '../components/HeroSlider';
import { toast } from 'react-hot-toast';
import './Home.css';

const HOME_TITLE = 'BeautyHaat | Buy Makeup, Skincare & Beauty Products Online in Bangladesh';
const HOME_DESCRIPTION = 'Shop genuine makeup, skincare, haircare, fragrance and personal care products online at BeautyHaat, with fast delivery across Bangladesh.';

// ========================================
// --- Skeleton Loading Component ---
// ========================================
const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-image skeleton-animate"></div>
            <div className="skeleton-text skeleton-animate"></div>
            <div className="skeleton-text short skeleton-animate"></div>
            <div className="skeleton-text price skeleton-animate"></div>
            <div className="skeleton-button skeleton-animate"></div>
        </div>
    );
};

const Home = () => {
    const [newestProducts, setNewestProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNewestArrivals = async () => {
            try {
                const params = {
                    pageNo: 0,
                    pageSize: 8,
                    sortBy: 'createdAt',
                    sortDir: 'desc',
                };
                const response = await axiosInstance.get('/api/v1/product/newestArrivals', { params });
                setNewestProducts(response.data.data || []);
            } catch (error) {
                console.error("Error fetching newest arrivals:", error);
                toast.error("Could not load newest arrivals.");
            } finally {
                setLoading(false);
            }
        };
        fetchNewestArrivals();
    }, []);

    const title = "Our Newest Arrivals";

    // WebSite schema (enables Google's sitelinks search box) + Organization
    // schema (brand identity for the knowledge panel). These belong on the
    // homepage only - one instance per site.
    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "BeautyHaat",
        "url": "https://beautyhaat.com/"
        // NOTE: a "potentialAction": SearchAction block (which can unlock
        // Google's sitelinks search box) is deliberately left out - it must
        // point at a URL pattern that actually returns filtered results
        // (e.g. /shop?q={search_term_string}), which ShopPage.jsx doesn't
        // support yet. Add it back once that query-param search exists.
    };

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "BeautyHaat",
        "url": "https://beautyhaat.com/",
        "logo": "https://res.cloudinary.com/dgxol8iyp/image/upload/v1778592921/ecommerce/ChatGPT_Image_May_12_2026_07_34_49_PM_hauhxs.png",
        "sameAs": [
            "https://www.facebook.com/beautyhaat52"
        ]
    };

    const itemListSchema = newestProducts.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Newest Arrivals",
        "itemListElement": newestProducts.slice(0, 20).map((p, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://beautyhaat.com/product/${p.slug || p.productId}`,
            "name": p.name,
            ...(p.imageUrl ? { "image": p.imageUrl } : {})
        }))
    } : null;

    return (
        <div className="home-page">
            <Helmet>
                <title>{HOME_TITLE}</title>
                <meta name="description" content={HOME_DESCRIPTION} />
                <link rel="canonical" href="https://beautyhaat.com/" />

                {/* Open Graph / Facebook & WhatsApp link previews */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={HOME_TITLE} />
                <meta property="og:description" content={HOME_DESCRIPTION} />
                <meta property="og:url" content="https://beautyhaat.com/" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={HOME_TITLE} />
                <meta name="twitter:description" content={HOME_DESCRIPTION} />

                <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
                <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
                {itemListSchema && (
                    <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
                )}
            </Helmet>

            <HeroSlider />
            <div className="container">
                <div className="home-title-container">
                    <h1 className="home-title" aria-label={title}>
                        <div className="side-arrow">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19 12L12 19L5 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>

                        <span className="animated-title-text">
                            {title.split('').map((char, index) => (
                                <span
                                    key={index}
                                    style={{ animationDelay: `${0.5 + index * 0.05}s` }}
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            ))}
                        </span>

                        <div className="side-arrow">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 5V19" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M19 12L12 19L5 12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </h1>
                </div>

                {/* Product Grid & Skeleton Loading */}
                <div className="product-grid">
                    {loading
                        ? [...Array(8)].map((_, index) => (
                            <SkeletonCard key={`skeleton-${index}`} />
                        ))
                        : newestProducts.map((product) => (
                            <ProductCard key={product.productId} product={product} />
                        ))
                    }
                </div>

                {/* Explore More Section */}
                {!loading && (
                    <div className="explore-more-container">
                        <Link to="/shop" className="explore-more-btn">
                            Explore More Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
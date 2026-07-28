

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import axiosInstance from '../api/AxiosInstance';
import HeroSlider from '../components/HeroSlider';
import { toast } from 'react-hot-toast';
import './Home.css';

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

    return (
        <div className="home-page">
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
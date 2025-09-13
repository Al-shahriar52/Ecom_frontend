import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import axiosInstance from '../api/AxiosInstance';
import HeroSlider from '../components/HeroSlider';
import { toast } from 'react-hot-toast';
import './Home.css';

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
                const response = await axiosInstance.get('/api/v1/product/search', { params });
                setNewestProducts(response.data.data.content || []);
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
                {loading ? (
                    <p>Loading products...</p>
                ) : (
                    <div className="product-grid">
                        {newestProducts.map((product) => (
                            <ProductCard key={product.productId} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
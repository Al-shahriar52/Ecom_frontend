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

    const title = "✨ Our Newest Arrivals ✨";
    return (
        <div className="home-page">
            <HeroSlider />
            <div className="container">
                <div className="home-title-container">
                    <h1 className="home-title" aria-label={title}>
                        {title.split('').map((char, index) => (
                            <span
                                key={index}
                                // We add a base delay so letters appear after the background starts revealing
                                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
                            >
                                {char}
                            </span>
                        ))}
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
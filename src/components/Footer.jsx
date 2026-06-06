import React, { useState, useEffect } from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance'; // Ensure this path matches your project structure

const Footer = () => {
    const [topCategories, setTopCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopCategories = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/product/categories');
                setTopCategories(response.data.data.slice(0, 7) || []);
            } catch (error) {
                console.error("Error fetching top categories for footer:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopCategories();
    }, []);

    return (
        <footer className="footer">
            <div className="footer-container">

                {/* About Us Column */}
                <div className="footer-section">
                    <h4>About Us</h4>
                    <ul>
                        <li><Link to="/about">Our Mission</Link></li>
                        <li><Link to="/about">Our Story</Link></li>
                        <li><Link to="/about">Why Choose Us</Link></li>
                    </ul>
                </div>

                {/* Quick Links Section */}
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/shop">Products</Link></li>
                        <li><Link to="/shipping-delivery">Shipping & Delivery</Link></li>
                        <li><Link to="/refund-policy">Refund Policy</Link></li>
                        <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                    </ul>
                </div>

                {/* Top Categories Section */}
                <div className="footer-section">
                    <h4>Top Categories</h4>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <ul>
                            {topCategories.map((category) => {
                                const slug = category.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                                return (
                                    <li key={category.id}>
                                        <Link
                                            to={`/category/${slug}`}
                                            state={{
                                                categoryId: category.id,
                                                categoryName: category.name
                                            }}
                                        >
                                            {category.name}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Follow Us & Payments Section */}
                <div className="footer-section">
                    <h4>Follow Us</h4>
                    <div className="social-links">
                        <a href="https://www.facebook.com/beautyhaat52" target="_blank" rel="noopener noreferrer">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
                    </div>

                    {/* Highly Uniform Payment Container */}
                    <div className="payment-methods-block">
                        <h5>We Accept:</h5>
                        <div className="payment-badges-row">

                            {/* Card 1: Cash On Delivery */}
                            <div className="payment-badge-card">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e84393" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 3h15v11H1V3zM16 7h4l3 3v4h-7V7z" />
                                    <circle cx="4.5" cy="16.5" r="1.5" fill="#e84393" />
                                    <circle cx="14.5" cy="16.5" r="1.5" fill="#e84393" />
                                </svg>
                                <div className="badge-card-text">
                                    <span>Cash on</span>
                                    <span>Delivery</span>
                                </div>
                            </div>

                            {/* Card 2: bKash */}
                            <div className="payment-badge-card">
                                <img
                                    src="https://www.logo.wine/a/logo/BKash/BKash-Icon-Logo.wine.svg"
                                    alt="bKash"
                                    className="bkash-bird-logo"
                                />
                                <div className="badge-card-text bkash-text-accent">
                                    <span>bKash</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} BeautyHaat. All Rights Reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
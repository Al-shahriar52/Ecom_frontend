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
                // Limits it to the top 7 categories so the footer layout stays clean
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

                {/* NEW: Dedicated About Us Column */}
                <div className="footer-section">
                    <h4>About Us</h4>
                    <ul>
                        <li><Link to="/about">Our Mission</Link></li>
                        <li><Link to="/about">Our Story</Link></li>
                        <li><Link to="/about">Why Choose Us</Link></li>
                    </ul>
                </div>

                {/* Quick Links Section (About Us removed from here) */}
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
                                // Formatting the slug exactly like in your Header.jsx
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

                {/* Follow Us Section */}
                <div className="footer-section">
                    <h4>Follow Us</h4>
                    <div className="social-links">
                        <a href="https://www.facebook.com/beautyhaat52" target="_blank" rel="noopener noreferrer">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
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
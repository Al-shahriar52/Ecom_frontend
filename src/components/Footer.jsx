import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h4>About Us</h4>
                    <p>Your one-stop shop for the finest beauty products. Quality and customer satisfaction are our top priorities.</p>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/products">Products</Link></li>
                        <li><Link to="/contact">Contact</Link></li>
                        <li><Link to="/faq">FAQ</Link></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Follow Us</h4>
                    <div className="social-links">
                        {/* Add social media icons here */}
                        <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
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
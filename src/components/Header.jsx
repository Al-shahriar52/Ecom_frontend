
import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const categories = [
    {
        name: 'Makeup',
        path: '/category/makeup',
        color: '#AD1457', // Changed color for visual variety
        subcategories: [
            {
                title: 'FACE',
                links: [
                    { name: 'Face Primer', path: '/subcategory/face-primer' },
                    { name: 'Concealer', path: '/subcategory/concealer' },
                    { name: 'Foundation', path: '/subcategory/foundation' },
                    { name: 'Compact & Pressed Powder', path: '/subcategory/compact-powder' },
                    { name: 'Contour', path: '/subcategory/contour' },
                    { name: 'Loose Powder', path: '/subcategory/loose-powder' },
                    { name: 'Blush', path: '/subcategory/blush' },
                ],
            },
            {
                title: 'EYES',
                links: [
                    { name: 'Kajal', path: '/subcategory/kajal' },
                    { name: 'Eyeliner', path: '/subcategory/eyeliner' },
                    { name: 'Mascara', path: '/subcategory/mascara' },
                    { name: 'Eye Shadow', path: '/subcategory/eye-shadow' },
                    { name: 'Eye Brow Enhancers', path: '/subcategory/eye-brow' },
                    { name: 'False Eyelashes', path: '/subcategory/false-eyelashes' },
                ],
            },
            {
                title: 'LIPS',
                links: [
                    { name: 'Lipstick', path: '/subcategory/lipstick' },
                    { name: 'Liquid Lipsticks', path: '/subcategory/liquid-lipsticks' },
                    { name: 'Lip Crayon', path: '/subcategory/lip-crayon' },
                    { name: 'Lip Gloss', path: '/subcategory/lip-gloss' },
                    { name: 'Lip Liner', path: '/subcategory/lip-liner' },
                ],
            },
            {
                title: 'TOOLS & BRUSHES',
                links: [
                    { name: 'Face Brush', path: '/subcategory/face-brush' },
                    { name: 'Eye Brush', path: '/subcategory/eye-brush' },
                    { name: 'Lip Brush', path: '/subcategory/lip-brush' },
                    { name: 'Brush Sets', path: '/subcategory/brush-sets' },
                ],
            },
            {
                title: 'TOP BRANDS',
                isBrands: true, // Special flag for styling
                links: [
                    { name: 'L\'Oreal', path: '/brand/loreal' },
                    { name: 'MAC', path: '/brand/mac' },
                    { name: 'The Body Shop', path: '/brand/the-body-shop' },
                ],
            },
        ],
    },
    { name: 'Skin', path: '/category/skin', color: '#6A1B9A' }, // This one has no subcategories
    { name: 'Personal care', path: '/category/personal-care', color: '#4A148C' },
    { name: 'Mom & Baby', path: '/category/mom-baby', color: '#1565C0' },
    { name: 'Fragrance', path: '/category/fragrance', color: '#00695C' },
    { name: 'CLEARANCE SALE', path: '/category/sale', color: '#D81B60' },
    { name: 'MEN', path: '/category/men', color: '#2E7D32' },
];


const Header = () => {
    const { cart } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext);
    const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [activeCategory, setActiveCategory] = useState(null);

    const handleMouseEnter = (categoryName) => {
        setActiveCategory(categoryName);
    };

    const handleMouseLeave = () => {
        setActiveCategory(null);
    };

    // Active category object for rendering the menu
    const currentMenu = categories.find(cat => cat.name === activeCategory);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <header className="header-wrapper">
            <div className="header-main">
                <div className="header-left">
                    <Link to="/" className="logo">BrightnessBeauty</Link>
                    <Link to="/brands" className="brands-link">BRANDS</Link>
                </div>

                <div className="header-center">
                    <div className="search-bar-wrapper">
                        <span className="search-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M21 21L16.65 16.65" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        </span>
                        <input type="text" placeholder="Search for Products, Brands..." />
                    </div>
                </div>

                <div className="header-right">
                    <Link to="/wishlist" className="header-action-btn btn-wishlist">WISHLIST</Link>

                    {user ? (
                        <div className="user-menu-container" ref={dropdownRef}>
                            <button
                                className="header-action-btn btn-account"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                MY ACCOUNT
                            </button>

                            {isDropdownOpen && (
                                <div className="dropdown-menu">
                                    {/* --- SIMPLIFIED LOGIC --- */}
                                    <Link
                                        to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                                        className="dropdown-item"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        Dashboard
                                    </Link>

                                    <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="dropdown-item logout">
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="header-action-btn btn-login">LOGIN</Link>
                    )}

                    <Link to="/cart" className="header-action-btn btn-bag">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M3 6H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        <span>BAG</span>
                        <span className="cart-item-count">{totalItemsInCart}</span>
                    </Link>
                </div>
            </div>

            {/*<nav className="category-nav">
                {categories.map((category) => (
                    <Link
                        key={category.name}
                        to={category.path}
                        className="category-link"
                        style={{ backgroundColor: category.color }}
                    >
                        {category.name}
                    </Link>
                ))}
            </nav>*/}

            <nav className="category-nav" onMouseLeave={handleMouseLeave}>
                {categories.map((category) => (
                    <div
                        key={category.name}
                        className="category-item-wrapper"
                        onMouseEnter={() => handleMouseEnter(category.name)}
                    >
                        <Link
                            to={category.path}
                            className="category-link"
                            style={{ backgroundColor: category.color }}
                        >
                            {category.name}
                        </Link>
                    </div>
                ))}

                {/* --- RENDER THE MEGA MENU --- */}
                {currentMenu && currentMenu.subcategories && (
                    <div className="mega-menu">
                        <div className="mega-menu-content">
                            {currentMenu.subcategories.map((column) => (
                                <div key={column.title} className="mega-menu-column">
                                    <h4 className={column.isBrands ? 'column-title-brands' : 'column-title'}>
                                        {column.title}
                                    </h4>
                                    <ul>
                                        {column.links.map((link) => (
                                            <li key={link.name}>
                                                <Link to={link.path}>{link.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
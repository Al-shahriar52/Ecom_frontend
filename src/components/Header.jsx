import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import './Header.css';

/**
 * Parses a flat list of subcategories from the API into a multi-column structure.
 */
const parseSubcategories = (subCategoryData, categoryName) => {
    const columns = [];
    let currentColumn = null;

    subCategoryData.forEach(item => {
        const isTitle = item.name === item.name.toUpperCase() && item.name.length > 1;

        if (isTitle) {
            currentColumn = { title: item.name, links: [] };
            columns.push(currentColumn);
        } else if (currentColumn) {
            currentColumn.links.push({
                id: item.id,
                name: item.name,
                path: `/subcategory/${item.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`
            });
        }
    });

    if (columns.length === 0 && subCategoryData.length > 0) {
        const chunkSize = 8;
        for (let i = 0; i < subCategoryData.length; i += chunkSize) {
            const chunk = subCategoryData.slice(i, i + chunkSize);
            columns.push({
                title: i === 0 ? `Explore ${categoryName}` : '',
                links: chunk.map(item => ({
                    id: item.id,
                    name: item.name,
                    path: `/subcategory/${item.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`
                }))
            });
        }
    }
    return columns;
};

const Header = () => {
    const { cart } = useContext(CartContext);
    const { user, logout } = useContext(AuthContext);
    const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [activeCategoryName, setActiveCategoryName] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- ADDED --- Ref for the dropdown menu
    const dropdownRef = useRef(null);

    // --- ADDED --- useEffect to handle clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/product/categories');
                const apiCategories = response.data.data || [];

                const formattedCategories = apiCategories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    iconUrl: cat.iconUrl,
                    path: `/category/${cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`,
                    subcategories: null,
                    areSubcategoriesFetched: false,
                }));
                setCategories(formattedCategories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Could not load categories.");
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleMouseEnter = async (categoryId) => {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) return;
        setActiveCategoryName(category.name);
        if (!category.areSubcategoriesFetched) {
            try {
                const response = await axiosInstance.get(`/api/v1/product/subCategory/${categoryId}`);
                const subCategoryData = response.data.data || [];
                const parsedData = parseSubcategories(subCategoryData, category.name);
                setCategories(prevCategories =>
                    prevCategories.map(cat =>
                        cat.id === categoryId
                            ? { ...cat, subcategories: parsedData, areSubcategoriesFetched: true }
                            : cat
                    )
                );
            } catch (error) {
                console.error(`Error fetching subcategories for ${category.name}:`, error);
                setCategories(prevCategories =>
                    prevCategories.map(cat =>
                        cat.id === categoryId
                            ? { ...cat, areSubcategoriesFetched: true }
                            : cat
                    )
                );
            }
        }
    };

    const handleMouseLeave = () => {
        setActiveCategoryName(null);
    };

    const activeCategoryData = categories.find(cat => cat.name === activeCategoryName);

    return (
        <header className="header-wrapper">
            {isMobileMenuOpen && <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
            <div className={`mobile-sidenav ${isMobileMenuOpen ? 'open' : ''}`}>
                <div className="sidenav-header">
                    <h3>Menu</h3>
                    <button className="close-btn" onClick={() => setIsMobileMenuOpen(false)}>&times;</button>
                </div>
                <div className="sidenav-links">
                    {categories.map(category => (
                        <Link key={category.id} to={category.path} onClick={() => setIsMobileMenuOpen(false)}>
                            <img src={category.iconUrl} alt={category.name} />
                            <span>{category.name}</span>
                        </Link>
                    ))}
                    <hr />
                    <Link to="/brands" onClick={() => setIsMobileMenuOpen(false)}>Brands</Link>
                    <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)}>Wishlist</Link>
                    {user ? (
                        <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
                    ) : (
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                    )}
                </div>
            </div>

            <div className="header-main">
                <div className="header-left">
                    <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                        &#9776;
                    </button>
                    <Link to="/" className="logo">BrightnessBeauty</Link>
                    <Link to="/brands" className="brands-link desktop-only">BRANDS</Link>
                </div>

                <div className="header-center desktop-only">
                    <div className="search-bar-wrapper">
                        <span className="search-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M21 21L16.65 16.65" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        </span>
                        <input type="text" placeholder="Search for Products, Brands..." />
                    </div>
                </div>

                <div className="header-right">
                    <Link to="/wishlist" className="header-action-btn btn-wishlist desktop-only">WISHLIST</Link>
                    <div className="desktop-only">
                        {user ? (
                            // --- ADDED --- ref is attached here
                            <div className="user-menu-container" ref={dropdownRef}>
                                <button className="header-action-btn btn-account" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                                    MY ACCOUNT
                                </button>
                                {isUserDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>
                                            Dashboard
                                        </Link>
                                        <button onClick={() => { logout(); setIsUserDropdownOpen(false); }} className="dropdown-item logout">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="header-action-btn btn-login">LOGIN</Link>
                        )}
                    </div>
                    <Link to="/cart" className="header-action-btn btn-bag">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M3 6H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        <span className="cart-text">BAG</span>
                        <span className="cart-item-count">{totalItemsInCart}</span>
                    </Link>
                </div>
            </div>

            <nav className="category-nav desktop-only" onMouseLeave={handleMouseLeave}>
                {loadingCategories ? (
                    <p className="loading-text">Loading Categories...</p>
                ) : (
                    categories.map((category) => (
                        <div key={category.id} className="category-item-wrapper" onMouseEnter={() => handleMouseEnter(category.id)}>
                            <Link to={category.path} className="category-link">
                                <img src={category.iconUrl} alt={category.name} className="category-icon" />
                                <span className="category-name">{category.name}</span>
                            </Link>
                        </div>
                    ))
                )}

                {activeCategoryData && activeCategoryData.subcategories && (
                    <div className="mega-menu">
                        <div className="mega-menu-content">
                            {activeCategoryData.subcategories.length > 0 ? (
                                activeCategoryData.subcategories.map((column) => (
                                    <div key={column.title} className="mega-menu-column">
                                        <h4 className="column-title">{column.title}</h4>
                                        <ul>
                                            {column.links.map((link) => (
                                                <li key={link.id || link.name}>
                                                    <Link to={link.path}>{link.name}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <p>No subcategories found.</p>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Header;
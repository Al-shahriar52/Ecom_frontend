import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/AxiosInstance';
import { toast } from 'react-hot-toast';
import './Header.css';

/**
 * Parses a flat list of subcategories from the API into a multi-column structure.
 * 1. It identifies column titles by checking if a name is in ALL CAPS.
 * 2. If no titles are found, it splits the list into columns of max 8 items.
 * @param {Array} subCategoryData - The flat array from the subcategory API.
 * @param {string} categoryName - The name of the parent category for fallback titles.
 * @returns {Array} An array of column objects for the mega menu.
 */
const parseSubcategories = (subCategoryData, categoryName) => {
    const columns = [];
    let currentColumn = null;

    subCategoryData.forEach(item => {
        const isTitle = item.name === item.name.toUpperCase() && item.name.length > 1;

        if (isTitle) {
            currentColumn = {
                title: item.name,
                links: [],
            };
            columns.push(currentColumn);
        } else if (currentColumn) {
            currentColumn.links.push({
                id: item.id,
                name: item.name,
                path: `/subcategory/${item.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`
            });
        }
    });

    // Fallback logic: If no columns were created, create them by chunking the list.
    if (columns.length === 0 && subCategoryData.length > 0) {
        const chunkSize = 8; // Max items per column
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

    // Fetch main categories on component load
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

    // Fetch subcategories on-demand when hovering over a category
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
            {/* --- NEW --- Overlay and Side Navigation Panel for Mobile */}
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
                    {/* --- NEW --- Hamburger button, visible only on mobile */}
                    <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>
                        &#9776;
                    </button>
                    <Link to="/" className="logo">BrightnessBeauty</Link>
                    {/* Added 'desktop-only' class to hide on mobile */}
                    <Link to="/brands" className="brands-link desktop-only">BRANDS</Link>
                </div>

                {/* Added 'desktop-only' class to hide on mobile */}
                <div className="header-center desktop-only">
                    <div className="search-bar-wrapper">
                        <span className="search-icon">{/* ... svg ... */}</span>
                        <input type="text" placeholder="Search for Products, Brands..." />
                    </div>
                </div>

                <div className="header-right">
                    {/* Added 'desktop-only' class to hide on mobile */}
                    <Link to="/wishlist" className="header-action-btn btn-wishlist desktop-only">WISHLIST</Link>

                    {/* Added 'desktop-only' class to hide on mobile */}
                    <div className="desktop-only">
                        {user ? (
                            <div className="user-menu-container">
                                <button className="header-action-btn btn-account" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>
                                    MY ACCOUNT
                                </button>
                                {isUserDropdownOpen && (
                                    <div className="dropdown-menu">{/* ... dropdown content ... */}</div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="header-action-btn btn-login">LOGIN</Link>
                        )}
                    </div>

                    {/* Cart button remains visible on all screen sizes */}
                    <Link to="/cart" className="header-action-btn btn-bag">
                        <svg width="20" height="20" viewBox="0 0 24 24">{/* ... svg ... */}</svg>
                        <span className="cart-text">BAG</span>
                        <span className="cart-item-count">{totalItemsInCart}</span>
                    </Link>
                </div>
            </div>

            {/* Added 'desktop-only' class to hide the entire category nav on mobile */}
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
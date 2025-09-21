
import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
    const [brandMenuData, setBrandMenuData] = useState(null);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const brandMenuTimeoutRef = useRef(null);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
    const searchRef = useRef(null);
    const [searchPageNo, setSearchPageNo] = useState(0);
    const [hasMoreSearchResults, setHasMoreSearchResults] = useState(false);

    const dropdownRef = useRef(null);

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

    const handleBrandMouseEnter = async () => {
        // Clear any pending timer to close the menu
        clearTimeout(brandMenuTimeoutRef.current);

        setIsBrandMenuOpen(true);
        if (!brandMenuData && !isLoadingBrands) {
            setIsLoadingBrands(true);
            try {
                const response = await axiosInstance.get('/api/v1/product/brandMenu');
                setBrandMenuData(response.data.data);
            } catch (error) {
                console.error("Error fetching brand menu:", error);
                toast.error("Could not load brands.");
            } finally {
                setIsLoadingBrands(false);
            }
        }
    };

    const handleBrandMouseLeave = () => {
        // Set a timer to close the menu after a short delay
        brandMenuTimeoutRef.current = setTimeout(() => {
            setIsBrandMenuOpen(false);
        }, 150); // 150ms delay
    };

    const alphabet = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
    const activeCategoryData = categories.find(cat => cat.name === activeCategoryName);

    const handleCategoryMouseEnter = async (categoryId) => {
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

    const handleCategoryMouseLeave = () => {
        setActiveCategoryName(null);
    };

    const groupedBrands = useMemo(() => {
        if (!brandMenuData?.allBrands) return {};
        return brandMenuData.allBrands.reduce((acc, brand) => {
            let firstChar = brand.name.charAt(0).toUpperCase();
            if (!/[A-Z]/.test(firstChar)) {
                firstChar = '#';
            }
            if (!acc[firstChar]) {
                acc[firstChar] = [];
            }
            acc[firstChar].push(brand);
            return acc;
        }, {});
    }, [brandMenuData]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            setIsSearchDropdownOpen(false);
            return;
        }

        // Reset pagination for a new search term
        setSearchResults([]);
        setSearchPageNo(0);
        setHasMoreSearchResults(true);

        setIsSearchLoading(true);
        setIsSearchDropdownOpen(true);

        const debounceTimer = setTimeout(() => {
            const fetchSearchResults = async () => {
                try {
                    const params = { query: searchQuery, pageSize: 10, pageNo: 0 }; // Start at page 0
                    const response = await axiosInstance.get('/api/v1/product/search', { params });
                    const data = response.data.data;
                    setSearchResults(data.content || []);
                    setHasMoreSearchResults(!data.last); // Check if this is the last page
                } catch (error) {
                    console.error("Error fetching search results:", error);
                    toast.error("Could not fetch search results.");
                } finally {
                    setIsSearchLoading(false);
                }
            };
            fetchSearchResults();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the search bar wrapper
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchRef]); // The dependency is the searchRef


    const fetchMoreSearchResults = async () => {
        if (isSearchLoading || !hasMoreSearchResults) return;

        setIsSearchLoading(true);
        const nextPage = searchPageNo + 1;

        try {
            const params = { query: searchQuery, pageSize: 10, pageNo: nextPage };
            const response = await axiosInstance.get('/api/v1/product/search', { params });
            const data = response.data.data;
            // Append new results to the existing list
            setSearchResults(prevResults => [...prevResults, ...(data.content || [])]);
            setSearchPageNo(nextPage);
            setHasMoreSearchResults(!data.last);
        } catch (error) {
            console.error("Error fetching more search results:", error);
            toast.error("Could not load more results.");
        } finally {
            setIsSearchLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setIsSearchDropdownOpen(false);
            navigate(`/search?query=${searchQuery.trim()}`);
            setSearchQuery('');
        }
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        // Check if the user has scrolled to the bottom (with a small buffer)
        if (scrollHeight - scrollTop <= clientHeight + 5) {
            fetchMoreSearchResults();
        }
    };

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
                    <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(true)}>&#9776;</button>
                    <Link to="/" className="logo">BrightnessBeauty</Link>

                    <div
                        className="brands-link-wrapper desktop-only"
                        onMouseEnter={handleBrandMouseEnter}
                        onMouseLeave={handleBrandMouseLeave}
                    >
                        <Link to="/brands" className="brands-link">BRANDS</Link>
                    </div>
                </div>

                <div className="header-center desktop-only">
                    <form className="search-bar-wrapper" ref={searchRef} onSubmit={handleSearchSubmit}>
                        <span className="search-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M21 21L16.65 16.65" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path></svg></span>
                        <input
                            type="text"
                            placeholder="Search for Products, Brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery.trim() && setIsSearchDropdownOpen(true)}
                        />

                        {isSearchDropdownOpen && (searchResults.length > 0 || isSearchLoading) && (
                            <div className="search-results-dropdown" onScroll={handleScroll}>
                                <h4 className="search-results-title">PRODUCTS</h4>
                                <ul className="search-results-list">
                                    {searchResults.map(product => (
                                        <li key={product.productId}>
                                            <Link
                                                to={`/product/${product.productId}`}
                                                className="search-result-item"
                                                onClick={() => setIsSearchDropdownOpen(false)}
                                            >
                                                <img src={product.imageUrl} alt={product.name} className="search-result-image" />
                                                <div className="search-result-details">
                                                    <span className="search-result-name">{product.name}</span>
                                                    <span className="search-result-brand">{product.brandName}</span>
                                                </div>
                                                <span className="search-result-price">৳{product.discountedPrice}</span>
                                            </Link>
                                        </li>
                                    ))}
                                    {isSearchLoading && <li className="loading-text">Loading more...</li>}
                                </ul>
                            </div>
                        )}
                    </form>
                </div>

                <div className="header-right">
                    <Link to="/wishlist" className="header-action-btn btn-wishlist desktop-only">WISHLIST</Link>
                    <div className="desktop-only">
                        {user ? (
                            <div className="user-menu-container" ref={dropdownRef}>
                                <button className="header-action-btn btn-account" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}>MY ACCOUNT</button>
                                {isUserDropdownOpen && (
                                    <div className="dropdown-menu">
                                        <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="dropdown-item" onClick={() => setIsUserDropdownOpen(false)}>Dashboard</Link>
                                        <button onClick={() => { logout(); setIsUserDropdownOpen(false); }} className="dropdown-item logout">Logout</button>
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

            <nav className="category-nav desktop-only" onMouseLeave={handleCategoryMouseLeave}>
                {loadingCategories ? (
                    <p className="loading-text">Loading Categories...</p>
                ) : (
                    categories.map((category) => (
                        <div key={category.id} className="category-item-wrapper" onMouseEnter={() => handleCategoryMouseEnter(category.id)}>
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
            {isBrandMenuOpen && (
                <div className="brands-mega-menu"
                     onMouseEnter={handleBrandMouseEnter}
                     onMouseLeave={handleBrandMouseLeave}
                >
                    {isLoadingBrands ? (
                        <p className="loading-text">Loading Brands...</p>
                    ) : brandMenuData && (
                        <div className="brands-mega-menu-content">
                            <div className="brands-menu-left">

                                <div className="brand-list-scrollable">

                                    {/* Top Brands Section */}
                                    <div className="brand-section">
                                        <h4 className="brand-section-title">TOP BRANDS</h4>
                                        <ul>
                                            {brandMenuData.topBrands.map(brand => (
                                                <li key={brand.id}>
                                                    <Link to={`/brand/${brand.slug}`}>
                                                        {brand.name}
                                                        <span className="brand-product-count">{brand.productCount}</span>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* All Brands Section */}
                                    <div className="brand-section">
                                        <h4 className="brand-section-title">ALL BRANDS</h4>
                                        {Object.keys(groupedBrands).sort().map(letter => (
                                            <div key={letter} className="brand-group" id={`brand-group-${letter}`}>
                                                <h5 className="brand-letter-title">{letter}</h5>
                                                <ul>
                                                    {groupedBrands[letter].map(brand => (
                                                        <li key={brand.id}>
                                                            <Link to={`/brand/${brand.slug}`}>
                                                                {brand.name}
                                                                <span className="brand-product-count">{brand.productCount}</span>
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="brands-menu-right">
                                <div className="alphabet-index">
                                    {alphabet.map(char => (
                                        <a href={`#brand-group-${char}`} key={char}>{char}</a>
                                    ))}
                                </div>
                                <div className="top-brands-grid">
                                    <h4>TOP BRANDS</h4>
                                    <div className="logo-grid">
                                        {brandMenuData.topBrands.map(brand => (
                                            <Link to={`/brand/${brand.slug}`} key={brand.id} className="brand-logo-item">
                                                <img src={brand.logoUrl} alt={brand.name} />
                                                <p>{brand.name}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};

export default Header;

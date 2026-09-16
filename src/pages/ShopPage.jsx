

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useMatch, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axiosInstance from '../api/AxiosInstance';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-hot-toast';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './ShopPage.css';
import { slugify } from '../utils/slugify';

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

const ShopPage = () => {
    const location = useLocation();
    const { slug } = useParams();
    const initialState = location.state || {};

    const isBrandPage = !!useMatch("/brand/:slug");
    const isCategoryPage = !!useMatch("/category/:slug");
    const isSubCategoryPage = !!useMatch("/subcategory/:slug");

    const [products, setProducts] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [filterData, setFilterData] = useState(null);
    // True only when a /category|brand|subcategory/:slug URL was loaded
    // directly (no React Router state) AND the slug didn't match anything -
    // used to show a friendly message and keep the page out of the index.
    const [filterNotFound, setFilterNotFound] = useState(false);

    // Mobile filter popup state
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const [selectedBrandId, setSelectedBrandId] = useState(isBrandPage ? initialState.brandId : null);
    const [selectedBrandName, setSelectedBrandName] = useState(isBrandPage ? initialState.brandName : null);

    const [selectedCategoryId, setSelectedCategoryId] = useState(
        isCategoryPage ? initialState.categoryId : (isSubCategoryPage ? initialState.categoryId : null)
    );
    const [selectedCategoryName, setSelectedCategoryName] = useState(
        isCategoryPage ? initialState.categoryName : (isSubCategoryPage ? initialState.categoryName : null)
    );

    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(
        isSubCategoryPage ? initialState.subcategoryId : null
    );
    const [selectedSubCategoryName, setSelectedSubCategoryName] = useState(
        isSubCategoryPage ? initialState.subcategoryName : null
    );

    const [priceRange, setPriceRange] = useState(null);
    const [debouncedPriceRange, setDebouncedPriceRange] = useState(null);
    const [selectedTagId, setSelectedTagId] = useState(null);
    const [sortOption, setSortOption] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [brandSearchQuery, setBrandSearchQuery] = useState('');
    const [showAllBrands, setShowAllBrands] = useState(false);

    const debounceTimeout = useRef(null);
    const observerTarget = useRef(null);

    const fetchFilterData = useCallback(async () => {
        try {
            const params = {
                brandId: selectedBrandId,
                categoryId: selectedCategoryId,
                subCategoryId: selectedSubCategoryId,
            };
            Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);

            const response = await axiosInstance.get(`/api/v1/product/filters`, { params });
            const data = response.data.data;
            setFilterData(data);

            if (data.minPrice != null && data.maxPrice != null) {
                const initialRange = [data.minPrice, data.maxPrice];
                setPriceRange(initialRange);
                setDebouncedPriceRange(initialRange);
            } else {
                setPriceRange([0, 0]);
                setDebouncedPriceRange([0, 0]);
            }
        } catch (error) {
            console.error("Error fetching filter data:", error);
        }
    }, [selectedBrandId, selectedCategoryId, selectedSubCategoryId]);

    const fetchProducts = useCallback(async (currentPage) => {
        if (!debouncedPriceRange) return;
        if (loading && currentPage > 0) return;

        setLoading(true);
        try {
            const params = {
                brandId: selectedBrandId,
                categoryId: selectedCategoryId,
                subCategoryId: selectedSubCategoryId,
                tagId: selectedTagId,
                pageNo: currentPage,
                pageSize: 12,
                minPrice: debouncedPriceRange[0],
                maxPrice: debouncedPriceRange[1],
            };
            if (sortOption) {
                const [property, direction] = sortOption.split(',');
                params.sortBy = property;
                params.sortDir = direction;
            }
            Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);

            const response = await axiosInstance.get('/api/v1/product/search', { params });
            const data = response.data.data;

            if (currentPage === 0) setProducts(data.content || []);
            else setProducts(prev => [...prev, ...(data.content || [])]);

            setHasMore(!data.last);
            setPageNo(currentPage);
        } catch (error) {
            toast.error("Could not load products.");
        } finally {
            setLoading(false);
        }
    }, [debouncedPriceRange, selectedBrandId, selectedCategoryId, selectedSubCategoryId, selectedTagId, sortOption]);

    useEffect(() => {
        fetchFilterData();
    }, [fetchFilterData]);

    useEffect(() => {
        fetchProducts(0);
    }, [debouncedPriceRange, selectedBrandId, selectedCategoryId, selectedSubCategoryId, selectedTagId, sortOption, fetchProducts]);

    // Resolve which brand/category/subcategory this page is for.
    //
    // IMPORTANT: this used to trust React Router's `location.state` alone,
    // which only exists when the user clicked a link from inside the app.
    // A direct page load - a search engine crawling /category/lipstick from
    // the sitemap, a shared link, or a plain refresh - has no state, so the
    // page silently fell back to showing every product instead of the
    // category. We now resolve the slug against the live category/brand
    // list from the API every time, which makes these URLs work on their
    // own. `location.state` is still used as an instant "fast path" so
    // in-app navigation still feels immediate while that request is in flight.
    useEffect(() => {
        let isCancelled = false;

        const resolveFilterFromUrl = async () => {
            setFilterNotFound(false);
            setSelectedBrandId(null);
            setSelectedBrandName(null);
            setSelectedCategoryId(null);
            setSelectedCategoryName(null);
            setSelectedSubCategoryId(null);
            setSelectedSubCategoryName(null);
            setProducts([]);
            setPageNo(0);
            setHasMore(true);

            // Plain /shop - no filter to resolve.
            if (!isBrandPage && !isCategoryPage && !isSubCategoryPage) return;

            const navState = location.state || {};

            // Fast path: an in-app link already told us the exact id/name.
            if (isBrandPage && navState.brandId) {
                setSelectedBrandId(navState.brandId);
                setSelectedBrandName(navState.brandName);
            } else if (isSubCategoryPage && navState.subcategoryId) {
                setSelectedCategoryId(navState.categoryId);
                setSelectedCategoryName(navState.categoryName);
                setSelectedSubCategoryId(navState.subcategoryId);
                setSelectedSubCategoryName(navState.subcategoryName);
            } else if (isCategoryPage && navState.categoryId) {
                setSelectedCategoryId(navState.categoryId);
                setSelectedCategoryName(navState.categoryName);
            }

            // Authoritative path: always confirm/resolve straight from the
            // URL slug so the page works with no state at all.
            try {
                const response = await axiosInstance.get('/api/v1/product/filters');
                if (isCancelled) return;
                const data = response.data.data;

                if (isBrandPage) {
                    const match = data.availableBrands?.find(b => slugify(b.brandName) === slug);
                    if (match) {
                        setSelectedBrandId(match.brandId);
                        setSelectedBrandName(match.brandName);
                    } else if (!navState.brandId) {
                        setFilterNotFound(true);
                    }
                } else if (isSubCategoryPage) {
                    let found = false;
                    for (const cat of data.availableCategories || []) {
                        const sub = cat.subCategories?.find(s => slugify(s.subCategoryName) === slug);
                        if (sub) {
                            setSelectedCategoryId(cat.categoryId);
                            setSelectedCategoryName(cat.categoryName);
                            setSelectedSubCategoryId(sub.subCategoryId);
                            setSelectedSubCategoryName(sub.subCategoryName);
                            found = true;
                            break;
                        }
                    }
                    if (!found && !navState.subcategoryId) setFilterNotFound(true);
                } else if (isCategoryPage) {
                    const match = data.availableCategories?.find(c => slugify(c.categoryName) === slug);
                    if (match) {
                        setSelectedCategoryId(match.categoryId);
                        setSelectedCategoryName(match.categoryName);
                    } else if (!navState.categoryId) {
                        setFilterNotFound(true);
                    }
                }
            } catch (error) {
                console.error("Error resolving category/brand from slug:", error);
            }
        };

        resolveFilterFromUrl();
        return () => { isCancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname, slug, isBrandPage, isCategoryPage, isSubCategoryPage]);

    const handlePriceChange = (newRange) => {
        setPriceRange(newRange);
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => { setDebouncedPriceRange(newRange); }, 500);
    };

    const handleBrandClick = (brand) => {
        const newId = selectedBrandId === brand.brandId ? null : brand.brandId;
        setSelectedBrandId(newId);
        setSelectedBrandName(newId ? brand.brandName : null);
        setSelectedCategoryId(null);
        setSelectedCategoryName(null);
        setSelectedSubCategoryId(null);
        setSelectedSubCategoryName(null);
        setSelectedTagId(null);
    };

    const handleCategoryClick = (id, name) => {
        const newId = selectedCategoryId === id ? null : id;
        setSelectedCategoryId(newId);
        setSelectedCategoryName(newId ? name : null);
        setSelectedSubCategoryId(null);
        setSelectedSubCategoryName(null);
    };

    const handleSubCategoryClick = (id, name) => {
        const newId = selectedSubCategoryId === id ? null : id;
        setSelectedSubCategoryId(newId);
        setSelectedSubCategoryName(newId ? name : null);
    };

    const handleTagClick = (id) => {
        setSelectedTagId(prevId => prevId === id ? null : id);
    };

    const removeFilter = (filterType) => {
        if (filterType === 'brand') { setSelectedBrandId(null); setSelectedBrandName(null); }
        if (filterType === 'price' && filterData) {
            if (filterData.minPrice !== null) {
                const initialPrice = [filterData.minPrice, filterData.maxPrice];
                setPriceRange(initialPrice);
                setDebouncedPriceRange(initialPrice);
            }
        }
        if (filterType === 'category') { setSelectedCategoryId(null); setSelectedCategoryName(null); setSelectedSubCategoryId(null); setSelectedSubCategoryName(null); }
        if (filterType === 'subcategory') { setSelectedSubCategoryId(null); setSelectedSubCategoryName(null); }
        if (filterType === 'tag') { setSelectedTagId(null); }
    };

    const clearAllFilters = () => {
        removeFilter('brand');
        removeFilter('price');
        removeFilter('category');
        removeFilter('tag');
        setSortOption('');
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    fetchProducts(pageNo + 1);
                }
            },
            { root: null, rootMargin: '600px', threshold: 0 }
        );

        const target = observerTarget.current;
        if (target) observer.observe(target);

        return () => { if (target) observer.unobserve(target); };
    }, [loading, hasMore, pageNo, fetchProducts]);

    const displayedProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const areFiltersActive = selectedBrandId || selectedCategoryId || selectedSubCategoryId || selectedTagId || (filterData && priceRange && (filterData.minPrice !== null && (priceRange[0] > filterData.minPrice || priceRange[1] < filterData.maxPrice)));
    const filteredBrands = filterData?.availableBrands?.filter(brand => brand.brandName.toLowerCase().includes(brandSearchQuery.toLowerCase())) || [];
    const brandsToShow = showAllBrands ? filteredBrands : filteredBrands.slice(0, 15);

    // ================= SEO: page-level title / description / heading =================
    const pageHeading = isBrandPage
        ? (selectedBrandName || 'Brand')
        : isSubCategoryPage
            ? (selectedSubCategoryName || 'Products')
            : isCategoryPage
                ? (selectedCategoryName || 'Category')
                : 'Shop All Products';

    const pageTitle = !isBrandPage && !isCategoryPage && !isSubCategoryPage
        ? 'Shop All Products | BeautyHaat'
        : `${pageHeading} | BeautyHaat`;

    const pageDescription = isBrandPage
        ? `Shop genuine ${selectedBrandName || 'brand'} products online at BeautyHaat with fast delivery across Bangladesh.`
        : isSubCategoryPage
            ? `Browse ${selectedSubCategoryName || ''} products online at BeautyHaat with fast delivery across Bangladesh.`
            : isCategoryPage
                ? `Shop the best ${selectedCategoryName || ''} products online at BeautyHaat with fast delivery across Bangladesh.`
                : 'Browse the full range of makeup, skincare, haircare and personal care products at BeautyHaat, with fast delivery across Bangladesh.';

    const canonicalUrl = `https://beautyhaat.com${location.pathname}`;

    // ItemList schema: tells Google this page lists these specific products
    // (separate from, and complementary to, the Product schema on each
    // product's own detail page).
    const itemListSchema = products.length > 0 ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": products.slice(0, 24).map((p, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://beautyhaat.com/product/${p.slug || p.productId}`,
            "name": p.name,
            ...(p.imageUrl ? { "image": p.imageUrl } : {})
        }))
    } : null;

    const breadcrumbItems = [
        { name: "Home", item: "https://beautyhaat.com/" }
    ];
    if (isBrandPage) {
        breadcrumbItems.push({ name: pageHeading, item: canonicalUrl });
    } else if (isCategoryPage) {
        breadcrumbItems.push({ name: pageHeading, item: canonicalUrl });
    } else if (isSubCategoryPage) {
        if (selectedCategoryName) {
            breadcrumbItems.push({ name: selectedCategoryName, item: `https://beautyhaat.com/category/${slugify(selectedCategoryName)}` });
        }
        breadcrumbItems.push({ name: pageHeading, item: canonicalUrl });
    } else {
        breadcrumbItems.push({ name: "Shop", item: canonicalUrl });
    }

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": crumb.item
        }))
    };
    // ====================================================================================

    return (
        <div className="shop-page-container">

            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={canonicalUrl} />
                {filterNotFound && <meta name="robots" content="noindex, follow" />}

                {/* Open Graph / Facebook & WhatsApp link previews */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content={canonicalUrl} />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />

                {itemListSchema && (
                    <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
                )}
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            </Helmet>

            {/* Mobile Filter Backdrop */}
            {isMobileFilterOpen && (
                <div className="mobile-filter-overlay" onClick={() => setIsMobileFilterOpen(false)}></div>
            )}

            {/* Sidebar Filter Drawer / Desktop Sidebar */}
            <aside className={`sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
                <div className="sidebar-header-mobile">
                    <h3>Filters</h3>
                    <button className="close-filter-btn" onClick={() => setIsMobileFilterOpen(false)}>&times;</button>
                </div>

                {filterData ? (
                    <div className="sidebar-scrollable-content">
                        <div className="filter-block">
                            <h4>Filter by Price</h4>
                            <div className="price-slider-wrapper">
                                <Slider
                                    range
                                    min={filterData.minPrice !== null ? filterData.minPrice : 0}
                                    max={filterData.maxPrice !== null ? filterData.maxPrice : 100}
                                    value={filterData.minPrice !== null && priceRange ? priceRange : [0, 100]}
                                    disabled={filterData.minPrice === null}
                                    onChange={handlePriceChange}
                                    allowCross={false}
                                />
                                <div className="price-slider-labels">
                                    <span>৳{filterData.minPrice !== null && priceRange ? priceRange[0] : ''}</span>
                                    <span>৳{filterData.maxPrice !== null && priceRange ? priceRange[1] : ''}</span>
                                </div>
                            </div>
                        </div>

                        {filterData.availableCategories?.length > 0 && (
                            <div className="filter-block">
                                <h4>Product Categories</h4>
                                <ul className="category-filter-list">
                                    {filterData.availableCategories.map(cat => (
                                        <React.Fragment key={cat.categoryId}>
                                            <li className={`category-item parent ${selectedCategoryId === cat.categoryId ? 'active' : ''}`} onClick={() => handleCategoryClick(cat.categoryId, cat.categoryName)}>
                                                <span>{cat.categoryName}</span>
                                                <span className="filter-count-badge">{cat.productCount}</span>
                                            </li>
                                            {selectedCategoryId === cat.categoryId && cat.subCategories?.length > 0 && (
                                                <ul className="subcategory-list">
                                                    {cat.subCategories.map(sub => (
                                                        <li key={sub.subCategoryId} className={`category-item sub ${selectedSubCategoryId === sub.subCategoryId ? 'active' : ''}`} onClick={() => handleSubCategoryClick(sub.subCategoryId, sub.subCategoryName)}>
                                                            <span>{sub.subCategoryName}</span>
                                                            <span className="filter-count-badge">{sub.productCount}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {filterData.availableTags?.length > 0 && (
                            <div className="filter-block">
                                <h4>Tags</h4>
                                <ul className="category-filter-list">
                                    {filterData.availableTags.map(tag => (<li key={tag.tagId} className={`category-item ${selectedTagId === tag.tagId ? 'active' : ''}`} onClick={() => handleTagClick(tag.tagId)}><span>{tag.tagName}</span><span className="filter-count-badge">{tag.productCount}</span></li>))}
                                </ul>
                            </div>
                        )}

                        {filterData.availableBrands?.length > 0 && (
                            <div className="filter-block">
                                <h4>Filter by Brand</h4>
                                <div className="filter-search-wrapper"><input type="text" placeholder="Search brand..." value={brandSearchQuery} onChange={(e) => setBrandSearchQuery(e.target.value)} /></div>
                                <ul className="category-filter-list">{brandsToShow.map(brand => (<li key={brand.brandId} className={`category-item ${selectedBrandId === brand.brandId ? 'active' : ''}`} onClick={() => handleBrandClick(brand)}><span>{brand.brandName}</span><span className="filter-count-badge">{brand.productCount}</span></li>))}</ul>
                                {filteredBrands.length > 15 && !showAllBrands && (<button className="show-more-btn" onClick={() => setShowAllBrands(true)}>Show More</button>)}
                            </div>
                        )}

                        <div className="mobile-filter-footer">
                            <button className="apply-filters-btn" onClick={() => setIsMobileFilterOpen(false)}>Apply Filters</button>
                        </div>
                    </div>
                ) : <p className="no-filter-message">Loading filters...</p>}
            </aside>

            {/* Main Content Section */}
            <main className="main-content">

                <h1 className="shop-page-heading">{pageHeading}</h1>

                {filterNotFound && (
                    <p className="end-of-results">
                        We couldn't find that {isBrandPage ? 'brand' : isSubCategoryPage ? 'subcategory' : 'category'}. Showing all products instead.
                    </p>
                )}

                {/* Sticky Controls Header: Search + Filter Toggle + Sorting */}
                <div className="sticky-top-controls">

                    {/* Search Bar within current results */}
                    <div className="main-search-bar-wrapper">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input
                            type="text"
                            placeholder="Search within these results..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Toggle + Sorting Dropdown */}
                    <div className="page-header">
                        <button className="mobile-filter-toggle" onClick={() => setIsMobileFilterOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="4" y1="21" x2="4" y2="14"></line>
                                <line x1="4" y1="10" x2="4" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12" y2="3"></line>
                                <line x1="20" y1="21" x2="20" y2="16"></line>
                                <line x1="20" y1="12" x2="20" y2="3"></line>
                                <line x1="1" y1="14" x2="7" y2="14"></line>
                                <line x1="9" y1="8" x2="15" y2="8"></line>
                                <line x1="17" y1="16" x2="23" y2="16"></line>
                            </svg>
                            All Filters
                        </button>

                        <select className="sort-dropdown" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                            <option value="">Default Sorting</option>
                            <option value="name,asc">Sort by Name (A-Z)</option>
                            <option value="name,desc">Sort by Name (Z-A)</option>
                            <option value="quantity,asc">Sort by Stock (Low to High)</option>
                            <option value="quantity,desc">Sort by Stock (High to Low)</option>
                            <option value="discountedPrice,asc">Sort by Price (Low to High)</option>
                            <option value="discountedPrice,desc">Sort by Price (High to Low)</option>
                        </select>
                    </div>

                    {/* Active Filters */}
                    {areFiltersActive && (
                        <div className="active-filters">
                            {selectedBrandId && (<div className="filter-pill"><span>{selectedBrandName}</span><button onClick={() => removeFilter('brand')}>&times;</button></div>)}
                            {selectedCategoryId && (<div className="filter-pill"><span>{selectedCategoryName}</span><button onClick={() => removeFilter('category')}>&times;</button></div>)}
                            {selectedSubCategoryId && (<div className="filter-pill"><span>{selectedSubCategoryName}</span><button onClick={() => removeFilter('subcategory')}>&times;</button></div>)}
                            {filterData && priceRange && (filterData.minPrice !== null && (priceRange[0] > filterData.minPrice || priceRange[1] < filterData.maxPrice)) && (<div className="filter-pill"><span>Price: ৳{priceRange[0]} - ৳{priceRange[1]}</span><button onClick={() => removeFilter('price')}>&times;</button></div>)}
                            {selectedTagId && (<div className="filter-pill"><span>{filterData?.availableTags?.find(t => t.tagId === selectedTagId)?.tagName}</span><button onClick={() => removeFilter('tag')}>&times;</button></div>)}
                            <button className="clear-all-btn" onClick={clearAllFilters}>Clear all</button>
                        </div>
                    )}
                </div>

                {/* Product Grid & Loading Skeletons */}
                <div className="product-grid-brand">
                    {/* Render actual products */}
                    {displayedProducts.map(product => (
                        <ProductCard key={product.productId} product={product} />
                    ))}

                    {/* Render Skeleton Cards when loading */}
                    {loading && [...Array(products.length === 0 ? 12 : 4)].map((_, index) => (
                        <SkeletonCard key={`skeleton-${index}`} />
                    ))}
                </div>

                {/* Scroll Observer Target */}
                <div ref={observerTarget} style={{ height: '10px' }}></div>

                {/* State Messages */}
                {!loading && products.length === 0 && (
                    <p className="end-of-results">No products found for your selection.</p>
                )}
                {!loading && products.length > 0 && displayedProducts.length === 0 && (
                    <p className="end-of-results">No products match your search.</p>
                )}
                {!loading && !hasMore && displayedProducts.length > 0 && (
                    <p className="end-of-results">You've reached the end of the list.</p>
                )}
            </main>
        </div>
    );
};

export default ShopPage;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-hot-toast';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './BrandPage.css';

const BrandPage = () => {
    const { slug } = useParams();
    const location = useLocation();
    const initialBrand = location.state || {};

    const [products, setProducts] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [filterData, setFilterData] = useState(null);
    const [selectedBrandId, setSelectedBrandId] = useState(initialBrand.brandId);
    const [selectedBrandName, setSelectedBrandName] = useState(initialBrand.brandName);
    const [priceRange, setPriceRange] = useState(null);
    const [debouncedPriceRange, setDebouncedPriceRange] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const [selectedTagId, setSelectedTagId] = useState(null);
    const [sortOption, setSortOption] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [brandSearchQuery, setBrandSearchQuery] = useState('');
    const [showAllBrands, setShowAllBrands] = useState(false);
    const debounceTimeout = useRef(null);

    const fetchFilterData = useCallback(async () => {
        try {
            const params = { brandId: selectedBrandId };
            const response = await axiosInstance.get(`/api/v1/product/filters`, { params });
            const data = response.data.data;
            setFilterData(data);
            if (data.minPrice != null && data.maxPrice != null) {
                const initialRange = [data.minPrice, data.maxPrice];
                setPriceRange(initialRange);
                setDebouncedPriceRange(initialRange);
            }
        } catch (error) { console.error("Error fetching filter data:", error); }
    }, [selectedBrandId]);

    // --- THIS FUNCTION IS UPDATED ---
    const fetchProducts = useCallback(async (currentPage) => {
        if (!debouncedPriceRange) return;
        if (loading && currentPage > 0) return;
        setLoading(true);
        try {
            const params = {
                brandId: selectedBrandId,
                pageNo: currentPage,
                pageSize: 12,
                minPrice: debouncedPriceRange[0],
                maxPrice: debouncedPriceRange[1],
                categoryId: selectedCategoryId,
                subCategoryId: selectedSubCategoryId,
                tagId: selectedTagId,
            };

            // Updated logic to send sortBy and sortDir
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
        } catch (error) { toast.error("Could not load products."); }
        finally { setLoading(false); }
    }, [debouncedPriceRange, selectedBrandId, selectedCategoryId, selectedSubCategoryId, selectedTagId, sortOption]);

    useEffect(() => {
        fetchFilterData();
    }, [selectedBrandId, fetchFilterData]);

    useEffect(() => {
        fetchProducts(0);
    }, [debouncedPriceRange, selectedBrandId, selectedCategoryId, selectedSubCategoryId, selectedTagId, sortOption, fetchProducts]);

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
        setSelectedSubCategoryId(null);
        setSelectedTagId(null);
    };
    const handleCategoryClick = (id) => {
        const newId = selectedCategoryId === id ? null : id;
        setSelectedCategoryId(newId);
        setSelectedSubCategoryId(null);
    };
    const handleSubCategoryClick = (id) => {
        const newId = selectedSubCategoryId === id ? null : id;
        setSelectedSubCategoryId(newId);
    };
    const handleTagClick = (id) => {
        const newId = selectedTagId === id ? null : id;
        setSelectedTagId(newId);
    };
    const toggleExpandCategory = (categoryId) => {
        const newSet = new Set(expandedCategories);
        if (newSet.has(categoryId)) newSet.delete(categoryId);
        else newSet.add(categoryId);
        setExpandedCategories(newSet);
    };
    const removeFilter = (filterType) => {
        if (filterType === 'brand') { setSelectedBrandId(null); setSelectedBrandName(null); }
        if (filterType === 'price' && filterData) {
            const initialPrice = [filterData.minPrice, filterData.maxPrice];
            setPriceRange(initialPrice);
            setDebouncedPriceRange(initialPrice);
        }
        if (filterType === 'category') setSelectedCategoryId(null);
        if (filterType === 'subcategory') setSelectedSubCategoryId(null);
        if (filterType === 'tag') setSelectedTagId(null);
    };
    const clearAllFilters = () => {
        removeFilter('brand');
        removeFilter('price');
        removeFilter('category');
        removeFilter('subcategory');
        removeFilter('tag');
        setSortOption('');
    };

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200 && hasMore && !loading) {
                fetchProducts(pageNo + 1);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore, pageNo, fetchProducts]);

    const displayedProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const areFiltersActive = selectedBrandId || selectedCategoryId || selectedSubCategoryId || selectedTagId || (filterData && priceRange && (priceRange[0] !== filterData.minPrice || priceRange[1] !== filterData.maxPrice));

    const filteredBrands = filterData?.availableBrands?.filter(brand =>
        brand.brandName.toLowerCase().includes(brandSearchQuery.toLowerCase())
    ) || [];
    const brandsToShow = showAllBrands ? filteredBrands : filteredBrands.slice(0, 15);

    return (
        <div className="brand-page-container">
            <aside className="sidebar">
                {filterData ? (
                    <>
                        <div className="filter-block">
                            <h4>Filter by Price</h4>
                            <div className="price-slider-wrapper">
                                <Slider
                                    range
                                    // If a real price range exists, use it. Otherwise, use a dummy 0-100 range for visuals.
                                    min={filterData.minPrice !== null ? filterData.minPrice : 0}
                                    max={filterData.maxPrice !== null ? filterData.maxPrice : 100}

                                    // If a real range exists, use the state. Otherwise, set handles to the ends of the dummy range.
                                    value={filterData.minPrice !== null && priceRange ? priceRange : [0, 100]}

                                    // The slider is disabled if no minPrice is returned from the API.
                                    disabled={filterData.minPrice === null}

                                    onChange={handlePriceChange}
                                    allowCross={false}
                                />
                                <div className="price-slider-labels">
                                    {/* Only show numbers if a real price range exists */}
                                    <span>৳{filterData.minPrice !== null && priceRange ? priceRange[0] : ''}</span>
                                    <span>৳{filterData.maxPrice !== null && priceRange ? priceRange[1] : ''}</span>
                                </div>
                            </div>
                        </div>
                        <div className="filter-block">
                            <h4>Product Categories</h4>
                            <ul className="category-filter-list">
                                {filterData.availableCategories?.map(cat => (
                                    <React.Fragment key={cat.categoryId}>
                                        <li className={`category-item parent ${selectedCategoryId === cat.categoryId ? 'active' : ''}`} onClick={() => handleCategoryClick(cat.categoryId)}>
                                            <span>{cat.categoryName}</span>
                                            <span className="filter-count-badge">{cat.productCount}</span>
                                        </li>
                                        { (selectedCategoryId === cat.categoryId || expandedCategories.has(cat.categoryId)) && cat.subCategories?.length > 0 && (
                                            <ul className="subcategory-list">
                                                {cat.subCategories.map(sub => (
                                                    <li key={sub.subCategoryId} className={`category-item sub ${selectedSubCategoryId === sub.subCategoryId ? 'active' : ''}`} onClick={() => handleSubCategoryClick(sub.subCategoryId)}>
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
                        {filterData.availableTags?.length > 0 && (
                            <div className="filter-block">
                                <h4>Tags</h4>
                                <ul className="category-filter-list">
                                    {filterData.availableTags?.map(tag => (
                                        <li key={tag.tagId} className={`category-item ${selectedTagId === tag.tagId ? 'active' : ''}`} onClick={() => handleTagClick(tag.tagId)}>
                                            <span>{tag.tagName}</span>
                                            <span className="filter-count-badge">{tag.productCount}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {filterData.availableBrands?.length > 0 && (
                            <div className="filter-block">
                                <h4>Filter by Brand</h4>
                                <div className="filter-search-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Search brand..."
                                        value={brandSearchQuery}
                                        onChange={(e) => setBrandSearchQuery(e.target.value)}
                                    />
                                </div>
                                <ul className="category-filter-list">
                                    {brandsToShow.map(brand => (
                                        <li key={brand.brandId} className={`category-item ${selectedBrandId === brand.brandId ? 'active' : ''}`} onClick={() => handleBrandClick(brand)}>
                                            <span>{brand.brandName}</span>
                                            <span className="filter-count-badge">{brand.productCount}</span>
                                        </li>
                                    ))}
                                </ul>
                                {filteredBrands.length > 15 && !showAllBrands && (
                                    <button className="show-more-btn" onClick={() => setShowAllBrands(true)}>
                                        Show More
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                ) : <p>Loading filters...</p> }
            </aside>
            <main className="main-content">
                <div className="main-search-bar-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search within these results..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="page-header">
                    <div className="active-filters">
                        {selectedBrandId && (
                            <div className="filter-pill">
                                <span>{selectedBrandName}</span>
                                <button onClick={() => removeFilter('brand')}>&times;</button>
                            </div>
                        )}
                        {filterData && priceRange && (priceRange[0] > filterData.minPrice || priceRange[1] < filterData.maxPrice) && (
                            <div className="filter-pill">
                                <span>Price: ৳{priceRange[0]} - ৳{priceRange[1]}</span>
                                <button onClick={() => removeFilter('price')}>&times;</button>
                            </div>
                        )}
                        {selectedCategoryId && (
                            <div className="filter-pill">
                                <span>{filterData?.availableCategories?.find(c => c.categoryId === selectedCategoryId)?.categoryName}</span>
                                <button onClick={() => removeFilter('category')}>&times;</button>
                            </div>
                        )}
                        {selectedSubCategoryId && (
                            <div className="filter-pill">
                                <span>{filterData?.availableCategories?.flatMap(c => c.subCategories || []).find(sc => sc.subCategoryId === selectedSubCategoryId)?.subCategoryName}</span>
                                <button onClick={() => removeFilter('subcategory')}>&times;</button>
                            </div>
                        )}
                        {selectedTagId && (
                            <div className="filter-pill">
                                <span>{filterData?.availableTags?.find(t => t.tagId === selectedTagId)?.tagName}</span>
                                <button onClick={() => removeFilter('tag')}>&times;</button>
                            </div>
                        )}
                        {areFiltersActive && <button className="clear-all-btn" onClick={clearAllFilters}>Clear all</button>}
                    </div>
                    <select
                        className="sort-dropdown"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option value="">Default Sorting</option>
                        <option value="name,asc">Sort by Name (A-Z)</option>
                        <option value="name,desc">Sort by Name (Z-A)</option>
                        <option value="quantity,asc">Sort by Stock (Low to High)</option>
                        <option value="quantity,desc">Sort by Stock (High to Low)</option>
                        <option value="discountedPrice,asc">Sort by Price (Low to High)</option>
                        <option value="discountedPrice,desc">Sort by Price (High to Low)</option>
                    </select>
                </div>
                <div className="product-grid-brand">
                    {displayedProducts.map(product => <ProductCard key={product.productId} product={product} />)}
                </div>
                {loading && <p className="loading-indicator">Loading...</p>}
                {!loading && products.length > 0 && displayedProducts.length === 0 && <p className="end-of-results">No products match your search.</p>}
                {!loading && !hasMore && displayedProducts.length > 0 && <p className="end-of-results">You've reached the end of the list.</p>}
            </main>
        </div>
    );
};

export default BrandPage;
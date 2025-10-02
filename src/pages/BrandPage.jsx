import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-hot-toast';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './BrandPage.css';

const BrandPage = () => {
    const navigate = useNavigate();
    const { slug } = useParams();
    const location = useLocation();
    const initialBrand = location.state || {};

    // State for products and pagination
    const [products, setProducts] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // State for all available filter options
    const [filterData, setFilterData] = useState(null);

    // State for all selected filters
    const [selectedBrandId, setSelectedBrandId] = useState(initialBrand.brandId);
    const [selectedBrandName, setSelectedBrandName] = useState(initialBrand.brandName);
    const [priceRange, setPriceRange] = useState([0, 9999]);
    const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 9999]);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const [selectedTagId, setSelectedTagId] = useState(null);

    // UI State
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const debounceTimeout = useRef(null);

    // Fetch GLOBAL filter data (always includes all brands)
    useEffect(() => {
        const getInitialFilters = async () => {
            try {
                const response = await axiosInstance.get(`/api/v1/product/filters`);
                const data = response.data.data;
                setFilterData(data);
                if (data.minPrice != null && data.maxPrice != null) {
                    setPriceRange([data.minPrice, data.maxPrice]);
                    setDebouncedPriceRange([data.minPrice, data.maxPrice]);
                }
            } catch (error) { console.error("Error fetching initial filter data:", error); }
        };
        getInitialFilters();
    }, []);

    // Main function to fetch products based on all active filters
    const fetchProducts = useCallback(async (currentPage) => {
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
            Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);
            const response = await axiosInstance.get('/api/v1/product/search', { params });
            const data = response.data.data;
            if (currentPage === 0) setProducts(data.content || []);
            else setProducts(prev => [...prev, ...(data.content || [])]);
            setHasMore(!data.last);
            setPageNo(currentPage);
        } catch (error) { toast.error("Could not load products."); }
        finally { setLoading(false); }
    }, [debouncedPriceRange, selectedBrandId, selectedCategoryId, selectedSubCategoryId, selectedTagId]);

    // Refetch products whenever any filter changes
    useEffect(() => {
        fetchProducts(0);
    }, [debouncedPriceRange, selectedBrandId, selectedCategoryId, selectedSubCategoryId, selectedTagId, fetchProducts]);

    // Handler for price slider
    const handlePriceChange = (newRange) => {
        setPriceRange(newRange);
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            setDebouncedPriceRange(newRange);
        }, 500);
    };

    // Handlers for all filter selections
    const handleBrandClick = (brand) => {
        const newId = selectedBrandId === brand.brandId ? null : brand.brandId;
        setSelectedBrandId(newId);
        setSelectedBrandName(newId ? brand.brandName : null);
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

    // Handler to remove a specific filter pill
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

    // Clear all filters by resetting state
    const clearAllFilters = () => {
        removeFilter('brand');
        removeFilter('price');
        removeFilter('category');
        removeFilter('subcategory');
        removeFilter('tag');
    };

    // Infinite scroll handler
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 200 && hasMore && !loading) {
                fetchProducts(pageNo + 1);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore, pageNo, fetchProducts]);

    const areFiltersActive = selectedBrandId || selectedCategoryId || selectedSubCategoryId || selectedTagId || (filterData && (priceRange[0] !== filterData.minPrice || priceRange[1] !== filterData.maxPrice));

    return (
        <div className="brand-page-container">
            <aside className="sidebar">
                {filterData ? (
                    <>
                        <div className="filter-block">
                            <h4>Filter by Price</h4>
                            <div className="price-slider-wrapper">
                                <Slider range min={filterData.minPrice} max={filterData.maxPrice} value={priceRange} onChange={handlePriceChange} allowCross={false} />
                                <div className="price-slider-labels"><span>৳{priceRange[0]}</span><span>৳{priceRange[1]}</span></div>
                            </div>
                        </div>

                        {filterData.availableBrands?.length > 0 && (
                            <div className="filter-block">
                                <h4>Filter by Brand</h4>
                                <ul className="category-filter-list">
                                    {filterData.availableBrands.map(brand => (
                                        <li key={brand.brandId} className={`category-item ${selectedBrandId === brand.brandId ? 'active' : ''}`} onClick={() => handleBrandClick(brand)}>
                                            <span>{brand.brandName}</span>
                                            <span>{brand.productCount}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="filter-block">
                            <h4>Product Categories</h4>
                            <ul className="category-filter-list">
                                {filterData.availableCategories?.map(cat => (
                                    <React.Fragment key={cat.categoryId}>
                                        <li className={`category-item parent ${selectedCategoryId === cat.categoryId ? 'active' : ''}`} onClick={() => handleCategoryClick(cat.categoryId)}>
                                            <span>{cat.categoryName}</span>
                                            <span>{cat.productCount}</span>
                                        </li>
                                        { (selectedCategoryId === cat.categoryId || expandedCategories.has(cat.categoryId)) && cat.subCategories?.length > 0 && (
                                            <ul className="subcategory-list">
                                                {cat.subCategories.map(sub => (
                                                    <li key={sub.subCategoryId} className={`category-item sub ${selectedSubCategoryId === sub.subCategoryId ? 'active' : ''}`} onClick={() => handleSubCategoryClick(sub.subCategoryId)}>
                                                        <span>{sub.subCategoryName}</span>
                                                        <span>{sub.productCount}</span>
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
                                            <span>{tag.productCount}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : <p>Loading filters...</p> }
            </aside>
            <main className="main-content">
                <div className="page-header">
                    <div className="active-filters">
                        {selectedBrandId && (
                            <div className="filter-pill">
                                <span>{selectedBrandName}</span>
                                <button onClick={() => removeFilter('brand')}>&times;</button>
                            </div>
                        )}
                        {filterData && (priceRange[0] > filterData.minPrice || priceRange[1] < filterData.maxPrice) && (
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
                    <select className="sort-dropdown"><option value="default">Default sorting</option></select>
                </div>
                <div className="product-grid-brand">
                    {products.map(product => <ProductCard key={product.productId} product={product} />)}
                </div>
                {loading && <p className="loading-indicator">Loading...</p>}
                {!hasMore && products.length > 0 && <p className="end-of-results">You've reached the end of the list.</p>}
            </main>
        </div>
    );
};

export default BrandPage;
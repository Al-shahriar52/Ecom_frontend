import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/AxiosInstance';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-hot-toast';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import './BrandPage.css'; // We reuse the same CSS file

const AllProductsPage = () => {
    const navigate = useNavigate();

    // State for products and pagination
    const [products, setProducts] = useState([]);
    const [pageNo, setPageNo] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    // State for all available filters
    const [filterData, setFilterData] = useState(null);

    // State for currently selected filters
    const [priceRange, setPriceRange] = useState([0, 9999]);
    const [debouncedPriceRange, setDebouncedPriceRange] = useState([0, 9999]);
    const [selectedBrandId, setSelectedBrandId] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
    const [selectedTagId, setSelectedTagId] = useState(null);

    // UI State
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const debounceTimeout = useRef(null);

    // Fetch GLOBAL filter data when component mounts
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

    // Fetch products based on all currently active filters
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

    // Refetch products whenever a filter changes
    useEffect(() => {
        fetchProducts(0);
    }, [debouncedPriceRange, selectedBrandId, selectedCategoryId, selectedSubCategoryId, selectedTagId, fetchProducts]);

    // Handlers for all filter interactions
    const handlePriceChange = (newRange) => {
        setPriceRange(newRange);
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
            setDebouncedPriceRange(newRange);
        }, 500);
    };

    const handleBrandClick = (id) => {
        const newId = selectedBrandId === id ? null : id;
        setSelectedBrandId(newId);
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
        if (filterType === 'brand') setSelectedBrandId(null);
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
                                        <li key={brand.brandId} className={`category-item ${selectedBrandId === brand.brandId ? 'active' : ''}`} onClick={() => handleBrandClick(brand.brandId)}>
                                            <span>{brand.brandName}</span>
                                            <span>{brand.productCount}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="filter-block">
                            <h4>Product Categories</h4>
                            {/* Category & Subcategory mapping JSX */}
                        </div>

                        {filterData.availableTags?.length > 0 && (
                            <div className="filter-block">
                                <h4>Tags</h4>
                                {/* Tag mapping JSX */}
                            </div>
                        )}
                    </>
                ) : <p>Loading filters...</p> }
            </aside>
            <main className="main-content">
                <div className="page-header">
                    <div className="active-filters">
                        <span>All Products</span>
                        {/* Logic for dynamically showing active filter pills */}
                        {areFiltersActive && <button className="clear-all-btn" onClick={clearAllFilters}>Clear all</button>}
                    </div>
                    <select className="sort-dropdown"><option>Default sorting</option></select>
                </div>
                <div className="product-grid-brand">
                    {products.map(product => <ProductCard key={product.productId} product={product} />)}
                </div>
                {loading && <p className="loading-indicator">Loading...</p>}
            </main>
        </div>
    );
};

export default AllProductsPage;
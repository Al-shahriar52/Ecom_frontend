
import React, {useState, useEffect, useMemo} from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Admin.css';
import StarRating from '../../components/StarRating';
import axiosInstance from '../../api/AxiosInstance';

// Mock data is no longer needed as we are fetching from the API.

const ProductManagement = () => {
    // State for data fetched from the API
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ pageNo: 0, pageSize: 10, totalPages: 1 });

    const [categories, setCategories] = useState([]);
    // State for API query parameters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    //  useEffect to fetch categories when the component first loads
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axiosInstance.get('/api/v1/product/categories');
                setCategories(response.data.data || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
                toast.error("Could not load category filter options.");
            }
        };
        fetchCategories();
    }, []); // Empty array ensures this runs only once on mount

    // This useEffect hook is the core of the integration.
    // It re-fetches data from the API whenever a filter, sort, or page changes.
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Construct query parameters from the current state
                const params = {
                    pageNo: pagination.pageNo,
                    pageSize: pagination.pageSize,
                    sortBy: sortConfig.key,
                    sortDir: sortConfig.direction,
                    query: searchTerm,
                    category: categoryFilter === 'All' ? '' : categoryFilter,
                };

                const response = await axiosInstance.get('/api/v1/product/search', { params });
                const { content, pageNo, pageSize, totalPages } = response.data.data;

                setProducts(content || []);
                setPagination({ pageNo, pageSize, totalPages });

            } catch (error) {
                console.error("Error fetching products:", error);
                toast.error("Could not fetch product list.");
            }
        };

        fetchProducts();
    }, [pagination.pageNo, sortConfig, searchTerm, categoryFilter]); // Dependencies array

    // Updates the sort configuration, which triggers the useEffect to re-fetch
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Helper function to determine status based on quantity from the API response
    const getProductStatus = (quantity) => {
        if (quantity <= 0) return { text: 'Out of Stock', className: 'status-out-of-stock' };
        if (quantity < 5) return { text: 'Limited', className: 'status-limited' };
        return { text: 'In Stock', className: 'status-in-stock' };
    };

    const displayProducts = useMemo(() => {
        if (statusFilter === 'All') {
            return products;
        }
        return products.filter(product => {
            const statusText = getProductStatus(product.quantity).text;
            return statusText === statusFilter;
        });
    }, [products, statusFilter]);

    const getSortArrow = (key) => {
        if (sortConfig.key !== key) return '↑↓';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    const handleSortChange = (e) => {
        const [key, direction] = e.target.value.split('-');
        setSortConfig({ key, direction });
    };

    const handlePageChange = (newPageNo) => {
        setPagination(prev => ({ ...prev, pageNo: newPageNo }));
    };

    return (
        <div className="admin-page-content">
            <div className="content-card">
                <header className="page-header">
                    <div className="header-title-container">
                        <h2>Product Management</h2>
                        <Link to="/admin/products/add" className="btn-add-product">Add Product</Link>
                    </div>
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="In Stock">In Stock</option>
                            <option value="Limited">Limited</option>
                            <option value="Out of Stock">Out of Stock</option>
                        </select>
                        <select className="filter-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="filter-select"
                            onChange={handleSortChange}
                            value={`${sortConfig.key}-${sortConfig.direction}`}
                        >
                            <option value="name-asc">Sort by Name (A-Z)</option>
                            <option value="name-desc">Sort by Name (Z-A)</option>
                            <option value="quantity-asc">Sort by Stock (Low to High)</option>
                            <option value="quantity-desc">Sort by Stock (High to Low)</option>
                            <option value="discountedPrice-asc">Sort by Price (Low to High)</option>
                            <option value="discountedPrice-desc">Sort by Price (High to Low)</option>
                        </select>
                    </div>
                </header>

                <div className="product-list-wrapper">
                    <table className="product-table">
                        <colgroup>
                            <col className="col-image" />
                            <col className="col-name" />
                            <col className="col-category" />
                            <col className="col-stock" />
                            <col className="col-price" />
                            <col className="col-status" />
                            <col className="col-reviews" />
                            <col className="col-action" />
                        </colgroup>
                        <thead>
                        <tr>
                            <th>Image</th>
                            <th onClick={() => requestSort('name')} className="sortable-header">Product Name <span className="sort-arrow">{getSortArrow('name')}</span></th>
                            <th onClick={() => requestSort('category')} className="sortable-header">Category <span className="sort-arrow">{getSortArrow('category')}</span></th>
                            <th onClick={() => requestSort('quantity')} className="sortable-header">Stock <span className="sort-arrow">{getSortArrow('quantity')}</span></th>
                            <th onClick={() => requestSort('discountedPrice')} className="sortable-header">Price <span className="sort-arrow">{getSortArrow('discountedPrice')}</span></th>
                            <th>Status</th>
                            <th onClick={() => requestSort('rating')} className="sortable-header">Reviews <span className="sort-arrow">{getSortArrow('rating')}</span></th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {displayProducts.map(product => {
                            const status = getProductStatus(product.quantity);
                            return (
                                <tr key={product.productId}>
                                    {/* Table data cells */}
                                    <td><img src={product.imageUrl || "https://via.placeholder.com/40"} alt={product.name} className="product-image" /></td>
                                    <td className="td-product-name">{product.name}</td>
                                    <td>{product.categoryName}</td>
                                    <td>{product.quantity}</td>
                                    <td>৳{product.discountedPrice.toFixed(2)}</td>
                                    <td>
                                        <span className={`status-badge ${status.className}`}>{status.text}</span>
                                    </td>
                                    <td><StarRating rating={product.rating} /></td>
                                    <td>{/* Action Icons */}</td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button onClick={() => handlePageChange(pagination.pageNo - 1)} disabled={pagination.pageNo === 0}>
                        Previous
                    </button>
                    {[...Array(pagination.totalPages).keys()].map(number => (
                        <span key={number} className={pagination.pageNo === number ? 'active' : ''} onClick={() => handlePageChange(number)}>
                            {number + 1}
                        </span>
                    ))}
                    <button onClick={() => handlePageChange(pagination.pageNo + 1)} disabled={pagination.pageNo >= pagination.totalPages - 1}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;

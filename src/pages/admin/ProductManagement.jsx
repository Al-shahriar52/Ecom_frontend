
import React, { useState, useMemo } from 'react';
import './Admin.css';
import { Link } from 'react-router-dom';
import StarRating from '../../components/StarRating';

const mockProducts = [
    { id: 1, image: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1754715759/logo_xkwamd.png', name: 'Himalaya Brightening Vitamin C Bluberry Face Wash-100ml', category: 'Skin Care', stock: 12, price: 99.00, status: 'In Stock', reviews: 4.5 },
    { id: 2, image: 'https://i.imgur.com/gO0aYEr.jpeg', name: 'Himalaya Natural Glow Saffron Face Wash', category: 'Skin Care', stock: 3, price: 112.00, status: 'Limited', reviews: 4 },
    { id: 3, image: 'https://i.imgur.com/k2psCHT.jpeg', name: 'Himalaya Vitamin C Orange Face Wash-100ml', category: 'Skin Care', stock: 0, price: 99.00, status: 'Out of Stock', reviews: 5 },
    { id: 4, image: 'https://i.imgur.com/vTj3d2d.jpeg', name: 'Garnier Men Acno Fight Pimple Clearing Face Wash', category: 'Men Care', stock: 25, price: 150.00, status: 'In Stock', reviews: 3.2 },
    { id: 5, image: 'https://i.imgur.com/vTj3d2d.jpeg', name: 'Garnier Men Acno Fight Pimple Clearing Face Wash', category: 'Men Care', stock: 25, price: 150.00, status: 'In Stock', reviews: 4.5 },
    { id: 6, image: 'https://i.imgur.com/vTj3d2d.jpeg', name: 'Garnier Men Acno Fight Pimple Clearing Face Wash', category: 'Men Care', stock: 25, price: 150.00, status: 'In Stock', reviews: 2 },
    // Add more products to see pagination in action
];

const ProductManagement = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const productsPerPage = 5;

    // Sorting Logic
    const sortedProducts = useMemo(() => {
        let sortableProducts = [...mockProducts];
        if (sortConfig !== null) {
            sortableProducts.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableProducts;
    }, [mockProducts, sortConfig]);

    // Pagination Logic (uses the sorted products)
    const currentProducts = sortedProducts.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);
    const totalPages = Math.ceil(mockProducts.length / productsPerPage);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortArrow = (key) => {
        if (sortConfig.key !== key) return '↑↓';
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    const getStatusClass = (status) => {
        if (status === 'In Stock') return 'status-in-stock';
        if (status === 'Limited') return 'status-limited';
        if (status === 'Out of Stock') return 'status-out-of-stock';
        return '';
    };

    return (
        <div className="admin-page-content">
            <div className="content-card">
                <header className="page-header">
                    <h2>Product Management</h2>
                    <Link to="/admin/products/add" className="btn-add-product">
                        Add Product
                    </Link>
                    <div className="header-actions">
                        <input type="text" placeholder="Search..." className="search-input" />
                        <select className="filter-select">
                            <option>All Status</option>
                            <option>In stock</option>
                            <option>Out of stock</option>
                            <option>limited</option>
                        </select>
                        {/* New "All Categories" Dropdown */}
                        <select className="filter-select">
                            <option>All Categories</option>
                            <option>Skin Care</option>
                            <option>Men Care</option>
                            <option>Makeup</option>
                        </select>

                        {/* New "Sort by" Dropdown */}
                        <select className="filter-select">
                            <option>Sort by</option>
                            <option>Category</option>
                            <option>Stock</option>
                            <option>Price</option>
                            <option>Status</option>
                            <option>Reviews</option>
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
                            <col className="col-action" /> {/* 2. Correctly defined */}
                        </colgroup>
                        <thead>
                        <tr>
                            <th>Image</th>
                            <th onClick={() => requestSort('name')} className="sortable-header">
                                Product Name <span className="sort-arrow">{getSortArrow('name')}</span>
                            </th>
                            <th onClick={() => requestSort('category')} className="sortable-header">
                                Category <span className="sort-arrow">{getSortArrow('category')}</span>
                            </th>
                            <th onClick={() => requestSort('stock')} className="sortable-header">
                                Stock <span className="sort-arrow">{getSortArrow('stock')}</span>
                            </th>
                            <th onClick={() => requestSort('price')} className="sortable-header">
                                Price <span className="sort-arrow">{getSortArrow('price')}</span>
                            </th>
                            <th onClick={() => requestSort('status')} className="sortable-header">
                                Status <span className="sort-arrow">{getSortArrow('status')}</span>
                            </th>
                            <th onClick={() => requestSort('reviews')} className="sortable-header">
                                Reviews <span className="sort-arrow">{getSortArrow('reviews')}</span>
                            </th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentProducts.map(product => (
                            <tr key={product.id}>
                                <td><img src={product.image} alt={product.name} className="product-image" /></td>
                                <td className="td-product-name">{product.name}</td>
                                <td>{product.category}</td>
                                <td>{product.stock}</td>
                                <td>৳{product.price.toFixed(2)}</td>
                                <td><span className={`status-badge ${getStatusClass(product.status)}`}>{product.status}</span></td>
                                <td>
                                    <StarRating rating={product.reviews} />
                                </td>
                                <td>
                                    <div className="action-icons">
                                        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.13,5.12L18.88,8.87M3,17.25V21H6.75L17.81,9.94L14.06,6.19L3,17.25Z" /></svg>
                                        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" /></svg>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                        Previous
                    </button>
                    {[...Array(totalPages).keys()].map(number => (
                        <span key={number + 1} className={currentPage === number + 1 ? 'active' : ''} onClick={() => setCurrentPage(number + 1)}>
                            {number + 1}
                        </span>
                    ))}
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductManagement;
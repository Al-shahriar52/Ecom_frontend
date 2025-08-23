import React from 'react';
import './Admin.css';

const mockProducts = [
    { id: 1, image: 'https://res.cloudinary.com/dgxol8iyp/image/upload/v1754715759/logo_xkwamd.png', name: 'Himalaya Brightening Vitamin C Bluberry Face Wash-100ml', category: 'Skin Care', stock: 12, price: 99.00, status: 'In Stock' },
    { id: 2, image: 'https://i.imgur.com/gO0aYEr.jpeg', name: 'Himalaya Natural Glow Saffron Face Wash', category: 'Skin Care', stock: 3, price: 112.00, status: 'Limited' },
    { id: 3, image: 'https://i.imgur.com/k2psCHT.jpeg', name: 'Himalaya Vitamin C Orange Face Wash-100ml', category: 'Skin Care', stock: 0, price: 99.00, status: 'Out of Stock' },
    { id: 4, image: 'https://i.imgur.com/vTj3d2d.jpeg', name: 'Garnier Men Acno Fight Pimple Clearing Face Wash', category: 'Men Care', stock: 25, price: 150.00, status: 'In Stock' },
];

const ProductManagement = () => {
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
                    <div className="header-actions">
                        <input type="text" placeholder="Search..." className="search-input" />
                        <select className="filter-select"><option>All Status</option></select>
                        <select className="filter-select"><option>All Categories</option></select>
                        <button className="btn-add-product">Add Product</button>
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
                            <col className="col-status" /> {/* <-- ADD CLASSNAME HERE */}
                            <col className="col-reviews" />
                            <col className="col-action" />
                        </colgroup>
                        <thead>
                        <tr>
                            <th>Image</th> {/* Image */}
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Reviews</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mockProducts.map(product => (
                            <tr key={product.id}>
                                <td><img src={product.image} alt={product.name} className="product-image" /></td>
                                <td className="td-product-name">{product.name}</td>
                                <td>{product.category}</td>
                                <td>{product.stock}</td>
                                <td>৳{product.price.toFixed(2)}</td>
                                <td>
                                        <span className={`status-badge ${getStatusClass(product.status)}`}>
                                            {product.status}
                                        </span>
                                </td>
                                <td>★★★★☆</td>
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
                    <button disabled>Previous</button>
                    <span className="active">1</span>
                    <span>2</span>
                    <span>3</span>
                    <button>Next</button>
                </div>

            </div>
        </div>
    );
};

export default ProductManagement;
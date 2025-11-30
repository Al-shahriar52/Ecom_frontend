import React from 'react';
import '../../pages/admin/Admin.css';

const ProductSelectList = ({ products, onProductClick, actionType, onActionClick }) => {
    return (
        <ul className="product-select-list">
            {products.length === 0 && <li className="no-results">No products found.</li>}
            {products.map(product => {
                // This logic ensures we get a valid ID regardless of the property name
                const productId = product.productId || product.id;

                return (
                    <li key={productId}>
                        <div
                            className={`product-item-info ${onProductClick ? 'clickable' : ''}`}
                            onClick={() => onProductClick && onProductClick(product)}
                        >
                            <img src={product.imageUrl || '/placeholder.png'} alt={product.name} />
                            <span>{product.name}</span>
                        </div>
                        {actionType === 'add' && (
                            <button className="action-btn add-btn" onClick={() => onActionClick(productId)}>
                                Add
                            </button>
                        )}
                        {actionType === 'remove' && (
                            <button className="action-btn remove-btn" onClick={() => onActionClick(productId)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
};

export default ProductSelectList;
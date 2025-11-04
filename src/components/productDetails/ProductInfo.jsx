import React, { useState, useContext } from 'react';
import { CartContext } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './ProductInfo.css';
import ProductOffers from './ProductOffers';

const ProductInfo = ({ product }) => {
    const { addToCart } = useContext(CartContext);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        addToCart(product, quantity);
        toast.success(`${quantity} x ${product.name} added to cart!`);
    };

    const handleWishlistClick = () => {
        toast.success(`${product.name} added to wishlist!`);
    };

    const savedAmount = Math.round(product.originalPrice - product.discountedPrice);
    const discountPercentage = product.originalPrice > product.discountedPrice
        ? Math.round((savedAmount / product.originalPrice) * 100)
        : 0;

    return (
        <div className="info-container">
            <h1 className="pdp-title">{product.name}</h1>

            <div className="pdp-meta">
                <span>Size: <strong>{product.variations?.[0]?.size || 'N/A'}</strong></span>
                <span className="pdp-reviews">{product.rating} ★ | {product.numReviews || 'No'} Reviews</span>
            </div>

            <div className="pdp-price-section">
                <span className="pdp-current-price">৳{product.discountedPrice}</span>
                {discountPercentage > 0 && (
                    <>
                        <span className="pdp-original-price">৳{product.originalPrice}</span>
                        <span className="pdp-save-amount">Save ৳{savedAmount}</span>
                        <span className="pdp-discount-badge">{discountPercentage}% OFF</span>
                    </>
                )}
            </div>

            <div className="pdp-app-download">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download App for <a href="#">iOS</a> or <a href="#">Android</a>
            </div>

            <ProductOffers tagNames={product.tagNames} />

            <div className="pdp-actions-wrapper">
                <button className="pdp-wishlist-btn" onClick={handleWishlistClick}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <div className="pdp-quantity-selector">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(product.quantity || 1, q + 1))}>+</button>
                </div>
                <button className="pdp-add-to-cart-btn" onClick={handleAddToCart} disabled={product.quantity === 0}>
                    {product.quantity > 0 ? 'ADD TO CART' : 'OUT OF STOCK'}
                </button>
            </div>

            {product.quantity > 0 && product.quantity < 10 && (
                <div className="pdp-stock-warning">
                    🔥 Only {product.quantity} items left in stock
                </div>
            )}
            
            <div className="pdp-details-list">

                <div className="pdp-brief-description">
                    <span className="pdp-brief-label">Brief Description</span>
                    <div className="pdp-brief-content">
                        <p>
                            <strong><em>Please note: The packaging might be slightly scratched, distorted, torn, slightly dirty, or look old.</em></strong>
                            {' '}
                            {product.description.split('.').slice(0, 1).join('.') + '.'}
                        </p>
                        <a href="#full-description" className="read-more-link">Read More...</a>
                    </div>
                </div>
                <div className="pdp-detail-item">
                    <span className="pdp-detail-label">SKU:</span>
                    <span className="pdp-detail-value">{product.sku}</span>
                </div>
                <div className="pdp-detail-item">
                    <span className="pdp-detail-label">Categories:</span>
                    <span className="pdp-detail-value">{product.categoryNames}</span>
                </div>
                <div className="pdp-detail-item">
                    <span className="pdp-detail-label">Tags:</span>
                    <span className="pdp-detail-value">{product.tagNames}</span>
                </div>
                <div className="pdp-detail-item">
                    <span className="pdp-detail-label">Brand:</span>
                    <span className="pdp-detail-value">
                        <Link to={`/brand/${product.brandName?.toLowerCase()}`}>{product.brandName}</Link>
                    </span>
                </div>
            </div>

        </div>
    );
};

export default ProductInfo;
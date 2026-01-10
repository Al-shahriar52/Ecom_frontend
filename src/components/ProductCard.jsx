import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './ProductCard.css';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);

    // 1. Check Stock Status
    const isOutOfStock = product.quantity <= 0;

    // Existing Price Logic
    const hasDiscount = product.originalPrice && product.originalPrice > product.discountedPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
        : 0;

    const amountSaved = hasDiscount ? (product.originalPrice - product.discountedPrice).toFixed(2) : 0;

    const handleAddToCart = (e) => {
        e.preventDefault();

        // 2. Prevent adding if out of stock
        if (isOutOfStock) return;

        addToCart(product, 1);
    };

    const imageUrl = product.imageUrl || 'https://via.placeholder.com/300';

    return (
        <div className={`product-card ${isOutOfStock ? 'card-disabled' : ''}`}>
            <Link to={`/product/${product.productId}`} className="product-image-link">
                <div className="product-image-container">
                    <img src={imageUrl} alt={product.name} className="product-image" />

                    {/* 3. Out of Stock Badge (High Priority) */}
                    {isOutOfStock && (
                        <div className="oos-badge">SOLD OUT</div>
                    )}

                    {/* Discount Badges (Only show if IN STOCK to avoid clutter, or keep both) */}
                    {!isOutOfStock && hasDiscount && (
                        <>
                            <div className="discount-badge discount-percent">
                                {discountPercentage}% OFF
                            </div>
                            <div className="discount-badge amount-saved">
                                SAVE ৳{amountSaved}
                            </div>
                        </>
                    )}
                </div>
            </Link>

            <div className="product-info">
                <h3 className="product-name">
                    <Link to={`/product/${product.productId}`}>{product.name}</Link>
                </h3>

                <div className="product-tag-container">
                    {product.tagName && (
                        <span className={`product-tag tag-${product.tagName.toLowerCase().replace(' ', '-')}`}>
                            {product.tagName}
                        </span>
                    )}
                </div>

                <div className="price-container">
                    {hasDiscount && (
                        <span className="original-price">৳{product.originalPrice.toFixed(2)}</span>
                    )}
                    <span className="current-price">৳{product.discountedPrice.toFixed(2)}</span>
                </div>

                <div className="product-rating">
                    <StarRating rating={product.rating} />
                </div>

                {/* 4. Disable Button if Out of Stock */}
                <button
                    onClick={handleAddToCart}
                    className={`add-to-cart-btn ${isOutOfStock ? 'btn-disabled' : ''}`}
                    disabled={isOutOfStock}
                >
                    {isOutOfStock ? 'SOLD OUT' : 'ADD TO CART'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
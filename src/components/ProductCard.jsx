
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './ProductCard.css';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);

    // This logic correctly uses the API's price fields
    const hasDiscount = product.originalPrice && product.originalPrice > product.discountedPrice;
    const discountPercentage = hasDiscount
        ? Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100)
        : 0;

    const amountSaved = hasDiscount ? (product.originalPrice - product.discountedPrice).toFixed(2) : 0;

    // A handler to provide user feedback
    const handleAddToCart = (e) => {
        // Prevent the click from bubbling up if you wrap the card in a Link later
        e.preventDefault();

        // Just call the context function.
        // Pass quantity '1' explicitly.
        // The Context will handle the API call, the loading state, and the Toast message.
        addToCart(product, 1);
    };

    // Use a placeholder if imageUrl is missing from the API response
    const imageUrl = product.imageUrl || 'https://via.placeholder.com/300';

    return (
        <div className="product-card">
            {/* Change: Use product.productId from the API for the link */}
            <Link to={`/product/${product.productId}`} className="product-image-link">
                <div className="product-image-container">
                    {/* Change: Use product.imageUrl from the API */}
                    <img src={imageUrl} alt={product.name} className="product-image" />
                    {hasDiscount && (
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
                    {/* Change: Use product.productId for the link and product.name for the title */}
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

                <button onClick={handleAddToCart} className="add-to-cart-btn">
                    ADD TO CART
                </button>
            </div>
        </div>
    );
};

export default ProductCard;

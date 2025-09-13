
/*
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import './ProductCard.css';
import StarRating from './StarRating';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-image-link">
                <div className="product-image-container">
                    {/!* Fix 1: Changed product.name to product.title for the alt text *!/}
                    <img src={product.image} alt={product.title} className="product-image" />
                    {hasDiscount && (
                        <div className="discount-badge">{discountPercentage}% OFF</div>
                    )}
                </div>
            </Link>
            <div className="product-info">
                <h3 className="product-name">
                    {/!* Fix 1: Changed product.name to product.title to display the title *!/}
                    <Link to={`/product/${product.id}`}>{product.title}</Link>
                </h3>

                {/!* Fix 2: Always render the container to maintain consistent height *!/}
                <div className="product-tag-container">
                    {product.tag && (
                        <span className={`product-tag tag-${product.tag.toLowerCase().replace(' ', '-')}`}>
                            {product.tag}
                        </span>
                    )}
                </div>

                <div className="price-container">
                    {hasDiscount && (
                        <span className="original-price">৳{product.originalPrice.toFixed(2)}</span>
                    )}
                    <span className="current-price">৳{product.price.toFixed(2)}</span>
                </div>

                <div className="product-rating">
                    <StarRating rating={product.rating} />
                </div>

                <button onClick={() => addToCart(product)} className="add-to-cart-btn">
                    ADD TO CART
                </button>
            </div>
        </div>
    );
};

export default ProductCard;*/


import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // Import toast for user feedback
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
    const handleAddToCart = () => {
        addToCart(product);
        toast.success(`${product.name} added to cart!`);
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
